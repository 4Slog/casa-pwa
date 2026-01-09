/**
 * Casa de Sowu PWA v2.0
 * Camera Grid Component - Fixed with proper authentication
 */

export class CameraGrid {
  constructor(store, api, config) {
    this.store = store;
    this.api = api;
    this.config = config;
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
        <div class="section-header glass-card">
          <span class="mdi mdi-cctv"></span>
          <span>Security Cameras</span>
        </div>
        ${featured ? `
          <div class="camera-featured glass-card">
            <div class="camera-stream" data-camera="${featured.id}">
              <img id="camera-featured-img" src="" alt="${featured.name}" crossorigin="anonymous">
              <div class="camera-label">${featured.name}</div>
              <div class="camera-loading" id="camera-featured-loading">
                <span class="mdi mdi-loading mdi-spin"></span>
              </div>
              <div class="camera-error hidden" id="camera-featured-error">
                <span class="mdi mdi-camera-off"></span>
                <span>Unable to load</span>
              </div>
            </div>
          </div>
        ` : ''}
        <div class="camera-grid">
          ${others.map(c => `
            <div class="camera-thumb glass-card" data-camera="${c.id}">
              <img id="camera-${c.id.split('.')[1]}-img" src="" alt="${c.name}" crossorigin="anonymous">
              <div class="camera-label">${c.name}</div>
              <div class="camera-loading" id="camera-${c.id.split('.')[1]}-loading">
                <span class="mdi mdi-loading mdi-spin"></span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  startRefresh() {
    console.log('📹 Starting camera refresh...');
    this.stopRefresh();
    const cameras = this.config.get('entities.cameras') || [];
    const interval = this.config.getRefreshInterval?.('camera') || 10000;

    cameras.forEach(cam => {
      this.refreshCamera(cam.id, cam.featured);
      this.refreshIntervals[cam.id] = setInterval(() => {
        this.refreshCamera(cam.id, cam.featured);
      }, interval);
    });
  }

  stopRefresh() {
    Object.values(this.refreshIntervals).forEach(clearInterval);
    this.refreshIntervals = {};
  }

  async refreshCamera(entityId, featured) {
    const camKey = entityId.split('.')[1];
    const imgEl = featured
      ? document.getElementById('camera-featured-img')
      : document.getElementById(`camera-${camKey}-img`);
    const loadingEl = featured
      ? document.getElementById('camera-featured-loading')
      : document.getElementById(`camera-${camKey}-loading`);
    const errorEl = featured
      ? document.getElementById('camera-featured-error')
      : null;

    if (!imgEl) {
      console.warn('Camera img element not found:', entityId);
      return;
    }

    try {
      // Get token from API instance
      const token = this.api.accessToken;

      if (!token) {
        console.error('No auth token for camera');
        loadingEl?.classList.add('hidden');
        if (errorEl) errorEl.classList.remove('hidden');
        return;
      }

      // Use the camera proxy endpoint with auth header
      const haUrl = this.config.get('app.haUrl');
      const url = `${haUrl}/api/camera_proxy/${entityId}`;
      console.log('📷 Fetching camera:', entityId);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Camera fetch failed: ${response.status}`);
      }

      const blob = await response.blob();

      // Revoke old object URL to prevent memory leak
      if (imgEl.src && imgEl.src.startsWith('blob:')) {
        URL.revokeObjectURL(imgEl.src);
      }

      imgEl.src = URL.createObjectURL(blob);
      loadingEl?.classList.add('hidden');
      errorEl?.classList.add('hidden');

    } catch (error) {
      console.error('Camera refresh error:', entityId, error);
      loadingEl?.classList.add('hidden');
      if (errorEl) {
        errorEl.classList.remove('hidden');
      }
    }
  }
}
