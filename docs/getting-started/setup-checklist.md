# Setup Checklist

Work through these in order. Each takes a few minutes, and together they turn
a fresh install into one that can take orders and provision hosting.

The admin dashboard shows a shorter version until it is complete: **Upload
your logo**, **Configure email delivery**, **Add a payment gateway**,
**Connect a server** and **Create your first product**. Each one ticks itself
off when PNLCS sees it done. This page covers those five and the settings
around them.

!!! note
    You do not need every item to start, but **email** and at least **one
    payment gateway** are required before real customers can order.

## 1. Company details and logo

**Setup → General Settings**

- **Company Information**: company name, address and **Company Email**.
- **Localization**: default language, default country, date format and
  timezone.
- **Invoices**: the numbering scheme and the default payment due (days).
- **Terms and Privacy**: the addresses of your Terms of Service and Privacy
  Policy. The registration form links to them; left empty, it names them
  without a link.
- **Legal identity**: the registered company name, when it differs from the
  brand, plus tax office and registry numbers. Printed on invoices and legal
  documents.

**Setup → Currencies** holds the currencies you bill in; four (USD, EUR, GBP,
TRY) are there from the start, USD as the default.

**Setup → Appearance**: upload your logo. This is the dashboard's first step.

This is your business identity: it appears on invoices, emails and the client
area.

## 2. Email delivery *(required)*

**Setup → General Settings → Mail Configuration**

Choose **SMTP**, fill in your mail server, save, and press **Send Test Email**.
Until mail is configured nothing reaches your customers: no invoices, no order
confirmations, no ticket replies.

➡️ [Configure Email](../guides/configure-email.md)

## 3. Payment gateways *(required)*

**Setup → Payment Gateways**

Enable at least one: Stripe, PayPal, Mollie, Razorpay, Authorize.Net, iyzico,
Tpay, or **Bank Transfer** for payments you confirm by hand.

➡️ [Payment Gateways](../guides/payment-gateways.md)

## 4. Servers *(if you sell hosting or VPS)*

**Setup → Servers**

Add the server accounts are created on (Panelica, cPanel, Plesk, DirectAdmin,
HestiaCP, aaPanel, Proxmox or Vultr) and test the connection.

➡️ [Connect a Server](../guides/connect-a-server.md)

## 5. Your first product

**Setup → Products/Services**

Create a product group (for example "Shared Hosting"), then a product that uses
your server's module, with a billing cycle and a price.

➡️ [Your First Sale](your-first-sale.md)

## 6. Domain pricing *(if you sell domains)*

**Setup → Domain Pricing** for the extensions and their prices, and
**Setup → Domain Registrars** for the registrar that registers them.

➡️ [Sell Domains](../guides/sell-domains.md)

## 7. Tax *(if you charge tax or VAT)*

**Setup → Tax Rules**

➡️ [Tax Rules](../guides/tax-rules.md)

## 8. Staff *(optional)*

**Setup → Admin Roles** and **Setup → Admin Accounts**: roles with the
permissions each job needs, then the people.

➡️ [Staff & Roles](../guides/staff-and-roles.md)

## 9. Sign-up checks *(recommended)*

- **Setup → General Settings → Email Verification**: new customers confirm
  their address before they can order. On by default.
- **Setup → General Settings → Fraud Screening**: MaxMind or FraudLabs Pro
  scores each order; a risky one is held under **Orders → Fraud**.

## 10. The cron runner *(required for automation)*

Invoices, reminders, suspensions and provisioning retries run on a schedule.
On your own server, add the cron line from the installation guide:

```
* * * * * cd /var/www/pnlcs && php artisan schedule:run >> /dev/null 2>&1
```

The Docker image runs the scheduler by itself.

➡️ What runs and when: [Scheduled Commands](../reference/scheduled-commands.md)

## Ready?

➡️ [Your First Sale](your-first-sale.md): one full order, from shop to a
running hosting account.
