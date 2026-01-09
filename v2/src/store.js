/**
 * Casa de Sowu PWA v2.0
 * Reactive State Store with Pub/Sub Pattern
 */

export class Store {
  constructor() {
    this.state = {
      connection: { status: 'disconnected' },
      auth: { status: 'unknown' },
      entities: { _loaded: false },
      ui: {
        currentPage: 'lights',
        modalOpen: null,
        theme: 'dark'
      },
      calendar: { events: [] },
      todos: {}
    };

    this.subscribers = new Map();
    this.wildcardSubscribers = new Set();
  }

  /**
   * Get a value from the store using dot notation
   * @param {string} path - Dot-notated path (e.g., 'entities.light.living_room')
   * @returns {*} The value at the path, or undefined
   */
  get(path) {
    if (!path) return this.state;

    const keys = path.split('.');
    let value = this.state;

    for (const key of keys) {
      if (value === undefined || value === null) return undefined;
      value = value[key];
    }

    return value;
  }

  /**
   * Set a value in the store using dot notation
   * @param {string} path - Dot-notated path
   * @param {*} value - The value to set
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = this.state;

    // Navigate to parent
    for (const key of keys) {
      if (target[key] === undefined) {
        target[key] = {};
      }
      target = target[key];
    }

    // Set value
    const oldValue = target[lastKey];
    target[lastKey] = value;

    // Notify subscribers
    this.notify(path, value, oldValue);
  }

  /**
   * Update multiple values at once
   * @param {Object} updates - Object with path: value pairs
   */
  batch(updates) {
    for (const [path, value] of Object.entries(updates)) {
      this.set(path, value);
    }
  }

  /**
   * Subscribe to changes at a specific path
   * @param {string} path - Dot-notated path to watch (use '*' for all changes)
   * @param {Function} callback - Function to call on change: (newValue, oldValue, path) => {}
   * @returns {Function} Unsubscribe function
   */
  subscribe(path, callback) {
    if (path === '*') {
      this.wildcardSubscribers.add(callback);
      return () => this.wildcardSubscribers.delete(callback);
    }

    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }

    this.subscribers.get(path).add(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(path);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(path);
        }
      }
    };
  }

  /**
   * Subscribe to entity state changes
   * @param {string} entityId - Entity ID to watch
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribeEntity(entityId, callback) {
    return this.subscribe(`entities.${entityId}`, callback);
  }

  /**
   * Notify subscribers of a change
   * @param {string} path - Path that changed
   * @param {*} newValue - New value
   * @param {*} oldValue - Previous value
   */
  notify(path, newValue, oldValue) {
    // Exact path subscribers
    const subs = this.subscribers.get(path);
    if (subs) {
      subs.forEach(cb => {
        try {
          cb(newValue, oldValue, path);
        } catch (e) {
          console.error('Subscriber error:', e);
        }
      });
    }

    // Parent path subscribers (e.g., 'entities' gets notified for 'entities.light.x')
    const parts = path.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.');
      const parentSubs = this.subscribers.get(parentPath);
      if (parentSubs) {
        const parentValue = this.get(parentPath);
        parentSubs.forEach(cb => {
          try {
            cb(parentValue, undefined, parentPath);
          } catch (e) {
            console.error('Subscriber error:', e);
          }
        });
      }
    }

    // Wildcard subscribers
    this.wildcardSubscribers.forEach(cb => {
      try {
        cb(newValue, oldValue, path);
      } catch (e) {
        console.error('Wildcard subscriber error:', e);
      }
    });
  }

  /**
   * Get entity state
   * @param {string} entityId - Entity ID
   * @returns {Object|undefined} Entity state
   */
  getEntity(entityId) {
    return this.get(`entities.${entityId}`);
  }

  /**
   * Check if entity is on
   * @param {string} entityId - Entity ID
   * @returns {boolean}
   */
  isEntityOn(entityId) {
    const entity = this.getEntity(entityId);
    return entity?.state === 'on';
  }

  /**
   * Get entity attribute
   * @param {string} entityId - Entity ID
   * @param {string} attribute - Attribute name
   * @returns {*}
   */
  getEntityAttribute(entityId, attribute) {
    const entity = this.getEntity(entityId);
    return entity?.attributes?.[attribute];
  }

  /**
   * Debug: dump current state
   */
  debug() {
    console.log('Store State:', JSON.parse(JSON.stringify(this.state)));
    console.log('Subscribers:', this.subscribers.size);
    console.log('Wildcard Subscribers:', this.wildcardSubscribers.size);
  }
}
