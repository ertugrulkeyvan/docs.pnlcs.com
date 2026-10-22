---
sources:
  - app/Http/Controllers/Admin/ReportController.php
  - app/Services/ReportManager.php
  - app/Reports/AbstractReport.php
  - resources/views/admin/reports/index.blade.php
  - resources/views/admin/reports/show.blade.php
  - lang/en/reports.php
  - modules/Reports/
---

# Reports

PNLCS includes 27 reports on income, invoices, clients, services, domains,
SSL, support, affiliates and promotions. Each report is a table you can
filter by date where that applies, and export as CSV.

## Where they are

**Reports** in the top bar. Every report needs the **view reports**
permission (see [Staff & Roles](staff-and-roles.md)). The same permission
opens **Billing → Transactions**.

The Reports page groups the reports by category: Financial, Client,
Service, Domain, Support, Affiliate and Promotion. The buttons at the top
show one category, or **All**. Each card is tagged **Date filter** when the
report has one, and **CSV export**.

## Filters

Reports tagged **Date filter** have **From** and **To** fields and a
**Generate** button. They start on the current month: the 1st of the month
to today. Both days are included.

Two reports work on a year or month instead, and their page has no field
for it:

- **Annual Income Report** shows the current year. For another year, add
  `?year=2025` to the address.
- **Daily Performance** shows the current month. For another month, add
  `?year=2025&month=3`.

All other reports show what is in the database now.

## Export

**Export CSV** (top right, shown when the report has rows) downloads the
table with the same filters, as `<report>-<date>.csv`. The file has the
column names as its first row. The totals row is not included.

## The reports

| Report | Category | Filter | What it shows |
|---|---|---|---|
| **Active Services** | Service | — | Active services with client, product, domain, amount, cycle and next due date, soonest due first (up to 500). |
| **Affiliates Overview** | Affiliate | — | Each affiliate's visitors, balance, withdrawn and total earned, with totals. See [Affiliates](affiliates.md). |
| **Aging Invoices** | Financial | — | Unpaid and overdue invoices with days overdue, in brackets 0-30, 31-60, 61-90 and 90+ days. |
| **Annual Income Report** | Financial | Year | Income, fees, refunds and net per month of the year, with totals. |
| **Clients by Country** | Client | — | Number of clients and active clients per country. |
| **Client Sources** | Client | — | Clients grouped by the text of their notes field (filled by a WHMCS import). Clients without notes count as *Direct/Unknown*. Top 20. |
| **Customer Retention** | Client | — | Active and inactive/closed clients, retention rate, and the average age of active clients in days. |
| **Daily Performance** | Financial | Month | For each day of the month: active orders, new invoices, paid invoices and new tickets. |
| **Disk Usage Summary** | Service | — | Disk used, limit and usage % per active service from the last usage poll, fullest first (up to 100). |
| **Domain Renewal Reminders** | Domain | — | Active domains expiring in the next 90 days, with registrar, days left and renewal amount. |
| **Domains Overview** | Domain | — | Number of domains and recurring revenue per status and registrar. |
| **Income by Product** | Financial | Dates | Revenue and number of invoices per product, from invoices paid in the period. |
| **Income Forecast** | Financial | — | Renewals due and projected income per month for the next 12 months, from active services. |
| **Income Summary** | Financial | Dates | Income, fees and refunds per month from transactions in the period. |
| **New Customers** | Client | Dates | New client accounts per month. |
| **Product Suspensions** | Service | — | Suspended services with the suspension reason. |
| **Promotions Usage** | Promotion | — | Each promo code with type, value, uses, limit, status (*Active*, *Expired*, *Maxed*), whether it recurs, and its dates. See [Promotions](promotions-and-addons.md#promo-codes). |
| **Sales Tax Liability** | Financial | Dates | Subtotal, tax, second tax and total per month from invoices paid in the period. See [Tax Rules](tax-rules.md). |
| **Server Revenue Forecast** | Service | — | Active services and their monthly revenue per server (longer cycles divided into months). |
| **SSL Certificate Monitoring** | Domain | — | SSL certificate orders with status, expiry date and days left, soonest first. |
| **Support Ticket Replies** | Support | Dates | Number of ticket replies per staff member in the period (customer replies as *Client*). |
| **Support Ticket Volume** | Support | Dates | Tickets opened per month, with how many are open, answered and closed. |
| **Ticket Feedback Scores** | Support | — | Number of ratings and average rating per ticket department. |
| **Ticket Ratings by Staff** | Support | — | Number of ratings and average, lowest and highest rating per staff member who replied to the ticket. |
| **Ticket Tags** | Support | — | The 30 most used ticket tags. |
| **Top 10 Clients by Income** | Client | — | The ten clients who paid the most (payments less refunds), with email, company and number of invoices. |
| **Transactions List** | Financial | Dates | Payments in the period with client, gateway, transaction ID, amounts in and out, and fees (up to 500). |

Income figures come from recorded transactions. Affiliate commissions and
payouts are left out of the income reports, but **Transactions List** shows
them. Disk usage is updated by the scheduled usage poll (see
[Scheduled Commands](../reference/scheduled-commands.md)).

## Adding a report

Reports are modules: a new report class in the reports folder appears on
the Reports page on its own. See [Writing a module →
Reports](../developer/modules.md#reports).
