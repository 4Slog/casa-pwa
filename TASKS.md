# Casa de Sowu PWA v2.0 - Task Tracker

> Status: `[ ]` todo | `[~]` in progress | `[x]` done | `[!]` blocked
> Updated: 2026-01-09

---

## ==> ACTIVE TASK
**T001** - Project setup and infrastructure

---

## Phase 1: Core Stability & Bug Fixes

### Infrastructure (T001-T005)
- [x] **T001** - Project setup and infrastructure
  - [x] Initialize git repository
  - [x] Create GitHub repo (4Slog/casa-pwa)
  - [x] Set up Google Drive sync for Claude.ai
  - [x] Create PROJECT_SPEC.md
  - [x] Create CLAUDE_MEMORY.md
  - [x] Create TASKS.md

- [ ] **T002** - Fix WebSocket reconnection reliability
  - [ ] Add exponential backoff for reconnection attempts
  - [ ] Handle token refresh during active connection
  - [ ] Add connection state indicator with retry count
  - [ ] Test offline/online transitions
  - *Depends on: T001*

- [ ] **T003** - Service Worker cache versioning
  - [ ] Implement versioned cache names (e.g., `casa-v2.0.1`)
  - [ ] Add cache invalidation on new deployment
  - [ ] Create update notification banner
  - [ ] Handle stale-while-revalidate for API calls
  - *Depends on: T001*

- [ ] **T004** - Error handling improvements
  - [ ] Add global error boundary
  - [ ] Implement toast notification system
  - [ ] Add retry logic for failed service calls
  - [ ] Log errors to console with context
  - *Depends on: T002*

- [ ] **T005** - Loading states
  - [ ] Add skeleton loaders for cards
  - [ ] Show spinner during initial state fetch
  - [ ] Add loading indicators for camera refresh
  - [ ] Button loading states for actions
  - *Depends on: T001*

### Bug Fixes (T006-T010)
- [ ] **T006** - Fix progress bar timer race condition
  - [ ] Clear interval on component unmount
  - [ ] Handle rapid play/pause toggling
  - [ ] Sync with media_position_updated_at correctly
  - *Depends on: T001*

- [ ] **T007** - Fix map marker driving status lag
  - [ ] Update marker on state_changed event immediately
  - [ ] Add CSS transition for driving indicator
  - [ ] Test with actual driving scenario
  - *Depends on: T001*

- [ ] **T008** - Fix modal close button (line 1047 bug)
  - [ ] Change `classList.remove` to `classList.add`
  - [ ] Add escape key handler
  - [ ] Add click-outside-to-close
  - *Depends on: T001*

- [ ] **T009** - Token refresh edge cases
  - [ ] Handle concurrent token refresh requests
  - [ ] Clear all pending requests on auth failure
  - [ ] Graceful degradation when offline
  - *Depends on: T002*

- [ ] **T010** - Camera proxy error handling
  - [ ] Add placeholder image on load failure
  - [ ] Implement retry with backoff
  - [ ] Show error state in UI
  - *Depends on: T004*

---

## Phase 2: Features & Enhancements

### UI/UX Improvements (T011-T015)
- [ ] **T011** - Dark/Light theme toggle
  - [ ] Create CSS custom properties for theme
  - [ ] Add toggle button in header
  - [ ] Persist preference in localStorage
  - [ ] Respect system preference initially
  - *Depends on: T005*

- [ ] **T012** - Accessibility (ARIA)
  - [ ] Add aria-labels to all interactive elements
  - [ ] Implement keyboard navigation
  - [ ] Add focus indicators
  - [ ] Test with screen reader
  - *Depends on: T011*

- [ ] **T013** - Animation refinements
  - [ ] Add page transition animations
  - [ ] Smooth card state transitions
  - [ ] Micro-interactions on buttons
  - [ ] Reduce motion for prefers-reduced-motion
  - *Depends on: T011*

- [ ] **T014** - Tablet-optimized layout
  - [ ] 3-column grid for tablets
  - [ ] Larger touch targets
  - [ ] Side navigation option
  - [ ] Test on iPad and Android tablets
  - *Depends on: T013*

- [ ] **T015** - Pull-to-refresh
  - [ ] Add pull gesture detection
  - [ ] Refresh all entity states
  - [ ] Show refresh indicator
  - *Depends on: T005*

### New Features (T016-T020)
- [ ] **T016** - Push notifications
  - [ ] Set up Web Push API
  - [ ] Create HA automation for alerts
  - [ ] Notification permission flow
  - [ ] Test on mobile devices
  - *Depends on: T003*

- [ ] **T017** - Dashboard customization
  - [ ] Drag-and-drop card reordering
  - [ ] Save layout to localStorage
  - [ ] Reset to default option
  - [ ] Per-page customization
  - *Depends on: T014*

- [ ] **T018** - Quick actions panel
  - [ ] Swipe-up gesture to reveal
  - [ ] Customizable action buttons
  - [ ] Scene activation shortcuts
  - [ ] Automation triggers
  - *Depends on: T017*

- [ ] **T019** - Voice control (Web Speech API)
  - [ ] Add microphone button
  - [ ] Parse voice commands
  - [ ] Map to service calls
  - [ ] Visual feedback during listening
  - *Depends on: T004*

- [ ] **T020** - Multi-user profiles
  - [ ] Profile selection on startup
  - [ ] Per-user dashboard layouts
  - [ ] Profile-specific entity visibility
  - [ ] Quick profile switching
  - *Depends on: T017*

---

## Phase 3: Polish & Optimization

### Performance (T021-T023)
- [ ] **T021** - Bundle optimization
  - [ ] Minify CSS and JS
  - [ ] Lazy load non-critical features
  - [ ] Preload critical assets
  - [ ] Measure Lighthouse score
  - *Depends on: Phase 2 complete*

- [ ] **T022** - State management refactor
  - [ ] Implement efficient diff-based updates
  - [ ] Batch UI updates
  - [ ] Reduce unnecessary re-renders
  - *Depends on: T021*

- [ ] **T023** - Image optimization
  - [ ] WebP format for icons
  - [ ] Lazy load camera images
  - [ ] Implement blurhash placeholders
  - *Depends on: T021*

### Testing (T024-T025)
- [ ] **T024** - Cross-browser testing
  - [ ] Chrome, Firefox, Safari
  - [ ] iOS Safari, Android Chrome
  - [ ] Edge
  - *Depends on: Phase 2 complete*

- [ ] **T025** - Offline mode testing
  - [ ] Verify cached resources work
  - [ ] Test reconnection flow
  - [ ] Ensure no data loss
  - *Depends on: T003*

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

---

## Completed Tasks Archive

| Task | Description | Completed |
|------|-------------|-----------|
| T001 | Project setup and infrastructure | 2026-01-09 |

---

## Notes

### Task ID Format
- `T###` - Numbered tasks (phases 1-3)
- `B###` - Backlog items

### Dependencies
Tasks should generally be completed in order within each phase.
Cross-phase dependencies are noted on individual tasks.

### Updates
Run `~/scripts/update_pwa_task.sh <task_id> <status>` to update task status.
This will also sync to Google Drive for big bro visibility.
