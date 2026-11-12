# EDNA storefront: audit and build plan (v2)

Prepared 12 November 2026 for the implementer. Read this whole file, then `theme/AGENTS.md`, before changing anything. This version replaces the first draft: it adds a browser audit, SEO, catalog and store-setup findings, and reflects the owner's confirmation below.

## Decisions on record

- **Owner confirmed on 12 Nov: the 12 products, their images and their prices (PKR 9,900–24,900) are real and final.** EDNA is therefore a premium brand at these prices. Do not use "under Rs 4,000" or "preview" framing anywhere.
- The store's own content currently says the opposite on every product (see finding B). Rewriting that content is part of this plan.
- The store is not launched. It is in testing behind a password.

## How this was checked

| Method | Covered |
| --- | --- |
| Code read | `theme/layout`, all `edna-*` sections and snippets, EDNA CSS and JS, templates, settings, Horizon cart, header and product-form scripts |
| Headless Chromium, logged in | Homepage, product dialog, menu, collection, search, cart, 404, contact, privacy policy at 393×851 |
| Throttled speed run | Homepage on slow 4G (1.6 Mbps, 150 ms latency) with 4× CPU slowdown, cold cache |
| Shopify Admin API (read-only) | All 12 products, 14 collections, menus, pages, shipping rate, shop settings, theme file checksums |

Not checked: product pages (all products are drafts and return 404), the cart drawer with an item in it, checkout, payment methods, and a Lighthouse run (not permitted in the audit session). The storefront password is not stored in this repo; ask the owner.

## Scorecard (homepage, phone)

| Measure | Now | Target |
| --- | --- | --- |
| Largest Contentful Paint, throttled | 3.7 s (the hero image) | under 2.5 s |
| First Contentful Paint, throttled | 1.4 s | under 1.5 s |
| Full load, throttled | 9.4 s | under 5 s |
| Layout shift (CLS) | 0 | stay under 0.1 |
| Requests before any scroll | 138 (83 scripts) | under 80 |
| Transfer before any scroll | 2.0 MB (0.9 MB images) | under 1.0 MB |
| Transfer after full scroll | at least 3.4 MB (2.1 MB images) | under 1.5 MB |
| Visible text under 12px | 57 elements | 0 |
| Tap targets under 44px | 28 | 0 |
| Links to products from the homepage | 0 | every product shown |
| Meta description | missing on every page | present on every page |
| Structured data (JSON-LD) | none | Organization, WebSite, Product, Breadcrumb |
| Screens scrolled before the first product with a price | about 2 | under 1 |

## Part 1. Findings

### A. Store setup blocks any sale (admin, not theme)

| # | Finding | Evidence |
| --- | --- | --- |
| A1 | All 12 products are DRAFT, so every product URL returns 404 | `/products/noor-satin-stiletto` returned 404 |
| A2 | Every variant has zero stock and inventory policy DENY | Nothing can be added to a cart |
| A3 | The only delivery rate is named "معیاری" and costs **PKR 4,619** | Delivery profile, Domestic zone |
| A4 | Prices display as "Rs.13,900.00 PKR" | Money format is `Rs.{{amount}}`; currency code setting is on |
| A5 | Store name is "My Store 3"; shop description is empty | Shop settings |
| A6 | Only a privacy policy exists. No refund, shipping, terms or contact policy | Shop policies |
| A7 | Menus are Shopify defaults: Home, Catalog, Contact; footer has "Search" | Menus |
| A8 | Shop contact email is a personal address | Shop settings |
| A9 | Payment methods are unverified. No digital wallets are configured | Not visible through the API; check in admin |

### B. Catalog content contradicts the brand

| # | Finding | Evidence |
| --- | --- | --- |
| B1 | Every product description ends with "EDNA collection concept. AI-generated design image. Proposed price… Not available to order." | `descriptionHtml` on all 12 |
| B2 | Body copy calls products "a study", "a design direction", "a concept" | All 12 descriptions |
| B3 | Every image alt text begins "AI-generated EDNA … design concept" | Product media and theme alt strings |
| B4 | Every collection description says "design study… not available to order" | 13 collections |
| B5 | Products are tagged `edna-concept` and `edna-collection-study` | All 12 |
| B6 | **One image per product.** No angles, on-foot shots, details or video | `mediaCount` is 1 on all 12 |
| B7 | No product category, weight 0, no cost per item, no SEO title or description, no metafields | All 12 |
| B8 | Collection handles are `edna-stilettos`, `edna-edna-edit` and similar. No collection images | 13 collections |
| B9 | Sizes are EU 36–41 with no size chart anywhere | Product options |

