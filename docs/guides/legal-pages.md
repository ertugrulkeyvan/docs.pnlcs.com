---
sources:
  - app/Http/Controllers/LegalController.php
  - resources/views/legal/
  - resources/views/admin/settings/general.blade.php
  - resources/views/client/auth/register.blade.php
  - resources/views/client/cart/checkout.blade.php
  - app/Http/Controllers/Client/CartController.php
  - app/Services/OrderService.php
  - app/Models/MarketingConsent.php
  - app/Services/ClientRegistrationService.php
  - app/Http/Controllers/Admin/BulkActionController.php
  - app/Services/PersonalDataExport.php
  - app/Support/Tracking.php
---

# Legal Pages and Consent

PNLCS ships a set of legal documents for a hosting company, published at
`/legal`, and records what customers agree to. Payment providers such as
Stripe and iyzico check that terms, privacy and refund pages can be reached
before they approve a shop.

!!! warning "Templates, not legal advice"
    The documents are a starting point written for a hosting business. Have
    them reviewed for your company and the countries you sell to.

## The documents

`/legal` lists them; each one is at `/legal/<name>`:

| Address | Document |
|---|---|
| `/legal/terms` | Terms of Service |
| `/legal/aup` | Acceptable Use Policy |
| `/legal/privacy` | Privacy Policy |
| `/legal/cookies` | Cookie Policy |
| `/legal/refund` | Cancellation and Refund Policy |
| `/legal/sla` | Service Level Agreement |
| `/legal/dpa` | Data Processing Addendum |
| `/legal/abuse` | Abuse and Copyright (DMCA) Policy |
| `/legal/domain` | Domain Registration Agreement |

Four Turkish statutory forms are added when **Setup → General Settings →
Localization → Country** is Turkey, or when **Publish the Turkish statutory
forms** is ticked there (for a seller elsewhere who sells to consumers in
Turkey): the KVKK notice (`kvkk`), the Distance Sales Agreement
(`distance-sales`), the Pre-Contractual Information Form (`pre-information`)
and the hosting provider registration (`yer-saglayici`). Their text is
Turkish only; English readers of the first three get a short English note
above it pointing to the matching English document.

The other documents exist in English and Turkish. A visitor using Turkish
reads the Turkish text; every other language gets English. Each document ends
with its **effective date**, your company name and email address.

The public **Contact** page links to `/legal`, and the cookie banner, when
shown, links to the Privacy Policy unless you give it another address
([below](#cookie-consent)). The site
footer does not link to the documents; add the links you want through your
theme or homepage content.

## What the documents fill in from your settings

You do not edit company details into the text. The documents read them from
**Setup → General Settings**, the same fields the invoice PDF uses, so the two
always agree:

- **Company Information**: name, address, city, phone, email, tax ID.
- **Legal identity**: **Registered company name** (when the company behind
  the brand has another name, the documents name it "… trading as …"),
  **Tax office**, **Postcode**, **State / region**, **Trade registry no**,
  **MERSIS no**, **Abuse contact email** and **Data protection contact
  email** (both fall back to the company email).
- The currency prices are shown in, the currency invoices are billed in and
  whether the TCMB rate is used ([Currencies](currencies.md)).
- The VAT rate stated for customers in Turkey: the default rate of your tax
  rule for TR, if any ([Tax Rules](tax-rules.md)). With none, the documents
  name no rate.

The seller block on the contracts always lists registered name, address,
telephone, email, website, tax office and tax number, with a dash for any you
left empty. Fill them in before you launch.

## Your own terms instead

**Setup → General Settings → Terms and Privacy** has **Terms of Service
address** and **Privacy Policy address**. The sign-up form links its
agreement box to them; left empty, it names the two documents without a link.
They are empty on a new installation, so to point sign-up at the built-in
pages, enter `https://example.com/legal/terms` and
`https://example.com/legal/privacy` (with your own domain).

!!! note "The checkout box in 1.6.1"
    The agreement box at checkout does not use these addresses: its two links
    lead nowhere. Customers can still reach the documents from `/legal`.

To change the wording of a built-in document, replace its view in a theme
([Themes → Replacing views](../developer/themes.md#replacing-views)): the
English Terms of Service is `legal/en/terms.blade.php`, the Turkish one
`legal/tr/terms.blade.php`, and so on. The list of documents itself cannot be
changed.

## Versions and what is recorded

The effective date belongs to the PNLCS release: **30 August 2026** in 1.6.1.
It changes when an update changes the documents, not when you change one in a
theme.

- **Sign-up** asks the customer to tick *I have read and agree to the Terms
  of Service and Privacy Policy*. The form cannot be sent without it; the
  tick itself is not stored.
- **Checkout** asks the same on every order. The order records when the box
  was ticked, from which IP address, the effective date of the documents and
  which documents were published. Orders staff enter by hand record nothing.

These records are part of the customer's data export (the **Personal data**
button on the client's page), which answers a GDPR or KVKK request.

## Marketing email consent

PNLCS sends news and offers only to customers who asked for them:

- Sign-up, and checkout for a new customer, offer *Email me news and offers.
  I can stop at any time.*, unticked.
- Customers change it later on their profile (**News and offers by email**).
- Each change is recorded with its date, where it was made and the IP
  address. The client's page in the admin area shows **Marketing email**:
  *Agreed* with the date, *Withdrawn*, or *Not given*.

When you send a mass email, tick **This is a marketing message**: it then goes
only to customers who agreed, each with an **Unsubscribe** link that works
without signing in. Leave it unticked for service notices, which go to
everyone you selected. Invoices, renewal and support emails never depend on
consent. In 1.6.1 the **Mass Email & Bulk Actions** page has no menu entry; it
is at `/admin/bulk/mass-email`.

## Cookie consent

**Setup → General Settings → Tracking and cookie consent**: once you enter a
**Google Tag Manager container**, and while **Ask visitors before ads and
analytics cookies (recommended)** is ticked (the default), visitors see a
cookie banner and Google's tags run with storage denied until they accept.
The choice is kept for 180 days. **Cookie information link** sets where the
banner points; empty, it points to `/legal/privacy`.
