---
sources:
  - modules/Gateways/
  - app/Http/Controllers/GatewayWebhookController.php
  - app/Http/Controllers/Admin/PaymentNotificationController.php
  - app/Support/AutoCharge.php
  - app/Services/AutoChargeService.php
  - app/Http/Controllers/Client/PaymentMethodController.php
  - app/Support/formatting.php
  - resources/views/admin/settings/general.blade.php
  - routes/web.php
---

# Payment Gateways

A **gateway** is how you get paid. At least one must be enabled before real
customers can order. Configure them under **Setup → Payment Gateways**: open a
gateway, fill in its keys, save and enable it.

!!! tip "Test before you take real money"
    Every card gateway below has a test or sandbox mode. Place a test order,
    pay it in test mode, and check that the invoice becomes *Paid* and, if you
    sell hosting, that the service is provisioned. Then switch to live keys.
    Checkout must run over HTTPS.

## What each gateway asks for

| Gateway | Fields | Webhook |
|---|---|---|
| **Stripe** | Publishable Key, Secret Key, Webhook Signing Secret | `/gateway/stripe/webhook` |
| **PayPal** | PayPal Email, Client ID, Client Secret, Sandbox Mode, Charge in the invoice's billing currency | `/gateway/paypal/webhook` |
| **Authorize.Net** | API Login ID, Transaction Key, Client Key (Accept.js), Test Mode | `/gateway/authorize/webhook` |
| **Mollie** | Mollie API Key, Test Mode, Charge in the invoice's billing currency | `/gateway/mollie/webhook` |
| **Razorpay** | Key ID, Key Secret, Webhook Secret, Test Mode | `/gateway/razorpay/webhook` |
| **Tpay** (Poland) | Open API Client ID, Open API Client Secret, Security Code, Sandbox Mode | `/gateway/tpay/webhook` |
| **iyzico** (Turkey) | API key, Secret key, Sandbox, Instalments offered, Payment group, Let the customer store their card | none: the result comes back with the customer from iyzico's page |
| **Bank Transfer** | Account holder, up to three banks (shown to customers or not, bank name, IBAN or account number, sort code / routing, SWIFT/BIC), an additional note | none: you confirm payments by hand |

A gateway is offered at checkout only once every required field has a value
and it is enabled.

## Webhooks

Card gateways confirm a payment by calling PNLCS back. In the provider's
dashboard, set the webhook address to your PNLCS address followed by the path
in the table, for example:

```
https://example.com/gateway/stripe/webhook
```

For **Stripe**, copy the signing secret the dashboard shows for that endpoint
into **Webhook Signing Secret**. Without it every incoming webhook is refused,
because an unsigned one could claim any invoice was paid. PayPal payments are
also re-checked with PayPal directly before an invoice is marked paid.

## Stripe

1. In the [Stripe dashboard](https://dashboard.stripe.com), copy the
   **Publishable key** and **Secret key** (test mode first).
2. Add a webhook endpoint `https://example.com/gateway/stripe/webhook`, and copy
   its signing secret.
3. Paste all three into **Setup → Payment Gateways → Stripe** and enable it.

Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

**Charge in the invoice's billing currency** (off by default). When customers
are billed in another currency (**Setup → Currencies**), Stripe can charge the
card in that currency, at the rate on the invoice, instead of in the shop
currency. The customer's statement then shows the amount on their invoice,
not one their bank converted. The payment is still recorded in the shop
currency, and a refund goes back in the currency the card was charged in.
Stripe must support the currency for your account, and it converts the payout
to your account's currency at its own rate. Renewals charged automatically
from a stored card follow the same setting.

## Mollie

1. In the [Mollie dashboard](https://my.mollie.com), copy an **API key** (test
   key first).
2. Paste it into **Setup → Payment Gateways → Mollie** and enable it. Mollie
   calls `https://example.com/gateway/mollie/webhook` by itself; there is
   nothing to register.

**Charge in the invoice's billing currency** works as it does for Stripe: an
invoice billed in another currency is charged in that currency at the rate on
the invoice, recorded in the shop currency, and refunded in the currency it was
paid in. Mollie must accept the currency (it takes PLN, GBP, CHF, USD and
others, not TRY).

## PayPal

1. Create an app on the [PayPal Developer](https://developer.paypal.com) portal
   and copy its **Client ID** and **Secret** (sandbox first).
2. Fill them in under **Setup → Payment Gateways → PayPal**, choose sandbox or
   live, and enable it.
3. Point a PayPal webhook at `https://example.com/gateway/paypal/webhook`.

**Charge in the invoice's billing currency** works as it does for Stripe: an
invoice billed in another currency is charged in that currency at the rate on
the invoice, by the PayPal buttons and by automatic renewals, recorded in the
shop currency, and refunded in the currency it was paid in. PayPal must take
the currency (it takes PLN, GBP, CHF, USD and others, not TRY), and your PayPal
account must accept payments in it under **Payment receiving preferences**;
otherwise they wait as pending, the customer is told the payment did not go
through, and once you accept one in PayPal you record it on the invoice
yourself. A payment in the shop currency is still taken at face value, and
anything paid above what the invoice owed is converted at today's rate, not
the invoice's.

## Bank Transfer

1. Enable **Bank Transfer** and enter the bank details customers see at
   checkout.
2. The customer is asked to write the invoice's **payment reference** on the
   transfer: a short code such as `INV34` (the prefix and the invoice's
   number). Change the prefix under **Setup → General Settings → Billing
   currency → Payment reference prefix** (default `INV`, up to 8 characters).
3. After paying, a customer can send a **payment notification** from the
   invoice, with a receipt if they like. The invoice shows **Payment Pending**
   until you decide.
4. You review it under **Billing → Payment Notifications**:
    - **Approve** records the payment: the invoice is marked paid and whatever
      waits on it (provisioning, for example) runs. When less arrived than the
      invoice owes, the rest stays open on the invoice.
    - **Reject** needs a reason. The invoice goes back to the status it had
      (unpaid or overdue), and the customer gets the reason in the **Payment
      Notification Rejected** email so they can pay again.

## Stored cards and automatic payment

Stripe, iyzico and PayPal can store a customer's card at the gateway and
charge it for renewals. Card numbers never pass through PNLCS: the customer
enters them on the gateway's own form.

Nothing is charged until you switch it on under **Setup → General Settings →
Automatic Payment**:

| Setting | Default |
|---|---|
| **Pay invoices with the card the customer has stored** | Off |
| **Charge this many days before the due date** | 3 |
| **Attempts per invoice** | 3 |
| **Days between attempts** | 3 (at least 1) |

The run starts every day at 06:45, before overdue services are suspended and
reminders go out. It collects every unpaid invoice that is due, not only
renewals, including anything already owed on the day you switch it on. Run
`php artisan pnlcs:auto-charge --dry-run` first to see what the first morning
would charge.

While it is on, customers can store a card and switch **Automatic payment**
on or off for their account under **Payment Methods** in the client area. It
is on for each account until they turn it off. When a charge fails, or the
bank asks the customer to confirm it, they are emailed (**Automatic Payment
Failed**, **Automatic Payment Authentication Required**).

## Gateway Logs

**Utilities → System Logs → Gateway Logs** lists what a gateway recorded,
filterable by gateway and date, kept for 90 days by default. In PNLCS 1.6.1
only **Tpay** (transactions, refunds, refused webhooks) and **iyzico** write
there; the other gateways write to the application log file instead.

## Refunds

A paid invoice can be refunded, fully or in part, from its page in the admin
area. Gateway payments go back through the gateway; bank transfers are
refunded outside PNLCS and recorded.
