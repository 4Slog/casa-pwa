import { Header } from './Header.js';
import { DeviceCard, DeviceGroupCard } from './DeviceCard.js';
import { MediaPlayer } from './MediaPlayer.js';
import { WeatherCard } from './WeatherCard.js';
import { FamilyMap } from './FamilyMap.js';
import { CameraGrid } from './CameraGrid.js';

let components = {};

export function initComponents(store, api, config) {
  console.log('🎨 Initializing components...');
  components.header = new Header(store, api, config);
  components.media = new MediaPlayer(store, api, config);
  components.weather = new WeatherCard(store, api, config);
  components.family = new FamilyMap(store, api, config);
  components.cameras = new CameraGrid(store, api, config);
  renderLightsPage(store, api, config);
  initNavigation(store, components);
  initMagicFab(store, api, config);
  console.log('✅ Components initialized');
}

function renderLightsPage(store, api, config) {
  const c = document.getElementById('page-lights');
  if (!c) return;
  const groups = config.get('entities.lights.groups') || [];
  const devices = config.get('entities.lights.devices') || [];
  c.innerHTML = '<div class="page-content lights-page"><div class="device-grid" id="device-grid"></div></div>';
  const g = document.getElementById('device-grid');
  groups.forEach(gr => g.appendChild(new DeviceGroupCard(store, api, config, gr).element));
  devices.forEach(d => g.appendChild(new DeviceCard(store, api, config, d).element));
}

function initNavigation(store, comps) {
  const pills = document.querySelectorAll('.nav-pill');
  const pages = ['media', 'lights', 'climate', 'calendar', 'family', 'cameras'];
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const pg = pill.dataset.page;
      pills.forEach(p => p.classList.toggle('active', p.dataset.page === pg));
      store.set('ui.currentPage', pg);
      const w = document.getElementById('pages-wrapper');
      const i = pages.indexOf(pg);
      if (w && i >= 0) w.style.transform = 'translateX(-' + (i * (100 / pages.length)) + '%)';
      if (pg === 'cameras') comps.cameras?.startRefresh(); else comps.cameras?.stopRefresh();
      if (pg === 'family' && comps.family?.map) setTimeout(() => { comps.family.map.invalidateSize(); comps.family.fitBounds(); }, 300);
    });
  });
}

function initMagicFab(store, api, config) {
  const fab = document.getElementById('magic-fab');
  if (!fab) return;
  const update = () => {
    const hr = new Date().getHours();
    const pg = store.get('ui.currentPage');
    const spId = config.get('entities.media.spotify');
    const sp = store.getEntity(spId);
    let icon = 'lightning-bolt', act = null;
    if (pg === 'media' && sp?.state === 'playing') { icon = 'pause'; act = () => api.mediaPlayPause(spId); }
    else if (hr >= 6 && hr < 10) { icon = 'weather-sunny'; act = () => api.callService('script', 'turn_on', { entity_id: 'script.good_morning' }); }
    else if (hr >= 22 || hr < 6) { icon = 'weather-night'; act = () => api.callService('script', 'turn_on', { entity_id: 'script.goodnight' }); }
    else { icon = 'home'; act = () => api.callService('script', 'turn_on', { entity_id: 'script.toggle_main_lights' }); }
    fab.innerHTML = '<span class="mdi mdi-' + icon + '"></span>';
    fab.onclick = act;
  };
  store.subscribe('ui.currentPage', update);
  store.subscribe('entities', update);
  update();
  setInterval(update, 60000);
}

export { components };
