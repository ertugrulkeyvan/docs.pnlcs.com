---
sources:
  - app/Http/Controllers/Admin/ModuleController.php
  - app/Services/Module/ModuleSwitchboard.php
  - app/Services/Module/ModuleRegistry.php
  - app/Services/AddonManager.php
  - app/Services/ReportManager.php
  - resources/views/admin/config/modules.blade.php
  - resources/views/admin/layouts/app.blade.php
  - modules/
---

# Modules

PNLCS talks to the outside world through **modules**: server modules create
hosting accounts, payment gateways take money, registrars register domains, SSL
modules order certificates, addons add features, and report modules add
reports. They live in the `modules/` folder.

## The Modules screen

**Setup → Modules** lists every installed server, payment gateway, registrar,
SSL and addon module, grouped by type, each with:

- **Source**: *Built-in* (ships with PNLCS) or *Third-party* (added by you).
- **In use**: for server and SSL modules, how many servers and products use
  it.
- **Switch on / Switch off**.
- **Configure**: opens the module type's own settings page.

Switching a module off stops it being **offered for new use**; whatever
already uses it keeps working:

| Type | Switched off means |
|---|---|
| Payment gateway | No longer offered at checkout |
| Registrar | No longer used by the domain search |
| Server | No longer offered when adding a server or a product |
| SSL | No longer offered for new certificate products |
| Addon | Deactivated |

A **server** or **SSL** module that a server or product still uses cannot be
switched off; the screen shows how many records use it. Move them to another
module first.

## Extensions

Addons are managed on the **Extensions** page (in the settings sidebar, or
**Configure** next to *Addons* on the Modules screen): activate or deactivate
each one, and **Open** an active one for its own settings or page. Active
addons that add admin pages get an **Extensions** menu in the top bar, which
ends with **Manage extensions**. The menu is not shown while no active addon
adds a page.

## Where the settings are

Credentials and options stay on each type's own page:

| Type | Settings |
|---|---|
| Payment gateways | **Setup → Payment Gateways** ([guide](payment-gateways.md)) |
| Servers | **Setup → Servers**, per server ([guide](connect-a-server.md)) |
| Registrars | **Setup → Domain Registrars** ([guide](sell-domains.md)) |
| SSL | **Setup → SSL Modules** |
| Addons | the **Extensions** page in the settings sidebar |

## The built-in modules

| Type | Modules |
|---|---|
| Servers | Panelica, Panelica Licenses (sells Panelica panel licenses, [guide](sell-panelica-licenses.md)), cPanel/WHM, Plesk, DirectAdmin, HestiaCP, aaPanel ([guide](../modules/aapanel.md)), Proxmox VE, Vultr, Custom |
| Payment gateways | Stripe, PayPal, Authorize.Net, Mollie, Razorpay, Tpay, iyzico, Bank Transfer |
| Registrars | Namecheap, ResellerClub, OpenProvider, Enom, HRD, DomainNameAPI, Manual |
| SSL | GoGetSSL |
| Addons | Company Lookup (PL): fills in a Polish company's details from its NIP; KSeF (e-Invoices): sends paid invoices to Poland's national e-invoicing system; Project Management: projects, tasks and time for client services; Staff Board: an internal message board for staff |
| Reports | 27 reports on the **Reports** page: income, invoices, clients, services, domains, SSL, tickets, affiliates, promotions and tax |

## Adding a module

Drop the module's folder into `modules/` with its `pnlcs.json` manifest; it
appears on this screen, marked *Third-party*, on the next page load. Nothing
in PNLCS itself is edited, so updates leave it in place.

To write one: [Writing a module](../developer/modules.md).
