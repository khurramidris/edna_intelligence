# EDNA storefront: analysis and build plan

Prepared 12 November 2026 for the implementer. Read this whole file, then `theme/AGENTS.md`, before changing anything.

## How this was checked

- Read from the repo: `theme/layout`, all `edna-*` sections and snippets, `assets/edna*.css|js`, the homepage, product, collection and cart templates, theme settings, and the Horizon cart, header and product-form scripts.
- Read from the live store (Shopify connector): theme list, file checksums for 42 key files, products, orders, apps, policies.
- **Browser check (12 Nov, added after the first draft):** the storefront was opened in headless Chromium (Pixel 5 and 1440×900) from the build environment after logging in with the storefront password. The password is not stored in this repo; ask the owner. Results on the homepage:
  - Mobile: 306 requests, about 3.4 MB transferred (content-length only, so a floor), of which about 2.1 MB is images. Desktop: 294 requests, about 2.2 MB, 0.9 MB images.
  - Every card image is the 1122 px original shown at about 170 px wide on mobile. The six hidden "show all" cards also download their images.
  - No `.header-actions__cart-icon` element exists, which confirms finding C.2 (no fly-to-cart target).
  - Headings render with the fallback sans-serif, not Optima (finding E). The hero fills the whole first mobile screen and no product or price is visible without scrolling.
  - No horizontal overflow at 393 px or 1440 px; one H1.
  - Timing numbers (LCP 0.26 s mobile, CLS 0) were taken on an unthrottled datacenter connection and are **not** representative of a phone on mobile data. Phase 0.5 must repeat them with CPU and network throttling.
- **Still not checked:** product pages (all products are drafts, so none render), cart and checkout, and any throttled performance run.

## Store facts that shape the plan

- Live theme: `EDNA — Collection preview` (id `192828473626`, role MAIN). Two other themes exist, both unpublished.
- 12 products, all DRAFT, zero inventory, priced PKR 9,900–24,900. The owner's positioning is under Rs 4,000.
- 0 orders, 0 customers. Store is on a trial plan with the password page on.
- Installed apps: only the ChatGPT and Claude connectors. No analytics or ad pixels.
- 14 collections exist. Products carry tags such as `wedding`, `everyday`, `after-dark`, `stilettos`.

## Part 1. Findings

Ranked by how much they block a sale.

### A. The homepage is a brochure, not a shop

1. **Products on the homepage are not Shopify products.** `sections/edna-concept-catalog.liquid` renders 12 hard-coded blocks from `templates/index.json`: name, price, image filename and description are typed into theme settings. Clicking a card opens a `<dialog>` built from a `<template>` tag. There is no product URL, no size selection and no way to order.
2. **Prices exist in three places** (Shopify product, `index.json`, `catalog/concepts.json`). They will drift.
3. **Analytics cannot see product interest.** Shopify's standard `product_viewed` event fires on product pages. A dialog fires nothing, so no pixel will ever learn which design a visitor looked at.
4. **The page tells visitors not to buy.** Copy includes "Collection study", "Styles are not available to order", "Proposed price" and "01 / 12".
5. **Header search is hijacked on the homepage.** `assets/edna-collection.js` intercepts the search form and filters the concept cards instead of searching the store.
6. **The wishlist is invisible to the business.** `assets/edna.js` stores saved styles in the visitor's `localStorage` only.

### B. A better version already exists in the theme, unused

The theme contains an earlier set of sections bound to real Shopify data, with responsive images:

| Unused section | What it does |
| --- | --- |
| `sections/edna-campaign.liquid` | Hero from an image picker, `image_url` with `widths` and `sizes`, links to the catalog when products exist |
| `sections/edna-collections.liquid` | Collection tiles (styles or occasions) linking to collection pages |
| `sections/edna-edit.liquid` + `snippets/edna-product-card.liquid` | Real product cards from a chosen collection, with sold-out state and price |
| `sections/edna-signature.liquid` | Feature for one real product, optional video |
| `sections/edna-stories.liquid` | Editorial blocks linking to collections |
| `sections/edna-confidence.liquid` | Fit, delivery and exchange information, and reviews that render only when real content is entered |

The plan switches the homepage back to these and improves them. It does not start from scratch.

### C. The product page is stock Horizon and adding to bag gives no feedback

