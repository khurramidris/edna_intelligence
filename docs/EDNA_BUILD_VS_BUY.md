# EDNA: implementation ownership and build-versus-buy decision

Prepared 11 November 2026. Companion to [the growth blueprint](EDNA_GROWTH_BLUEPRINT.md). This is a feasibility and cost assessment, not a subscription, deployment or new campaign approval.

## Recommendation

Build the EDNA-specific data, reporting and automation logic ourselves. Retain Shopify for commerce, official advertising integrations for measurement, and established email/WhatsApp delivery infrastructure. Use free or inexpensive managed apps where they remove more operational work than they cost.

The previous US$350 software envelope was a planning allowance, not a minimum or a confirmed bill. Current research supports a lighter launch configuration. In particular, Shopify Messaging already includes 10,000 emails/month on eligible paid plans, so Klaviyo is optional at launch. Windsor.ai can also be deferred while direct integrations or scheduled imports cover the necessary sources.

This proposal does not claim feature parity with every enterprise platform. It implements the workflows EDNA can use now, with a path to extend them.

## 1. What Codex can implement and what requires the owner

I can author, integrate, test and troubleshoot the software, and operate connected tools within their actual permissions. I can begin local code and draft-theme work without new accounts. Live deployment, production data collection and sending require the corresponding accounts, credentials and authorized business settings.

| Workstream | Codex contribution | Owner or external dependency |
| --- | --- | --- |
| Storefront and buying experience | Product/cart surfaces, mobile usability, fit guides, filters, wishlist, accessibility, performance tests | Approved product details, stock, prices, photography and launch decision |
| Behavioral measurement | Event dictionary, consent-aware instrumentation, standard integrations, test journeys and deduplication checks | Google/Meta account sign-in, ownership and any required permissions |
| Customer profiles and segmentation | Store schema, identity rules, preference capture, rules-based segments and exports | Agreed purposes/consent, genuine customer data |
| Profit and COD reporting | Join orders, costs, returns, delivery and cash remittance; reconcile missing data | Actual unit costs, courier data, gateway fees and API/export access |
| AI analysis | Dashboard explanations, draft recommendations, scheduled reports, evaluations and usage limits | Hosted runtime, chosen model access/billing and a delivery destination |
| Social proof and recommendations | Genuine activity aggregates, product widgets, inventory-aware rules, experimentation | Real qualifying activity and customer permission for photos/testimonials |
| Email and WhatsApp journeys | Templates, triggers, suppression, consent propagation, sender integration and acceptance tests | Sender/domain ownership, DNS permissions, phone verification, account approval and sending authority |
| Advertising | Creative, landing pages, audience definitions, tracking and supported campaign configuration | Ad-account ownership, billing, platform approval and a specified spend limit |
| Payment and courier connections | Configure supported services; code integrations when APIs exist; reconcile results | Merchant onboarding, bank/identity verification, contracts and fulfillment operations |
| Production operation | Deployment configuration, backups, restore checks, monitoring, alerts, upgrades and runbooks | Hosting account, billing and a named person responsible for responding to incidents |

The present Shopify connection was rechecked successfully. It does not imply access to Meta, Google, WhatsApp, cloud billing or a courier account. Some settings require the provider's admin interface or account-owner authentication; the current Shopify MCP does not expose a universal app-install or account-creation operation.

For a continuing background service, create a separately authorized Shopify app through the current developer workflow. Do not attempt to reuse or extract the MCP connector's credentials. Shopify supports [custom distribution for one merchant](https://shopify.dev/docs/apps/launch/distribution); data access still needs the relevant scope and configuration. [Protected customer data](https://shopify.dev/docs/apps/launch/protected-customer-data).

Owner involvement should be batched around four inputs: account ownership and sign-in, actual commercial data, sender/domain/business verification, and concrete launch/spending decisions. Passwords, one-time codes and secrets belong in the provider's secure flow or designated secret storage.

## 2. Build, integrate or use an existing service

### Build first

- One EDNA management dashboard: sales, delivered/collected contribution, campaign costs, stock and returns.
- Consistent metrics and data history in a database under EDNA's account.
- Rules-based customer segments and style/size preferences.
- Fit-guide, wishlist, restock and truthful activity widgets where they improve the buying experience.
- Inventory-aware recommendations using catalog rules initially.
- A daily AI brief grounded in computed metrics, with evidence and explicit hypotheses.
- Courier/COD reconciliation adapters, alerts and operational exception queues.
- Direct data connectors for the few authorized sources that matter, with a CSV import fallback where an API is unavailable.

