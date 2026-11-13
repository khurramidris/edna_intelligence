# Activation handoff — account work deferred

Development can continue without these connections. Do not send secrets in chat. Configure them through provider login/secret interfaces when the application is ready.

## Implemented collection interfaces

- `POST /api/collect`: hosted browser event ingestion; requires exact allowed Origin, the Cloudflare `EVENT_LIMITER` binding, and analytics permission in every event. Batches contain 1–50 events, max 64 KB. Set `COLLECT_ORIGINS` to a comma-separated list of actual storefront origins. Null origins are rejected; verify Shopify pixel sandbox Origin behavior before activation.
- `POST /api/events/import`: private authenticated equivalent for controlled adapter ingestion and local development. Does not require a public rate limiter.
- `GET /api/intelligence`: authenticated product-interest aggregates, activity by Pakistan date, and evidence-based operational alerts.
- `POST /api/shopify/webhooks`: hosted signed receiver for `orders/create`, `orders/updated`, `orders/cancelled`. Set `SHOPIFY_SHOP_DOMAIN` and secret `SHOPIFY_WEBHOOK_SECRET`. Subscriptions must be registered in the authorized Shopify app. No registration has happened.
- `public/collector.mjs`: browser transport with permission off by default. Calls are dropped while permission is off. No email, address, URL, IP, search text or checkout token is persisted. Visitor IDs are ephemeral per transport instance, not persistent identities.

Event shape: `{ "events": [{ "id": "stable-event-id", "visitorId": "anonymous-id", "name": "product_viewed", "at": "ISO timestamp", "analyticsConsent": true, "productId": "Shopify product GID" }] }`. Generate timestamps at event occurrence. Reuse event IDs on retry. Unknown fields are discarded. Unsupported names, stale timestamps and missing permission reject the entire batch.

## What is still development work

- Connect the transport to Shopify customer events and customer privacy lifecycle, then exercise storefront and checkout behavior. The generic transport is not an installed Shopify pixel. Do not put ADMIN_TOKEN or webhook secret in it.
- Paginated order backfill/reconciliation is now implemented in `shopify-sync.mjs`: 50 orders per call, fixed update window, persisted cursor, retries, five-minute overlap, totals for refunds and Shopify receipts. Initial coverage is the accessible 59-day update window. Historical access beyond Shopify's order window requires additional scope. Dedicated refund/fulfillment detail and line-item cost handlers remain to build.
- Cloud events now use indexed Postgres storage and SQL aggregates (`migrations/002_events.sql`). Apply this migration before using cloud collection. The local fallback remains capped at 10,000 retained events; orders remain in the versioned document, capped at 2,000 records, with 10,000 recent webhook receipts. Normalize orders before exceeding this capacity.
- Scheduled maintenance is implemented with a 15-minute Cloudflare trigger. It prunes events older than 30 days and receipts older than 7 days, even without traffic, once deployed. Optional `ENABLE_SHOPIFY_SYNC=true` processes one order page per invocation. Failed jobs need operational monitoring; a configured cron is not proof of deployment or successful execution.
- Add courier, ad-cost, CRM and visitor-replay adapters, multi-user authentication, monitoring, identity/consent deletion flows and deployment qualification.

## Account activation sequence

1. Supabase: project access; apply schema, seed and migration 002. If migrating an existing local instance, separately import retained events through the authenticated batch API; seed/state events are not automatically moved to the new table.
2. Cloudflare: account access; configure secrets, rate limiter and origins, deploy.
3. Shopify: authorized app access and scopes; configure webhook subscriptions and pixel settings.
4. Advertising/courier/messaging: account access and provider configuration as each adapter is completed.
5. Run one end-to-end controlled journey and reconcile browser events, authoritative orders and courier outcomes before enabling automation.

## Sync controls and validation

Set `SHOPIFY_ADMIN_TOKEN` only in backend secret storage. `GET /api/shopify/status` reports configuration and cursor progress; `POST /api/shopify/sync` processes one page, both behind dashboard authorization. The Integrations screen exposes these controls. Credentials being present do not prove connectivity. No credentials were supplied or live sync executed during development.

The API is pinned to 2026-10 and the query passed the Shopify toolkit schema validator. Tests use simulated Shopify pages for pagination, failure and currency rejection; a PGlite PostgreSQL engine executes the actual SQL migration, duplicates, rollups, pruning and permission checks. Hosted Supabase and Cloudflare verification still remains.

Source: [Shopify order API](https://shopify.dev/docs/api/admin-graphql/2026-10/queries/order).

Browser events are untrusted observations. Origin allowlisting and rate limits reduce abuse; they do not authenticate browser payloads. Never use them alone for paid-order accounting, sales notifications or scarcity claims. Signed order records are stored separately from the manual remittance ledger, because Shopify payment status does not establish courier remittance.

Sources: [Shopify standard events](https://shopify.dev/docs/api/web-pixels-api/standard-events), [pixel privacy](https://shopify.dev/docs/api/web-pixels-api/pixel-privacy), [webhook verification](https://shopify.dev/docs/apps/build/webhooks/verify-deliveries), [Cloudflare rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).

## Demand pull (back-in-stock sign-ups)

- `GET /api/demand`: authenticated report: totals, design by size, day by day, unpaired count.
- `POST /api/demand/sync`: pulls customers tagged `notify` from Shopify (customer ID, creation time and tags only) and replaces the stored sign-ups. Needs a custom app token with `read_customers`; set it only in backend secret storage, like the order token.
- `POST /api/demand/import`: the same result from rows exported out of Shopify, for use before a token exists.
- Not verified against a real Shopify customer: whether a returning customer's new `want:` tag is added to the existing record when they use the form a second time. Test with a real browser (the form is protected by Shopify's captcha, so it cannot be exercised by automation) and look at the customer's tags. If tags are not added, repeat requesters are undercounted.
- Automated checks use simulated pages; no live pull has run because no credential exists yet.
