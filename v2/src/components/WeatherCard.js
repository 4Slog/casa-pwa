import { getWeatherIcon } from '../utils.js';

export class WeatherCard {
  constructor(store, api, config) {
    this.store = store; this.api = api; this.config = config;
    this.container = document.getElementById('page-climate');
    this.render(); this.subscribe();
  }

  render() {
    if (!this.container) return;
    const sensors = this.config.get('entities.climate.sensors') || [];
    this.container.innerHTML = `
      <div class="page-content climate-page">
        <div class="weather-grid">
          <div class="weather-card forecast-card glass-card">
            <div class="weather-main"><span class="weather-icon mdi mdi-weather-cloudy" id="weather-icon"></span><span class="weather-temp" id="weather-temp">--°</span></div>
            <div class="weather-condition" id="weather-condition">Loading...</div>
            <div class="weather-details"><span><span class="mdi mdi-water-percent"></span> <span id="weather-humidity">--</span>%</span><span><span class="mdi mdi-weather-windy"></span> <span id="weather-wind">--</span> mph</span></div>
          </div>
          <div class="weather-card thermostat-card glass-card">
            <div class="thermostat-display"><div class="thermostat-current" id="thermostat-current">--°</div><div class="thermostat-label">Current</div></div>
            <div class="thermostat-controls">
              <button class="temp-btn glass-card" id="temp-down"><span class="mdi mdi-minus"></span></button>
              <div class="thermostat-target"><span id="thermostat-target">--</span>°<small id="hvac-mode">Off</small></div>
              <button class="temp-btn glass-card" id="temp-up"><span class="mdi mdi-plus"></span></button>
            </div>
          </div>
          <div class="weather-card comfort-card glass-card" id="comfort-card">
            <div class="comfort-icon"><span class="mdi mdi-thermostat-auto"></span></div>
            <div class="comfort-info"><div class="comfort-title">Auto Comfort</div><div class="comfort-band">71-73°F Band</div></div>
            <div class="toggle-switch"><div class="toggle-knob"></div></div>
          </div>
        </div>
        <div class="section-header glass-card"><span class="mdi mdi-thermometer"></span><span>Room Temperatures</span></div>
        <div class="room-temps-grid">
          ${sensors.map(s => '<div class="room-temp-card glass-card '+(s.highlight?'highlight':'')+'" data-entity="'+s.id+'"><span class="room-name">'+s.name+'</span><span class="room-temp" id="temp-'+(s.room||s.name.toLowerCase().replace(/\s/g,'-'))+'">--°</span></div>').join('')}
        </div>
      </div>`;
    this.bindEvents();
  }

  bindEvents() {
    const thermId = this.config.get('entities.climate.thermostat');
    const comfortId = this.config.get('entities.climate.autoComfort');
    document.getElementById('temp-up')?.addEventListener('click', () => {
      const e = this.store.getEntity(thermId);
      this.api.setThermostat((e?.attributes?.temperature || 72) + 1);
    });
    document.getElementById('temp-down')?.addEventListener('click', () => {
      const e = this.store.getEntity(thermId);
      this.api.setThermostat((e?.attributes?.temperature || 72) - 1);
    });
    document.getElementById('comfort-card')?.addEventListener('click', () => this.api.toggleEntity(comfortId));
  }

  subscribe() {
    const weatherId = this.config.get('entities.climate.weather');
    const thermId = this.config.get('entities.climate.thermostat');
    const comfortId = this.config.get('entities.climate.autoComfort');
    const sensors = this.config.get('entities.climate.sensors') || [];
    this.store.subscribeEntity(weatherId, (e) => this.updateWeather(e));
    this.store.subscribeEntity(thermId, (e) => this.updateThermostat(e));
    this.store.subscribeEntity(comfortId, (e) => document.getElementById('comfort-card')?.classList.toggle('on', e?.state === 'on'));
    sensors.forEach(s => {
      this.store.subscribeEntity(s.id, (e) => {
        const key = s.room || s.name.toLowerCase().replace(/\s/g, '-');
        const el = document.getElementById('temp-' + key);
        if (el && e) el.textContent = Math.round(parseFloat(e.state) || 0) + '°';
      });
    });
  }

  updateWeather(e) {
    if (!e) return;
    const a = e.attributes || {};
    const tempEl = document.getElementById('weather-temp');
    const condEl = document.getElementById('weather-condition');
    const humEl = document.getElementById('weather-humidity');
    const windEl = document.getElementById('weather-wind');
    const iconEl = document.getElementById('weather-icon');
    if (tempEl) tempEl.textContent = Math.round(a.temperature || 0) + '°';
    if (condEl) condEl.textContent = (e.state || '').replace(/_/g, ' ');
    if (humEl) humEl.textContent = a.humidity || '--';
    if (windEl) windEl.textContent = Math.round(a.wind_speed || 0);
    if (iconEl) iconEl.className = 'weather-icon mdi mdi-' + getWeatherIcon(e.state);
  }

  updateThermostat(e) {
    if (!e) return;
    const a = e.attributes || {};
    const curEl = document.getElementById('thermostat-current');
    const targEl = document.getElementById('thermostat-target');
    const modeEl = document.getElementById('hvac-mode');
    if (curEl) curEl.textContent = Math.round(a.current_temperature || 0) + '°';
    if (targEl) targEl.textContent = Math.round(a.temperature || 0);
    if (modeEl) modeEl.textContent = (e.state || 'off').toUpperCase();
  }
}