At PKR 10,000–25,000 a shopper expects six to eight images, materials, heel height and fit notes. B6 and B9 are the largest gaps between this store and a premium product page.

### C. The homepage is a brochure, not a shop

1. Its 12 "products" are hard-coded blocks in `templates/index.json`, rendered by `sections/edna-concept-catalog.liquid`. A card opens a `<dialog>`, not a product page. There is no size selection and no order path.
2. Prices exist in three places (Shopify, `index.json`, `catalog/concepts.json`).
3. Analytics cannot see product interest, because Shopify's `product_viewed` event fires only on product pages.
4. The page tells visitors not to buy: "Collection study", "not available to order", "Proposed price", "01 / 12".
5. The hero fills the entire first phone screen. Style tiles follow. The first product with a price appears about two screens down.
6. The same product photos appear up to three times (style tiles, the edit grid, occasion tiles).
7. `assets/edna-collection.js` hijacks the header search on the homepage to filter concept cards.
8. The wishlist saves to the visitor's browser only.
9. The mobile menu has three items: Home, The collection, Saved styles.

### D. A better version already exists in the theme, unused

| Unused section | What it does |
| --- | --- |
| `sections/edna-campaign.liquid` | Hero from an image picker with `image_url`, `widths` and `sizes` |
| `sections/edna-collections.liquid` | Collection tiles linking to collection pages |
| `sections/edna-edit.liquid` + `snippets/edna-product-card.liquid` | Real product cards from a collection, with price and sold-out state |
| `sections/edna-signature.liquid` | Feature for one real product, optional video |
| `sections/edna-stories.liquid` | Editorial blocks linking to collections |
| `sections/edna-confidence.liquid` | Fit, delivery and exchange information, and reviews that render only when real content is entered |

### E. Product page and cart

1. `templates/product.json` is stock Horizon: gallery, title, price, size buttons, quantity, add-to-cart, accelerated checkout, description, recommendations. No size guide, delivery or exchange information, stock message, materials, WhatsApp contact or back-in-stock request.
2. **Add-to-bag gives no feedback** (from code; the browser confirmed the missing element):
   - `assets/product-form.js:107` and `assets/sticky-add-to-cart.js:180` need `.header-actions__cart-icon`. The EDNA header has none.
   - `auto_open_cart_drawer` is off.
   - The bag count in `sections/edna-header.liquid` is static.
3. The bag icon links to `/cart` although `cart_type` is `drawer`.
4. The empty cart and the 404 page show Horizon placeholder T-shirts priced "Rs.19.99 PKR". Confirm these disappear once products are active.
5. The accelerated checkout block is present with no wallets configured.

### F. Speed

1. **Every EDNA photo is a theme asset served at one fixed size.** Sections use `asset_url`, so there is no `srcset`. Cards show 1122 px images about 170 px wide.
2. The hero is the LCP element at 3.7 s throttled. It transfers 154 KB.
3. Six below-the-fold tile images load immediately, adding about 0.75 MB before any scroll.
4. The six hidden "show all" cards still download their images.
5. 83 script requests on the homepage, 49 of them Horizon modules. `layout/theme.liquid` renders the cart drawer, theme drawer, chat drawer, search modal and quick-add modal on every page.
6. The HTML is 169 KB uncompressed, partly because each product is duplicated inside a `<template>`.
7. About 0.5 MB of the first load is Shopify's own checkout preload. The theme cannot change that.

### G. SEO

