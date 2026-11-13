# Storefront measurements

Measured 12 November 2026 in headless Chromium, phone viewport 393×851 at 2.75 pixel ratio, logged in through the storefront password. "Before" is the live theme `EDNA — Collection preview` (id 192828473626). "After" is the unpublished `EDNA — Build` theme (id 192900727066).

## Page weight (no throttling)

Shopify's preview bar, theme hot-reload and checkout prefetch scripts are blocked in both runs so only the theme's own cost is compared.

| Measure | Before | After |
| --- | --- | --- |
| Transferred before any scroll | 2,146 KB | 1,312 KB (−39%) |
| of which images | 1,607 KB | 771 KB (−52%) |
| Transferred after scrolling the whole page | 2,377 KB | 1,637 KB (−31%) |
| of which images | 1,838 KB | 1,088 KB (−41%) |

The after run shows all 12 products. The before run showed 6 visible cards, 6 hidden ones whose images still downloaded, and 12 tiles that reused the same photographs.

## Throttled run (slow 4G, 4× CPU slowdown, cold cache, no scroll)

Shopify's own checkout prefetch (about 500 KB) is **included** here because it competes for the connection in real use. The preview bar is blocked.

| Measure | Before | After |
| --- | --- | --- |
| First Contentful Paint | 1.4 s | 1.1–1.4 s |
| Largest Contentful Paint (hero image) | 3.7 s | 3.3–3.6 s |
| Full load | 9.4 s | 7.4 s |
| Requests before scroll | 138 | 135–137 |
| Layout shift | 0 | 0.004 |

**The largest paint improved only slightly, and the 2.5 s target is not met in this test.** The phone hero is now 118 KB (it was 147 KB; the phone source is chosen at 800 px for a 2.75× screen) but it still takes about 2.5 s to arrive because the emulated connection is shared equally between about 80 script requests, three fonts and the first four product photographs. A real browser prioritises the hero, so a phone on mobile data may do better, but that is unmeasured. Ideas not yet tried: preloading the hero from the layout, and trimming Horizon's script set.

## Checks that are not timing-based

| Check | Before | After |
| --- | --- | --- |
| Visible text under 12 px (homepage) | 57 elements | 0 |
| Tap targets under 44 px (homepage) | 28 | 0 (an inline privacy link is exempt) |
| Product links on the homepage | 0 | 12 |
| Pages with a meta description | 0 | all pages checked |
| Structured data | none | Organization, WebSite, BreadcrumbList, ProductGroup |
| Heading font on Android | fallback sans-serif | Jost, loaded as a web font |
| Add to bag opens the cart drawer | no feedback | drawer opens, count updates |
| Horizontal overflow at 393 px and 1440 px | none | none |

## Not measured

Lighthouse (blocked in the audit session), checkout, payment, a real phone on mobile data, and any page that needs stock to be added to a cart.