### Integrate established infrastructure

- Shopify storefront/checkout, order processing and supported payment gateways.
- Meta/Google advertising networks and their official measurement channels.
- An established email delivery service.
- WhatsApp Business Platform via a supported integration.
- Database hosting, backups and monitoring.
- Genuine review collection through a low-cost app unless a demonstrated gap justifies owning it.

Our code can control segmentation, decisions and presentation. It cannot eliminate advertising costs, provider message charges, payment fees, platform access rules or the need for customers to supply identity information. Shopify plan restrictions still apply to custom checkout work.

### Open-source options

| Component | Suitable role | What we still build or operate |
| --- | --- | --- |
| PostgreSQL | Owned reporting and customer-data tables | Schema, access controls, connectors, retention, backups and reconciliation |
| Metabase Open Source | Internal dashboards and SQL exploration | Hosting, data models, authentication and updates; evaluate embedding terms separately |
| listmonk | Mailing lists, newsletters and transactional sending interface | Shopify events, journey scheduling, consent/suppression, bounce handling, SMTP provider and delivery monitoring |
| A small custom worker/queue | Scheduled data jobs, lifecycle rules and alerts | Retries, idempotency, failure alerts, audit records and tests |
| n8n Community | Optional internal workflow orchestration | Hosting, credentials, reliable workflow design and current license review |

