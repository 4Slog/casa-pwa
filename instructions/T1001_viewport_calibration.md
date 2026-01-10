# T1001: Viewport Calibration Fix

The previous fix caused a regression because `.page { width: 100% }` calculated 100% of the *wrapper* (600vw), making every page massive. This causes the "cut off" effect because the slide distance is too large.

We will fix this by forcing the pages back to viewport width and using the window's visible client width for math.

## 1. CSS Correction (v2/css/page-layout.css)

Revert the `.page` width to `100vw` but ensure `overflow` is handled on the body to prevent scrollbars.

Overwrite `v2/css/page-layout.css` with this content:

```css
/* T1001: VIEWPORT CALIBRATION RULES */

/* 1. Global Safety - Kill scrollbars on the window itself */
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden; /* Prevent horizontal scrollbar on window */
  overscroll-behavior: none;
}

#pages-wrapper {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;

  /* Wrapper is wide, but purely to hold children */
  width: 600vw !important;
  height: 100% !important;

  will-change: transform;
  contain: layout style;
  box-sizing: border-box !important;
}

.page {
  /* 1. SIZE: Force exactly viewport width */
  width: 100vw !important;
  min-width: 100vw !important;
  max-width: 100vw !important;

  /* 2. FLEX: Rigid sizing */
  flex: 0 0 100vw !important;

  /* 3. LAYOUT */
  height: 100% !important;
  box-sizing: border-box !important;

  /* 4. CONTENT SCROLLING */
  overflow-y: auto !important;
  overflow-x: hidden !important;

  /* 5. CLEANUP */
  margin: 0 !important;
  padding: 0 !important;
}
```
