# EDNA growth and intelligence blueprint

Prepared 11 November 2026. This is a proposed operating system and implementation backlog, grounded in the connected store. The integrations and campaigns below have not been activated.

Build-versus-buy follow-up: [implementation ownership and revised costs](EDNA_BUILD_VS_BUY.md) recommends a lighter hybrid launch, using Shopify's included email and building EDNA-specific reporting/automation. Klaviyo and Windsor.ai below are optional choices; the original US$350 allowance is not a minimum. Use the follow-up for current launch budgeting and responsibility boundaries.

## Business objective and confirmed scope

Build a Pakistan-first footwear business that learns from acquisition, browsing, purchases, delivery, exchanges and repeat buying. Optimize contribution profit and customer experience; use revenue and ad attribution as supporting measures.

The owner confirms real products, prices, stock and delivery arrangements are ready, and is willing to consider US$300+ per month for software when value is clear. Exact subscriptions and advertising spend have not been selected.

The operating loop is: **collect reliable signals → understand the problem → take a targeted action → measure the result → retain what works**.

## 1. What the live audit established

| Area | Observation | Consequence |
| --- | --- | --- |
| Store | wearedna.myshopify.com; store name My Store 3; trial plan; PKR; PKT | Finish brand/account setup and select a selling plan. |
| Catalog | 12 products, all DRAFT, each with zero inventory | Match approved real products, photos, prices, sizes and stock to these records before activation. Owner readiness does not make the existing concept descriptions accurate. |
| Store configuration | HTTPS enabled; shipping countries returns PK; customer accounts optional | Consistent with Pakistan-first scope; actual rates and payment acceptance still need tests. |
| Last 30 days | 16 sessions, 15 visitors; zero sessions with cart additions, reached checkout or completed checkout | Too little data for customer conclusions. Counts are unfiltered and may include setup/test/bot activity. This is not an all-channel sales report. |
| Policies | Only a privacy policy returned; it still names My Store 3 | Align identity and policies with the actual business and chosen tools; create truthful delivery, exchange/return and contact information. |
| App visibility | Installation query returned the Shopify ChatGPT MCP App only, with no next page | Other account connections, custom tracking, complete app visibility and configuration are not established. Do not equate installation with working measurement. |
| Marketing consent | SMS marketing consent at checkout is disabled | This does not establish email or WhatsApp permission. Each channel needs its own configuration. |

Evidence: [minimized audit record](../output/growth-audit-summary.json). The analytics response retains the earlier vrp8pp-z1.myshopify.com domain alias; current shop information identifies wearedna.myshopify.com.

Current password protection could not be reverified with the web tool. Payment gateways, courier connections, tracking health and end-to-end shopping were not tested in this audit.

The previous build uses concept cards and dialogs separate from native sellable Shopify product pages. Its UI validation is not evidence that checkout or product analytics works. Preserve [the storefront handoff](../.agent/STORE_PREVIEW_HANDOFF.md).

## 2. Recommended system

| Capability | Initial choice | Purpose and boundary |
| --- | --- | --- |
| Orders, products, customers, inventory | Shopify | Authoritative commerce records. Payment settlement and courier remittance still need reconciliation. |
| Traffic and conversion funnel | Shopify Analytics + GA4 through Google & YouTube | Compare sources, landing pages, devices and funnel steps. Keep metric definitions consistent. |
| Advertising measurement | Facebook & Instagram by Meta; Pixel + Conversions API | Eligible audience retargeting and campaign measurement. Validate browser/server deduplication and catalog IDs. |
| Browsing friction | Microsoft Clarity | Masked recordings, heatmaps and interaction analysis on supported surfaces. Do not assume access to every checkout field or step. |
| Customer profiles and lifecycle | Klaviyo | One primary lifecycle system for sign-ups, segments, email and eligible WhatsApp workflows. Avoid duplicate Shopify/Klaviyo recovery sends. |
| Search and recommendations | Shopify Search & Discovery | Useful filters, related items and merchandising before an additional personalization engine. |
| Operational automation | Shopify Flow | Stock, order and service workflows on an eligible paid plan. External HTTP actions require Grow or higher. |
| Reviews | Judge.me, or Klaviyo's included review capability if sufficient | Choose one collector after checking requirements; do not pay for overlapping tools by default. |
| Customer support | Shopify Inbox initially | Consistent fit, delivery and exchange answers with a human escalation route. Add deeper helpdesk automation when workload warrants it. |
| Cross-platform AI analysis | Existing Shopify connection + Klaviyo connection + Windsor.ai candidate | Combine accessible marketing data for analysis after account authorization. A connector is not itself a verified customer data warehouse. |
| Data warehouse later | Managed warehouse + scheduled connectors, if justified | Join orders, costs, advertising and fulfillment history when operational reporting outgrows the initial stack. |