1. **No meta description on any page.**
2. **No structured data on any page checked.**
3. **The homepage links to no products and one collection.** It has 41 `#` links. A crawler finds nothing to index.
4. Title is "EDNA — Footwear house": no product or location words.
5. The social share description says "collection study".
6. Collection URLs carry a redundant `edna-` prefix (B8).
7. No About, Size guide, Delivery, Exchange or FAQ pages. The blog is empty.
8. The store is on `wearedna.myshopify.com` with no custom domain.
9. `sitemap.xml` returns 404 while the password is on. This is expected and resolves at launch.
10. Canonical tags, `lang`, Open Graph image and Twitter card are present and correct.

### H. Usability, brand consistency and accessibility

1. Mobile text: 16 elements at 8px, 8 at 9px, 22 at 10px, 11 at 11px. Prices on cards are 10px.
2. 28 tap targets are smaller than 44px. The save button is 36px.
3. **The homepage and the rest of the site look like two brands.** The homepage uses light EDNA headings; collection, search, cart, 404 and policy pages use Horizon's bold Inter headings.
4. The heading font stack (`Optima, Candara, "Segoe UI"`) exists only on Apple and Windows. Android falls back to its default sans-serif. No display webfont is loaded.
5. The header is 76–78px tall on mobile and not sticky.
6. The footer has one link and a large empty area.
7. Colour contrast is acceptable for body text (stone on ivory 5.45:1, ink on ivory 15.8:1). `--edna-sand` on ivory is 1.76:1 and must not be used for text.
8. Good practice to keep: image `width`/`height`, lazy loading, focus outlines, `aria` labels, reduced-motion rules, zero layout shift.

### I. Housekeeping

1. `scripts/build_edna.py` and `scripts/enrich_edna.py` generate theme files. Running them overwrites manual edits.
2. Repo and live theme match except `config/settings_data.json` (9.3 KB in the repo, 7.9 KB live). The other differences are trailing whitespace.

## Part 2. What the finished site should do

**A shopper arriving from an Instagram ad on a mid-range Android phone sees the shoe within two seconds, believes it is worth the price, picks a size with confidence and orders without leaving the product page.**

1. **Product first.** Shoes and prices on the first screen.
2. **Justify the price.** Rich imagery, materials, construction and fit detail. At this price the page must feel as considered as the shoe.
3. **Remove doubt next to the button.** Size help, delivery, exchange and payment answers beside the order button.
4. **Real numbers only.** Stock counts come from Shopify inventory. Reviews, viewer counts and recent-order notices appear only when real data exists.
5. **One brand on every page.** Same type, colour and spacing from homepage to cart.
6. **Quiet luxury.** No flashing, bouncing or stacked pop-ups.
7. **Every interaction is an event** that pixels can use.

## Part 3. Build phases

Do the phases in order.

### Phase 0. Safe workspace

| # | Task | Detail |
| --- | --- | --- |
| 0.1 | Duplicate the live theme | `themeDuplicate` mutation or the admin. Name it `EDNA — Build`. Never write to theme `192828473626`. |
| 0.2 | Pull editor-managed files | Fetch `config/settings_data.json` and `templates/*.json` from live into the repo first. Live wins. |
| 0.3 | Retire the generators | Mark both Python scripts as historical. Note it in `docs/STOREFRONT.md`. |
| 0.4 | Save the baseline | Copy the scorecard above into `docs/THEME_BASELINE.md`. Re-run the throttled test after each phase. |
| 0.5 | Branch | Feature branch, one commit per task. |

### Phase 1. Store and catalog (admin changes)

Each row is a write to the live store. Get the owner's approval for each before running it.