1. `templates/product.json` has: gallery, title, price, size buttons, quantity, add-to-cart, accelerated checkout, description, recommendations. It has no size guide, delivery or exchange information, stock message, WhatsApp contact or notify-me.
2. **Add-to-bag feedback is broken by the custom header.** Inferred from code, to be confirmed in a browser:
   - `assets/product-form.js:107` and `assets/sticky-add-to-cart.js:180` look for `.header-actions__cart-icon`. The EDNA header has no such element, so the fly-to-cart animation is skipped.
   - `auto_open_cart_drawer` defaults to `false` and is not set, so the drawer does not open.
   - The bag count in `sections/edna-header.liquid` is printed once by Liquid and never updated.
   - Result: a shopper taps "Add to cart" and nothing visibly changes.
3. The header bag icon links to `/cart` even though `cart_type` is `drawer`.
4. The gallery is set to `grid`. Horizon also offers `carousel`.
5. The accelerated checkout block is present, but the store has no digital wallets configured.

### D. Speed: images are the whole problem

1. **Every EDNA image is a theme asset served at full size.** Sections use `{{ 'edna-noor.jpg' | asset_url }}`, which gives one fixed JPEG to every device. There is no `srcset`, no resizing and no modern format.
2. **Homepage on a phone, full scroll: 11 unique images, about 2.3 MB.** Card images are 1122×1402 (150–280 KB each) and are shown about 170 px wide in the two-column mobile grid.
3. **The mobile hero is 255 KB** (1086×1448) and is the largest element on first paint.
4. The 16 JPEGs add 3.5 MB to the theme. `edna-identity-board.jpg` (289 KB) is only used by the unused fallback snippet `edna-board-crop`.
5. JavaScript and CSS are not the bottleneck. EDNA's own scripts are 7 KB and deferred; its two stylesheets are 25 KB. Horizon loads its modules on demand.

### E. The luxury typeface does not load on Android

`assets/edna.css` sets headings to `Optima, Candara, "Segoe UI", sans-serif`. These are system fonts on Apple and Windows only. An Android phone has none of them and falls back to its default sans-serif, so most Pakistani shoppers will not see the intended look. No display webfont is loaded.

### F. Mobile text and tap targets are too small

From the `max-width: 749px` rules in `edna.css` and `edna-collection.css`:

| Element | Mobile size now |
| --- | --- |
| Eyebrow labels | 8px |
| Hero paragraph | 10px |
| Card price | 10px |
| Section intro text | 11px |
| Notice bar | 9px |
| Result count | 8px |
| Save (heart) button | 36×36px |

The header is 76–78px tall on mobile and is not sticky.

### G. Housekeeping

1. **Theme files are generated by Python.** `scripts/enrich_edna.py` writes the concept sections, `templates/index.json`, the header, footer, `layout/theme.liquid`, `snippets/meta-tags.liquid` and the `edna` locale strings. Running it again overwrites manual edits.
2. **Repo and live theme match, with one exception.** Of 42 key files, 27 are identical and 14 differ only by a trailing newline or one byte of whitespace. `config/settings_data.json` differs in content (9.3 KB in the repo, 7.9 KB live).
3. The newsletter form in `sections/edna-footer.liquid` works and tags customers `newsletter,edna-first-chapter`. It collects email only.
4. Good practice already in the custom code, to keep: `width`/`height` on images, `loading="lazy"`, `fetchpriority="high"` on the hero, focus outlines, `aria` labels, reduced-motion rules.

## Part 2. What the finished site should do

One sentence: **a shopper arriving from an Instagram ad on a mid-range Android phone sees the shoe within a second, believes the price, picks a size and orders (or asks to be notified) without leaving the product page.**

Principles for every decision:

1. **Product first.** The first screen shows shoes and prices, not brand essays.
2. **The price is the hook.** "The look of luxury, under Rs 4,000" is the promise. Show the price on every card, in a readable size.
3. **Remove doubt next to the button.** Size help, delivery, exchange and payment answers sit beside the order button, not in the footer.
4. **Urgency and social proof use real numbers only.** A stock count read from Shopify inventory is always true. Anything that needs data we do not have yet stays hidden until the data exists.
5. **Quiet luxury styling.** No flashing, bouncing or stacked pop-ups.
6. **Every interaction is an event.** Size taps, notify-me requests and WhatsApp clicks are published so pixels can use them.

