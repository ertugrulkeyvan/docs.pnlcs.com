---
sources:
  - routes/console.php
  - app/Services/InvoiceGenerationService.php
  - app/Console/Commands/PaymentReminderCommand.php
  - app/Console/Commands/SuspensionCommand.php
  - app/Console/Commands/TerminationCommand.php
  - app/Console/Commands/UnsuspendOnPaymentCommand.php
  - app/Console/Commands/LateFeeCommand.php
  - app/Console/Commands/ProcessCancellationsCommand.php
  - app/Services/AutoChargeService.php
  - app/Support/AutoCharge.php
  - app/Listeners/RenewOnPaymentListener.php
  - app/Services/PaymentService.php
  - resources/views/admin/settings/general.blade.php
---

# The Billing Lifecycle

This page explains what PNLCS does *on its own*, on a schedule, without you
lifting a finger — how a service goes from active to renewed, or from unpaid to
suspended to terminated.

!!! important "This all depends on the cron runner"
    Every automated step below is driven by the scheduled task runner. If cron
    isn't running, none of this happens. See
    [Scheduled Commands](../reference/scheduled-commands.md).

The settings named below are on **Setup → General Settings**: the Invoices,
Automatic Payment and Late Fees cards on the **Invoicing** tab, the Automation
card on the **Automation** tab.

## Recurring billing

Each active service has a **next due date**. **Raise renewal invoices (days
before due)** (Invoices card, default 14) before that date, PNLCS generates a
**renewal invoice** and emails it to the customer. One invoice per customer
collects everything of theirs that falls due in the same run: services, addons
and domains. Renewals on different dates are invoiced on their own days, so a
customer can get several small invoices. The invoice is due after **Default
payment due (days)** (default 14), so with the defaults it falls due on the
service's due date.

With **Invoice each renewal separately** ticked, each service (with its own
addons), each domain and each lone addon gets an invoice of its own, so a
customer can renew one and let another lapse.

### One invoice a month

Set **Consolidated billing day** to a day of the month (1–28) to bill each
customer once a month instead. On that day everything due before the same day
next month, plus the lead above, goes on one invoice per customer. With the
1st and 0 days, the invoice raised on 1 December covers everything renewing in
December; with the 1st and 31 days it covers January too, so customers pay a
month ahead. Between billing days PNLCS raises only what would otherwise be
invoiced late, such as a service ordered since the last billing day, at the
usual lead.

No renewal invoice is raised for a service whose customer turned auto-renew
off, or that has a cancellation request waiting. Paying the renewal invoice
moves the service's next due date on by one billing cycle.

Supported cycles: monthly, quarterly, semi-annually, annually, biennially,
triennially.

## Payment reminders

Unpaid invoices get **reminder emails** at fixed points: **7, 3 and 1 day**
before the due date, and **1, 3, 7 and 30 days** after it. There is no setting
for these. Each invoice remembers the last reminder it got, so a reminder is
never sent twice; if the scheduler missed a day, the next run sends the latest
reminder due.

## Overdue → Suspend → Terminate

If an invoice isn't paid:

1. **Overdue** — the day after its due date, an unpaid or partially paid
   invoice is marked overdue, and the reminders after the due date go out.
2. **Auto-suspend** — once the invoice has been overdue for more than
   **Suspend after (days overdue)** (Automation card, default 3), the
   customer's active services are **suspended** on the server (the site goes
   offline, the account still exists). By default this suspends every active
   service of that customer, not only the one on the invoice; tick **Suspend
   only the services on the overdue invoice** to suspend just those (the
   service, its overage and its addons). To hold one service back, set **Do
   not suspend until** on the service's page.
3. **Auto-terminate** — off by default. With **Automatically terminate
   services suspended for non-payment** ticked, a service that has been
   suspended for **Terminate after (days suspended)** (default 30) while the
   customer still has an overdue invoice is **terminated** (the account and
   its data are deleted). A service staff suspended by hand is left alone;
   only a suspension made by auto-suspend counts. `php artisan pnlcs:auto-terminate --dry-run` lists
   what it would terminate.

**A product can keep its own periods.** **Suspend after (days overdue)** and
**Terminate after (days suspended)** on the product's edit page (Product
details card) override the general settings for its services; left empty,
the Automation card applies. A product with its own *terminate after* is
terminated on that schedule even while automatic termination is off for the
rest.

Once the customer has paid, a service suspended for non-payment is
**automatically unsuspended** within 30 minutes, provided nothing on it is
still unpaid and the customer has no other invoice overdue past the
suspension grace period.
A bank-transfer notice that moves an invoice to *Payment Pending* is not a
payment: the service stays suspended until the money is in.

While a service is suspended the customer can still open it and download what
is theirs, but the panel login, the module buttons and the hosting tabs are
refused.

## Late fees

You can add a **late fee** to overdue invoices (Late Fees card). **Charge**:
*Do not charge late fees* (the default), *A fixed amount*, or *A percentage of
the invoice* (of what its lines add up to, after discounts and before any
credit), with the **Amount** and **Days overdue before
charging** (default 3). The fee is added once per invoice, as an untaxed line.

## Auto-renew and automatic payment

Services and domains **auto-renew** unless the customer turns it off: PNLCS
raises the renewal invoice, and the customer pays it.

PNLCS charges a stored card only when **Automatic Payment** is switched on
(Automatic Payment card; off by default). Then, every morning, each unpaid
invoice due within **Charge this many days before the due date** (default 3),
or already past due however old, is charged to the customer's stored card, at most **Attempts per invoice**
(default 3) times, **Days between attempts** (default 3) apart. It works with
cards stored through Stripe, iyzico or PayPal, and never for a customer who
turned **Automatic payment** off on their **Payment Methods** page. The invoice
of a new order (paid at checkout), Draft, *Payment Pending* and *Collections*
invoices are never charged.
`php artisan pnlcs:auto-charge --dry-run` shows what the next run would
charge.

## Cancellations

A customer can ask to cancel a service, **Immediate** or at the **End of
Billing Period**. The nightly run ends the service on the day the request asks
for (terminating the account on its server) and marks it **Cancelled**.

## Refunds

You can **refund** a paid invoice — fully or partially — through the original
gateway or offline for bank transfers. The invoice moves to *Refunded* (or back
to *Partially Paid*) and the money is returned via the gateway.

## What runs when

| Task | Schedule |
|------|----------|
| Process cancellations | Daily, 02:00 |
| Database backup | Daily, 04:30 |
| Currency rate update | Daily, 05:30 |
| Generate renewal invoices | Daily, 06:00 |
| Mark overdue invoices | Daily, 06:30 |
| Automatic payment (only when switched on) | Daily, 06:45 |
| Auto-suspend unpaid services | Daily, 07:00 |
| Apply late fees | Daily, 07:30 |
| Payment reminders | Daily, 08:00 |
| Auto-terminate (only when switched on) | Daily, 08:00 |
| Unsuspend on payment | Every 30 minutes |
| Retry failed provisioning | Every 5 minutes |
| Import support mailboxes | Every 5 minutes |

Full list and command names: [Scheduled Commands](../reference/scheduled-commands.md).

## You're always in control

Every automated action can also be done **manually** from the admin panel —
create an invoice, mark it paid, suspend a service, issue a refund, accept an
order. Automation just handles the routine so you don't have to.
