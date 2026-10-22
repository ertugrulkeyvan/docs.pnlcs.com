---
sources:
  - resources/views/admin/settings/general.blade.php
  - app/Http/Controllers/Admin/SettingController.php
  - lang/en/admin.php
  - database/seeders/DatabaseSeeder.php
  - app/Support/AutoCharge.php
  - app/Support/MailTransport.php
  - app/Support/formatting.php
  - app/Support/FreeSubdomains.php
  - app/Support/Tracking.php
  - app/Http/Middleware/MaintenanceMode.php
  - app/Providers/AppServiceProvider.php
  - app/Services/InvoiceService.php
  - app/Services/OrderService.php
  - app/Http/Controllers/DomainSearchController.php
  - app/Console/Commands/SuspensionCommand.php
  - modules/Registrars/HRD/HrdRegistrar.php
---

# General Settings, card by card

**Setup → General Settings** is one long page of cards, with one
**Save Settings** button at the bottom that saves all of them. This page lists
every card in the order the screen shows it, with each field's label, its
default and what it does.

How the page saves:

- Secret fields (SMTP password, API keys, tokens, client secrets) are never
  shown again. Left empty on a later save, the stored value is kept.
- Nothing is checked when you save: a value is stored as typed. A wrong one
  (an unknown timezone, a malformed Tag Manager ID) is ignored where it is
  used.
- "Default" below is what a fresh install has before anyone saves the page.

## Company Information

| Field | Default | What it does |
|---|---|---|
| **Company Name** | `PNLCS` | Your business name on invoices, emails, page titles and the client area |
| **Domain** | `hosting.panelica.com` | The address used for links in mail sent by scheduled tasks (invoices, reminders). Set it to your own PNLCS address; `https://` is assumed when no scheme is given |
| **Company Address** | empty | Printed on invoices and the legal and contact pages |
| **Phone Number** | empty | Shown on invoices and the contact and legal pages |
| **Company Email** | empty | Your public contact address on the contact and legal pages; also where **Send Test Email** goes when **System Email Address** is empty |
| **City** | empty | Part of your address on invoices and legal pages |
| **Tax ID** | empty | Printed on invoices and the contact and legal pages |

## Localization

| Field | Default | What it does |
|---|---|---|
| **Default Language** | `en` | The language visitors get before they choose one. Lists the active languages ([Languages](../guides/languages.md)) |
| **Default Country** | none | Preselected country for new clients; also turns on the Turkish legal forms when set to Turkey |
| **Publish the Turkish statutory forms** | off | Publishes the distance sales contract, preliminary information form and KVKK notice; always on when the country is Turkey |
| **Record domain searches** | on | Keeps the names visitors search on the storefront for 90 days (no IP address), under **Domains → Domain searches** |
| **Date Format** | `d/m/Y` | PHP date format used everywhere dates are shown |
| **Timezone** | `UTC` | The clock times are shown in. Times are stored in UTC either way; an unknown name falls back to the server's setting |

!!! warning "Check Default Language before you save"
    The installer and **Setup → Languages** store the default language where
    this card does not read it. The list then shows the first active language
    instead of the real default, and saving the page makes that language the
    default. Pick the right language before the first save; after that the
    list shows it correctly until the default is next changed on
    **Setup → Languages**.

## Terms and Privacy

| Field | Default | What it does |
|---|---|---|
| **Terms of Service address** | empty | Linked from the registration form; left empty, the form names it without a link |
| **Privacy Policy address** | empty | The same, for the privacy policy |

## Automation

| Field | Default | What it does |
|---|---|---|
| **Suspend after (days overdue)** | 3 | Days an invoice may be overdue before its service is suspended by the daily run |
| **Terminate after (days suspended)** | 30 | Days a service may stay suspended over an unpaid invoice before it is terminated |
| **Automatically terminate services suspended for non-payment** | off | Turns termination on. It deletes the account and its data on the server |

