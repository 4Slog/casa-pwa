export class FamilyMap {
  constructor(store, api, config) {
    this.store = store; this.api = api; this.config = config;
    this.container = document.getElementById('page-family');
    this.map = null; this.markers = {}; this.layers = null;
    this.render(); this.subscribe();
  }

  render() {
    if (!this.container) return;
    const family = this.config.get('entities.family') || [];
    this.container.innerHTML = `
      <div class="page-content family-page">
        <div class="section-header glass-card"><span class="mdi mdi-account-group"></span><span>Family Location</span></div>
        <div class="family-grid">
          ${family.map(p => '<div class="family-card glass-card" data-person="'+p.person+'"><div class="family-avatar" style="background:linear-gradient(135deg,'+p.color+' 0%,'+this.adjustColor(p.color,-30)+' 100%)"><span>'+p.initial+'</span></div><div class="family-info"><div class="family-name">'+p.name+'</div><div class="family-status" id="status-'+p.name.toLowerCase()+'">Loading...</div><div class="family-location" id="location-'+p.name.toLowerCase()+'"></div></div><div class="family-battery" id="battery-'+p.name.toLowerCase()+'"></div></div>').join('')}
        </div>
        <div class="map-container glass-card">
          <div id="family-map"></div>
          <div class="map-controls">
            <button class="map-ctrl-btn glass-card active" id="map-satellite"><span class="mdi mdi-satellite-variant"></span></button>
            <button class="map-ctrl-btn glass-card" id="map-street"><span class="mdi mdi-map"></span></button>
            <button class="map-ctrl-btn glass-card" id="map-center"><span class="mdi mdi-home"></span></button>
          </div>
        </div>
      </div>`;
    setTimeout(() => this.initMap(), 100);
    this.bindEvents();
  }

  initMap() {
    const el = document.getElementById('family-map');
    if (!el || this.map) return;
    const home = this.config.get('home.coords') || [33.3552, -82.1134];
    this.map = L.map('family-map', { center: home, zoom: 15, zoomControl: false });
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    this.layers = {
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri', maxZoom: 19 }),
      street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM', maxZoom: 19 })
    };
    this.layers.satellite.addTo(this.map);
    this.updateMarkers();
  }

  bindEvents() {
    document.getElementById('map-satellite')?.addEventListener('click', () => this.setLayer('satellite'));
    document.getElementById('map-street')?.addEventListener('click', () => this.setLayer('street'));
    document.getElementById('map-center')?.addEventListener('click', () => this.fitBounds());
  }

  setLayer(name) {
    if (!this.map || !this.layers) return;
    Object.values(this.layers).forEach(l => { if (this.map.hasLayer(l)) this.map.removeLayer(l); });
    this.layers[name]?.addTo(this.map);
    document.getElementById('map-satellite')?.classList.toggle('active', name === 'satellite');
    document.getElementById('map-street')?.classList.toggle('active', name === 'street');
  }

  fitBounds() {
    if (!this.map) return;
    if (Object.keys(this.markers).length === 0) {
      const home = this.config.get('home.coords');
      if (home) this.map.setView(home, 15);
      return;
    }
    const bounds = L.latLngBounds([]);
    Object.values(this.markers).forEach(m => bounds.extend(m.getLatLng()));
    if (bounds.isValid()) this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  }

  subscribe() {
    const family = this.config.get('entities.family') || [];
    family.forEach(p => {
      this.store.subscribeEntity(p.person, (e) => this.updatePersonCard(p, e, null));
      this.store.subscribeEntity(p.tracker, (t) => { this.updatePersonCard(p, null, t); this.updateMarker(p, t); });
    });
  }

  updatePersonCard(person, personEntity, tracker) {
    const n = person.name.toLowerCase();
    if (personEntity) {
      const home = personEntity.state === 'home';
      const card = document.querySelector('[data-person="'+person.person+'"]');
      card?.classList.toggle('home', home);
      card?.classList.toggle('away', !home);
      const st = document.getElementById('status-' + n);
      if (st) st.innerHTML = home ? '🏠 Home' : '📍 Away';
    }
    if (tracker) {
      const drv = tracker.attributes?.driving;
      const addr = tracker.attributes?.address;
      const batt = tracker.attributes?.battery_level;
      const chrg = tracker.attributes?.battery_charging;
      const st = document.getElementById('status-' + n);
      if (st && drv) st.innerHTML = '🚗 Driving';
      const loc = document.getElementById('location-' + n);
      if (loc && addr) loc.textContent = addr.length > 40 ? addr.substring(0, 37) + '...' : addr;
      const bat = document.getElementById('battery-' + n);
      if (bat && batt !== undefined) bat.textContent = (chrg ? '⚡' : '🔋') + ' ' + batt + '%';
    }
  }

  updateMarker(person, tracker) {
    if (!this.map || !tracker?.attributes?.latitude) return;
    const lat = tracker.attributes.latitude, lng = tracker.attributes.longitude;
    const drv = tracker.attributes.driving;
    if (this.markers[person.name]) {
      this.markers[person.name].setLatLng([lat, lng]);
    } else {
      const icon = L.divIcon({
        html: '<div class="person-marker '+(drv?'driving':'')+'" style="background:'+person.color+';display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px;border-radius:50%;width:40px;height:40px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)">'+person.initial+'</div>',
        className: 'person-marker-container', iconSize: [40, 40], iconAnchor: [20, 20]
      });
      this.markers[person.name] = L.marker([lat, lng], { icon }).addTo(this.map);
    }
  }

  updateMarkers() {
    const family = this.config.get('entities.family') || [];
    family.forEach(p => { const t = this.store.getEntity(p.tracker); if (t) this.updateMarker(p, t); });
  }

  adjustColor(hex, amt) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amt));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amt));
    const b = Math.min(255, Math.max(0, (num & 0xFF) + amt));
    return '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
  }
}
