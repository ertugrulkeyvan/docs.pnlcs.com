---
sources:
  - app/Enums/
  - app/Models/Product.php
  - app/Services/OrderService.php
  - app/Services/PaymentService.php
  - app/Services/InvoiceService.php
  - app/Services/InvoiceGenerationService.php
  - app/Listeners/RenewOnPaymentListener.php
  - app/Services/DomainMove.php
  - resources/views/admin/products/create.blade.php
  - resources/views/admin/products/edit.blade.php
---

# Products, Services, Orders & Invoices

These four objects are the heart of PNLCS. Understanding how they relate is the
single most useful thing you can learn.

## Product — what you sell

A **product** is an entry on your price list. It defines:

- A **name**, **group** (category) and **product type** (Shared Hosting,
  Reseller Hosting, VPS/Dedicated, SSL Certificate, Other)
- Which **server module** it provisions with (or *None*, when nothing is
  created on a server), and optionally a **server group** to keep it to
  certain servers. A product picks a module, not a single server; see
  [Servers & Modules](servers-and-modules.md).
- **Auto Setup** — when the account is created: *As soon as the first payment
  is received*, *As soon as the order is placed*, or *Only when an admin
  accepts the order*
- A **payment type** (*Recurring*, *One Time* or *Free*) and **pricing** per
  currency and billing cycle (monthly, quarterly, semi-annually, annually,
  biennially, triennially; `-1` turns a cycle off)
- Optional **configurable options**, **add-ons**, a **free domain** (the first
  year of a domain registered or transferred with it, for the extensions and
  cycles you choose), welcome email, and stock limits

A product is a *template*. Nothing is billed or provisioned until a customer
actually orders it.

## Order — the act of buying

When a customer checks out, PNLCS creates an **order**. The order:

- Records who bought, what, and at what price
- Generates an **invoice** for the total (an order that totals zero, such as
  a free product, is marked paid at once)
- Creates a **pending service** for each product and a **pending domain** for
  each domain registration or transfer (a domain ordered with hosting is its
  own line in the cart)

Order statuses:

| Status | Meaning |
|--------|---------|
| **Pending** | Placed, waiting to be accepted: usually waiting for payment, or paid and waiting for you because a product is set to *Only when an admin accepts the order* |
| **Active** | Accepted — services have been activated/provisioned |
| **Cancelled** | Called off; its services are cancelled (accounts on a server are terminated) and an unpaid invoice is cancelled |
| **Fraud** | Flagged as fraudulent, by you or by fraud screening; its active services are suspended and an unpaid invoice is cancelled |

## Invoice — the bill

An **invoice** is generated for the order and later for each renewal. It carries
line items, tax, credit applied and a status:

| Status | Meaning |
|--------|---------|
| **Draft** | Not issued yet. Only the API creates drafts ([createinvoice](../api/invoices.md#createinvoice) with `status=draft`); reminders and automatic payment skip them |
| **Unpaid** | Awaiting payment |
| **Partially Paid** | Some money received, a balance remains |
| **Payment Pending** | A customer reported an offline (bank transfer) payment, awaiting your approval (the **Awaiting approval** tab on the invoice list) |
| **Paid** | Settled in full |
| **Overdue** | Past its due date and not fully paid; the daily run marks unpaid and partially paid invoices overdue the day after their due date |
| **Collections** | Set only by hand (through the API); PNLCS never sets it. Still counts as owed, but gets no reminders and is never charged automatically |
| **Cancelled** | Voided; anything already paid on it goes back to the client's credit |
| **Refunded** | Everything paid on it was returned (a partial refund puts it back to *Partially Paid*) |

**Paying an invoice is the trigger** for almost everything: it accepts the
order, activates and provisions the service (unless its product waits for an
admin), credits affiliates, and sends the welcome email. Paying a renewal
invoice moves the service's next due date on by one billing cycle.

## Service — what the customer owns

Once an order is accepted, each hosting item becomes an **active service** — the
live account. A service has:

- Its own **status**: *Pending*, *Active*, *Suspended*, *Terminated*,
  *Cancelled* (ended at the customer's request), *Fraud* or *Completed*
  (the last two are only set by you)
- Its own **billing cycle** and **next due date**
- A link to the **server** it lives on and the **username** on that server

Customers who own an active service of a product also get that product's
**downloads**, if you have kept a download to owners of certain products
(**Only for owners of** on the download).

The service is what **renews**. As the next due date approaches, PNLCS
generates a renewal invoice; if it goes unpaid past your grace period, the
service is **suspended**, and, if you have turned automatic termination on,
eventually **terminated**.

## How they flow together

```
Product (your price list)
   │  customer orders
   ▼
Order (Pending) ──creates──▶ Invoice (Unpaid)
                                  │  customer pays
                                  ▼
Order (Active) ──activates──▶ Service (Active) ──provisioned on──▶ Server
                                  │
                                  │  each billing cycle
                                  ▼
                             Renewal Invoice ──unpaid too long──▶ Suspend ──▶ Terminate (if turned on)
```

## Domains

A **domain** is billed and renewed like a service, but it has its own
statuses. The nightly domain sync moves a domain past its expiry date through
the grace and redemption periods set for its extension:

| Status | Meaning |
|--------|---------|
| **Pending** | Ordered, not registered or transferred yet |
| **Active** | Registered and current |
| **Grace Period** | Past expiry, within the extension's grace period; it still renews at the normal price |
| **Redemption** | Past the grace period, within the redemption period; it can be restored for the extension's restore price |
| **Expired** | Past both periods |
| **Cancelled** | Called off, for example with its order |
| **Fraud** | Set only by you |
| **Transferred Away** | Moved to another registrar |

A customer can give a domain to another customer account: **Give to another
account** on the domain's page, with that account's email address. The other
account has 7 days to accept or decline, and nothing moves until it accepts.
A domain with an unpaid invoice cannot be offered. Nothing changes at the
registry; the new owner updates the WHOIS contact if needed.

## Common questions

**Why do I have both an "order" and a "service"?**
The order is the one-time purchase event. The service is the ongoing product
the customer owns, which keeps billing long after the order is history.

**Why is my service "Pending" and not "Active"?**
The order hasn't been accepted yet — usually because the invoice is still
unpaid, or the product's **Auto Setup** is *Only when an admin accepts the
order* — or the server refused to create the account and the attempt is
waiting to be retried. See [The Billing Lifecycle](billing-lifecycle.md).

**A customer paid but nothing was provisioned.**
Check the product has a **Server Module** assigned, that a server of that
type exists (in its server group, if it has one), and that **Auto Setup** is
*As soon as the first payment is received*. See [Provisioning failed](../troubleshooting/common-issues.md#provisioning-did-not-happen).
