---
sources:
  - app/Http/Middleware/AffiliateTracking.php
  - app/Services/AffiliateService.php
  - app/Services/ClientRegistrationService.php
  - app/Services/PaymentService.php
  - app/Models/Affiliate.php
  - app/Http/Controllers/Admin/AffiliateController.php
  - app/Http/Controllers/Client/AffiliateController.php
  - resources/views/admin/affiliates/index.blade.php
  - resources/views/admin/affiliates/show.blade.php
  - resources/views/client/affiliate/index.blade.php
  - modules/Reports/AffiliatesOverviewReport.php
---

# Affiliates

With the affiliate programme, your customers earn a commission on what the
customers they send you spend. An affiliate shares a link. Anyone who opens
the link and then signs up becomes that affiliate's referral, and each paid
invoice of a referral adds a commission to the affiliate's balance.

## Turning it on

There is no on/off switch: the programme is always available. A customer
joins it in two ways:

- **Themselves.** In the client area, **Account → Affiliates** shows
  *Join the affiliate programme*. **Join the programme** makes them an
  affiliate straight away.
- **By you.** **Billing → Affiliates → Add Affiliate**, choose the client.
  PNLCS also sends them the *Affiliate Welcome Email* (an email template
  under **Setup → Email Templates**).

Every new affiliate starts at **10 %** commission on every paid invoice.
Change it per affiliate (see [Commission settings](#commission-settings)).

On a client account with extra users, a user sees the affiliate page only
with the **affiliates** permission (see
[Client Logins & Permissions](client-logins-and-permissions.md)).

## How referrals are tracked

1. **The link.** The affiliate's link is your site address with `?ref=`
   and their affiliate number, for example `https://example.com/?ref=12`.
   An affiliate can also choose a **Personal code** (3 to 32 lower-case
   letters, digits and dashes, not only digits), so the link becomes
   `https://example.com/?ref=ayse`. The numbered link keeps working.
   `?aff=` works in place of `?ref=`, and the link can point to any page of
   your site.
2. **The cookie.** Opening the link stores a cookie in the visitor's
   browser for **90 days**. Each new cookie counts as one *visitor* for the
   affiliate. A visitor who opens the link again is not counted again.
3. **The sign-up.** When that visitor opens an account (at checkout or on
   the registration page) within the 90 days, the new client is linked to
   the affiliate for good.

Rules:

- Only **new accounts** are linked. An existing customer who clicks a link
  is not.
- **The first referral wins.** A later link from another affiliate doesn't
  take the customer over.
- **No self-referral.** An affiliate can't be their own referral.
- A link can't be added to a client by hand afterwards.

## Commission

Commission is added when an invoice of a referred customer is **paid**.

- **What counts:** the invoice's lines after discounts. **Tax is not
  included**, and neither are *Add Funds* lines or payments that settle
  several invoices at once (each of those invoices earns its own commission
  when it is settled).
- **New sale or renewal:** the invoice of an order earns the affiliate's
  **Commission Amount**. Any other invoice (renewals and invoices you raise
  by hand) earns the **Renewal commission** when one is set.
- **Refunds:** refunding a paid invoice takes back the same share of its
  commission. If the affiliate has already withdrawn the money, the balance
  only drops to zero, never below.

Commissions appear in the affiliate's **Commission History** and in the
**Referral History** on their admin page.

## Commission settings

**Billing → Affiliates**, then the affiliate's row (needs the **manage
affiliates** permission).

The *Settings* card on the affiliate's page:

| Field | What it does |
|---|---|
| **Commission Type** | **Percentage** of the invoice, or **Flat Amount** per paid invoice. |
| **Commission Amount** | The percentage or amount for new sales. Default 10 (%). |
| **Renewal commission** | Paid on renewals and other invoices that did not come from an order. Leave empty to pay the same as on new sales. `0` pays nothing on renewals. |
| **One-time commission only** | Pay only on the first paid invoice of each referred customer. |
| **Personal link code** | The same personal code the affiliate can set themselves. |

Press **Save Settings**.

## Payouts

An affiliate's **balance** is what they have earned and not yet taken out.
There are two ways to take it out:

| Way | Who | What happens |
|---|---|---|
| **Add to Balance** | Affiliate (client area) or staff (affiliate page, **Amount to Add**) | The amount moves from the affiliate balance to the client's account credit, which pays their own invoices. Any amount. |
| **Withdrawal** | Affiliate: **Request Withdrawal** in the client area | Asks you for a cash payout. At least **25** (in your default currency); there is no screen to change the minimum. |
| **Pay** | Staff: **Payout Amount** and **Pay** on the affiliate page | Records a payout you made, for example by bank transfer. |

!!! important "PNLCS records payouts, it doesn't send money"
    A **Request Withdrawal** takes the amount off the affiliate's balance
    straight away and records it as a withdrawal, but PNLCS doesn't send
    the money or notify staff. Look for *Affiliate withdrawal* entries in
    the affiliate's **Referral History** or under **Billing → Transactions**,
    then pay the affiliate yourself.

    Don't press **Pay** for a withdrawal the affiliate requested: the amount
    has already left the balance, and **Pay** would take it off a second
    time. Use **Pay** only for payouts the affiliate did not request.

## The affiliate's page

Client area, **Account → Affiliates**:

- **Total Referrals** (visitors), **Signups** (accounts linked to them),
  **Total Earnings** (earned in total) and **Pending** (current balance)
- **Your Referral Link** with a copy button, and the **Personal code** field
- **Request Withdrawal** and **Add to Balance**
- **Commission History**: the last 50 commissions, with the invoice and the
  referred client

## Admin screens

- **Billing → Affiliates**: totals (affiliates, earnings, withdrawn,
  visitors) and the list of affiliates with their visitors, commission type,
  rate, balance and withdrawn amount. Search by name or email. **Add
  Affiliate** turns a client into an affiliate.
- **The affiliate's page**: details, referral link, settings, payout and
  credit forms, and the **Referral History**: commissions, reversals,
  withdrawals and payouts.
- **Reports → Affiliates Overview**: every affiliate with visitors,
  balance, withdrawn and total earned (see [Reports](reports.md)).

Affiliates can also be listed and created through the API
([Affiliates](../api/affiliates.md)).
