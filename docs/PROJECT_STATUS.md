# Development status

EDNA is a Pakistan-first footwear business. The project contains a Shopify storefront and an owned operations/intelligence application.

Implemented locally: catalog and cost workspace, COD ledger, validated JSON/CSV imports, customer segments, campaign-cost reporting, consent-required event ingestion, signed order webhooks, resumable Shopify reconciliation, event-table migration, scheduled retention and a rule-based intelligence view. Twenty-three automated checks passed at the initial repository publication, including embedded PostgreSQL migration checks.

Cloudflare and Supabase deployment preparation is included. Live cloud deployment, Shopify app credentials, pixel installation and external provider activation remain pending. The owner prefers to finish independent development before account activation. Existing catalog/analytics seed data is a dated snapshot, not a live feed. No customer or order runtime database belongs in Git.

Demand page (back-in-stock requests by design and size) is implemented and tested against simulated Shopify pages; no live pull has run because no credential exists.

Next development: Shopify pixel/privacy adapter; normalized order/customer identity and line-item/fulfillment data; courier reconciliation; advertising API adapters; focused automations. Retain native Shopify checkout and external delivery/payment/ad networks. Prefer owned code or suitable open-source components for EDNA-specific software capabilities.

Do not label collected cash as profit, infer identities from anonymous visits, fabricate activity, or claim a connection is live because its code/configuration exists.

See dashboard/ACTIVATION.md for implementation limits and the eventual account setup sequence, dashboard/GROWTH_REPORTING.md for metric definitions, and docs/STOREFRONT.md for storefront provenance. Local private agent notes and browser artifacts are intentionally excluded from version control.