| # | Task | Detail |
| --- | --- | --- |
| 1.1 | Rewrite product descriptions | Remove the concept paragraph and the words study, concept, design direction and proposed. Structure: two sentences of desire, then bullet facts (upper, lining, sole, heel height, fit, care). Facts come from the owner. |
| 1.2 | Rewrite image alt text | Describe the shoe: name, colour, material, style, view. No "AI-generated" or "concept". |
| 1.3 | Rewrite collection descriptions and handles | Two or three sentences per collection. Handles become `stilettos`, `occasion`, `wedding-guest` and so on. No redirects are needed before launch. |
| 1.4 | Clean tags | Remove `edna-concept` and `edna-collection-study`. Keep style and occasion tags. |
| 1.5 | Product data | Set product category (footwear taxonomy), weight, cost per item, SEO title and description. |
| 1.6 | Product metafields | Define `edna.material`, `edna.lining`, `edna.sole`, `edna.heel_height_cm`, `edna.fit_note`, `edna.care`. Fill from owner facts. |
| 1.7 | More media | Owner supplies five to seven more images per product (side, front, back, top, detail, on foot) and a short video where possible. Upload and order them. |
| 1.8 | Stock | Owner supplies quantities per size. Enter them. |
| 1.9 | Activate | Set products ACTIVE and publish products and collections to the Online Store. |
| 1.10 | Delivery rate | Replace the PKR 4,619 rate with the owner's real rate, named in English. Consider free delivery at these prices. |
| 1.11 | Money format | `Rs {{amount_no_decimals}}` and `Rs {{amount_no_decimals}} PKR`. Turn off the currency-code settings for cards and product pages. |
| 1.12 | Store identity | Store name EDNA, shop description (used as the homepage meta description), business contact email. |
| 1.13 | Policies and pages | Refund and exchange, shipping, terms, contact information. Pages: About, Size guide, Delivery and exchanges, FAQ. Text from the owner. |
| 1.14 | Menus | Main: New, Shop by style (six collections), Shop by occasion (four), About, Help. Footer: policies, size guide, contact. |
| 1.15 | Payments and checkout | Owner confirms payment methods in admin. Make phone number required at checkout. |

### Phase 2. Real products on the storefront

| # | Task | Detail |
| --- | --- | --- |
| 2.1 | Move editorial images to Files | Campaign, mobile campaign and street editorial images, selected through image pickers. |
| 2.2 | Rebuild `templates/index.json` | Use the sections in finding D. Order is in Phase 5.2. |
| 2.3 | Upgrade `snippets/edna-product-card.liquid` | Product type as subtitle. Second image on hover or swipe. Badges: "New", "Only N left" when any size is at or below 3, "Sold out". Whole card links to the product page. |
| 2.4 | Hero art direction | Second image picker for mobile in `edna-campaign`. `<picture>` with `image_url` widths for both. Preload the hero image. |
| 2.5 | Delete the concept layer | Remove `edna-concept-*.liquid`, `assets/edna-collection.js`, its `<script>` tag, unused `edna.collection.*` strings and concept CSS. |
| 2.6 | Collection page | Keep Horizon's `main-collection` for filters, sorting and pagination. Use the EDNA card and type. Show the collection description above the grid. Size and price filters need the Search & Discovery app. |
| 2.7 | Empty states | Cart, search and 404 show real bestsellers, not placeholders. |

### Phase 3. A product page that justifies the price

Order on mobile: gallery → title and price → stock line → size buttons → size-guide link → main button → assurances → WhatsApp → specification → details accordion → recommendations.

| # | Task | Detail |
| --- | --- | --- |
| 3.1 | Fix add-to-bag feedback | Render Horizon's `<cart-icon>` (see `snippets/header-actions.liquid`) in `sections/edna-header.liquid`. Set `auto_open_cart_drawer` to true. The bag icon opens the drawer. |
| 3.2 | Gallery | `media_presentation: carousel` on mobile with dots and pinch zoom. First image eager, the rest lazy. Video plays muted on tap. |
| 3.3 | Stock line | Horizon's `product-inventory` block, threshold 3, show quantity. |
| 3.4 | Size guide | `popup-link` block opening the Size guide page: EU, UK, US and foot length in cm. |
| 3.5 | Back-in-stock block | New `blocks/edna-notify.liquid`, shown when the selected size is unavailable. WhatsApp button to `https://wa.me/<number>?text=<product, size>`, hidden if no number is set. Email fallback with `{% form 'customer' %}` and tags `notify`, `notify-<handle>`, `size-<EU>`. |
| 3.6 | Unavailable sizes stay tappable | Confirm in `variant-picker` that a sold-out size can be selected so 3.5 appears. |
| 3.7 | Assurances block | New `blocks/edna-assurances.liquid`: up to three lines with icons (delivery, exchange, payment). Each line hidden while its setting is blank. |
| 3.8 | Specification table | New `blocks/edna-specs.liquid` reading the metafields from 1.6. Rows hidden when empty. |
| 3.9 | WhatsApp help link | "Ask about fit on WhatsApp", prefilled with the product name. |
| 3.10 | Details accordion | Horizon's `accordion` block: description, care, delivery and exchanges. |
| 3.11 | Buy buttons | Remove `accelerated-checkout`. Keep sticky add-to-cart. Hide quantity on mobile. |
| 3.12 | Recommendations | Keep "You may also like". Add recently viewed (Horizon has `recently-viewed-products.js`). |
| 3.13 | Reviews slot | Leave Horizon's `review` block out until a reviews app and real reviews exist. |

