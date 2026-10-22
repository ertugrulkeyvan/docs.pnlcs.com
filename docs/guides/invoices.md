---
sources:
  - app/Http/Controllers/Admin/InvoiceController.php
  - app/Services/InvoiceService.php
  - app/Services/PaymentService.php
  - app/Services/ProformaService.php
  - app/Hooks/proforma.php
  - app/Http/Controllers/Admin/ClientCreditController.php
  - app/Http/Controllers/Client/InvoiceController.php
  - app/Http/Controllers/Client/FundsController.php
  - app/Http/Controllers/Admin/ProductController.php
  - app/Services/InvoicePdfService.php
  - app/Listeners/SendNotificationListener.php
  - app/Support/formatting.php
  - resources/views/admin/invoices/create.blade.php
  - resources/views/admin/invoices/show.blade.php
  - resources/views/admin/clients/credit.blade.php
  - resources/views/admin/settings/general.blade.php
  - resources/views/pdf/invoice.blade.php
---

# Invoices, Credit and Refunds

Most invoices raise themselves: one when a customer orders, then one for each
renewal ([The Billing Lifecycle](../concepts/billing-lifecycle.md)). This page
covers what staff do by hand: writing an invoice, recording a payment,
cancelling, refunding and managing a customer's credit balance. What each
status means is on
[Products, Services, Orders & Invoices](../concepts/products-services-orders-invoices.md#invoice-the-bill).

**Billing → Invoices** opens on the **Unpaid** tab, overdue invoices included.
The other tabs are **All**, **Awaiting approval** (bank transfers a customer
reported), **Paid**, **Overdue**, **Cancelled** and **Drafts**, plus **Needs
checking** when automatic payment is on. Tick invoices to mark them paid,
cancel, send or remind them in one go.

## Create an invoice by hand

**Add New → New Invoice**:

1. **Select Client**.
2. Add the **Line Items**. Typing a **Description** suggests your active
   products (at their cheapest billing cycle) and your catalogue items; picking
   one fills in the price, unit and tax. Each line has a **Qty**, a **Unit**,
   a **Tax** rate and a **Price** before tax. **+ Add Item** adds a line.
3. **Notes** are printed on the invoice.
4. **Dates**: the **Invoice Date** is today and the **Due Date** is today plus
   **Default payment due (days)**; change either.
5. **Payment Method**: your enabled gateways, **Bank Transfer** and
   **Manual**. The customer's default is preselected.
6. Check the **Summary** (net, tax per rate, gross) and press **Create
   Invoice**.

The **Tax** list offers the rates that apply to the customer's country, and
0%. Tax is worked out line by line, and the rate you pick applies even to a
customer marked tax exempt ([Tax Rules](tax-rules.md#invoices-you-build-by-hand)).

Once saved, the invoice gets the next number, any credit balance the customer
has is taken off it, and it is emailed to them (**Invoice Created**). A
customer with a group discount gets the discount as a line of its own.

### The catalogue

Goods and services you bill often, but do not sell in the shop, go in the
catalogue: **Setup → Products/Services → + Add product/service**, with a
**Product Name**, **Price**, **Unit** and one of your tax rates. They are
listed in the page's **Products/Services** card and offered in the
description box of a new invoice.

## Change an invoice

On the invoice's page, each line's description, quantity, price and tax rate
can be edited in place (press Enter to save), **+ Add Item** adds a blank line
and **×** deletes one. Totals are recalculated each time.

!!! warning "Only change invoices nobody has paid"
    PNLCS 1.6.1 lets you edit the lines of any invoice, including paid and
    cancelled ones, and the customer may already have its PDF. Correct a paid
    invoice with a refund or a new invoice instead.

The buttons at the top depend on the status:

| Button | Shown for | What it does |
|---|---|---|
| **Paid** | Unpaid, Overdue, Partially Paid, Payment Pending | Records a payment (below) |
| **Refund** | Paid, Partially Paid | Opens the refund form ([Refunds](#refunds)) |
| **Cancel** | anything not Paid, Cancelled or Refunded | Voids the invoice |
| **Send** | always | Emails the invoice again |
| **Remind** | Unpaid, Overdue, Partially Paid, Payment Pending | Sends a payment reminder now |
| **Charge card now** | open invoices, with automatic payment on and a stored card | [Stored cards and automatic payment](payment-gateways.md#stored-cards-and-automatic-payment) |
| **Download PDF** | always | The PDF the customer gets |

### Record a payment

**Paid** opens **Mark Invoice as Paid**: the **Gateway** it came through, a
**Transaction ID (optional)** and the **Amount**.

- Less than is owed: the invoice becomes **Partially Paid**.
- More than is owed: the invoice is paid and the rest goes to the customer's
  credit balance.
- A transaction ID already recorded for the same gateway is never counted
  twice.

The amount is pre-filled with the invoice total, not with what is still owed:
on a part-paid invoice, enter what you actually received. Choosing **Credit**
as the gateway only labels the payment; it does not take anything from the
customer's balance (see [Use credit](#use-credit)).

Paying an invoice in full sets off everything that follows a payment: the
order is accepted, services are set up or renewed.

### Cancel

**Cancel** voids an unpaid invoice. Anything paid on it, and any credit
balance that was applied to it, goes back to the customer's credit balance. A
paid invoice cannot be cancelled; refund it.

## Refunds

**Refund** on a paid or part-paid invoice opens **Refund Invoice**:

- **Refund Amount**: empty for everything paid; less for a partial refund.
- **Reason (optional)**: kept on the refund record.
- **Refund via gateway** (ticked): sends the money back through the gateway
  that took the payment. Untick it to record a refund you made yourself.

Payments by **Bank Transfer**, **Manual** or **Credit** are always recorded
as offline refunds: you return the money outside PNLCS. If the gateway refuses
the refund, nothing is recorded and the error is shown.

The part of the invoice that was paid from the customer's credit balance goes
back to the balance first; only the rest goes back as money. Refunding an
**Add Funds** invoice takes the added credit off the balance again (as much
of it as is left), and affiliate commission on the refunded amount is taken
back. The invoice becomes **Refunded**, or **Partially Paid** if part of the
payment stays.

A refund does not touch the services the invoice paid for: cancel them
yourself if they should end.

## Credit balance

Each customer has a **credit balance**, in your default currency, shown on
the client's page as **Credit Balance**. It grows from:

- the customer topping up on **Add Funds**;
- overpayments, and money arriving on an invoice that is already paid,
  cancelled or refunded;
- payments and applied credit handed back when an invoice is cancelled;
- credit you add.

### Add or remove credit

**Manage** next to the balance on the client's page (staff need the
permission to manage invoices) opens **Credit**: choose **Add credit** or
**Remove credit**, an **Amount** and a **Description**, then **Save**. You
cannot remove more than the balance. **History** lists every change with its
description.

### Use credit

- **New invoices** take the balance automatically, up to their total; an
  invoice the balance covers in full is marked paid at once.
- For an **invoice that already exists**, the customer presses **Use my
  account credit** on the invoice in the client area. The admin area has no
  button for this; integrations use the API's
  [`applycredit`](../api/clients.md#applycredit).

Add Funds invoices never take credit, which would move it in a circle.

### Add Funds

Customers top up under **Billing → Add Funds** in the client area: a quick
amount (10, 25, 50, 100, 250 or 500) or their own, between 5 and 10,000, and a
payment method. PNLCS raises an untaxed invoice for it, due the same day, with
no group discount. When it is paid, the amount is added to the balance. When
customers are billed in another currency, they enter the amount in that
currency ([Currencies](currencies.md#rounding)).

## Proformas and VAT invoices

Some countries want a payment request first and the tax invoice only once the
money arrives. Tick **Enable Proforma scheme** under **Setup → General
Settings → Invoices**:

- New invoices are **proformas**, numbered with the **Proforma numbering
  scheme** (default `PRO-{year}/{month}-{num}`).
- When a proforma is paid, PNLCS issues the **VAT invoice**: the same lines and
  totals, the next number of the invoice series, dated and paid that day, and
  linked to the proforma (**Refers to proforma**). It is emailed to the
  customer.
- **Hide paid proformas** (on by default) leaves paid proformas out of the
  invoice lists, for you and for the customer, so each sale shows once.

## Numbering

**Setup → General Settings → Invoices**:

| Setting | Default |
|---|---|
| **Invoice numbering scheme** | `INV-{year}{month}-{num}` |
| **Reset numbering each year** | Off |
| **Default payment due (days)** | 14 |
| **Default Payment Method for New Clients** | |

The scheme takes `{year}`, `{yy}`, `{month}`, `{day}` and `{num}`; `{num}` is
six digits with leading zeros. The number continues from the highest one
already issued, so changing the scheme does not restart the count. With
**Reset numbering each year**, only this year's invoices count, so each
January starts again at 1. The card shows the **Last invoice** and a
**Preview** of the next.

For bank transfers, customers quote a short reference instead of the invoice
number: **Payment reference prefix** (**Setup → General Settings → Billing
currency**, default `INV`) followed by the invoice's internal ID, for example
`INV34`.

## The PDF

Staff download it with **Download PDF**; customers from the invoice in the
client area, and it comes with the invoice email. It shows:

- your logo (**Setup → Appearance**) and company details, with the registered
  company name from **Legal identity** when it differs from the brand
  ([Legal Pages and Consent](legal-pages.md#what-the-documents-fill-in-from-your-settings));
- the customer's details as they were when the invoice was issued: changing
  the customer's address later does not change old invoices;
- each line with its tax rate, the tax per rate, any credit applied and the
  total;
- the amount in the billing currency and the rate, when there is one
  ([Currencies](currencies.md#on-the-invoice-pdf));
- the invoice's notes.

## Late fees

A fee for overdue invoices is set under **Setup → General Settings → Late
Fees**; see [The Billing Lifecycle](../concepts/billing-lifecycle.md#late-fees).
