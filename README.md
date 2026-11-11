# EDNA Intelligence

Owned commerce operations and intelligence software for EDNA, alongside the complete Shopify storefront source and brand assets. Pakistan first, with PKR reporting.

## Run the dashboard

Requires Node.js 22 or newer.

```sh
cd dashboard
npm start
```

Open http://127.0.0.1:4173. Local use needs no production dependencies or cloud account. It starts with dated Shopify catalog and aggregate analytics snapshots. Runtime edits persist in ignored `dashboard/.data/` files.

For automated checks, run `npm ci` then `npm test` inside `dashboard/`.

## Project contents

| Directory | Contents |
| --- | --- |
| `dashboard/` | UI, imports, customer segments, campaign reports, event collection, Shopify reconciliation, Cloudflare Worker and Supabase migrations |
| `theme/` | Complete Shopify theme and optimized assets, retaining inherited Horizon attribution |
| `scripts/` | Theme and asset preparation scripts |
| `catalog/` | Product definitions and saved Shopify product/collection metadata |
| `ASSETS/` | EDNA artwork and extracted brand kit |
| `output/imagegen/products/` | Original generated artwork used by preparation scripts |
| `docs/` | Architecture, strategy, implementation status and storefront history |

## Implementation and activation

The dashboard and data-processing code are implemented locally. External credentials, live tracking, cloud deployment and end-to-end store qualification remain pending. Configuration alone does not establish an active integration. No AI service, advertising campaign or messaging automation is enabled by this repository.

- [Dashboard instructions](dashboard/README.md)
- [Activation and remaining integration work](dashboard/ACTIVATION.md)
- [Customer and marketing metric definitions](dashboard/GROWTH_REPORTING.md)
- [Current development status](docs/PROJECT_STATUS.md)
- [Build-versus-buy strategy](docs/EDNA_BUILD_VS_BUY.md)
- [Growth blueprint](docs/EDNA_GROWTH_BLUEPRINT.md)
- [Storefront history and concept limitations](docs/STOREFRONT.md)

The historical storefront preview uses generated footwear imagery and separate concept cards. Treat snapshots as dated evidence. Sellable stock, checkout and production measurement require reconciliation before launch.

Keep credentials in ignored environment files or provider secret stores. Do not commit customer databases, orders, contact exports, runtime backups or access tokens. `.env.example` documents variable names without secrets.

Source code, relevant assets and documentation are versioned here. Local screenshots, deployment archives, dependency folders and private working notes are excluded. Back up actual runtime data separately. Some historical documentation refers to those local-only artifacts.
