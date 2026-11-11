# Owned customer and marketing reporting

The Customers and Marketing pages run on our code and database. They require no paid CRM or reporting connector. They currently use imported records; advertising APIs and customer synchronization have not been activated.

## Imports

The import center accepts JSON arrays and CSV files using downloadable templates. Pick the type before uploading. Preview reports new versus replacement rows; saving replaces records with matching IDs. Re-import a complete record, including optional customer/campaign links, because replacement is not a partial update. Retain backups before corrections.

- Orders: optional `customerId`, `campaignId`, `platform` connect business records. Use consistent opaque customer IDs, such as Shopify customer GIDs. Campaign links require platform `meta`, `google`, `tiktok` or `other` and supporting source evidence. No automatic attribution inference occurs.
- Customers: `id`, `emailConsent` (`unknown`, `subscribed`, `unsubscribed`), `consentUpdatedAt` (YYYY-MM-DD), `source`. This stores consent evidence and identity references, not email addresses. Older-date consent cannot replace a newer-date record; within-day changes need careful source ordering until precise timestamps are added. No messaging or audience upload is enabled.
- Advertising costs: one daily campaign aggregate with `id = date:platform:campaignId`, `date`, `platform`, `campaignId`, `campaignName`, `currency=PKR`, `spend`, `impressions`, `clicks`, `source`. Aggregate accounts to unique campaign identifiers before import. Use the same identifiers in order links. Date and currency conversion must be reconciled before import; record source/exchange evidence. Missing dates are unknown, not zero. Templates contain placeholders, not real campaign or financial data.

CSV uses commas, header names from the template, quoted fields and doubled quotes. Blank optional order identifiers and courier fees become null. Other required fields remain required. Raw imported fields are validated server-side and discarded unless allowed. Neither uploads nor templates send information to marketing platforms.

## Definitions and limits

Customer segments use the entire imported order history. A completed purchase is a delivered order with positive collected cash after refunds. First purchase = one such order; Repeat = at least two; Lapsed = latest such order at least 90 calendar days ago; No completed purchase = none. Lapsed takes precedence over Repeat in the segment table, while the repeat-buyer count still counts all repeat buyers. Recency uses order date because delivered timestamps are not yet recorded. Pakistan calendar date determines the as-of date. Future-dated orders are excluded. Anonymous orders cannot be grouped into people; their count remains visible.

Marketing date filters select spend by spend date and orders by placement date. Cumulative order cash receipts can occur later. Collected/spend is a comparison for those order cohorts, not a cash-flow period metric, CAC, profit or independently verified ROAS. Refunds reduce net collected. Campaign and consent records come from user-supplied sources; the UI does not assert verification beyond format validation.

No cost coverage, lifetime value prediction, identity stitching or advertising-account coverage is inferred from missing records. Platform adapters, normalized customer/campaign tables and complete historical order identity remain subsequent development work.

Test fixtures live only under `test/`; no synthetic customers, campaigns or orders were inserted into EDNA's working database.
