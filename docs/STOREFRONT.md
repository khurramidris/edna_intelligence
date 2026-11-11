# EDNA — Collection preview

A populated luxury footwear concept storefront, built on the existing Shopify Horizon theme with the supplied EDNA digital brand kit.

- [Open the new theme editor](https://admin.shopify.com/store/wearedna/themes/192828473626/editor)
- [Storefront preview](https://wearedna.myshopify.com/?preview_theme_id=192828473626) — the store's existing password applies
- [Desktop capture](output/playwright/collection-desktop.png)
- [Mobile capture](output/playwright/collection-mobile.png)
- [Mobile product view](output/playwright/collection-product-mobile.png)
- [Uploadable theme ZIP](output/edna-collection-preview-theme.zip)

## What was created

- 12 Shopify DRAFT products: Noor, Sable, Mehfil, Sitara, Gul, Raqs, Forma, Lina, Cypher, Reverb, Orbit and Fable.
- Six proposed EU size variants per product (36–41), 72 variants total, tracked zero stock.
- Proposed PKR prices from 9,900 to 24,900; these are planning values, not confirmed retail prices.
- 13 unpublished collections: six styles, three editorial selections and four occasions.
- 15 images using built-in image generation: 12 product photographs, a landscape campaign, a mobile campaign adaptation and a street-style editorial.
- New supplied horizontal/mobile logos, dark-footer logo, favicon, Apple icon, share-preview artwork and architectural brand patterns.
- Full-width 72svh campaign, six style shortcuts, two-column curated six-item edit expanding to all 12, product dialogs, browser-local wishlist, signature Orbit section, Quiet/Unexpected editorials, occasion filters, brand story and native newsletter.
- Header search filters the concept collection on the homepage, including a clear empty-results state.

The new version is saved as **EDNA — Collection preview**, unpublished. The previous EDNA theme is now the live theme because the owner published it between turns; it was preserved during this work.

## Concept status

These are original design proposals with AI-generated imagery. They are not verified photographs of manufactured stock. Descriptions do not promise genuine material composition, tested fit, manufacturing origin, delivery or exchanges. Products remain DRAFT and cannot be purchased. The preview labels the collection, prices and size range as proposals and offers no checkout for the concepts.

The homepage concept cards and the Shopify draft records use the same source catalog but are separate editable representations. Draft Shopify products do not appear in normal storefront Liquid product collections, so the review theme uses concept blocks and dialogs. Before selling, approve physical products/materials, real photography where needed, pricing, fit and inventory; then bind the native Shopify shopping sections to approved products.

No fake reviews, customer photographs, orders, stock, followers or delivery policies were created. The newsletter is Shopify's native customer form; no real subscription was submitted during testing.

## Files

- `ASSETS/New folder/EDNA_digital_brand_assets/`: supplied brand kit, preserved.
- `output/imagegen/products/`: all 15 original generated PNGs.
- `output/imagegen/generation-manifest.json`: exact prompts, source paths and built-in generation/edit modes.
- `catalog/concepts.json`: design names, categories, proposed prices and copy.
- `catalog/shopify-products/`: creation responses and product IDs.
- `catalog/shopify-verification.json`: current verification of all 12 drafts and imported product media.
- `catalog/shopify-collections/` and `catalog/collection-verification.json`: collection IDs and verified membership.
- `theme/`: complete theme source, including inherited Shopify Horizon attribution.
- `scripts/enrich_edna.py`: generates this theme's collection sections and configuration.
- `scripts/prepare_collection_assets.ps1`: creates web JPEG encodings from the originals.
- `.agent/PLANS.md`: exact state and resume instructions.

Do not rerun the build/enrichment generators after changing the theme editor without reconciling those changes: generators reset the custom homepage configuration. The earlier `scripts/build_edna.py` generates the preceding version, not this collection preview.

## Verification and limits

Official Shopify theme validation passed for all 39 new/changed files, with a separate successful check for the final EDNA SEO metadata update. All 39 deployed files matched their normalized local checksums before that scoped metadata update; the final metadata checksum also matched.

Local browser checks passed at 1440×1000 and 390×844: no horizontal overflow, one H1, 72% hero height, loaded branding/images, six initial cards, all 12 accessible, twelve style/editorial/occasion filters, search and no-results state, product dialog and Escape close, wishlist persistence and saved-style deep links. No page JavaScript errors occurred.

MCP reads confirmed all 12 product images, six variants each, DRAFT status and zero inventory; all 13 collections are unpublished with the expected membership counts. The shop's current domain is `wearedna.myshopify.com`; the earlier `vrp8pp-z1.myshopify.com` redirects to it.

An unauthenticated Shopify preview reaches the password page. End-to-end live checkout, payments and newsletter delivery have not been tested. This is a reviewable concept storefront, not an operational inventory-backed launch.
