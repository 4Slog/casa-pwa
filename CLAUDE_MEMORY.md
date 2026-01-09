# Claude Memory - Casa de Sowu PWA v2.0

> Persistent context for Claude Code (little bro) and Claude.ai (big bro)
> Last Updated: 2026-01-09

---

## Project Identity

| Key | Value |
|-----|-------|
| **Project** | Casa de Sowu PWA v2.0 |
| **Purpose** | Custom Home Assistant dashboard PWA |
| **Live URL** | https://app.casadesowu.com |
| **HA URL** | https://ha.casadesowu.com |
| **Local Path** | /var/www/casa-app |
| **GitHub** | https://github.com/4Slog/casa-pwa |
| **Big Bro Reads** | gdrive:HomeAssistant-Config/for-claude/ |

---

## Architecture Decisions

### Tech Stack (Locked In)
- **Frontend:** Vanilla HTML/CSS/JavaScript (NO frameworks)
- **State Management:** Single AppState class with localStorage persistence
- **Communication:** Home Assistant WebSocket API
- **Authentication:** OAuth2 with token refresh
- **PWA:** Service Worker + Web App Manifest
- **Maps:** Leaflet.js with ArcGIS/OSM tiles
- **Icons:** Material Design Icons (mdi)
- **Fonts:** Outfit (UI), JetBrains Mono (data)

