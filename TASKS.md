# Casa de Sowu PWA v2.0 - Task Tracker

> Status: `[ ]` todo | `[~]` in progress | `[x]` done | `[!]` blocked
> Updated: 2026-01-09

---

## ==> ACTIVE TASK
**T104** - Build src/api.js (WebSocket, auth, service calls)

---

## Phase 1+2 Combined: Fresh v2.0 Build

### Foundation (T101-T103)
- [x] **T101** - Create src/ directory structure and ES6 module skeleton
- [x] **T102** - Create config/dashboard-config.json with all entities
- [x] **T103** - Create new index.html with ES6 module imports

### Core Modules (T104-T107)
- [x] **T104** - Build src/api.js (WebSocket, auth, service calls)
- [x] **T105** - Build src/store.js (reactive state with Pub/Sub)
- [x] **T106** - Build src/config.js (static configuration)
- [x] **T107** - Build src/utils.js (formatters, helpers)

### UI Components (T108-T113)
- [x] **T108** - Build src/components/Header.js (Dynamic Island)
- [x] **T109** - Build src/components/DeviceCard.js (glassmorphism cards)
- [x] **T110** - Build src/components/MediaPlayer.js (full-screen art)
- [x] **T111** - Build src/components/WeatherCard.js
- [x] **T112** - Build src/components/FamilyMap.js
- [x] **T113** - Build src/components/CameraGrid.js

### Styling (T114-T116)
- [x] **T114** - Create css/glass.css (Deep Glass & Neon theme)
- [x] **T115** - Create css/animations.css (transitions, micro-interactions)
- [x] **T116** - Add Magic Button FAB with context-aware actions

### Integration (T117-T119)
- [ ] **T117** - Wire up all components in main app.js
- [ ] **T118** - Test all 6 pages end-to-end
- [ ] **T119** - Deploy to production and verify

---

## Phase 3: Polish & Optimization

### Performance (T301-T303)
- [ ] **T301** - Bundle optimization
  - [ ] Minify CSS and JS
  - [ ] Lazy load non-critical features
  - [ ] Preload critical assets
  - [ ] Measure Lighthouse score

- [ ] **T302** - State management refinement
  - [ ] Implement efficient diff-based updates
  - [ ] Batch UI updates
  - [ ] Reduce unnecessary re-renders

- [ ] **T303** - Image optimization
  - [ ] WebP format for icons
  - [ ] Lazy load camera images
  - [ ] Implement blurhash placeholders

### Testing (T304-T305)
- [ ] **T304** - Cross-browser testing
  - [ ] Chrome, Firefox, Safari
  - [ ] iOS Safari, Android Chrome
  - [ ] Edge

- [ ] **T305** - Offline mode testing
  - [ ] Verify cached resources work
  - [ ] Test reconnection flow
  - [ ] Ensure no data loss

---

## Backlog (Unscheduled)

- [ ] **B001** - Weather forecast expansion (hourly/daily)
- [ ] **B002** - Energy monitoring dashboard
- [ ] **B003** - Alarm system integration
- [ ] **B004** - Guest mode (limited access)
- [ ] **B005** - Presence-based automation controls
- [ ] **B006** - History/statistics graphs
- [ ] **B007** - Backup/restore configuration
- [ ] **B008** - Multiple HA instance support
- [ ] **B009** - Push notifications
- [ ] **B010** - Voice control (Web Speech API)
- [ ] **B011** - Dashboard customization (drag-drop)
- [ ] **B012** - Multi-user profiles

---

## Completed Tasks Archive

| Task | Description | Completed |
|------|-------------|-----------|
| T001 | Project setup and infrastructure | 2026-01-09 |
| T116 | ### UI Components (T108-T113) | 2026-01-09 |
| T115 | ### UI Components (T108-T113) | 2026-01-09 |
| T114 | ### UI Components (T108-T113) | 2026-01-09 |
| T113 | ### UI Components (T108-T113) | 2026-01-09 |
| T112 | ### UI Components (T108-T113) | 2026-01-09 |
| T111 | ### UI Components (T108-T113) | 2026-01-09 |
| T110 | ### UI Components (T108-T113) | 2026-01-09 |
| T109 | **T104** - Build src/api.js (WebSocket, auth, service calls) | 2026-01-09 |
| T108 | **T104** - Build src/api.js (WebSocket, auth, service calls) | 2026-01-09 |
| T107 | **T104** - Build src/api.js (WebSocket, auth, service calls) | 2026-01-09 |
| T106 | **T104** - Build src/api.js (WebSocket, auth, service calls) | 2026-01-09 |
| T105 | **T104** - Build src/api.js (WebSocket, auth, service calls) | 2026-01-09 |
| T104 | Build src/api.js (WebSocket, auth, service calls) | 2026-01-09 |
| T101 | Create src/ directory structure and ES6 module skeleton | 2026-01-09 |
| T102 | Create config/dashboard-config.json with all entities | 2026-01-09 |
| T103 | Create new index.html with ES6 module imports | 2026-01-09 |

---

## Notes

### Fresh Build Approach
v2.0 is a complete rewrite using ES6 modules, not a patch of v1.0.
The old monolithic app.js is being replaced with a modular architecture.

### Task ID Format
- `T0##` - Setup tasks (complete)
- `T1##` - Fresh build tasks (Phase 1+2)
- `T3##` - Polish tasks (Phase 3)
- `B###` - Backlog items

### New Directory Structure
```
/var/www/casa-app/
├── index.html              # New ES6 module loader
├── config/
│   └── dashboard-config.json
├── src/
│   ├── app.js              # Main entry point
│   ├── api.js              # WebSocket & HA communication
│   ├── store.js            # Reactive state management
│   ├── config.js           # Static configuration
│   ├── utils.js            # Helper functions
│   └── components/
│       ├── Header.js
│       ├── DeviceCard.js
│       ├── MediaPlayer.js
│       ├── WeatherCard.js
│       ├── FamilyMap.js
│       └── CameraGrid.js
├── css/
│   ├── glass.css           # Deep Glass & Neon theme
│   └── animations.css      # Transitions & micro-interactions
└── [legacy files preserved for reference]
```

### Updates
Run `~/scripts/update_pwa_task.sh <task_id> <status>` to update task status.
This will also sync to Google Drive for big bro visibility.
