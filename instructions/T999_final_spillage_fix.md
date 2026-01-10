# T999: Final Spillage & Layout Fix

This fix addresses the cumulative page bleed by enforcing `flex-shrink: 0` and switching the transform logic to absolute `vw` units.

## 1. Update CSS (v2/css/page-layout.css)

Overwrite `v2/css/page-layout.css` with these exact rules. We are removing the conflicting rules and using strict sizing.

```css
/* IRON-GRIP LAYOUT FIX */

/* The Main Container */
#pages-wrapper {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;

  /* Force container to be wide enough, but let content dictate width */
  width: 600vw !important;
  box-sizing: border-box !important;

  /* CRITICAL: Ensure transforms happen on a reliable layer */
  will-change: transform;
  contain: layout style;
}

/* The Individual Pages */
.page {
  /* 1. SIZE: Exactly one viewport width */
  width: 100vw !important;
  min-width: 100vw !important;
  max-width: 100vw !important;

  /* 2. FLEX BEHAVIOR: Never shrink, never grow, strict basis */
  flex: 0 0 100vw !important;

  /* 3. CONTAINMENT: Handle internal content overflow */
  box-sizing: border-box !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;

  /* 4. CLEANUP: Remove margins/padding that could add width */
  margin: 0 !important;
  padding: 0 !important; /* Padding should be on inner containers, not the page */
}
```

## 2. Update JavaScript Transform (v2/src/components/index.js)

Find the line with `translateX` and change from percentage to viewport units:

**Before:**
```javascript
if (w && i >= 0) w.style.transform = 'translateX(-' + (i * (100 / pages.length)) + '%)';
```

**After:**
```javascript
if (w && i >= 0) w.style.transform = 'translateX(-' + (i * 100) + 'vw)';
```

This removes any ambiguity about what the percentage refers to.

## 3. Bump Cache Version

Update `sw.js`:
```javascript
const CACHE_NAME = 'casa-v2.0.4';
```

## 4. Commit and Test

```bash
cd /var/www/casa-app
git add -A
git commit -m "T999: Iron-grip layout fix - vw transforms, strict flex sizing"
git push origin main
```

Clear site data and test all 6 pages in portrait mode.
