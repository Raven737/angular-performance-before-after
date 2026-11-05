# Angular performance: before / after

The same 10,000-row orders table (11 columns), built twice in Angular 22 (standalone, Signals, CDK).
One page is deliberately slow, the other is fixed. A live metrics bar shows FPS, DOM nodes and time from action to paint.

## Measured results

Headless Chromium, 10,000 rows, same machine, same data. Treat the numbers as indicative: they will differ on your device, but the ratio holds.

| Metric | Slow (before) | Optimized (after) |
|---|---|---|
| DOM elements in the table | 130,000 | 223 |
| Scrolling (frames per second) | 1 FPS | 60 FPS |
| First keystroke in search to paint | 1,425 ms | 9 ms |
| Sort a column to paint | 2,649 ms | 68 ms |

## What was wrong and how it was fixed

| Problem on the slow page | Fix on the optimized page |
|---|---|
| All 10,000 rows rendered into the DOM | CDK Virtual Scroll, only visible rows exist |
| Filter and sort inside a getter, re-run on every change detection and several times per pass | `computed()` signal, calculated once per input change and cached |
| Filter runs on every keystroke | 200 ms debounce on search |
| `(scroll)` handler updates a field, so every scroll event runs a full change detection pass, including the filter, sort and the summary total | Scroll position is a signal fed by `scrolledIndexChange`, total is a `computed()` |
| Per-cell formatting functions create `Intl.NumberFormat` objects on every pass | Formatters created once, values pre-formatted |
| `track $index`, DOM rebuilt on every change | Stable `trackBy` identity |
| Plain fields and default change detection | Signals and `OnPush` |

## Run locally

```bash
npm install
npm start        # http://localhost:4200
npm test
npm run build
```

Live demo: https://raven737.github.io/angular-performance-before-after/

Code for the slow page is in `src/app/slow`, the fixed one in `src/app/optimized`. The data is generated, nothing is real.

## Need this done in your app?

I fix Angular performance problems, upgrade versions and build UI from Figma: https://www.fiverr.com/roman_dev777