## Part 3. Build phases

Do the phases in order. Each phase ends with the checks listed in "Verification".

### Phase 0. Safe workspace and a way to see the site

| # | Task | Detail |
| --- | --- | --- |
| 0.1 | Duplicate the live theme | Use the `themeDuplicate` mutation or the admin. Name it `EDNA — Build`. All work goes to this copy. Never write to theme `192828473626`. |
| 0.2 | Pull editor-managed files | Fetch `config/settings_data.json` and all `templates/*.json` from the live theme into the repo before editing them. Live wins for these files. |
| 0.3 | Retire the generators | Add a header comment to `scripts/build_edna.py` and `scripts/enrich_edna.py` stating they are historical and must not be run. Note it in `docs/STOREFRONT.md`. Theme files are now the source of truth. |
| 0.4 | Browser access | Works as of 12 Nov: the environment's network is unrestricted and Playwright can log in at `/password` (the password field is inside a dialog opened by "Enter using password"). Ask the owner for the password; do not commit it. |
| 0.5 | Record a baseline | With access: Lighthouse mobile run and screenshots at 390×844 and 1440×900 for home, collection, product and cart. Save numbers in `docs/THEME_BASELINE.md`. |
| 0.6 | Branch | Work on a feature branch. One commit per task. |

### Phase 1. Real products everywhere

| # | Task | Detail |
| --- | --- | --- |
| 1.1 | Product data (owner input needed) | Set real prices. Set chosen products to ACTIVE and publish them and their collections to the Online Store. Keep inventory tracked at zero until stock exists, so sizes show as unavailable. Add a product metafield `edna.stage` with values `preview` or `live`. |
| 1.2 | Move editorial images to Files | Upload the campaign, mobile campaign and street editorial images to Shopify Files and select them through section image pickers. Product images already exist as product media. |
| 1.3 | Rebuild `templates/index.json` | Use `edna-campaign`, `edna-edit`, `edna-collections` (styles), `edna-signature`, `edna-stories`, `edna-collections` (occasions), `edna-confidence`, `edna-house-note`. Order is in Phase 4.2. |
| 1.4 | Upgrade `snippets/edna-product-card.liquid` | Add product type as a subtitle. Add a state badge: "Preview" when `edna.stage` is `preview`, "Only N left" when any size is low, "Sold out" otherwise. Keep `image_url` with `widths` and `sizes`. |
| 1.5 | Hero art direction | Add a second image picker to `edna-campaign` for mobile. Output a `<picture>` with both, each using `image_url` widths. Keep `fetchpriority="high"` on this image only. |
| 1.6 | Delete the concept layer | After 1.3 works, remove `edna-concept-*.liquid`, `assets/edna-collection.js`, its `<script>` tag in `layout/theme.liquid`, the `edna.collection.*` strings no longer used, and the concept CSS rules. |
| 1.7 | Collection page | Keep Horizon's `main-collection` for filtering, sorting and pagination. Align its cards with EDNA typography through theme settings and a small amount of CSS. Size filters need the Search & Discovery app (owner installs). |

### Phase 2. A product page that sells

Target order on mobile: gallery → title and price → stage or stock line → size buttons → size-guide link → main button → assurances → WhatsApp → details accordion → recommendations.

