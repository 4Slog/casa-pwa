import { formatTimeOfDay, formatDate, getGreeting } from '../utils.js';

export class Header {
  constructor(store, api, config) {
    this.store = store;
    this.api = api;
    this.config = config;
    this.element = document.getElementById('dynamic-island');
    this.timeEl = document.getElementById('island-time');
    this.centerEl = document.getElementById('island-center');
    this.dateEl = document.getElementById('island-date');
    this.greetingEl = document.getElementById('island-greeting');
    this.currentContext = 'default';
    this.contextTimeout = null;
    this.init();
  }

  init() {
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 60000);
    this.store.subscribe('entities', () => this.checkContext());
    this.store.subscribe('ui.currentPage', () => this.checkContext());
    this.store.subscribe('connection.status', (s) => this.handleConnectionStatus(s));
    const spotifyId = this.config.get('entities.media.spotify');
    if (spotifyId) this.store.subscribeEntity(spotifyId, () => this.checkMediaContext());
  }

  updateDateTime() {
    const now = new Date();
    if (this.timeEl) this.timeEl.textContent = formatTimeOfDay(now);
    if (this.dateEl) this.dateEl.textContent = formatDate(now);
    if (this.greetingEl && this.currentContext === 'default') this.greetingEl.textContent = getGreeting();
  }

  checkContext() {
    if (this.checkSecurityAlert()) return;
    if (this.store.get('ui.currentPage') === 'media') this.checkMediaContext();
    else this.setContext('default');
  }

  checkSecurityAlert() {
    for (const id of ['binary_sensor.front_door', 'binary_sensor.back_door']) {
      const s = this.store.getEntity(id);
      if (s?.state === 'on') {
        this.setContext('security', { icon: 'door-open', text: s.attributes?.friendly_name || 'Door Open', color: 'var(--accent-orange)' });
        return true;
      }
    }
    return false;
  }

  checkMediaContext() {
    const id = this.config.get('entities.media.spotify');
    const sp = this.store.getEntity(id);
    if (sp?.state === 'playing') {
      const t = sp.attributes?.media_title || 'Playing';
      const a = sp.attributes?.media_artist || '';
      this.setContext('media', { icon: 'music', text: a ? t + ' • ' + a : t, color: 'var(--accent-green)' });
    } else if (this.currentContext === 'media') this.setContext('default');
  }

  handleConnectionStatus(status) {
    if (status === 'disconnected' || status === 'reconnecting') {
      this.setContext('connection', { icon: 'wifi-off', text: 'Reconnecting...', color: 'var(--accent-red)' });
    } else if (status === 'authenticated' && this.currentContext === 'connection') {
      this.setContext('default');
    }
  }

  setContext(ctx, data = {}) {
    if (this.currentContext === ctx && ctx === 'default') return;
    this.currentContext = ctx;
    if (!this.centerEl) return;
    if (this.contextTimeout) { clearTimeout(this.contextTimeout); this.contextTimeout = null; }
    if (ctx === 'default') {
      this.element?.classList.remove('expanded');
      this.centerEl.innerHTML = '<span class="island-greeting" id="island-greeting">' + getGreeting() + '</span>';
      this.greetingEl = document.getElementById('island-greeting');
    } else {
      this.element?.classList.add('expanded');
      this.centerEl.innerHTML = '<div class="island-context" style="color:' + (data.color||'white') + '"><span class="mdi mdi-' + data.icon + '"></span><span>' + data.text + '</span></div>';
      if (ctx !== 'connection' && ctx !== 'security') {
        this.contextTimeout = setTimeout(() => { if (this.currentContext === ctx) this.setContext('default'); }, 10000);
      }
    }
  }

  showNotification(icon, text, color = 'var(--accent-blue)', dur = 5000) {
    this.setContext('notification', { icon, text, color });
    if (dur > 0) this.contextTimeout = setTimeout(() => this.setContext('default'), dur);
  }
}
