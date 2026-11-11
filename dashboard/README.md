# EDNA Business Studio

Run `npm start` in this directory, then open http://127.0.0.1:4173. Node 22+ is required; no package installation is needed.

## Included

Customer segmentation, campaign cost reporting and CSV imports are now available. See [GROWTH_REPORTING.md](GROWTH_REPORTING.md) for identity, consent, date and attribution definitions. These features use our own code without a paid reporting connector.

New: Intelligence page, validated browser-event collection, consent-aware browser transport, signed Shopify order webhook receiver and duplicate/out-of-order protection. These are implemented interfaces awaiting activation, not installed storefront tracking. See [ACTIVATION.md](ACTIVATION.md) for exact capability boundaries and remaining work.

- Responsive overview, catalog search, editable product/packaging costs, order/COD ledger, integration status and import center.
- Actual saved Shopify catalog and analytics evidence, with source dates. No invented orders or trends.
- JSON imports with preview, whole-batch validation, ID-based replacement, concurrent-write checks and backup export.
- Local persistence in `.data/state.json`; restarting preserves edits. Keep backups of this file.
- Cloudflare Worker API and Supabase REST adapter with backend-only credentials and a restricted database table.

## Data definitions

Order imports are cumulative records, not transactions. Re-importing an ID replaces it. `collected` is gross cash received before fees; `refunded` is cash returned. COD owed is max(order total minus collected, zero) for delivered COD orders only. Courier fee `null` means unknown; zero means confirmed zero. Net cash is collected minus refunded. It is not contribution profit: item quantities, historical COGS, tax, ad spend and complete fulfillment costs are not yet integrated.

Cost inputs are current per-product estimates, not historical inventory valuations. Templates contain placeholders; replace them with real records. Imports do not alter Shopify. Data spans all imported dates. The funnel is a fixed saved 30-day snapshot, not a live date selector.

## Hosted setup

1. Connect a Supabase project and run `schema.sql` through its SQL editor or connected tools.
2. Insert one `edna_state` record with id `edna`, revision `0`, and the `data` object from `seed.json` (or a local exported backup). Use a secure backend connection; never place a service role key in public assets.
3. Set Cloudflare Worker secrets `ADMIN_TOKEN` (a long random secret), `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` using Wrangler secret prompts. Verify account with `npx wrangler whoami`; deploy with `npx wrangler deploy`.
4. Open the hosted dashboard and enter the admin token. Data endpoints remain closed until configured. The shell/assets contain no business records. The token stays in tab memory and clears on reload. This initial version supports one trusted operator; use individual identity/access controls before adding a team.

For local use against Supabase, copy `.env.example` to `.env` and configure all three variables. Local mode without Supabase binds only to 127.0.0.1 and rejects foreign Host/Origin values. Do not expose the local server through a public tunnel.

## Integration boundaries

Shopify MCP supplied the snapshot; it is not an ongoing app credential. Automatic Shopify synchronization, webhooks, courier APIs, Meta/Google and visitor events are not connected. Supabase and Cloudflare configurations are implemented but have not been deployed or exercised against live accounts. The dashboard displays these states explicitly. AI is deferred.

The database uses one versioned document for this initial small-store release. Split it into indexed tables before large order volumes; imports are capped at 2,000 records / 1 MB per request. No scheduled sync or high-volume event ingestion is claimed.

## Verification

Run `npm ci` to install the development-only PostgreSQL test engine, then `npm test`. Twenty-three checks cover accounting, imports/CSV, segmentation, campaign spend, consent, webhook signatures, sync pagination/failures, retention and the actual SQL migration. Runtime still uses Node/Web APIs without production package dependencies.

Cloudflare routing follows https://developers.cloudflare.com/workers/static-assets/binding/ . Supabase backend API reference: https://supabase.com/docs/guides/api .
