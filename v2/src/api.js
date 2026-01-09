/**
 * Casa de Sowu PWA v2.0
 * Home Assistant API Module
 * Handles WebSocket connection, authentication, and service calls
 */

const STORAGE_KEY = 'casa_de_sowu_v2';

export class API {
  constructor(config, store) {
    this.config = config;
    this.store = store;
    this.ws = null;
    this.wsId = 1;
    this.connected = false;
    this.authenticated = false;
    this.pendingRequests = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 5000;
    this.reconnectTimer = null;

    // Auth state
    this.accessToken = '';
    this.refreshToken = '';
    this.tokenExpiry = 0;

    // Load saved credentials
    this.loadCredentials();

    // Bind methods
    this.handleMessage = this.handleMessage.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  // ============================================
  // CREDENTIAL MANAGEMENT
  // ============================================

  loadCredentials() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.accessToken = data.accessToken || '';
        this.refreshToken = data.refreshToken || '';
        this.tokenExpiry = data.tokenExpiry || 0;
      }
    } catch (e) {
      console.error('Failed to load credentials:', e);
    }
  }

  saveCredentials() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        tokenExpiry: this.tokenExpiry
      }));
    } catch (e) {
      console.error('Failed to save credentials:', e);
    }
  }

  clearCredentials() {
    this.accessToken = '';
    this.refreshToken = '';
    this.tokenExpiry = 0;
    localStorage.removeItem(STORAGE_KEY);
  }

  hasValidToken() {
    if (!this.accessToken) return false;
    // Check if token is expired (with 5 min buffer)
    if (this.tokenExpiry > 0 && Date.now() > (this.tokenExpiry - 300000)) {
      return false;
    }
    return true;
  }

  setToken(token, refresh = '', expiresIn = 0) {
    this.accessToken = token;
    this.refreshToken = refresh;
    this.tokenExpiry = expiresIn > 0 ? Date.now() + (expiresIn * 1000) : 0;
    this.saveCredentials();
  }

  // ============================================
  // OAUTH FLOW
  // ============================================

  startOAuthFlow() {
    const state = this.generateRandomString(32);
    sessionStorage.setItem('oauth_state', state);

    const haUrl = this.config.get('app.haUrl');
    const redirectUri = window.location.origin + window.location.pathname;
    const clientId = window.location.origin + '/';

    const authUrl = new URL(`${haUrl}/auth/authorize`);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');

    window.location.href = authUrl.toString();
  }

  async handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const returnedState = urlParams.get('state');
    const error = urlParams.get('error');

    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code) return false;

    // Verify state
    const savedState = sessionStorage.getItem('oauth_state');
    sessionStorage.removeItem('oauth_state');

    if (returnedState !== savedState) {
      throw new Error('OAuth state mismatch');
    }

    // Exchange code for token
    const haUrl = this.config.get('app.haUrl');
    const redirectUri = window.location.origin + window.location.pathname;
    const clientId = window.location.origin + '/';

    const response = await fetch(`${haUrl}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: clientId,
        redirect_uri: redirectUri
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    this.setToken(data.access_token, data.refresh_token || '', data.expires_in || 0);

    return true;
  }

  async refreshAccessToken() {
    if (!this.refreshToken) return false;

    const haUrl = this.config.get('app.haUrl');
    const clientId = window.location.origin + '/';

    try {
      const response = await fetch(`${haUrl}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: clientId
        })
      });

      if (!response.ok) throw new Error('Refresh failed');

      const data = await response.json();
      this.setToken(data.access_token, data.refresh_token || this.refreshToken, data.expires_in || 0);
      return true;
    } catch (e) {
      console.error('Token refresh failed:', e);
      this.clearCredentials();
      return false;
    }
  }

  generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // ============================================
  // WEBSOCKET CONNECTION
  // ============================================

  async connect() {
    // Check if token needs refresh
    if (!this.hasValidToken() && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        this.store.set('auth.status', 'expired');
        return;
      }
    }

    if (!this.accessToken) {
      this.store.set('auth.status', 'unauthenticated');
      return;
    }

    const wsUrl = this.config.get('app.wsUrl');
    console.log('🔌 Connecting to:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = this.handleOpen;
      this.ws.onmessage = this.handleMessage;
      this.ws.onclose = this.handleClose;
      this.ws.onerror = this.handleError;
    } catch (e) {
      console.error('WebSocket connection failed:', e);
      this.scheduleReconnect();
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.authenticated = false;
  }

  handleOpen() {
    console.log('🔌 WebSocket connected');
    this.reconnectAttempts = 0;
    this.store.set('connection.status', 'connected');
  }

  handleMessage(event) {
    try {
      const msg = JSON.parse(event.data);
      this.processMessage(msg);
    } catch (e) {
      console.error('Failed to parse message:', e);
    }
  }

  handleClose(event) {
    console.log('🔌 WebSocket closed:', event.code, event.reason);
    this.connected = false;
    this.authenticated = false;
    this.store.set('connection.status', 'disconnected');
    this.scheduleReconnect();
  }

  handleError(error) {
    console.error('🔌 WebSocket error:', error);
    this.store.set('connection.status', 'error');
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.store.set('connection.status', 'failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.min(this.reconnectAttempts, 5);

    console.log(`🔄 Reconnecting in ${delay/1000}s (attempt ${this.reconnectAttempts})`);
    this.store.set('connection.status', 'reconnecting');

    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  // ============================================
  // MESSAGE HANDLING
  // ============================================

  processMessage(msg) {
    switch (msg.type) {
      case 'auth_required':
        this.sendMessage({ type: 'auth', access_token: this.accessToken });
        break;

      case 'auth_ok':
        console.log('✅ Authenticated with Home Assistant');
        this.connected = true;
        this.authenticated = true;
        this.store.set('connection.status', 'authenticated');
        this.subscribeToEvents();
        this.fetchAllStates();
        break;

      case 'auth_invalid':
        console.error('❌ Authentication failed');
        this.clearCredentials();
        this.store.set('auth.status', 'invalid');
        break;

      case 'result':
        this.handleResult(msg);
        break;

      case 'event':
        this.handleEvent(msg);
        break;
    }
  }

  handleResult(msg) {
    const requestInfo = this.pendingRequests.get(msg.id);
    this.pendingRequests.delete(msg.id);

    if (!requestInfo) return;

    if (msg.success === false) {
      console.error('Request failed:', msg.error);
      if (requestInfo.reject) requestInfo.reject(msg.error);
      return;
    }

    // Handle based on request type
    switch (requestInfo.type) {
      case 'get_states':
        if (msg.result) {
          msg.result.forEach(entity => {
            this.store.set(`entities.${entity.entity_id}`, entity);
          });
          this.store.set('entities._loaded', true);
        }
        break;

      case 'calendar':
        if (msg.result?.response) {
          const events = [];
          Object.entries(msg.result.response).forEach(([calId, cal]) => {
            if (cal.events) {
              cal.events.forEach(e => events.push({ ...e, calendar: calId }));
            }
          });
          this.store.set('calendar.events', events);
        }
        break;

      case 'todo':
        if (msg.result?.items) {
          this.store.set(`todos.${requestInfo.listId}`, msg.result.items);
        }
        break;
    }

    if (requestInfo.resolve) requestInfo.resolve(msg.result);
  }

  handleEvent(msg) {
    if (msg.event?.event_type === 'state_changed') {
      const { entity_id, new_state } = msg.event.data;
      if (new_state) {
        this.store.set(`entities.${entity_id}`, new_state);
      }
    }
  }

  // ============================================
  // API METHODS
  // ============================================

  sendMessage(msg) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }

  sendCommand(type, payload = {}, requestType = null) {
    return new Promise((resolve, reject) => {
      const id = this.wsId++;
      const msg = { id, type, ...payload };

      this.pendingRequests.set(id, { type: requestType || type, resolve, reject });

      if (!this.sendMessage(msg)) {
        this.pendingRequests.delete(id);
        reject(new Error('WebSocket not connected'));
      }
    });
  }

  subscribeToEvents() {
    this.sendCommand('subscribe_events', { event_type: 'state_changed' });
  }

  fetchAllStates() {
    this.sendCommand('get_states', {}, 'get_states');
  }

  callService(domain, service, data = {}, target = null) {
    const payload = {
      type: 'call_service',
      domain,
      service,
      service_data: data
    };
    if (target) payload.target = target;

    return this.sendCommand('call_service', payload);
  }

  // Convenience methods
  toggleEntity(entityId) {
    const domain = entityId.split('.')[0];
    const entity = this.store.get(`entities.${entityId}`);

    if (domain === 'script') {
      return this.callService('script', 'turn_on', { entity_id: entityId });
    } else if (domain === 'cover') {
      const pos = entity?.attributes?.current_tilt_position || 0;
      const newPos = (pos <= 5 || pos >= 95) ? 70 : 100;
      return this.callService('cover', 'set_cover_tilt_position', { entity_id: entityId, tilt_position: newPos });
    } else if (domain === 'input_boolean') {
      return this.callService('input_boolean', 'toggle', { entity_id: entityId });
    } else {
      return this.callService(domain, 'toggle', { entity_id: entityId });
    }
  }

  setLightBrightness(entityId, brightness) {
    return this.callService('light', 'turn_on', { entity_id: entityId, brightness: Math.round((brightness / 100) * 255) });
  }

  setFanSpeed(entityId, percentage) {
    return this.callService('fan', 'set_percentage', { entity_id: entityId, percentage });
  }

  setThermostat(temperature) {
    const thermostat = this.config.get('entities.climate.thermostat');
    return this.callService('climate', 'set_temperature', { entity_id: thermostat, temperature });
  }

  // Media controls
  mediaPlayPause(entityId) {
    return this.callService('media_player', 'media_play_pause', { entity_id: entityId });
  }

  mediaNext(entityId) {
    return this.callService('media_player', 'media_next_track', { entity_id: entityId });
  }

  mediaPrev(entityId) {
    return this.callService('media_player', 'media_previous_track', { entity_id: entityId });
  }

  mediaSetVolume(entityId, volume) {
    return this.callService('media_player', 'volume_set', { entity_id: entityId, volume_level: volume });
  }

  mediaSeek(entityId, position) {
    return this.callService('media_player', 'media_seek', { entity_id: entityId, seek_position: position });
  }

  // Calendar
  fetchCalendarEvents(days = 90) {
    const calendars = this.config.get('entities.calendars');
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + days);

    return this.sendCommand('call_service', {
      type: 'call_service',
      domain: 'calendar',
      service: 'get_events',
      target: { entity_id: calendars },
      service_data: {
        start_date_time: now.toISOString(),
        end_date_time: end.toISOString()
      },
      return_response: true
    }, 'calendar');
  }

  // Todo lists
  fetchTodoItems(entityId, listId) {
    const id = this.wsId++;
    this.pendingRequests.set(id, { type: 'todo', listId });
    this.sendMessage({ id, type: 'todo/item/list', entity_id: entityId });
  }

  // Camera
  getCameraProxyUrl(entityId) {
    const haUrl = this.config.get('app.haUrl');
    return `${haUrl}/api/camera_proxy/${entityId}?token=${this.accessToken}&t=${Date.now()}`;
  }
}
