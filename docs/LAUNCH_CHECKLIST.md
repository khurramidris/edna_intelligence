# Launch checklist: what is done and what needs the owner

Updated 12 November 2026.

## Done in the store (Admin API)

| Item | Result |
| --- | --- |
| Product copy | All 12 descriptions rewritten without "concept", "study" or "not available to order". Only design facts already in the original text were kept. |
| Image alt text | All 12 product images and the 3 editorial images have plain descriptions. |
| Tags | `edna-concept` and `edna-collection-study` removed. Style and occasion tags kept. |
| Collections | 13 descriptions rewritten. Handles shortened (`stilettos`, `occasion`, `tradition`, `flats-mules`, `street-sneakers`, `statement`, `the-edna-edit`, `the-quiet-edit`, `the-unexpected-edit`, `wedding-guest`, `everyday`, `after-dark`, `weekend`). |
| Publishing | The 12 products are ACTIVE and, with the 13 collections, published to the Online Store. The store is still password protected. To undo: set the products back to DRAFT. |
| Menus | Main menu: The EDNA Edit, Shop by style (6), Shop by occasion (4), Contact. Footer: Shop all, Search, Contact. |
| Files | `edna-campaign.jpg`, `edna-mobile-campaign.jpg` and `edna-street-editorial.jpg` added to Files so the theme can resize them. |
| Product details fields | Metafield definitions created: `edna.material`, `edna.lining`, `edna.sole`, `edna.heel_height`, `edna.fit_note`, `edna.care`. They appear on each product in the admin. |
| Theme | Duplicate `EDNA — Build` (id 192900727066), unpublished. The live theme was not touched. |

## Not possible from here, owner to do in Shopify admin

1. **Publish `EDNA — Build`** when you are happy with it (Online Store → Themes → Publish). Blocked for assistants by design.
2. **Delete leftover files from `EDNA — Build`.** Assistants cannot delete theme files. In the theme code editor, delete: `sections/edna-concept-*.liquid` (5 files), `sections/edna-collections.liquid`, `sections/edna-stories.liquid`, `snippets/edna-board-crop.liquid`, `assets/edna-collection.css`, `assets/edna-collection.js`, `assets/edna-identity-board.jpg` and the 15 `assets/edna-*.jpg` product and campaign photographs. Nothing references them. The repository already has them removed.
3. **Store name** is still "My Store 3" (Settings → Store details).
4. **Shop description and business contact email.** The email is currently a personal address. The homepage search description uses the shop description when it is set.
5. **Price format.** Settings → Store details → Currency formatting. Suggested HTML without currency: `Rs {{amount_no_decimals}}`. The theme already strips trailing zeros, so prices read "Rs.13,900" until you change it.
6. **Shipping rate.** The only rate is PKR 4,619 named in Urdu. Replace it with the real rate and an English name. Consider free delivery at these prices.
7. **Policies and pages.** Refund and exchange, shipping, terms, contact information. Pages: About, Size guide, Delivery and exchanges, FAQ.
8. **Payments.** Choose and test the payment methods, including cash on delivery if offered.
9. **Custom domain,** then remove the storefront password, then submit the sitemap to Google Search Console.

## Needs owner information before it can be filled in

| Needed | Used by |
| --- | --- |
| Material, lining, sole, heel height, fit and care for each design | The product details table on each product page (fill the metafields; empty rows stay hidden) |
| Five to seven more photographs per design, and a short video if possible | Product galleries (carousel is already set) and the hover image on cards |
| Stock per size | Add in Products → Inventory. Until then every size shows sold out and the back-in-stock form appears |
| Delivery time, exchange terms and payment options, one short line each | The "EDNA assurances" block on the product page (theme editor → Product page → add block settings) |
| WhatsApp Business number | "EDNA WhatsApp help" and "EDNA back in stock" blocks (theme editor) |
| Size chart in centimetres | A "Size guide" page and a popup link on the product page |
| Choice of heading typeface | Currently Jost. Change in Theme settings → Typography |

## Needs the owner to sign in

Google & YouTube (GA4), Facebook & Instagram (Meta pixel and server-side events), TikTok if available in Pakistan, Microsoft Clarity. See the app install steps in the conversation. Move the store, GitHub and ad accounts to the business identity first.

## Known limits

- With zero stock every product shows "Sold out", on cards, collection pages and product pages. That is accurate but looks flat until stock is entered.
- Ad-source attribution (`edna_*` cart attributes) and the back-in-stock tags have been built but not exercised end to end, because nothing can be added to a cart without stock. The back-in-stock panel itself was tested in a browser (shows for sold-out sizes, heading and tags follow the chosen size). The form was not submitted, to avoid creating a customer record.
- Unused EDNA strings ("study", "AI-generated", "not available to order") have been removed from the locale file. The theme shows no "translation missing" text on the pages checked.
- The quantity selector is hidden on phones (quantity stays 1) and still shows on larger screens.
- `catalog/*.json` are historical snapshots taken before the rename and activation. Handles and statuses in them are out of date.
- The size-select event is wired to the variant picker's radio buttons and dropdown; the dropdown variant was not tested.
