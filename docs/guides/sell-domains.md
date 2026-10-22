---
sources:
  - app/Http/Controllers/Admin/ConfigController.php
  - app/Http/Controllers/Admin/DomainController.php
  - app/Http/Controllers/Client/DomainController.php
  - app/Http/Controllers/Client/DomainMoveController.php
  - app/Http/Controllers/Admin/WhoisController.php
  - app/Models/DomainPricing.php
  - app/Models/Product.php
  - app/Services/CartService.php
  - app/Services/OrderService.php
  - app/Services/DomainAvailability.php
  - app/Services/DomainRegistrarActions.php
  - app/Services/DomainRestoreService.php
  - app/Services/DomainMove.php
  - app/Services/DomainHosting.php
  - app/Console/Commands/DomainSyncCommand.php
  - resources/views/admin/config/domain-pricing.blade.php
  - resources/views/client/domains/show.blade.php
  - modules/Registrars/
---

# Sell Domains

PNLCS sells domain registrations, transfers and renewals alongside hosting.
Selling domains is optional: if you only sell hosting, skip this page.

## 1. Set the prices

**Setup → Domain Pricing**

Add each extension you sell (`.com`, `.net`, `.org`...) with **Add TLD**.
Customers can only order extensions that are listed and enabled here.

| Field | What it does |
|---|---|
| **Register**, **Transfer**, **Renew** price | The price for one year |
| **Restore fee** | Charged on top of a year's renewal to bring a domain back from redemption ([below](#restore-from-redemption)). 0: restore is not offered |
| **WHOIS privacy price (per year)** | Empty: privacy is not offered at order. 0: offered free. An amount: sold at that price per year, on the order and on renewals |
| **Category** | Generic, Local extensions, Country or New TLDs: the filter tabs on the public domain search and pricing pages |
| **Popular** | Also listed under the *popular* filter |
| **Grace Period (days)** | Days after expiry before the domain goes into redemption; the domain search shows it as extra time to renew at the normal price |
| **Min Years**, **Max Years** | How many years a customer may order at once (1 and 10 when left empty) |
| **Auto Registrar** | The registrar module that registers this extension, by its key in lower case (`domainnameapi`, `enom`, `namecheap`, `hrd`...). Empty: orders for it use **Manual** and you register them by hand |
| **Sort Order**, **Enabled** | Order in the lists; whether it is sold |

Prices are in your default currency. The public domain pages show them in US
dollars when a USD currency is set up (**Setup → Currencies**), unless the
visitor picked a currency of their own.

## 2. Choose a registrar

**Setup → Domain Registrars**

A registrar module registers, transfers and renews names at the registry.
Open it, enter the credentials from your registrar account, and switch it on.

| Registrar | What it asks for |
|---|---|
| **Namecheap** | API username, API key, the whitelisted IP of your server, sandbox mode |
| **ResellerClub** | Reseller ID, API key, test mode |
| **OpenProvider** | Username, password, sandbox mode |
| **Enom** | Username (UID), password, test mode |
| **HRD** (Poland) | Login, API hash, API password, default nameserver group, PESEL field, CSA field |
| **DomainNameAPI** (Turkey) | Reseller ID, live and test API keys, test mode, default nameservers |
| **Manual** | Nothing: you register names yourself at any registrar and record them in PNLCS |

**Manual** is a good start, or the answer when your registrar has no module
yet: billing works exactly the same, and the registration step is yours.
Manual is on unless you switch it off; every other registrar is off until you
switch it on.

Every registrar module registers, transfers, renews, changes nameservers, locks
and gives the EPP code. **WHOIS privacy**, the **WHOIS contact**, **own
nameservers (glue)**, **restore from redemption** and checking many names in
one call are only in **DomainNameAPI** so far; for other registrars those
buttons are not shown.

### HRD: PESEL and CSA

HRD registers a domain to a registrant account (its **CSA**, a user id), and a
private person needs a **PESEL** number (a company uses its NIP, the client's
tax ID). PNLCS has no PESEL field of its own, so create client
[custom fields](custom-fields.md) for them and choose them in **PESEL field**
and **CSA field**. Left on *Auto*, PNLCS uses custom fields named `pesel` and
`csa` (or `hrd_user_id`). The first domain creates the HRD account and stores
its CSA in that field, so the client's next domains reuse it.

!!! warning "A paid domain is never marked registered without a registrar"
    If a domain's registrar cannot be loaded (switched off, or no longer
    installed), a paid order leaves the domain **pending** and you get a
    notification, rather than showing it active while nothing was registered.

## 3. How customers buy

- The **domain search** on the public site (`/client/domain-search`) checks
  availability and puts a name in the cart.
- During hosting checkout, customers can register or transfer a domain in the
  same order.