| # | Task | Detail |
| --- | --- | --- |
| 2.1 | Fix add-to-bag feedback | Render Horizon's `<cart-icon>` (see `snippets/header-actions.liquid`) inside `sections/edna-header.liquid` so the count updates and fly-to-cart has a target. Set `auto_open_cart_drawer` to `true`. Make the bag icon open the drawer. |
| 2.2 | Gallery | Set `media_presentation` to `carousel` and confirm it swipes on mobile with the first image eager and the rest lazy. |
| 2.3 | Stock line | Add Horizon's existing `product-inventory` block under the price, threshold 3, show quantity on. It reads Shopify inventory, so the number is always true. |
| 2.4 | Notify-me block | New `blocks/edna-notify.liquid`, shown when the selected size is unavailable. Primary action: WhatsApp button to `https://wa.me/<number>?text=<product, size>`, hidden if no number is set. Fallback: email field using `{% form 'customer' %}` with tags `notify`, `notify-<handle>`, `size-<EU>`. This serves both pre-launch demand capture and later restocks. |
| 2.5 | Unavailable sizes stay tappable | Check how `variant-picker` treats unavailable variants. A shopper must be able to select a sold-out size so the notify-me block appears and the tap is recorded. |
| 2.6 | Size guide | Add a `popup-link` block pointing to a "Size guide" page. Leave it out of the template until the owner supplies measurements. |
| 2.7 | Assurances block | New `blocks/edna-assurances.liquid`: up to three short lines with icons (delivery, exchange, payment). Text comes from block settings. Each line is hidden while its setting is blank. |
| 2.8 | WhatsApp help link | "Ask about fit on WhatsApp", prefilled with the product name. Uses the same number setting as 2.4. |
| 2.9 | Details accordion | Use Horizon's `accordion` block for description, materials and care, delivery and exchange. Only add rows the owner has supplied text for. |
| 2.10 | Preview disclosure | For products with `edna.stage = preview`, show one line under the gallery: "Design preview. The finished shoe may differ." |
| 2.11 | Clean up buy buttons | Remove the `accelerated-checkout` block. Keep sticky add-to-cart (already enabled). Hide the quantity selector on mobile or default it to 1. |
| 2.12 | Price display | Check the store's money format. Prices should read like "Rs 3,490" with no decimals and no repeated "PKR". Adjust `currency_code_enabled_*` settings and the store currency format to match. |

### Phase 3. Speed

Targets on a mid-range Android, slow 4G, to be confirmed against the Phase 0 baseline:

| Measure | Target |
| --- | --- |
| Largest Contentful Paint | under 2.5 s |
| Layout shift (CLS) | under 0.1 |
| Image bytes on first screen | under 150 KB |
| Homepage transfer, full scroll | under 900 KB |

| # | Task | Detail |
| --- | --- | --- |
| 3.1 | No image through `asset_url` | After Phase 1, every photo comes from product media or Files via `image_url` + `image_tag` with `widths` and correct `sizes`. Cards: `(max-width: 749px) 46vw, 30vw`. |
| 3.2 | Remove image assets | Delete the 16 `edna-*.jpg` files from `theme/assets`, plus `edna-identity-board.jpg` and `snippets/edna-board-crop.liquid`, once nothing references them. Keep SVG logos and patterns. |
| 3.3 | Display typeface | Add a `font_picker` theme setting for the EDNA display font. Load one weight with `font-display: swap` and preload it. Set `--edna-display` from it. Owner chooses the face. |
| 3.4 | Trim body font weights | Check which Inter weights Horizon loads and remove variants the design never uses. |
| 3.5 | One stylesheet, one script | Merge `edna-collection.css` into `edna.css` and drop rules for deleted sections. Merge remaining script into `edna.js`, deferred. |
| 3.6 | Switch off unused Horizon features | `quick_add` defaults to on and renders a modal on every page. Turn it off unless Phase 4 uses it. |
| 3.7 | App discipline | Every app adds script. Record Lighthouse before and after each app install in `docs/THEME_BASELINE.md`. |

### Phase 4. Ease of use and desire

| # | Task | Detail |
| --- | --- | --- |
| 4.1 | Mobile type scale | No text under 12px. Body 14–16px. Card title 14px or more, card price 14px or more. Eyebrows 10px or more. All tap targets at least 44×44px. |
| 4.2 | Homepage order | 1) Hero: one product-led image, one line of promise, one button to the main collection. Height about 60svh on mobile so the first product row is visible. 2) "The Edit": product grid. 3) Shop by occasion. 4) Signature product. 5) Stories. 6) Confidence (fit, delivery, exchange). 7) House note and sign-up. |
| 4.3 | Copy | Remove "study", "proposed", "concept", "01 / 12" and the notice bar. Lead with the promise: the look of luxury, under Rs 4,000. Do not use couture, atelier or origin claims. |
| 4.4 | Sticky compact header | Header sticks on scroll at about 56px on mobile. Logo centred, menu left, search and bag right. |
| 4.5 | Real search | Remove the custom search form. Open Horizon's `search-modal` (predictive search) from the header icon. |
| 4.6 | Menu | Link list: New, Shop by style, Shop by occasion, Saved styles, Help. Driven by a Shopify menu. |
| 4.7 | Announcement bar | Use Horizon's `header-announcements` section for one line, such as delivery or payment terms. Leave it disabled until the owner supplies the text. |
| 4.8 | Sign-up block | Change the footer form heading to the early-access offer. Add a WhatsApp list button beside the email field when a number is set. |
| 4.9 | Cart drawer | Keep it simple: items, total, one button. Add a free-delivery progress line only when the owner sets a threshold. |
| 4.10 | Footer | Links to delivery, exchange, contact and privacy pages as the owner creates them. Policies with empty bodies stay hidden (the current code already does this). |

