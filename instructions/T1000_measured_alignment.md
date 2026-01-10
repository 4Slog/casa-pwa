# T1000: Measured Alignment Fix

The "spillage" persists because `100vw` includes the scrollbar width (~17px), but the visible window excludes it. Over 5 pages, this error multiplies (~85px), causing the misalignment.

We will fix this by modifying `v2/src/components/index.js` to calculate transforms based on the **actual measured pixel width** of the page elements, rather than theoretical CSS units.

## 1. Update `v2/src/components/index.js`

Read `v2/src/components/index.js` and completely replace the `MapsTo` function (lines ~54-68) with this robust implementation:

```javascript
export function navigateTo(pg) {
  // Update active pill state
  document.querySelectorAll('.nav-pill').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pg);
  });

  // Handle page scrolling
  const w = document.getElementById('pages-wrapper');
  const targetPage = document.getElementById(`page-${pg}`);

  if (w && targetPage) {
    // MEASURED ALIGNMENT STRATEGY
    // 1. Get the exact width of the target page as rendered by the browser
    const pageWidth = targetPage.offsetWidth;

    // 2. Determine the index (0-5)
    const i = pages.indexOf(pg);

    if (i >= 0) {
      // 3. Calculate exact pixel offset
      const offset = i * pageWidth;

      // 4. Apply transform using pixels
      w.style.transform = `translateX(-${offset}px)`;
    }
  }

  // Page-specific lifecycle hooks
  if (pg === 'cameras') comps.cameras?.startRefresh();
  else comps.cameras?.stopRefresh();
}

// Add a resize listener to correct alignment when window size changes
window.addEventListener('resize', () => {
  const activePill = document.querySelector('.nav-pill.active');
  if (activePill) {
    const pg = activePill.dataset.page;
    // Re-run navigation to snap to correct pixel value
    navigateTo(pg);
  }
});
```
