import { API } from './api.js';
import { Store } from './store.js';
import { Config } from './config.js';
import { initComponents } from './components/index.js';

class CasaPWA {
  constructor() {
    this.store = null;
    this.api = null;
    this.config = null;
    this.initialized = false;
  }

  async init() {
    console.log('🏠 Casa de Sowu PWA v2.0 starting...');
    try {
      this.config = new Config();
      await this.config.load();
      console.log('📋 Config loaded');

      this.store = new Store();
      this.store.set('ui.currentPage', 'lights');
      this.store.set('connection.status', 'disconnected');
      console.log('🗄️ Store initialized');

      this.api = new API(this.config, this.store);

      // Check for OAuth callback
      await this.handleOAuthCallback();

      // Check for existing auth
      if (this.api.hasValidToken()) {
        this.showApp();
        await this.api.connect();
      } else {
        this.showSetup();
      }

      this.updateTimeOfDay();
      setInterval(() => this.updateTimeOfDay(), 60000);
      this.registerServiceWorker();
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      this.showSetup();
    }
  }

  async handleOAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      console.log('🔐 OAuth callback detected');
      // Note: Don't clear URL here - api.handleOAuthCallback() needs to read it
      try {
        const success = await this.api.handleOAuthCallback();
        if (success) {
          console.log('✅ OAuth successful');
        }
      } catch (e) {
        console.error('OAuth failed:', e);
        this.updateStatus('Authentication failed. Please try again.', 'error');
      }
    }
  }

  showSetup() {
    document.getElementById('setup-screen')?.classList.remove('hidden');
    document.getElementById('main-app')?.classList.add('hidden');
    document.getElementById('magic-fab')?.classList.add('hidden');

    // OAuth login button
    document.getElementById('btn-login')?.addEventListener('click', () => this.startOAuth());

    // Manual token form (in Advanced Setup)
    document.getElementById('setup-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = document.getElementById('ha-token')?.value?.trim();
      if (token) {
        this.api.setToken(token);
        this.showApp();
        await this.api.connect();
      }
    });
  }

  showApp() {
    document.getElementById('setup-screen')?.classList.add('hidden');
    document.getElementById('main-app')?.classList.remove('hidden');
    document.getElementById('magic-fab')?.classList.remove('hidden');

    if (!this.initialized) {
      initComponents(this.store, this.api, this.config);
      this.initialized = true;
      console.log('✅ Casa de Sowu PWA v2.0 ready!');
    }

    // Set up connection status listener
    this.store.subscribe('connection.status', (status) => this.handleConnectionChange(status));
  }

  startOAuth() {
    this.updateStatus('Redirecting to Home Assistant...', 'loading');
    this.api.startOAuthFlow();
  }

  handleConnectionChange(status) {
    const banner = document.getElementById('connection-banner');
    if (!banner) return;

    if (status === 'disconnected' || status === 'reconnecting') {
      banner.classList.remove('hidden');
      banner.innerHTML = status === 'reconnecting'
        ? '<span class="mdi mdi-loading mdi-spin"></span> Reconnecting...'
        : '<span class="mdi mdi-wifi-off"></span> Disconnected';
    } else if (status === 'authenticated') {
      banner.classList.add('hidden');
    }
  }

  updateStatus(message, type = 'info') {
    const el = document.getElementById('login-status');
    if (el) {
      el.textContent = message;
      el.className = 'login-status ' + type;
    }
  }

  updateTimeOfDay() {
    const hr = new Date().getHours();
    const body = document.body;
    body.classList.remove('morning', 'afternoon', 'evening', 'night');
    if (hr >= 6 && hr < 12) body.classList.add('morning');
    else if (hr >= 12 && hr < 17) body.classList.add('afternoon');
    else if (hr >= 17 && hr < 21) body.classList.add('evening');
    else body.classList.add('night');
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/v2/sw.js');
        console.log('📦 Service Worker registered:', reg.scope);
      } catch (e) {
        console.warn('SW registration failed:', e);
      }
    }
  }

  // Public API for debugging
  debug() {
    console.log('Config:', this.config.get());
    console.log('Store:', this.store.debug());
    console.log('API connected:', this.api?.connected);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new CasaPWA();
  await app.init();
  window.casa = app;
});

export { CasaPWA };
