import { createElement } from '../utils.js';

export class DeviceCard {
  constructor(store, api, config, deviceConfig) {
    this.store = store; this.api = api; this.config = config;
    this.deviceConfig = deviceConfig; this.element = null; this.unsubscribe = null;
    this.create(); this.subscribe();
  }

  create() {
    const { id, name, icon, type } = this.deviceConfig;
    const domain = id.split('.')[0];
    this.element = createElement('div', { className: 'device-card glass-card', dataset: { entity: id, type: type || domain } },
      createElement('div', { className: 'device-glow' }),
      createElement('div', { className: 'device-icon' }, createElement('span', { className: 'mdi mdi-' + (icon || this.getDefaultIcon(domain)) })),
      createElement('div', { className: 'device-name' }, name),
      createElement('div', { className: 'device-state' }, 'Loading...')
    );
    this.element.addEventListener('click', (e) => { if (!e.target.closest('.device-slider')) this.toggle(); });
    let pt;
    this.element.addEventListener('mousedown', () => { pt = setTimeout(() => this.openDetails(), 500); });
    this.element.addEventListener('mouseup', () => clearTimeout(pt));
    this.element.addEventListener('mouseleave', () => clearTimeout(pt));
    this.element.addEventListener('touchstart', () => { pt = setTimeout(() => this.openDetails(), 500); }, { passive: true });
    this.element.addEventListener('touchend', () => clearTimeout(pt));
    return this.element;
  }

  subscribe() {
    this.unsubscribe = this.store.subscribeEntity(this.deviceConfig.id, (e) => this.update(e));
    const e = this.store.getEntity(this.deviceConfig.id);
    if (e) this.update(e);
  }

  update(entity) {
    if (!entity || !this.element) return;
    const isOn = entity.state === 'on';
    const domain = this.deviceConfig.id.split('.')[0];
    const stateEl = this.element.querySelector('.device-state');
    const iconEl = this.element.querySelector('.device-icon .mdi');
    this.element.classList.toggle('on', isOn);
    if (stateEl) {
      if (domain === 'cover') {
        const pos = entity.attributes?.current_tilt_position || 0;
        stateEl.textContent = entity.state === 'opening' ? 'Opening...' : entity.state === 'closing' ? 'Closing...' : pos > 5 && pos < 95 ? 'Open ' + pos + '%' : 'Closed';
      } else if (isOn && entity.attributes?.brightness) {
        stateEl.textContent = Math.round((entity.attributes.brightness / 255) * 100) + '%';
      } else stateEl.textContent = isOn ? 'On' : 'Off';
    }
    if (domain === 'fan' && iconEl) iconEl.classList.toggle('spinning', isOn);
    this.updateGlow(entity, isOn);
  }

  updateGlow(entity, isOn) {
    const g = this.element.querySelector('.device-glow');
    if (!g) return;
    const d = this.deviceConfig.id.split('.')[0];
    if (!isOn) { g.style.opacity = '0'; return; }
    g.style.opacity = '1';
    const rgb = entity.attributes?.rgb_color;
    if (d === 'light') g.style.background = rgb ? 'radial-gradient(circle, rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0.4) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(255,200,100,0.4) 0%, transparent 70%)';
    else if (d === 'fan') g.style.background = 'radial-gradient(circle, rgba(79,172,254,0.4) 0%, transparent 70%)';
    else if (d === 'switch') g.style.background = 'radial-gradient(circle, rgba(250,112,154,0.4) 0%, transparent 70%)';
    else if (d === 'cover') g.style.background = 'radial-gradient(circle, rgba(247,151,30,0.4) 0%, transparent 70%)';
  }

  toggle() { this.api.toggleEntity(this.deviceConfig.id); this.element.classList.add('toggling'); setTimeout(() => this.element.classList.remove('toggling'), 300); }
  openDetails() { document.dispatchEvent(new CustomEvent('device-details', { detail: { entityId: this.deviceConfig.id, config: this.deviceConfig } })); }
  getDefaultIcon(d) { return { light: 'lightbulb', fan: 'fan', switch: 'toggle-switch', cover: 'blinds', script: 'script-text' }[d] || 'checkbox-blank-circle'; }
  destroy() { if (this.unsubscribe) this.unsubscribe(); if (this.element) this.element.remove(); }
}

export class DeviceGroupCard {
  constructor(store, api, config, groupConfig) {
    this.store = store; this.api = api; this.config = config;
    this.groupConfig = groupConfig; this.element = null; this.unsubscribes = [];
    this.create(); this.subscribe();
  }

  create() {
    const { name, icon, entities } = this.groupConfig;
    this.element = createElement('div', { className: 'device-card device-group glass-card', dataset: { type: 'group' } },
      createElement('div', { className: 'device-glow' }),
      createElement('div', { className: 'device-icon' }, createElement('span', { className: 'mdi mdi-' + (icon || 'lightbulb-multiple') })),
      createElement('div', { className: 'device-name' }, name),
      createElement('div', { className: 'device-state' }, '0/' + entities.length + ' On')
    );
    this.element.addEventListener('click', () => this.toggleAll());
    return this.element;
  }

  subscribe() {
    this.groupConfig.entities.forEach(id => this.unsubscribes.push(this.store.subscribeEntity(id, () => this.updateCount())));
    this.updateCount();
  }

  updateCount() {
    const ents = this.groupConfig.entities;
    const onCt = ents.filter(id => this.store.isEntityOn(id)).length;
    const se = this.element.querySelector('.device-state');
    if (se) se.textContent = onCt + '/' + ents.length + ' On';
    this.element.classList.toggle('on', onCt > 0);
    const g = this.element.querySelector('.device-glow');
    if (g) { g.style.opacity = onCt > 0 ? '1' : '0'; g.style.background = 'radial-gradient(circle, rgba(255,234,167,0.4) 0%, transparent 70%)'; }
  }

  toggleAll() {
    const ents = this.groupConfig.entities;
    const anyOn = ents.some(id => this.store.isEntityOn(id));
    ents.forEach(id => { const on = this.store.isEntityOn(id); if ((anyOn && on) || (!anyOn && !on)) this.api.toggleEntity(id); });
  }

  destroy() { this.unsubscribes.forEach(u => u()); if (this.element) this.element.remove(); }
}
