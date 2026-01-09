# Casa de Sowu PWA v2.0 - Project Specification

## Overview
Custom Progressive Web App for controlling Home Assistant smart home system.
This document serves as the bridge between Claude Code (CLI) and Claude.ai (web).

**Last Updated:** 2026-01-09
**Repository:** https://github.com/4Slog/casa-pwa
**Local Path:** /var/www/casa-app
**Live URL:** https://app.casadesowu.com

---

## Architecture

### Tech Stack
- **Frontend:** Vanilla HTML/CSS/JavaScript (no framework)
- **PWA:** Service Worker + Web App Manifest
- **Backend:** Home Assistant WebSocket API
- **Proxy:** Nginx Proxy Manager (NPM)
- **Hosting:** Self-hosted on Ubuntu server

### Key URLs
| Service | Internal | External |
|---------|----------|----------|
| Home Assistant | http://10.0.0.60:8123 | https://ha.casadesowu.com |
| PWA | http://10.0.0.60:8090 | https://app.casadesowu.com |
| NPM Admin | http://10.0.0.60:81 | - |

### File Structure
```
/var/www/casa-app/
├── index.html          # Main app (single page)
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── css/
│   └── main.css       # All styles
├── js/
│   └── app.js         # Main application logic
├── icons/             # PWA icons (72-512px)
├── PROJECT_SPEC.md    # This file (synced to GDrive)
└── DEPLOYMENT.md      # Deployment notes
```

---

## Current Features (v1.0)

### Authentication
- [x] OAuth2 flow with Home Assistant
- [x] Long-lived access token fallback
- [x] Secure token storage (localStorage)
- [x] Auto-reconnect on connection loss

### Dashboard Sections
- [x] Climate control (thermostat)
- [x] Lighting controls (rooms, scenes)
- [x] Media players (Spotify, speakers)
- [x] Security cameras (RTSP streams)
- [x] Person tracking (location map)
- [x] Quick actions (scenes, automations)

### PWA Capabilities
- [x] Installable on mobile/desktop
- [x] Offline indicator
- [x] Service worker caching
- [x] iOS standalone mode

---

## v2.0 Roadmap

### Priority 1: Core Improvements
- [ ] Fix WebSocket reconnection reliability
- [ ] Improve error handling and user feedback
- [ ] Add loading states for all actions
- [ ] Optimize initial load time

### Priority 2: New Features
- [ ] Push notifications for alerts
- [ ] Voice control integration
- [ ] Dashboard customization (drag/drop)
- [ ] Multi-user support (profiles)

### Priority 3: UI/UX
- [ ] Dark/light theme toggle
- [ ] Accessibility improvements (ARIA)
- [ ] Animation refinements
- [ ] Tablet-optimized layout

---

## Development Workflow

### Claude Code (CLI) - "Little Bro"
- Direct file access at /var/www/casa-app
- Git operations and GitHub sync
- Server-side testing and debugging
- Updates PROJECT_SPEC.md with progress

### Claude.ai (Web) - "Big Bro"
- Reads PROJECT_SPEC.md from Google Drive
- Provides architectural guidance
- Reviews code changes
- Suggests improvements

### Sync Flow
```
Claude Code --> Git commit --> GitHub
Claude Code --> rclone --> Google Drive --> Claude.ai reads
Claude.ai --> Google Drive (claude-updates/) --> Server applies
```

---

## Configuration

### Home Assistant Integration
The PWA connects via WebSocket to Home Assistant.

**Required HA Configuration (configuration.yaml):**
```yaml
http:
  use_x_forwarded_for: true
  trusted_proxies:
    - 10.0.0.0/8
    - 172.16.0.0/12
  cors_allowed_origins:
    - https://app.casadesowu.com
```

### NPM Proxy Settings
- SSL: Let's Encrypt certificate
- WebSocket Support: Enabled
- HTTP/2: Enabled
- Block Exploits: Enabled

---

## Current Issues / Bugs

1. **RESOLVED** - WebSocket 403 Forbidden (IP was banned in HA)
2. **RESOLVED** - HTTP/2 421 Misdirected Request (enabled HTTP/2 on app subdomain)
3. **TODO** - Service worker cache invalidation on updates

---

## Session Log

### 2026-01-09
- Fixed IP ban issue blocking all external HA access
- Enabled HTTP/2 on app.casadesowu.com
- Verified WebSocket connection working
- Initialized git repo and connected to GitHub
- Created PROJECT_SPEC.md for Claude.ai bridge

---

## Notes for Claude.ai

When reading this file, you have context about:
1. The PWA architecture and tech stack
2. Current features and what's working
3. Known issues and their resolutions
4. The v2.0 roadmap priorities

To suggest changes, create files in:
`gdrive:HomeAssistant-Config/claude-updates/`

Claude Code will apply them via `apply_claude_updates.sh`.