[Metabase licenses](https://www.metabase.com/license) distinguish its AGPL open-source edition from commercial features. [listmonk](https://listmonk.app/docs/) is AGPLv3 and a newsletter manager, not a complete Klaviyo replacement. [n8n's current license](https://github.com/n8n-io/n8n/blob/master/LICENSE.md) is source-available under the Sustainable Use License for relevant code; it should not be described as unrestricted open source.

Self-hosting an analytics product is also an option, but a free license is only one part of its cost. For example, [PostHog currently describes self-hosted deployments as unsupported](https://posthog.com/docs/self-host). For EDNA's initial browser recordings, the already researched Clarity option has a more attractive setup burden.

These are alternatives to select deliberately. The launch budget below assumes a lightweight custom dashboard and workers; it does not include separate servers for every open-source product above.

## 3. Monthly cost model

### Assumptions

One Pakistan-first Shopify store; one initial managed database project; approximately 20,000 or fewer storefront sessions/month for planning; limited event retention; modest daily text analysis; no AI call on every click; email within the chosen starter allowance. No heavy image/video generation, large replay archive, highly available multi-region deployment or 24/7 human support is included.

Visitor volume alone does not determine the bill. Event counts, database size, retention, compute time, message volume, model context and connector refresh frequency all matter.

All amounts below are USD, before applicable taxes and currency conversion. Provider starting prices and our usage allowances are distinguished.

| Item | Monthly amount | Basis |
| --- | ---: | --- |
| Shopify Basic in Pakistan | 25 | Current month-to-month list price; 19/month equivalent when paid yearly, excluding promotions |
| Supabase Pro database | 25 | Starting subscription for a suitable initial project; overages/additional compute are separate |
| Cloudflare app/API workers | 5–15 | Paid plan starts at 5; upper amount is an initial usage allowance |
| AI text analysis | 10–30 | Our initial budget, not a provider quote or guaranteed unlimited usage |
| Email/customer journeys | 0–20 | Shopify included email allowance, or Klaviyo's 500-profile/5,000-email tier if needed |
| Reviews | 0–15 | Judge.me free or paid tier |
| Additional monitoring/backups | 5–15 | Planning allowance; validate actual services and restore requirements |
| **Core recurring subtotal** | **70–145** | Sum of the rows; WhatsApp and other excluded charges below |

Current primary sources: [Shopify Pakistan pricing](https://www.shopify.com/pk/pricing), [Supabase](https://supabase.com/pricing), [Cloudflare Workers](https://developers.cloudflare.com/workers/platform/pricing/), [Shopify email pricing](https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging/email/pricing), [Klaviyo](https://www.klaviyo.com/pricing), [Judge.me plans](https://judge.me/help/en/articles/8415450-judge-me-reviews-plans-and-pricing).

Shopify Messaging's 10,000 included emails are counted per recipient; marketing automations consume the allowance, while its abandoned-checkout emails are documented as free. The paid Klaviyo option is an alternative sender with a different feature set and limit, not an additional mandatory expense.

### WhatsApp can materially change the total

Shopify Messaging currently lists Pakistan marketing messages at **0.095/message** and service messages at **0.010/message**, with a documented 1,000-service-message monthly free threshold per WhatsApp Business Account. Actual account eligibility, connection and message classification must be verified. These are Shopify-provider prices, not a quote for every WhatsApp provider. [Rate table](https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging/whatsapp/pricing), [eligibility](https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging/whatsapp/requirements).

Illustrative monthly totals using that marketing rate:

| Scenario | Core subtotal | WhatsApp marketing | Combined |
| --- | ---: | ---: | ---: |
| No paid WhatsApp marketing | 70–145 | 0 | 70–145 |
| 500 marketing messages | 70–145 | 47.50 | 117.50–192.50 |
| 1,000 marketing messages | 70–145 | 95 | 165–240 |

Service-message overages, tax and other exclusions are not in these totals. Before selecting a provider, compare direct official WhatsApp API costs and support/hosting obligations with the managed provider. Custom coding may reduce a provider markup, but underlying billable message charges remain.

For illustration only, the 500-message scenario plus a separately chosen 300 ad budget would total **417.50–492.50/month** before the excluded commercial costs. This arithmetic is not a recommended ad budget or a return forecast.

### Other costs and ownership

- Domain registration/renewal: depends on the actual domain and annual contract; not quoted.
- Advertising: a separately approved test budget; software cannot supply paid traffic for free.
- Payments: gateway charges and any applicable Shopify third-party transaction fee. Shopify documents that [manual methods such as COD are exempt from its third-party transaction fee](https://help.shopify.com/en/manual/payments/manual-payments); courier COD collection and delivery charges still apply.
- Inventory, photography, packaging, shipping, failed delivery, returns, taxes and business registration: commercial costs outside the software estimate.
- Coding here: consumes the user's current Codex subscription allowance or usage credits; current remaining allowance is unknown. Runtime API billing is separate. [Official Codex pricing](https://learn.chatgpt.com/docs/pricing), [API pricing](https://developers.openai.com/api/docs/pricing).
- Implementation and maintenance effort: this estimate does not pay for a developer retainer or human incident response. I can do coding/testing work through authorized sessions and configured automations; a continuing production operation needs monitoring and someone accountable for incidents.

Recommended planning reserve: **150–250/month for the low-volume hybrid system with modest WhatsApp use**, plus separately chosen advertising and commercial fees. Spend can initially be lower. A fully built enterprise-equivalent suite and large-volume operation are not priced by this estimate.

## 4. Why low email delivery cost is not the whole system

Amazon SES lists base outbound email at **0.10 per 1,000 emails** under its a la carte pricing. Consequently, 10,000 outbound emails have a 1 base sending charge, before data and extras. [SES pricing](https://aws.amazon.com/ses/pricing/).

That does not provide a 1/month marketing platform. listmonk or our own application still needs a server, authenticated sender domain, production sending eligibility, consent tracking, unsubscribe/bounce/complaint handling, lifecycle state, retries and delivery monitoring. We can build these, but replacing an included email allowance solely to save delivery cost has weak launch economics.

The same principle applies to open-weight AI: self-hosting is feasible, but introduces inference hosting and model operations. Begin with capped text API usage and evaluate self-hosted inference against measured volume later.

## 5. Finite custom implementation scope

### First release

1. A separately authorized EDNA integration app and secure database.
2. Correct ingestion of orders, refunds, catalog and available fulfillment events.
3. An explicit cost/remittance import for missing courier and finance inputs.
4. A useful dashboard for delivered contribution, funnel trends, stock and returns.
5. A daily evidence-linked report with bounded AI usage.
6. One native customer-recovery journey, plus selected fit/restock improvements.

Finish this release before expanding into a full general-purpose marketing platform.

### Production acceptance

- Correct event/record IDs and currency; no duplicate orders or purchase events.
- Retries and replay are safe; missed updates can be reconciled.
- Defined consent, deletion and suppression behavior across affected systems.
- Credentials remain server-side and access is scoped.
- Restoring a backup is demonstrated.
- Report numbers match controlled Shopify orders, costs and delivery/remittance evidence.
- Sending stops on unsubscribe/purchase/cancellation as designed.
- Alerts, monthly limits and a rollback route are tested.
- A human can find the source behind every important AI claim.

The next implementation decision is the exact first-release scope and hosting/account choices. This assessment prepares that decision without activating new services.

