import { formatTime } from '../utils.js';

export class MediaPlayer {
  constructor(store, api, config) {
    this.store = store; this.api = api; this.config = config;
    this.container = document.getElementById('page-media');
    this.progressInterval = null; this.volumeDragging = false; this.progressDragging = false;
    this.els = {};
    this.render(); this.subscribe();
  }

  render() {
    if (!this.container) return;
    const speakers = this.config.get('entities.media.speakers') || [];
    const playlists = this.config.get('playlists.quick') || [];
    this.container.innerHTML = `
      <div class="page-content media-page">
        <div class="media-bg" id="media-bg"></div>
        <div class="media-player glass-card">
          <div class="album-art" id="album-art"><span class="mdi mdi-music"></span></div>
          <div class="track-info">
            <div class="track-title" id="track-title">Not Playing</div>
            <div class="track-artist" id="track-artist">Select a speaker to start</div>
            <div class="track-album" id="track-album"></div>
          </div>
          <div class="progress-container">
            <span class="progress-time" id="progress-current">0:00</span>
            <div class="progress-bar" id="progress-bar"><div class="progress-fill" id="progress-fill"></div><div class="progress-handle" id="progress-handle"></div></div>
            <span class="progress-time" id="progress-total">0:00</span>
          </div>
          <div class="playback-controls">
            <button class="ctrl-btn" id="btn-shuffle" title="Shuffle"><span class="mdi mdi-shuffle"></span></button>
            <button class="ctrl-btn" id="btn-prev" title="Previous"><span class="mdi mdi-skip-previous"></span></button>
            <button class="ctrl-btn ctrl-btn-main" id="btn-play" title="Play/Pause"><span class="mdi mdi-play"></span></button>
            <button class="ctrl-btn" id="btn-next" title="Next"><span class="mdi mdi-skip-next"></span></button>
            <button class="ctrl-btn" id="btn-repeat" title="Repeat"><span class="mdi mdi-repeat"></span></button>
          </div>
          <div class="volume-container">
            <span class="mdi mdi-volume-medium" id="volume-icon"></span>
            <div class="volume-bar" id="volume-bar"><div class="volume-fill" id="volume-fill"></div><div class="volume-handle" id="volume-handle"></div></div>
            <span class="volume-percent" id="volume-percent">50%</span>
          </div>
        </div>
        <div class="section-header glass-card"><span class="mdi mdi-speaker-multiple"></span><span>Speakers</span></div>
        <div class="speaker-grid" id="speaker-grid">
          ${speakers.map((s, i) => '<label class="speaker-item glass-card" data-entity="'+s.id+'"><input type="radio" name="speaker" class="speaker-radio" '+(i===0?'checked':'')+'><span class="mdi mdi-'+(s.icon||'speaker')+'"></span><span class="speaker-name">'+s.name+'</span></label>').join('')}
        </div>
        <div class="section-header glass-card"><span class="mdi mdi-playlist-music"></span><span>Quick Playlists</span></div>
        <div class="playlist-grid" id="playlist-grid">
          ${playlists.map(p => '<button class="playlist-btn glass-card" data-uri="'+p.uri+'"><span class="mdi mdi-'+(p.icon||'music-note')+'"></span><span>'+p.name+'</span></button>').join('')}
        </div>
      </div>`;
    this.cacheElements(); this.bindEvents();
  }

  cacheElements() {
    ['media-bg','album-art','track-title','track-artist','track-album','progress-bar','progress-fill','progress-handle','progress-current','progress-total','btn-play','btn-prev','btn-next','btn-shuffle','btn-repeat','volume-bar','volume-fill','volume-handle','volume-percent','volume-icon'].forEach(id => {
      const key = id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      this.els[key] = document.getElementById(id);
    });
  }

  bindEvents() {
    const spId = this.config.get('entities.media.spotify');
    this.els.btnPlay?.addEventListener('click', () => this.api.mediaPlayPause(spId));
    this.els.btnPrev?.addEventListener('click', () => this.api.mediaPrev(spId));
    this.els.btnNext?.addEventListener('click', () => this.api.mediaNext(spId));
    this.els.btnShuffle?.addEventListener('click', () => {
      const e = this.store.getEntity(spId);
      this.api.callService('media_player', 'shuffle_set', { entity_id: spId, shuffle: !(e?.attributes?.shuffle) });
    });
    this.els.btnRepeat?.addEventListener('click', () => {
      const e = this.store.getEntity(spId);
      const cur = e?.attributes?.repeat || 'off';
      this.api.callService('media_player', 'repeat_set', { entity_id: spId, repeat: cur === 'off' ? 'all' : cur === 'all' ? 'one' : 'off' });
    });
    this.initProgressBar(spId); this.initVolumeBar(spId);
    document.querySelectorAll('.playlist-btn').forEach(btn => {
      btn.addEventListener('click', () => this.api.callService('media_player', 'play_media', { entity_id: spId, media_content_type: 'playlist', media_content_id: btn.dataset.uri }));
    });
  }