### Phase 4. Speed

| # | Task | Detail |
| --- | --- | --- |
| 4.1 | No photo through `asset_url` | Every photo comes from product media or Files via `image_url` + `image_tag` with `widths` and correct `sizes`. Cards: `(max-width: 749px) 46vw, 30vw`. |
| 4.2 | Hero under 90 KB on phones | Mobile source capped near 1000 px wide. `fetchpriority="high"` and a preload link. |
| 4.3 | Nothing below the fold loads early | Lazy-load tiles below the hero. Do not render hidden duplicates. |
| 4.4 | Remove image assets | Delete the 16 `edna-*.jpg` files, `edna-identity-board.jpg` and `snippets/edna-board-crop.liquid` once unreferenced. |
| 4.5 | Display typeface | `font_picker` setting for the EDNA display font, one weight, `font-display: swap`, preloaded. Owner chooses the face. |
| 4.6 | Fewer scripts | Turn off `quick_add`. Check whether `chat-drawer` is needed and remove it from `layout/theme.liquid` if not. List the modules loaded on the homepage and drop features the site does not use. |
| 4.7 | One stylesheet, one script | Merge `edna-collection.css` into `edna.css`. Remove rules for deleted sections. |
| 4.8 | App discipline | Re-run the throttled test before and after each app install and record it. |

### Phase 5. Ease of use and one brand

| # | Task | Detail |
| --- | --- | --- |
| 5.1 | Mobile type scale | No text under 12px. Body 14–16px. Card title and price 14px or more. All tap targets at least 44×44px. |
| 5.2 | Homepage order | 1) Hero at about 60svh on mobile: one image, one line, one button. 2) Product grid ("The Edit"). 3) Shop by occasion. 4) Signature product. 5) Stories. 6) Confidence: fit, delivery, exchange. 7) Brand note and sign-up. Each product photo appears once. |
| 5.3 | Copy | Remove study, proposed, concept, "01 / 12" and the notice bar from `locales/en.default.json` and sections. Update the social share description in `snippets/meta-tags.liquid`. |
| 5.4 | Brand consistency | Apply EDNA heading font, weights and spacing to Horizon pages through theme settings (`type_heading_font`, sizes, button radius) so collection, cart, search, 404 and policy pages match the homepage. |
| 5.5 | Sticky compact header | About 56px on mobile, sticks on scroll. |
| 5.6 | Real search | Header icon opens Horizon's `search-modal` with predictive results. Remove the custom form. |
| 5.7 | Menu | Render the menu from 1.14, with collection links grouped. |
| 5.8 | Announcement bar | Horizon's `header-announcements`, one line. Disabled until the owner supplies the text. |
| 5.9 | Sign-up | Footer form keeps email. Add a WhatsApp list button when a number is set. Remove the empty footer area. |
| 5.10 | Cart drawer | Items, total, one button. Free-delivery progress line only if the owner sets a threshold. |

### Phase 6. SEO

