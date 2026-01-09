/**
 * Casa de Sowu PWA v2.0
 * Configuration Module
 * Loads and provides access to dashboard-config.json
 */

export class Config {
  constructor() {
    this.data = null;
    this.loaded = false;
    this.configPath = '../config/dashboard-config.json';
  }

  /**
   * Load configuration from JSON file
   */
  async load() {
    try {
      const response = await fetch(this.configPath);
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }

      this.data = await response.json();
      this.loaded = true;
      console.log('📋 Configuration loaded:', this.data.app.name, 'v' + this.data.app.version);
      return this.data;
    } catch (e) {
      console.error('Failed to load configuration:', e);
      // Fall back to default config
      this.data = this.getDefaultConfig();
      this.loaded = true;
      return this.data;
    }
  }

  /**
   * Get a config value using dot notation
   * @param {string} path - Dot-notated path (e.g., 'app.haUrl')
   * @returns {*} The value at the path
   */
  get(path) {
    if (!this.loaded || !this.data) {
      console.warn('Config not loaded yet');
      return undefined;
    }

    if (!path) return this.data;

    const keys = path.split('.');
    let value = this.data;

    for (const key of keys) {
      if (value === undefined || value === null) return undefined;
      value = value[key];
    }

    return value;
  }

  /**
   * Get all entities of a specific type
   * @param {string} type - Entity type (lights, climate, etc.)
   * @returns {Array}
   */
  getEntities(type) {
    return this.get(`entities.${type}`) || [];
  }

  /**
   * Get all device configs for the lights page
   * @returns {Array}
   */
  getLightDevices() {
    return this.get('entities.lights.devices') || [];
  }

  /**
   * Get all speaker configs
   * @returns {Array}
   */
  getSpeakers() {
    return this.get('entities.media.speakers') || [];
  }

  /**
   * Get family members config
   * @returns {Array}
   */
  getFamily() {
    return this.get('entities.family') || [];
  }

  /**
   * Get camera configs
   * @returns {Array}
   */
  getCameras() {
    return this.get('entities.cameras') || [];
  }

  /**
   * Get quick playlists
   * @returns {Array}
   */
  getQuickPlaylists() {
    return this.get('playlists.quick') || [];
  }

  /**
   * Get UI theme settings
   * @returns {Object}
   */
  getTheme() {
    return this.get('ui.theme') || {};
  }

  /**
   * Get refresh interval for a specific type
   * @param {string} type - Type (camera, map, weather)
   * @returns {number} Interval in milliseconds
   */
  getRefreshInterval(type) {
    return this.get(`ui.refreshIntervals.${type}`) || 5000;
  }

  /**
   * Default configuration fallback
   */
  getDefaultConfig() {
    return {
      app: {
        name: 'Casa de Sowu',
        version: '2.0.0',
        haUrl: 'https://ha.casadesowu.com',
        wsUrl: 'wss://ha.casadesowu.com/api/websocket'
      },
      home: {
        coords: [33.3552, -82.1134],
        name: 'Casa de Sowu'
      },
      entities: {
        media: { spotify: 'media_player.spotify', speakers: [] },
        lights: { devices: [], groups: [] },
        climate: { thermostat: 'climate.thermostat', sensors: [] },
        family: [],
        cameras: [],
        calendars: [],
        tasks: {}
      },
      playlists: { quick: [] },
      ui: {
        refreshIntervals: { camera: 2000, map: 10000, weather: 300000 },
        theme: { cardHeight: '200px', borderRadius: '16px', glassBlur: '12px' }
      }
    };
  }
}