Preview what would be terminated with `php artisan pnlcs:auto-terminate --dry-run`.
➡️ [The billing lifecycle](../concepts/billing-lifecycle.md#overdue-suspend-terminate)

## Automatic Payment

| Field | Default | What it does |
|---|---|---|
| **Pay invoices with the card the customer has stored** | off | Charges due invoices to the customer's stored card. While off, nothing is ever charged |
| **Charge this many days before the due date** | 3 | How early the first attempt is made |
| **Attempts per invoice** | 3 | Most attempts on one invoice |
| **Days between attempts** | 3 | At least 1 |

It collects every unpaid invoice that is due, including old ones, from the
first morning. Run `php artisan pnlcs:auto-charge --dry-run` first.
➡️ [Stored cards and automatic payment](../guides/payment-gateways.md#stored-cards-and-automatic-payment)

## Fraud Screening

| Field | Default | What it does |
|---|---|---|
| **Screen orders with MaxMind minFraud** | off | Adds a MaxMind score to each order |
| **MaxMind account ID** | empty | From your MaxMind account |
| **MaxMind license key** | empty | Secret; kept when left empty |
| **Screen orders with FraudLabs Pro** | off | Adds a FraudLabs Pro score to each order |
| **FraudLabs Pro API key** | empty | Secret; kept when left empty |

The worst score from the built-in rules and these providers counts; an order
scoring 60 or more is held under **Orders → Fraud**. A missing key or a provider
outage never blocks an order.
➡️ [Fraud screening](../guides/fraud-screening.md)

## SMS Verification

| Field | Default | What it does |
|---|---|---|
| **Let clients verify their phone number with a Twilio SMS code** | off | Adds a **Verify Phone** button to the client's Security page |
| **Twilio account SID** | empty | From Twilio |
| **Twilio auth token** | empty | Secret; kept when left empty |
| **Twilio Verify service SID** | empty | The Verify service that sends the codes |

➡️ [Client logins and permissions](../guides/client-logins-and-permissions.md#sign-in-settings)

## Email Verification

| Field | Default | What it does |
|---|---|---|
| **New customers must confirm their email address** | on | An unconfirmed address can sign in but is stopped at checkout. Existing accounts are not affected |

## Social Login

| Field | Default | What it does |
|---|---|---|
| **Allow customers to sign in with Google** | off | Lets customers sign in with their Google account |
| **Google Client ID** / **Google Client Secret** | empty | From a Google Cloud OAuth client; the card shows the redirect address to register there |
| **Allow customers to sign in with GitHub** | off | Lets customers sign in with their GitHub account |
| **GitHub Client ID** / **GitHub Client Secret** | empty | From a GitHub OAuth App; the card shows the callback address to register there |

## Customer account protection

| Field | Default | What it does |
|---|---|---|
| **Ask for a code sent by email before showing a domain's transfer code or changing its lock** | off | The customer confirms with a six-digit emailed code; one confirmation lasts 15 minutes |

## Google reCAPTCHA protection

| Field | Default | What it does |
|---|---|---|
| **Require reCAPTCHA on the public contact form** | off | |
| **Require reCAPTCHA when a signed-in customer opens a support ticket** | off | |
| **Require reCAPTCHA when a visitor opens an account (register page and checkout)** | off | |
| **Require reCAPTCHA on the sign-in form** | off | |
| **Require reCAPTCHA when someone asks for a password reset link** | off | |
| **Site key** / **Secret key** | empty | Keys of a reCAPTCHA v2 "I'm not a robot" site; shared by all five switches |

➡️ [Security checklist](../install/security.md#customers-and-orders)

## Legal identity

| Field | Default | What it does |
|---|---|---|
| **Registered company name** | empty | The legal party when it differs from the brand; printed on invoices and legal documents |
| **Tax office** | empty | Printed on invoices and legal documents |
| **Postcode** | empty | Part of your address |
| **State / region** | empty | Part of your address |
| **Trade registry no** | empty | Shown on the legal pages |
| **MERSIS no** | empty | Turkish central registry number; printed on invoices |
| **Abuse contact email** | empty | Named on the legal pages; **Company Email** when empty |
| **Data protection contact email** | empty | Named on the legal pages; **Company Email** when empty |
| **About us** | empty | Text of the public About page; paragraphs separated by a blank line |
| **Show the knowledge base to customers** | on | Off hides the knowledge base everywhere and its pages answer "not found" |

➡️ [About page and knowledge base](../guides/themes-and-branding.md#about-page-and-knowledge-base)

## Tracking and cookie consent

| Field | Default | What it does |
|---|---|---|
| **Google Tag Manager container** | empty | `GTM-` followed by 4 to 12 letters or digits; anything else is ignored |
| **Cookie information link** | empty | Linked from the consent bar |
| **Ask visitors before ads and analytics cookies (recommended)** | on | Runs Google consent mode with storage denied until the visitor accepts; the choice is kept 180 days |
| **Code for the head of every page** | empty | Added as written to client and public pages, never to the admin area, whatever the visitor chose |
| **Code for the end of every page** | empty | The same, before the end of the page |

## Search engines and sharing

| Field | Default | What it does |
|---|---|---|
| **Shop description** | empty | The description search engines and link previews show; up to 300 characters |
| **Image for shared links** | empty (your logo) | Address of the preview image; 1200×630 works everywhere |
| **X (Twitter) account** | empty | Your `@` handle for link previews |
| **Social media profiles** | empty | Full addresses for X, Facebook, Instagram, LinkedIn, YouTube, TikTok, Threads and Medium; themes show them |
| **robots.txt** | empty (everything may be indexed) | The text served at `/robots.txt`, with your sitemap address added at the end. Ignored while a real `robots.txt` file sits in the public web folder; the card warns when it does |

## Billing currency

| Field | Default | What it does |
|---|---|---|
| **Bill customers in** | Shop currency only | A second currency each invoice is also stated in, at a rate frozen when the invoice is raised |
| **Official rate source** | None (commercial rate) | **TCMB (Central Bank of Turkey)** names the official rate on the invoice |
| **TCMB rate** | forex selling rate | Or forex buying rate |
| **Payment reference prefix** | `INV` | Up to 8 characters; the code customers write on a bank transfer, such as `INV34` |
| **Auto-approve orders from** | empty | Comma-separated test addresses whose orders are marked paid and provisioned without payment. Leave empty in production |

➡️ [Currencies and exchange rates](../guides/currencies.md), and [Payment gateways](../guides/payment-gateways.md) for the per-gateway **Charge in the invoice's billing currency** option

## Domain search suggestions

| Field | Default | What it does |
|---|---|---|
| **Suggested extensions, in order** | `.com .net .org .io .co .dev .app .online .site .xyz` | Extensions offered next to the name searched, when priced and enabled |
| **How many** | 6 | 1 to 12 |

## Registrar balance watch

| Field | Default | What it does |
|---|---|---|
| **Registrar module** | `domainnameapi` | The registrar whose prepaid balance is checked, or **Off** |
| **Warning floor** | empty | Warn when the balance falls to this amount |
| **Currency** | empty | Three-letter code of the floor |
| **Alert email** | empty | Where the warning goes |

Checked at 08:00 and 20:00 ([Scheduled commands](scheduled-commands.md)).
➡️ [Sell domains](../guides/sell-domains.md)

## Late Fees

| Field | Default | What it does |
|---|---|---|
| **Charge** | Do not charge late fees | Or **A fixed amount**, or **A percentage of the invoice** |
| **Amount** | 0 | The fixed amount, or the percentage |
| **Days overdue before charging** | 3 | Added once per invoice by the daily run |

➡️ [Late fees](../concepts/billing-lifecycle.md#late-fees)

## System Settings

| Field | Default | What it does |
|---|---|---|
| **Admin Login URL Prefix** | `admin` | **Not used.** Saved, but nothing reads it: the admin area is always at `/admin` |
| **Client Area Template** | `default` | **Not used.** Saved, but nothing reads it. Themes are chosen under **Setup → Appearance** ([Themes and branding](../guides/themes-and-branding.md)) |
| **Maintenance Mode (client area offline)** | off | Visitors get a "maintenance" page (HTTP 503). The admin area, the API and signed-in staff are not affected |
| **Enable Online Order Form** | off | **Not used.** Saved, but nothing reads it, and once ticked it cannot be unticked from this page |

## Invoices

| Field | Default | What it does |
|---|---|---|
| **Default Payment Method for New Clients** | Bank Transfer | Preselected on the admin **Add New Client** form. Lists the usable gateways, Bank Transfer and Manual |
| **Default payment due (days)** | 14 | Days from the invoice date to its due date |
| **Invoice numbering scheme** | `INV-{year}{month}-{num}` | Tokens `{year}` `{yy}` `{month}` `{day}` `{num}`; `{num}` is six digits and continues from the highest number already issued. The card shows the last number and a preview |
| **Reset numbering each year** | off | `{num}` starts again from 1 each January |
| **Enable Proforma scheme** | off | New invoices are proformas; a paid proforma is replaced by a VAT invoice with its own number |
| **Proforma numbering scheme** | `PRO-{year}/{month}-{num}` | Shown when the proforma scheme is on; same tokens |
| **Hide paid proformas** | on | Paid proformas are left out of invoice lists, since their VAT invoice replaces them |

## Mail Configuration

| Field | Default | What it does |
|---|---|---|
| **Mail Type** | PHP Mail (shown) | **SMTP** or **PHP Mail** (the server's `sendmail`). Until this page is first saved, `.env` decides; the first save stores whatever is selected |
| **Enable outgoing emails** | on | Off stops every email PNLCS sends |
| **System Email Address** | empty | The sender address |
| **Email From Name** | empty | The sender name |
| **SMTP Host** | empty | Shown for SMTP |
| **SMTP Port** | 587 | |
| **SMTP Username** | empty | |
| **SMTP Password** | empty | Secret; kept when left empty |
| **SMTP Encryption** | TLS (STARTTLS) | Or SSL, or None |
| **Send Test Email** | | Sends a test to the System Email Address (or Company Email) with the saved settings; save first |

➡️ [Configure email](../guides/configure-email.md)

## Domains

| Field | Default | What it does |
|---|---|---|
| **Default Nameservers** (NS1 to NS5) | empty | Nameservers for registrations and transfers made without any. Only the HRD registrar module reads them; the others use their own settings |
| **Free subdomain domains** | empty | One domain per line; hosting orders can then take a name under them. Empty: not offered |
| **Names nobody may take** | built-in list | First labels refused for free subdomains, separated by commas or lines. Empty uses a built-in list of 47 (`www`, `mail`, `admin`, `api`, `billing` and others); the card shows it |

➡️ [Free subdomains](../guides/sell-domains.md#free-subdomains)

## Saved here from other screens

The AI translation key and model on **Setup → Languages** are stored with these
settings but are edited on that screen ([Translate with AI](../guides/languages.md#translate-with-ai)).
