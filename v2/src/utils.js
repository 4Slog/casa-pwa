/**
 * Casa de Sowu PWA v2.0
 * Utility Functions
 */

/**
 * Format seconds to MM:SS or HH:MM:SS
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date for display
 * @param {Date|string} date
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  const d = date instanceof Date ? date : new Date(date);
  const defaults = { weekday: 'short', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', { ...defaults, ...options });
}

/**
 * Format time for display
 * @param {Date|string} date
 * @returns {string}
 */
export function formatTimeOfDay(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Get greeting based on time of day
 * @returns {string}
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 22) return 'Good evening';
  return 'Good night';
}

/**
 * Get relative time string (e.g., "Today", "Tomorrow", "in 3 days")
 * @param {Date|string} date
 * @returns {string}
 */
export function getRelativeDay(date) {
  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `in ${diffDays} days`;
  if (diffDays > 7) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? 'in 1 week' : `in ${weeks} weeks`;
  }
  return formatDate(d);
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds
 * @returns {Function}
 */
export function throttle(fn, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Clamp a value between min and max
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Map a value from one range to another
 * @param {number} value
 * @param {number} inMin
 * @param {number} inMax
 * @param {number} outMin
 * @param {number} outMax
 * @returns {number}
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Generate a unique ID
 * @param {string} prefix
 * @returns {string}
 */
export function uniqueId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone an object
 * @param {Object} obj
 * @returns {Object}
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if device is mobile
 * @returns {boolean}
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if device supports touch
 * @returns {boolean}
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get weather icon name from condition
 * @param {string} condition - HA weather condition
 * @returns {string} MDI icon name
 */
export function getWeatherIcon(condition) {
  const icons = {
    'sunny': 'weather-sunny',
    'clear-night': 'weather-night',
    'partlycloudy': 'weather-partly-cloudy',
    'cloudy': 'weather-cloudy',
    'rainy': 'weather-rainy',
    'pouring': 'weather-pouring',
    'snowy': 'weather-snowy',
    'snowy-rainy': 'weather-snowy-rainy',
    'windy': 'weather-windy',
    'windy-variant': 'weather-windy-variant',
    'fog': 'weather-fog',
    'hail': 'weather-hail',
    'lightning': 'weather-lightning',
    'lightning-rainy': 'weather-lightning-rainy',
    'exceptional': 'weather-cloudy-alert'
  };
  return icons[condition] || 'weather-cloudy';
}

/**
 * Convert Fahrenheit to Celsius
 * @param {number} f
 * @returns {number}
 */
export function fahrenheitToCelsius(f) {
  return Math.round((f - 32) * 5 / 9);
}

/**
 * Convert Celsius to Fahrenheit
 * @param {number} c
 * @returns {number}
 */
export function celsiusToFahrenheit(c) {
  return Math.round(c * 9 / 5 + 32);
}

/**
 * Create an element with attributes and children
 * @param {string} tag
 * @param {Object} attrs
 * @param {...(Node|string)} children
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'dataset') {
      Object.assign(el.dataset, value);
    } else {
      el.setAttribute(key, value);
    }
  }

  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });

  return el;
}

/**
 * Wait for specified milliseconds
 * @param {number} ms
 * @returns {Promise}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
