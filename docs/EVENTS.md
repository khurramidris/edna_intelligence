# EDNA storefront events

The theme publishes custom events to Shopify's customer-events bus with `Shopify.analytics.publish('edna:<name>', data)`. A custom pixel or app pixel subscribes with `analytics.subscribe('edna:<name>', handler)`; the payload arrives in `event.customData`. Nothing here installs a pixel. Standard Shopify events (`page_viewed`, `product_viewed`, `product_added_to_cart`, `checkout_started`, `checkout_completed`) come from Shopify itself and are not repeated.

Payloads never contain names, emails, phone numbers or addresses. Custom events can be published by anyone in a browser console, so treat them as untrusted signals, never as proof of a sale.

Source: `theme/assets/edna.js`.

| Event | When it fires | Fields |
| --- | --- | --- |
| `edna:size_selected` | A shopper picks a size (radio button) on a product page | `productId`, `size` |
| `edna:unavailable_size_selected` | The picked size is sold out | `productId`, `size` |
| `edna:notify_requested` | The back-in-stock form is submitted | none |
| `edna:whatsapp_clicked` | A WhatsApp link (help block or back-in-stock block) is clicked | `productId`, `variantId` |
| `edna:wishlist_added` | The heart on a product card is switched on | `productId` |
| `edna:wishlist_removed` | The heart is switched off | `productId` |
| `edna:gallery_image_viewed` | A shopper swipes, drags or taps to another product photo (not on page load) | `productId`, `index` |

IDs are Shopify numeric product and variant IDs, not GIDs.

## Not built yet

`size_guide_opened` (there is no size guide page yet) and `spec_opened`. `gallery_image_viewed` is wired but cannot be exercised until products have more than one photo.

## Ad source on every order

On landing, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `ttclid` and `gclid` are kept in `sessionStorage` for the session, and only if Shopify's customer privacy API reports that analytics processing is allowed. If the API is not available the parameters are not stored.

When the first item is added to the cart (`/cart/add` succeeds) they are written to the cart as attributes, so they appear on the order:

| Cart attribute | Source |
| --- | --- |
| `edna_utm_source`, `edna_utm_medium`, `edna_utm_campaign`, `edna_utm_content`, `edna_utm_term` | Last-touch UTM values |
| `edna_fbclid`, `edna_ttclid`, `edna_gclid` | Last-touch click IDs |
| `edna_landing` | Path of the page where the last-touch parameters arrived |
| `edna_first_source`, `edna_first_campaign` | First touch of the session |

How to verify: open a product URL with `?utm_source=test&utm_campaign=check`, add a size that is in stock, then read `/cart.js` and look at `attributes`. This cannot be tested until a product has stock.

## Back-in-stock customers

The back-in-stock form creates a Shopify customer with the tags `notify`, `notify-<product handle>` and `size-<size>`, for example `notify,notify-noor-satin-stiletto,size-eu-38`. Filter customers by those tags to see demand by design and size. The sign-up line tells the shopper they agree to receive EDNA emails.