| # | Task | Detail |
| --- | --- | --- |
| 6.1 | Meta descriptions | Homepage from the shop description. Products and collections from their SEO fields (1.5). Fallback in `snippets/meta-tags.liquid`: first 155 characters of the description. |
| 6.2 | Titles | Pattern: `<Product name> – <type> | EDNA`, `<Collection> for women | EDNA`, homepage `EDNA – <category words> in Pakistan`. Final wording follows 6.8. |
| 6.3 | Structured data | Add JSON-LD: `Organization` and `WebSite` with search action on the homepage; `BreadcrumbList` on product and collection pages. Check what Horizon already outputs for `Product` once a product is active, and fill gaps (price, availability, brand, images). |
| 6.4 | Crawlable links | After Phase 2 every product card and collection tile is a real link. Add breadcrumbs to product and collection pages. |
| 6.5 | Headings | One H1 per page. Product name is the H1 on product pages. |
| 6.6 | Image SEO | Alt text from 1.2. Descriptive file names for new uploads. |
| 6.7 | Content pages | About, Size guide, Delivery and exchanges, FAQ (with `FAQPage` data). Collection descriptions from 1.3. |
| 6.8 | Keyword research | Before fixing titles, pull real Pakistan search terms from Google Keyword Planner. Do not guess volumes. |
| 6.9 | Launch items (owner) | Custom domain set as primary, password removed, Google Search Console verified, sitemap submitted, Google & YouTube app connected for Merchant Center. |

### Phase 7. Measurement hooks in the theme

| # | Task | Detail |
| --- | --- | --- |
| 7.1 | Custom events | `Shopify.analytics.publish('edna:<name>', data)` for `size_selected`, `unavailable_size_selected`, `size_guide_opened`, `notify_requested`, `whatsapp_clicked`, `wishlist_added`, `wishlist_removed`, `gallery_image_viewed`, `spec_opened`. Payload: product id, variant id, size, page type. No personal data. |
| 7.2 | Ad source on every order | Store `utm_*`, `fbclid`, `ttclid`, `gclid` for the session and write them to cart attributes with `/cart/update.js`. |
| 7.3 | Respect consent | Check Shopify's customer privacy API before storing ad parameters. |
| 7.4 | Event dictionary | `docs/EVENTS.md`. |

### Phase 8. Later, needs data or a backend

| Feature | Needs |
| --- | --- |
| "N people viewing now" | A live counter service. Show only at 3 or more. |
| "Just ordered" notice | Real orders from the signed webhook receiver in `dashboard/`. |
| Photo reviews and ratings | A reviews app and delivered orders. |
| Fit finder | Manufacturer sizing data and exchange history. |
| Delivery date by city | Courier transit times. |
| One-screen COD order form | A COD form app or a custom backend. Decide after testing Shopify checkout. |
| Wishlist the business can see | A backend endpoint or customer accounts. |
| Journal for search traffic | Keyword research (6.8) and a writer. |

## Part 4. Rules for the implementer

1. Work only on the duplicated theme. Publishing is the owner's action.
2. Admin writes (Phase 1) need the owner's approval each time.
3. Invent nothing. Materials, heel heights, delivery times, fees, exchange terms, sizes, reviews, counts and stock come from the owner or from Shopify data. If a fact is missing, the element stays hidden.
4. Follow `theme/AGENTS.md`. Reuse a Horizon block before writing a new one. Keep section and template IDs stable.
5. Do not run the Python generators.
6. All visible strings go in `locales/en.default.json`.
7. Keep existing accessibility behaviour.
8. Validate changed Liquid before uploading.
9. Never commit the storefront password or any personal contact detail.
10. In each hand-off, state what was verified in a browser and what was not.

## Verification for every phase

- Theme validation passes for every changed file.
- Screenshots at 393×851 and 1440×900 of each changed page, no horizontal scroll.
- Throttled speed run recorded in `docs/THEME_BASELINE.md`.
- Phase 3: add to bag updates the count and opens the drawer; an unavailable size shows the back-in-stock block; the page works with one image and with eight.
- Phase 6: structured data passes Google's Rich Results Test once the store is public.
- Phase 7: events visible with a test subscriber in the console.

## Part 5. What the owner must supply

| Needed | Blocks |
| --- | --- |
| Product facts: upper, lining, sole, heel height, fit, care | 1.1, 1.6, 3.8 |
| Five to seven more images per product, video if possible | 1.7, 3.2 |
| Stock per size | 1.8 |
| Delivery fee and time, exchange terms, payment methods | 1.10, 1.13, 1.15, 3.7 |
| Size chart in cm | 1.13, 3.4 |
| WhatsApp Business number | 3.5, 3.9, 5.9 |
| Display typeface choice | 4.5 |
| Business email, About text | 1.12, 1.13 |
| Custom domain | 6.9 |