Shopify documents [GA4 setup through Google & YouTube](https://help.shopify.com/en/manual/reports-and-analytics/google-analytics/google-analytics-setup/) and the official channel's [Meta data-sharing options](https://help.shopify.com/en/manual/promoting-marketing/analyze-marketing/meta-data-sharing). Enhanced and Maximum include server-side purchase sharing; the appropriate setting depends on disclosed data use and permissions. Never add a second purchase sender merely to collect more data.

Current official listings confirm [Clarity](https://apps.shopify.com/microsoft-clarity), [Search & Discovery](https://apps.shopify.com/search-and-discovery), [Forms](https://apps.shopify.com/shopify-forms) and [Inbox](https://apps.shopify.com/inbox). Prefer Klaviyo forms for lifecycle capture if Klaviyo is selected; Shopify Forms is an alternative for suitable cases, not an extra popup layer. [Flow plan requirements](https://help.shopify.com/en/manual/shopify-flow) must guide workflow design.

Klaviyo's current documentation includes [WhatsApp account setup](https://help.klaviyo.com/hc/en-us/articles/40111819732635) and [Pakistan-specific recipient pricing categories](https://help.klaviyo.com/hc/en-us/articles/40116442241179). Verify EDNA's account eligibility, phone-number migration, approved templates and actual usage quote before choosing it over a separate WhatsApp provider. Do not assume the existing business number can be moved without disruption.

Klaviyo and Windsor.ai were discovered and suggested as available assistant connections. Neither is confirmed connected. Connecting an assistant plugin is separate from installing a Shopify app, configuring its events and authorizing its underlying business accounts.

## 3. Data design: collect information that changes decisions

### Event map

Standard Shopify customer events should come from supported integrations. The custom names below are proposed internal labels, not claims that Shopify already emits them.

| Customer or business action | Proposed measurement | Decision enabled |
| --- | --- | --- |
| Landing and product browsing | Page/product/collection views; campaign, landing page, device, product and variant IDs | Which creative attracts useful traffic? Which products hold interest? |
| Search and filtering | Search term after personal-data filtering, zero-result flag, category/size/occasion filters | Missing stock, terminology or merchandising |
| Choosing footwear | Custom size_guide_opened, size_selected, unavailable_size_requested | Size demand and points of uncertainty |
| Saving or asking | Custom wishlist_added, fit_help_requested, WhatsApp contact click | Purchase intent; a click is not proof a conversation happened |
| Permission and preference | Signup, consent category/source/time, voluntarily chosen size/style/occasion | Relevant lifecycle journeys with auditable permission |
| Cart and checkout | product_added_to_cart, checkout_started, checkout_completed and equivalent destination events | Where people stop; whether messages recover eligible orders |
| Real commercial progress | Order created, paid, fulfilled, delivered, COD remitted, cancelled, refunded and exchanged | Separate order intent, successful delivery and collected money |
| After delivery | Review, fit feedback, return reason, repeat order, support issue | Product quality, repeat purchasing and service improvements |

Shopify's [web-pixel model](https://shopify.dev/docs/apps/build/marketing/pixels) and [customer privacy signals](https://shopify.dev/docs/api/web-pixels-api/pixel-privacy) provide the foundation. Klaviyo's [Shopify tracking guide](https://help.klaviyo.com/hc/en-us/articles/4425956184731) distinguishes its app embed and behavioral-event settings; merely connecting the integration does not validate all events.

Maintain an event dictionary with owner, trigger, allowed properties, destination, consent purpose, version and verification evidence. Core properties: event ID, event time, source, campaign, consent state, pseudonymous session ID where permitted, product ID, variant/SKU, quantity, value and currency. Add customer and order identifiers only where needed and permitted.

Use a shared product-ID mapping across Shopify, GA4 and ad catalogs. Keep item revenue, shipping, discounts, taxes and refunds separately defined. Use PKT for business reporting and a consistent event timestamp standard. Exclude known internal/test activity from decision dashboards.

### Identity and permission

A measurable anonymous session is not a named person. Ad platforms may match an eligible visitor to an audience without revealing their identity to EDNA. Browser restrictions, consent choices and matching limits mean there is no honest promise to identify or retarget every visitor.

Link a profile through information the person supplies, such as a sign-up, account or order, under the relevant permissions. Do not merge people just because they share a device, household or IP address. Hashing contact information for an approved destination does not make it anonymous.

Offer a useful reason to share preferences: a fit guide, relevant style recommendations, a size-specific restock alert or early access. Ask progressively; do not make a long survey a condition of shopping.

Keep direct identifiers out of GA4 event parameters, URLs and replay tags. Mask personal content in recordings. Keep payment credentials outside the analytics system. Record purpose, access, retention and deletion handling; pass consent changes to every affected destination. Use short retention for raw replays and preserve appropriate aggregated business trends. [Clarity privacy guidance](https://learn.microsoft.com/en-us/clarity/faq/) describes masking and consent behavior.

## 4. Pakistan-first commercial operations

The critical order states are separate:

**Placed → confirmed where needed → paid or COD pending → dispatched → delivered → cash remitted → retained or returned.**

A COD checkout must not be counted as settled cash. Preserve platform purchase reporting, but add a reconciled business view of delivered/collected orders. Do not emit a second generic purchase event when cash arrives; use a distinct internal event and an explicitly designed ad conversion strategy if needed.

Capture courier, dispatch and delivery timestamps, failed-delivery reason, return-to-origin cost, exchange reason, payment fees and remittance date. Reconcile courier statements against Shopify order IDs. Handle missing scans, partial returns, split shipments and duplicate updates.

Decide with the actual fulfillment provider whether confirmation, address checks or optional prepaid incentives improve delivered contribution after fees. Test them; excessive verification can also lose good customers. Compare serviceability and delivery success by city/area without using demographic stereotypes.

Pakistani businesses are not currently listed as eligible for Shopify Payments, so verify the actual supported third-party gateway and any manual/COD method. PKR display alone does not establish payment acceptance. [Shopify Payments country list](https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries).

WhatsApp can support fit questions, opted-in recovery and order updates. Use an approved business account and respect message-category permission, opt-outs and applicable template/service-window requirements. Do not treat a checkout phone number as marketing permission. [WhatsApp business policy](https://business.whatsapp.com/policy).

## 5. Storefront and checkout improvements

Prioritize a fast mobile purchase path:

- Real, accurate product imagery and details: materials, heel height, dimensions, care and fit information only when verified.
- Prominent sizes and availability; a useful measurement guide; easy comparison of similar styles.
- Delivery charges and serviceability visible before payment; truthful estimated delivery and exchange terms.
- Persistent cart, reliable variant selection, appropriate guest checkout and supported local payments.
- Relevant recommendations, carefully priced bundles and a free-shipping threshold only when margin supports them.
- Accessible controls, readable contrast, visible validation errors and a recoverable failed-payment path.
- English, Urdu or Roman Urdu content where customer research supports it; test with actual shoppers.
- Measure loading and interaction performance after every app embed; protect mobile usability from overlapping popups.

Stay on native Shopify checkout for the initial system. Do not promise arbitrary scripts or full customization on a normal plan: UI apps on information, shipping and payment steps are Plus-restricted, while other extension surfaces have wider availability. [Checkout app availability](https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-apps).

### Genuine social proof

Use verified reviews with fit/size context, approved customer photos and accurate bestsellers when real data exists.

A viewer count needs a defined meaning, such as distinct eligible sessions active on that product within the last five minutes. Use a service with a documented counting method or build a consent-aware aggregate service; filter test/bot traffic as practicable, expire stale activity, avoid names and hide the component below a useful threshold or when unavailable. It is an approximate activity signal, not an exact person counter.

Recent-sale messages need actual qualifying orders, a truthful time window and cancellation handling. For COD, distinguish an order placed from a settled sale. Avoid customer names, full locations and interruptions that obscure buying.

Test these components against conversion, complaints and page performance. At the current traffic level, fit guidance and trustworthy product detail deserve priority. No fake counters, invented sales, recycled countdowns or manufactured reviews.

## 6. Customer journeys and acquisition

One primary system should coordinate channel permissions, contact frequency and suppression. Timings below are starting hypotheses to test, not platform defaults or promised performance.

| Journey | Trigger and useful message | Important exit or suppression |
| --- | --- | --- |
| Welcome | Opt-in; introduce relevant collection, fit help and approved value proposition | Unsubscribe, purchase, channel preference |
| Browse follow-up | Known, eligible profile viewed products but did not advance | Purchase, active cart journey, no consent, unavailable item |
| Cart/checkout recovery | Eligible incomplete checkout; answer fit/delivery objections before discounting | Purchase, cancellation, out-of-stock variant, frequency limit |
| COD confirmation | Pending eligible order; confirm details through the agreed service process | Already confirmed/paid/cancelled; route disputes to a person |
| Delivery support | Real shipment status; useful delivery update and problem resolution | Avoid sending a successful-delivery claim without evidence |
| Post-delivery | Care guidance, fit check, then an honest review request | Undelivered/returned order; coordinate with open support cases |
| Cross-sell | Delivered purchase and relevant complementary item | Recent exchange, unavailable size, contact limit |
| Win-back/VIP | Observed repeat-buying interval and contribution | Do not assume footwear replenishes like consumables |
| Back-in-stock | Explicit size/product alert request and actual available stock | Stop after fulfillment/withdrawal; recheck stock before sending |

Do not gate review requests to happy customers or incentivize only positive reviews. Coordinate service resolution without suppressing honest feedback.

For acquisition:

1. Build a clear offer and matched landing pages for occasion, style and fit needs. Validate real differentiators.
2. Create a repeatable creative pipeline: product demonstrations, styling, fit explanations and customer-approved content.
3. Start with a focused paid-channel test after tracking and checkout pass. Meta is the initial candidate; Google search/catalog activity depends on account and market eligibility.
4. Retarget eligible product viewers/cart abandoners with relevant in-stock items; exclude completed purchasers where appropriate. Consolidate small audiences and use frequency controls available in the chosen campaign type.
5. Tag creators and campaigns consistently, pair codes with links, and ask a short post-purchase discovery question. Codes alone are not complete attribution.
6. Develop searchable product/category content, useful fit/occasion guides and accurate product feeds. Add referral/loyalty mechanics after actual repeat behavior is visible.
7. Use a defined advertising test budget and loss limit, independent of software budget. Scale on delivered contribution and credible repeat value.

## 7. The management dashboard

| Question | Measure |
| --- | --- |
| Are we acquiring viable customers? | New-customer acquisition cost, including the defined advertising/creative scope; first delivered/collected customer cost |
| Where is the purchase path failing? | Product-view to cart, cart to checkout and checkout completion by source/device; counts beside rates |
| Is an order economically useful? | Net merchandise + shipping revenue retained, excluding tax, minus COGS, packaging, payment/COD fees, delivery, return/exchange and other defined variable costs |
| Is growth profitable? | Contribution before acquisition minus acquisition spending; keep overhead and tax separate |
| Are customers returning? | 30/60/90-day repeat rates and realized cohort contribution, with adequate observation windows |
| Which styles/sizes deserve stock? | Sell-through, unavailable-size demand, stock cover, cancellations and fit-related exchanges by SKU |
| Is fulfillment damaging the business? | Delivery success, return-to-origin, delivery time, COD remittance delay and unresolved discrepancies |
| Do messages add value? | Eligible recipients, deliveries, clicks, purchases, delivered contribution, unsubscribes and complaints |
| Can we trust the data? | Freshness, missing costs/statuses, duplicate events, catalog match coverage and unexplained reconciliation differences |

Definitions must be written once and reused. Separate placed-order, paid-order and settled-cash reports. Include the costs of failed deliveries in the relevant order cohort, not only successful orders.

Platform ROAS is attributed revenue divided by ad spend. It is neither profit nor proof that an ad caused the purchase. Meta, GA4, Shopify and Klaviyo can all claim credit for the same order; never add their attributed revenues together. Use independent Shopify order reconciliation, customer surveys and controlled holdouts where volume permits. Report observed results, attribution and causal evidence separately.

## 8. What AI should actually do

| Role | Initial useful work | Evidence or control |
| --- | --- | --- |
| Daily analyst | Explain funnel, stock and delivery changes; prioritize three actions | Link sources, date range, metric definition, sample size and freshness; label hypotheses |
| Merchandising assistant | Suggest collections, size replenishment and relevant cross-sells | Actual availability, approved costs and fit/return evidence |
| Creative assistant | Draft ad concepts, variants and product education | Real product claims and human review before publication |
| Retention assistant | Draft segment-specific journeys and identify gaps | Channel permission, suppression, margin and frequency rules |
| Support assistant | Answer approved fit/delivery/policy questions and retrieve verified order status | Authentication for private order data and reliable handoff |
| Operations assistant | Flag delayed deliveries, COD discrepancies, inventory gaps and unusual refunds | Human review for financial actions, cancellation and accusations |

Start with read-only analysis, draft content and reversible operational tagging. Explicit, bounded authority is needed before a running system sends campaigns, changes prices, issues refunds or adjusts ad budgets. Store owners retain their accounts, data and decision rights.

Scheduling is a separate implementation: configure a supported scheduler/automation service, account permissions, delivery destination, retry behavior, run logs and budget limits. The current conversation and a connected MCP do not by themselves create a continuously running agent. No daily report delivery is active.

Predictive models need real history. For example, Klaviyo documents minimum data requirements for its [CLV dashboard](https://help.klaviyo.com/hc/en-us/articles/17797912816795), including 500 purchasing customers and 180 days of order history, plus other conditions. Do not present EDNA's current small sample as a basis for reliable lifetime-value or churn predictions.

An AI finding should follow: **observation → evidence → plausible explanation → proposed test → success metric**. Example hypothesis, not an EDNA finding: frequent size-guide opens followed by exits could justify testing clearer measurements.

## 9. Software economics

Verified public entry references on 11 November 2026:

| Tool | Public reference | Qualification |
| --- | --- | --- |
| Klaviyo Email | US$20/month for 500 active profiles and 5,000 emails; free tier has 250 profiles/500 emails | Higher profile volume, messaging and additional products change the bill. Ignore temporary promotional pricing in planning. [Pricing](https://www.klaviyo.com/pricing) |
| Judge.me | Free tier or US$15/month paid tier | Pick only if its extra review capability is needed. [Listing](https://apps.shopify.com/judgeme) |
| Microsoft Clarity | Free | Setup, permission checks and performance validation still require work. [Listing](https://apps.shopify.com/microsoft-clarity) |
| Windsor.ai | Documentation lists US$23/month for three sources, or US$118/month for seven | Annual rates differ. Verify MCP entitlement, needed fields, account limits and billing-screen quote. [Pricing documentation](https://windsor.ai/documentation/pricing-information/) |
| Shopify Flow | Free app on Basic/Grow/Advanced/Plus | Certain actions are plan-limited. [Requirements](https://help.shopify.com/en/manual/shopify-flow) |

The three paid entry examples above total US$58/month (20 + 15 + 23). That is an illustrative subscription subtotal, not the price of the whole system. It excludes Shopify, ad spend, WhatsApp usage, tax, hosting, payment fees, courier fees and implementation work.

Proposed initial **US$350/month planning envelope**, not an approved bill:

- US$100 reserved for customer lifecycle/profile growth.
- US$75 reserved for WhatsApp/service usage, subject to a real quote.
- US$15 for reviews if needed.
- US$23 for a three-source connector if it fits.
- US$50 for operational integration/automation needs.
- US$87 uncommitted reserve.

If seven sources require the US$118 connector tier, rebalance the envelope before subscribing. Retain unused budget. Add tools when they resolve a demonstrated gap and have an owner, measurable outcome, trial criterion and cancellation rule.

Later candidates include a dedicated helpdesk, returns portal, richer personalization and an attribution product such as Triple Whale. Its current [plan guide](https://kb.triplewhale.com/en/articles/16046642-understanding-triple-whale-plans-foundation-automate-and-enterprise) describes measurement and AI capabilities. It is not a launch dependency. Neither an attribution subscription nor a warehouse removes the need for testing and financial reconciliation.

## 10. Implementation order and acceptance criteria

Phases describe dependency order, not promised delivery dates.

### Phase A: reconcile the store with the ready business

- Map real SKU/variant, price, stock, cost, imagery, fit information and product claims to Shopify.
- Bind native product, collection and cart pages; reconcile the concept theme and current remote theme roles.
- Set the public brand/domain and business contact details.
- Configure actual shipping, payment and exchange terms with the selected providers.

**Done when:** approved products can be purchased on mobile; each supported payment/COD route has a documented successful test; failure/cancellation/refund handling is verified; stock and order records agree. Do not publish concept items or fabricate inventory to pass.

### Phase B: establish trustworthy measurement

- Configure chosen accounts and consent settings; use supported app integrations.
- Verify GA4, Meta, Klaviyo and Clarity separately.
- Establish the event dictionary, naming, UTM rules, test exclusion and dashboard definitions.

**Done when:** a controlled product → cart → checkout → order journey produces the expected IDs/value/currency; browser and server representations do not double-count; consent refusal/withdrawal behaves correctly; a known eligible profile enters the correct audience and suppression; replay masks personal content; reporting reconciliation differences are explained. An app installed or a green connection badge is insufficient.

### Phase C: activate useful customer journeys

- Prepare welcome, checkout recovery, order support, post-delivery care/reviews and size-specific restock flows.
- Add fit guidance, trustworthy reviews and relevant discovery.
- Connect actual courier/COD states to business reporting.

**Done when:** test profiles receive the intended sequence, consent and suppression work, no duplicate sender fires, purchases terminate recovery, and delivery/cancellation/return events change the journey correctly. Customer sends remain inactive until the actual sender, content and sending rules are authorized.

### Phase D: acquire, learn and automate

- Launch the selected ad test within its separately approved budget.
- Maintain a weekly creative and storefront experiment backlog.
- Schedule evidence-linked reporting and operational alerts once accounts and automation are connected.

**Done when:** reporting reconciles orders/costs/ad spend, each experiment has an owner and decision rule, alerts lead to an action, and scheduling has a verified successful run. Require enough observations before statistical claims; use interviews and replay evidence while traffic is low.

### The next concrete implementation batch

1. Reconcile real products and stock against the 12 drafts.
2. Inventory the actual Meta, Google, Klaviyo, WhatsApp, payment and courier accounts and grant only needed access.
3. Select the paid Shopify plan, exact subscriptions and an advertising test limit.
4. Configure the measurement foundation and run one end-to-end acceptance journey.
5. Activate the first lifecycle flows and start the weekly review cadence.

The business owner supplies or confirms actual stock/costs, account ownership, service terms and spending choices. Implementation can then proceed against these finite gates without an endless redesign.