  initProgressBar(spId) {
    if (!this.els.progressBar) return;
    const seek = (e) => {
      const r = this.els.progressBar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      const ent = this.store.getEntity(spId);
      const dur = ent?.attributes?.media_duration || 0;
      this.els.progressFill.style.width = (pct * 100) + '%';
      this.els.progressHandle.style.left = (pct * 100) + '%';
      return Math.floor(pct * dur);
    };
    this.els.progressBar.addEventListener('mousedown', (e) => { this.progressDragging = true; seek(e); });
    document.addEventListener('mousemove', (e) => { if (this.progressDragging) seek(e); });
    document.addEventListener('mouseup', (e) => { if (this.progressDragging) { this.progressDragging = false; this.api.mediaSeek(spId, seek(e)); } });
  }

  initVolumeBar(spId) {
    if (!this.els.volumeBar) return;
    const setV = (e) => {
      const r = this.els.volumeBar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      this.els.volumeFill.style.width = (pct * 100) + '%';
      this.els.volumeHandle.style.left = (pct * 100) + '%';
      this.els.volumePercent.textContent = Math.round(pct * 100) + '%';
      return pct;
    };
    this.els.volumeBar.addEventListener('mousedown', (e) => { this.volumeDragging = true; setV(e); });
    document.addEventListener('mousemove', (e) => { if (this.volumeDragging) setV(e); });
    document.addEventListener('mouseup', (e) => { if (this.volumeDragging) { this.volumeDragging = false; this.api.mediaSetVolume(spId, setV(e)); } });
  }

  subscribe() {
    const spId = this.config.get('entities.media.spotify');
    this.store.subscribeEntity(spId, (e) => this.update(e));
    this.startProgressTimer();
  }

  update(entity) {
    if (!entity) return;
    const playing = entity.state === 'playing';
    const a = entity.attributes || {};
    if (this.els.albumArt) {
      if (a.entity_picture) {
        const url = this.config.get('app.haUrl') + a.entity_picture;
        this.els.albumArt.innerHTML = '<img src="'+url+'" alt="Album">';
        if (this.els.mediaBg) { this.els.mediaBg.style.backgroundImage = 'url('+url+')'; this.els.mediaBg.classList.toggle('visible', playing); }
      } else {
        this.els.albumArt.innerHTML = '<span class="mdi mdi-music"></span>';
        if (this.els.mediaBg) this.els.mediaBg.classList.remove('visible');
      }
    }
    if (this.els.trackTitle) this.els.trackTitle.textContent = a.media_title || 'Not Playing';
    if (this.els.trackArtist) this.els.trackArtist.textContent = a.media_artist || 'Select a speaker';
    if (this.els.trackAlbum) this.els.trackAlbum.textContent = a.media_album_name || '';
    if (this.els.btnPlay) this.els.btnPlay.querySelector('.mdi').className = 'mdi mdi-' + (playing ? 'pause' : 'play');
    if (this.els.btnShuffle) this.els.btnShuffle.classList.toggle('active', a.shuffle === true);
    if (this.els.btnRepeat) {
      const rep = a.repeat || 'off';
      this.els.btnRepeat.classList.toggle('active', rep !== 'off');
      this.els.btnRepeat.querySelector('.mdi').className = 'mdi mdi-' + (rep === 'one' ? 'repeat-once' : 'repeat');
    }
    if (!this.progressDragging) {
      const dur = a.media_duration || 0, pos = a.media_position || 0;
      const pct = dur > 0 ? (pos / dur) * 100 : 0;
      if (this.els.progressFill) this.els.progressFill.style.width = pct + '%';
      if (this.els.progressHandle) this.els.progressHandle.style.left = pct + '%';
      if (this.els.progressCurrent) this.els.progressCurrent.textContent = formatTime(pos);
      if (this.els.progressTotal) this.els.progressTotal.textContent = formatTime(dur);
    }
    if (!this.volumeDragging && a.volume_level !== undefined) {
      const vol = Math.round(a.volume_level * 100);
      if (this.els.volumeFill) this.els.volumeFill.style.width = vol + '%';
      if (this.els.volumeHandle) this.els.volumeHandle.style.left = vol + '%';
      if (this.els.volumePercent) this.els.volumePercent.textContent = vol + '%';
      if (this.els.volumeIcon) this.els.volumeIcon.className = 'mdi mdi-volume-' + (vol === 0 ? 'off' : vol < 50 ? 'medium' : 'high');
    }
  }

  startProgressTimer() {
    if (this.progressInterval) clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      const spId = this.config.get('entities.media.spotify');
      const e = this.store.getEntity(spId);
      if (e?.state === 'playing' && !this.progressDragging) {
        const a = e.attributes || {};
        const dur = a.media_duration || 0, pos = a.media_position || 0, upd = a.media_position_updated_at;
        if (upd && dur > 0) {
          const elapsed = (Date.now() - new Date(upd).getTime()) / 1000;
          const cur = Math.min(pos + elapsed, dur);
          const pct = (cur / dur) * 100;
          if (this.els.progressFill) this.els.progressFill.style.width = pct + '%';
          if (this.els.progressHandle) this.els.progressHandle.style.left = pct + '%';
          if (this.els.progressCurrent) this.els.progressCurrent.textContent = formatTime(cur);
        }
      }
    }, 1000);
  }
}