### Phase 5. Measurement hooks in the theme

These make the site ready for pixels. They do not install any pixel.

| # | Task | Detail |
| --- | --- | --- |
| 5.1 | Custom events | In `edna.js`, publish with `Shopify.analytics.publish('edna:<name>', data)`. Events: `size_selected`, `unavailable_size_selected`, `size_guide_opened`, `notify_requested`, `whatsapp_clicked`, `wishlist_added`, `wishlist_removed`, `gallery_image_viewed`. Payload: product id, variant id, size, and page type. No personal data. |
| 5.2 | Ad source on every order | On landing, store `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` and click ids (`fbclid`, `ttclid`, `gclid`) for the session. Write them to cart attributes with `/cart/update.js` when the cart is first used, so each order records where it came from. |
| 5.3 | Respect consent | Read Shopify's customer privacy API before storing ad parameters. If analytics consent is denied, store nothing. |
| 5.4 | Event dictionary | Document every event, trigger and field in `docs/EVENTS.md`. |

### Phase 6. Later, needs data or a backend

Do not build placeholders for these. Each needs something that does not exist yet.

| Feature | Needs |
| --- | --- |
| "N people viewing now" | A live counter service. Show only at 3 or more. |
| "Just ordered" toast | Real orders, fed from the signed webhook receiver in `dashboard/`. |
| Photo reviews and star ratings | A reviews app and delivered orders. |
| Fit finder ("I wear 38 in another brand") | Real sizing data from the manufacturer and exchange history. |
| Delivery date by city | A courier contract with real transit times. |
| One-screen COD order form | Either a COD form app or a custom backend that creates orders. Decide after testing Shopify's own checkout with COD. |
| Wishlist the business can see | A backend endpoint or customer accounts. |

## Part 4. Rules for the implementer

1. Work only on the duplicated theme. Publishing is the owner's action.
2. Invent nothing. Delivery times, fees, exchange terms, materials, sizes, reviews, counts and stock come from the owner or from Shopify data. If a fact is missing, the element stays hidden.
3. Follow `theme/AGENTS.md`. Reuse a Horizon block before writing a new one. Keep section and template IDs stable.
4. Do not run `scripts/build_edna.py` or `scripts/enrich_edna.py`.
5. All visible strings go in `locales/en.default.json`.
6. Keep the existing accessibility behaviour: focus outlines, labels, reduced motion.
7. Validate changed Liquid with Shopify's theme validation before uploading.
8. State plainly in each hand-off what was verified in a browser and what was not.

## Verification for every phase

- Theme validation passes for every changed file.
- Screenshots at 390×844 and 1440×900 of each changed page, with no horizontal scroll.
- Keyboard pass: menu, search, size selection, add to bag, drawer, notify-me.
- Phase 2: add to bag updates the count and opens the drawer; selecting an unavailable size shows notify-me.
- Phase 3: Lighthouse mobile numbers recorded next to the baseline.
- Phase 5: events visible with a test subscriber in the browser console.

## Part 5. What the owner must supply

| Needed | Blocks |
| --- | --- |
| Price for each design, or one rule | 1.1 |
| Which designs go live first | 1.1, 1.3 |
| WhatsApp Business number | 2.4, 2.8, 4.8 |
| Delivery time and fee, exchange terms, payment methods | 2.7, 2.9, 4.7 |
| Size chart measurements | 2.6 |
| Display typeface choice | 3.3 |
| Network access and storefront password for testing | 0.4, 0.5 and all browser checks |
| Whether product images are renders or photographs | 2.10 |