- A transfer asks for the EPP (auth) code from the current registrar.
- The years they can choose follow **Min Years** and **Max Years**, and WHOIS
  privacy is offered in the cart when the extension has a privacy price.

### A free domain with a product

On a hosting product (**Setup → Products/Services**, the domain section), tick
**Free domain with this product**, list the extensions in **Free for these
extensions**, and tick the billing cycles under **On these billing cycles**
(none ticked means every cycle). The first year of a domain registered or
transferred with that product is then free; it renews at the normal price.

### Free subdomains

A hosting order can also take a name under one of your own domains, such as
`yourname.example-sites.com`, instead of a domain of its own. This suits trial
plans and customers who have not chosen a domain yet.

- **Offer it:** in **Setup → General → Domains**, list the domains under
  **Free subdomain domains**, one per line. The order form then shows **Free
  subdomain from us**: the customer types the first part and picks the domain.
- **Point the domains at your server:** a wildcard DNS record
  (`*.example-sites.com`) pointing at the hosting server is the usual way.
- **Names nobody may take:** **Names nobody may take** lists the first parts
  kept back (`www`, `mail`, `admin`, your own hosts). Left empty, a built-in
  list is used.
- **Rules:**
  - only one label is accepted (`yourname`, not `a.yourname`);
  - a name another live service already has is refused, and is checked again
    when the order is placed;
  - the same rules apply when a customer types such a name as their own domain.

## What customers can do with their domains

In the client area, on each domain's page:

- see registration and expiry dates;
- **change the nameservers** (sent to the registrar);
- turn **auto-renew** on or off;
- turn the **registrar lock** on or off, and get the **EPP code** to move the
  domain away (both ask the customer to confirm it is them first);
- **Renew now**: raises the renewal invoice straight away. On **My Domains**,
  **Renew selected** puts several domains (up to 100) on one invoice; a domain
  already on an unpaid invoice is left there;
- **Restore** a domain in redemption ([below](#restore-from-redemption));
- turn **ID Protection** (WHOIS privacy) on or off. Where the extension has a
  privacy price, a domain bought without privacy cannot switch it on here
  (they are asked to contact support); switching paid privacy off takes its
  price off the renewal;
- edit the **WHOIS contact** the registry holds;
- add, change and delete **own nameservers (glue)**, such as
  `ns1.their-domain.com`, with an IPv4 and an optional IPv6 address;
- **Give to another account**: offer the domain to another customer account by
  its email address. That account has 7 days to accept or decline; nothing
  moves until it accepts, and nothing changes at the registry. A domain on an
  unpaid invoice cannot be offered;
- **set the domain up on their hosting** (below).

Privacy, contacts and glue need an active domain and a registrar that offers
them (see [Choose a registrar](#2-choose-a-registrar)).

### Restore from redemption

A domain past its grace period goes into **redemption**. When its extension has
a **Restore fee**, the customer sees **Restore**: the invoice carries a year's
renewal plus the restore fee. Once it is paid, a registrar that can restore
(DomainNameAPI) does it and PNLCS reads the new dates back; with any other
registrar, or if the registrar refuses, PNLCS adds a to-do for you to restore
it by hand.

### What staff can do

**Clients → Domains**, on a domain: the same actions, plus **Sync** (read the
domain back from the registrar), **Renew** (at the registrar, now),
**Retry registration** for a paid domain that did not register, changing the
registrar, and **Move to another client** (by client ID or email; it moves at
once, with its renewals, and is refused while the domain is on an unpaid
invoice). **Utilities → WHOIS Lookup** looks up any domain.

### Set up on my hosting

A customer with an active hosting account can add a domain to it and point the
domain there in one step: **Set Up on My Hosting**, on the domain's page. With
several hosting accounts they choose which one.

PNLCS adds the domain to the account first, and only then changes its
nameservers to the ones entered on the account's **server** (**Setup →
Servers**), or else to the registrar's default nameservers. Pressing it again
changes nothing already done. It works for hosting on Panelica servers.

## Renewals and syncing

- Like services, domains renew on a cycle: PNLCS raises the renewal invoice
  ahead of expiry and renews at the registrar once it is paid. Reminders go out
  before expiry.
- Every night PNLCS asks the registrar for each domain's expiry, status and
  nameservers, and updates its records. A domain shown as active that the
  registrar does not know raises a notification, at most once a week.
- A domain past its expiry date moves to **grace** for the extension's grace
  period, then to **redemption** (30 days for the extensions PNLCS ships with;
  0 for extensions you add), then to **expired**, unless the registrar reports
  its own status.
- **Registrar balance watch** (**Setup → General Settings**) warns you when
  your prepaid balance at the registrar falls to a floor you set.
