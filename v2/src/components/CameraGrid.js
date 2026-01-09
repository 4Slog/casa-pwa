export class CameraGrid {
  constructor(store, api, config) {
    this.store = store; this.api = api; this.config = config;
    this.container = document.getElementById('page-cameras');
    this.refreshIntervals = {};
    this.render();
  }

  render() {
    if (!this.container) return;
    const cameras = this.config.get('entities.cameras') || [];
    const featured = cameras.find(c => c.featured);
    const others = cameras.filter(c => !c.featured);
    this.container.innerHTML = `
      <div class="page-content cameras-page">
        <div class="section-header glass-card"><span class="mdi mdi-cctv"></span><span>Security Cameras</span></div>
        ${featured ? '<div class="camera-featured glass-card"><div class="camera-stream" data-camera="'+featured.id+'"><img id="camera-featured-img" src="" alt="'+featured.name+'"><div class="camera-label">'+featured.name+'</div><div class="camera-loading" id="camera-featured-loading"><span class="mdi mdi-loading mdi-spin"></span></div></div></div>' : ''}
        <div class="camera-grid">
          ${others.map(c => '<div class="camera-thumb glass-card" data-camera="'+c.id+'"><img id="camera-'+c.id.split('.')[1]+'-img" src="" alt="'+c.name+'"><div class="camera-label">'+c.name+'</div></div>').join('')}
        </div>
      </div>`;
  }

  startRefresh() {
    this.stopRefresh();
    const cameras = this.config.get('entities.cameras') || [];
    const interval = this.config.getRefreshInterval('camera');
    cameras.forEach(c => {
      this.refreshCamera(c.id, c.featured);
      this.refreshIntervals[c.id] = setInterval(() => this.refreshCamera(c.id, c.featured), interval);
    });
  }

  stopRefresh() {
    Object.values(this.refreshIntervals).forEach(clearInterval);
    this.refreshIntervals = {};
  }

  refreshCamera(entityId, featured) {
    const img = featured ? document.getElementById('camera-featured-img') : document.getElementById('camera-' + entityId.split('.')[1] + '-img');
    if (!img) return;
    const url = this.api.getCameraProxyUrl(entityId);
    fetch(url).then(r => r.blob()).then(blob => {
      img.src = URL.createObjectURL(blob);
      if (featured) document.getElementById('camera-featured-loading')?.classList.add('hidden');
    }).catch(e => console.error('Camera error:', e));
  }
}
