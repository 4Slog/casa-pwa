/**
 * Casa de Sowu PWA v2.0
 * Main Application Entry Point
 */

import { API } from './api.js';
import { Store } from './store.js';
import { Config } from './config.js';
import { initComponents } from './components/index.js';

class CasaDeSowuApp {
  constructor() {
    this.api = null;
    this.store = null;
    this.config = null;
    this.initialized = false;
  }

  async init() {
    console.log('🏠 Casa de Sowu v2.0 initializing...');

    // Load configuration
    this.config = new Config();
    await this.config.load();

    // Initialize state store
    this.store = new Store();

    // Initialize API
    this.api = new API(this.config, this.store);

    // Initialize UI components
    initComponents(this.store, this.api, this.config);

    // Check for existing auth
    if (this.api.hasValidToken()) {
      this.showMainApp();
      await this.api.connect();
    } else {
      this.showSetupScreen();
    }

    this.initialized = true;
    console.log('✅ Casa de Sowu v2.0 ready!');
  }

  showSetupScreen() {
    document.getElementById('setup-screen')?.classList.remove('hidden');
    document.getElementById('main-app')?.classList.add('hidden');
  }

  showMainApp() {
    document.getElementById('setup-screen')?.classList.add('hidden');
    document.getElementById('main-app')?.classList.remove('hidden');
    document.getElementById('magic-fab')?.classList.remove('hidden');
  }
}

// Initialize on DOM ready
const app = new CasaDeSowuApp();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

export { app };