### Design System: "Deep Glass & Neon"
- **Background:** Deep space (#0d0d12 to #1a1a2e)
- **Cards:** Glassmorphism with blur, 200px size, rounded corners
- **Accents:** RGB neon gradients (cyan #4facfe, magenta #f093fb, purple #667eea)
- **Status Rings:** Pulsing RGB halos around active entities
- **Transitions:** Smooth 0.3s ease for all interactions

### File Organization
```
/var/www/casa-app/
├── index.html          # Single page with all HTML structure
├── manifest.json       # PWA manifest
├── sw.js              # Service worker (cache-first strategy)
├── css/main.css       # All styles (no CSS-in-JS)
├── js/app.js          # All JavaScript (single file)
├── icons/             # PWA icons 72-512px
├── PROJECT_SPEC.md    # Project specification
├── CLAUDE_MEMORY.md   # This file
└── TASKS.md           # Task tracking
```

---

## Entity IDs Reference

### Media Players
```javascript
ENTITIES.spotify = 'media_player.spotify_paul_sowu'
ENTITIES.spotifyPlus = 'media_player.spotifyplus_paul_sowu'
ENTITIES.speakers = [
  { entity: 'media_player.great_room_dot', name: 'Great Room dot', icon: 'speaker' },
  { entity: 'media_player.office', name: 'Great Room show', icon: 'tablet' },
  { entity: 'media_player.living_room_tv', name: 'Living Room TV', icon: 'television' },
  { entity: 'media_player.living_room', name: 'Living Room', icon: 'speaker' },
  { entity: 'media_player.show_8', name: 'Show 8', icon: 'tablet' },
  { entity: 'media_player.mauriece_dot', name: 'Mauriece dot', icon: 'speaker' },
  { entity: 'media_player.vlc_telnet', name: 'Server Speaker', icon: 'bluetooth-audio' },
]
```

### Lighting
```javascript
ENTITIES.commonLights = [
  'light.great_room_fan_and_light',
  'light.dining_room_main_light',
  'light.kitchen_light_switch',
  'switch.master_hallway',
]
ENTITIES.blinds = 'cover.blind_tilt_5b8c'
ENTITIES.masterScript = 'script.toggle_main_lights'
```

### Climate
```javascript
ENTITIES.weather = 'weather.forecast_home'
ENTITIES.thermostat = 'climate.thermostat'
ENTITIES.autoComfort = 'input_boolean.hvac_auto_comfort'
ENTITIES.temps = {
  master: 'sensor.lumi_lumi_weather_temperature',
  galley: 'sensor.temp_bedroom_wing_temperature',
  blue: 'sensor.temp_bedroom_wing_temperature_2',
  average: 'sensor.average_home_temperature',
}
```

### People & Tracking
```javascript
ENTITIES.persons = [
  { entity: 'person.paul', name: 'Paul', tracker: 'device_tracker.paul_360', color: '#667eea' },
  { entity: 'person.tuella_sowu', name: 'Tuella', tracker: 'device_tracker.tuella_360', color: '#f093fb' },
  { entity: 'person.mauriece', name: 'Mauriece', tracker: 'device_tracker.mauriece_360', color: '#4facfe' },
]
```

### Calendars
```javascript
ENTITIES.calendars = [
  'calendar.thesowus_gmail_com',
  'calendar.sowu_paul_gmail_com',
  'calendar.family',
  'calendar.augusta_eagles_varsity_boys_basketball',
]
```

### Tasks/Todos
```javascript
ENTITIES.tasks = {
  house: 'todo.house_tasks',
  paul: 'todo.paul',
  tuella: 'todo.tuella',
}
```

### Cameras
```javascript
ENTITIES.cameras = {
  main: 'camera.10_0_0_60',
  wyze: 'camera.wyze_cam',
  pan: 'camera.pan_cam',
  redbase: 'camera.redbase',
}
```

### Config Constants
```javascript
CONFIG = {
  STORAGE_KEY: 'casa_de_sowu_config',
  RECONNECT_INTERVAL: 5000,
  CAMERA_REFRESH_INTERVAL: 2000,
  MAP_UPDATE_INTERVAL: 10000,
  HOME_COORDS: [33.3552, -82.1134],
  HA_URL: 'https://ha.casadesowu.com',
}
```

---

## Known Issues & Gotchas

### RESOLVED
1. **WebSocket 403 Forbidden** - IP `71.203.72.143` was banned in HA's `ip_bans.yaml`. Fixed by removing the ban file.
2. **HTTP/2 421 Misdirected Request** - app.casadesowu.com had HTTP/2 off while other subdomains had it on. Fixed by enabling HTTP/2 on all.

### CURRENT
1. **Service Worker Cache** - Updates not invalidating properly. Need versioned cache names.
2. **Token Refresh Race** - Occasional race condition when token expires during request.
3. **Map Markers** - Driving status icon update sometimes lags.

### WATCH OUT FOR
- HA uses ISO datetime strings, JS needs `new Date()` parsing
- WebSocket message IDs must be unique per session (use `state.wsId++`)
- Camera proxy requires Bearer token in header
- Spotify attributes: `media_position_updated_at` is ISO string, not timestamp
- Cover entities use `tilt_position` not `position` for blinds

---

## Infrastructure

### Nginx Proxy Manager
- **Container:** npm (jc21/nginx-proxy-manager:latest)
- **Admin:** http://10.0.0.60:81
- **SSL:** Let's Encrypt auto-renewal
- **WebSocket:** Enabled for all proxies
- **HTTP/2:** Enabled on all *.casadesowu.com

### Home Assistant
- **Container:** homeassistant (ghcr.io/home-assistant/home-assistant:2026.1.0)
- **Config:** /home/paul/docker/homeassistant/config
- **Port:** 8123 internal
- **CORS:** Allows https://app.casadesowu.com

### Sync Infrastructure
- **rclone remote:** gdrive:HomeAssistant-Config/
- **Sync script:** ~/scripts/sync_pwa_spec.sh
- **GDoc converter:** ~/scripts/gdrive_auto_converter.py

---

## Session History

### 2026-01-09 - Session 1
**Focus:** Infrastructure setup and debugging

**Completed:**
- Diagnosed NPM proxy issues for app.casadesowu.com
- Fixed IP ban blocking all HA external access
- Enabled HTTP/2 on app.casadesowu.com
- Verified WebSocket connection working
- Created GitHub repo 4Slog/casa-pwa
- Initialized git in /var/www/casa-app
- Created PROJECT_SPEC.md
- Set up Google Drive sync for Claude.ai visibility
- Converted PROJECT_SPEC.md to Google Doc
- Created CLAUDE_MEMORY.md (this file)
- Created TASKS.md for task tracking

**Key Learnings:**
- HA ip_bans.yaml silently blocks all requests from banned IPs
- HTTP/2 ALPN mismatch causes 421 errors across subdomains
- rclone --drive-import-formats doesn't convert to Google Docs in v1.60
- Use Python gdrive_auto_converter.py for Google Doc creation

---

## Quick Reference

### Update Task Status
```bash
~/scripts/update_pwa_task.sh T001 done
```

### Sync to Google Drive
```bash
~/scripts/sync_pwa_spec.sh
```

### Convert to Google Doc
```bash
python3 ~/scripts/gdrive_auto_converter.py /var/www/casa-app/CLAUDE_MEMORY.md
```

### Git Commit & Push
```bash
cd /var/www/casa-app
git add -A && git commit -m "message" && git push
```

### Test WebSocket
```bash
curl -s -i --http1.1 \
  -H "Upgrade: websocket" \
  -H "Connection: Upgrade" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  -H "Sec-WebSocket-Version: 13" \
  https://ha.casadesowu.com/api/websocket
```

### Session: 2026-01-09 17:00
- Completed T104-T107 (Core Modules)
- api.js: Full WebSocket, OAuth, service calls
- store.js: Reactive Pub/Sub state management
- config.js: JSON config loader with dot notation
- utils.js: Formatters, helpers, DOM utilities

### Session: 2026-01-09 17:21
- Completed T108-T109 (UI Components Part 1)
- Header.js: Dynamic Island with context-aware display
- DeviceCard.js: Glassmorphism cards with glow effects
- DeviceGroupCard: Multi-entity control
- Updated index.js with navigation and Magic FAB
