---
offer: true
sources:
  - app/Http/Controllers/Admin/WhmcsImportController.php
  - app/Services/WhmcsImport/
  - lang/en/whmcs_import.php
  - app/Http/Controllers/Admin/ClientController.php
  - resources/views/admin/clients/show.blade.php
  - modules/Servers/Panelica/PanelicaModule.php
  - modules/Servers/Proxmox/ProxmoxModule.php
---

# Migrate from WHMCS

Moving from WHMCS to PNLCS? Because PNLCS deliberately mirrors WHMCS concepts,
the mental model carries straight over — clients, products, orders, invoices,
services, tickets and modules all mean the same thing.

!!! note "What the importer moves"
    **Utilities → Import WHMCS** reads clients, domains and services straight
    from your WHMCS database ([below](#import-from-the-whmcs-database)).
    Products, invoices, tickets and settings are not imported: you set those
    up in PNLCS yourself.

## Recommended approach: run both, cut over gradually

Rather than a big-bang migration, run PNLCS alongside WHMCS and move customers
over as they renew. This avoids downtime and billing surprises.

### 1. Rebuild your catalog

Recreate your **product groups** and **products** in PNLCS with the same names
and prices. See [Your First Sale](../getting-started/your-first-sale.md). This
is quick and gives you a clean, correct price list.

### 2. Connect the same servers

Add your existing hosting **servers** to PNLCS
([Connect a Server](connect-a-server.md)). The accounts already exist on those
servers — PNLCS just needs to manage them going forward.

### 3. Recreate settings

- Payment [gateways](payment-gateways.md) (use the same accounts)
- [Tax rules](tax-rules.md)
- [Email](configure-email.md) and templates
- [Staff and roles](staff-and-roles.md)

### 4. Bring customers over

Import them ([below](#import-from-the-whmcs-database)), or create them by hand:
for each customer, create a **client** in PNLCS and add their existing
**services**: on the client, **Services → Add Service**, with the right product,
next due date and price. On a Panelica or Proxmox server, **Link to an existing
account** lists what is already on it (the panel's accounts, or the virtual
machines); pick the customer's, and PNLCS manages it from then on (suspend,
terminate, password). Leave it empty for a billing-only record. New renewal
invoices then bill from PNLCS.

Two common patterns:

- **On renewal** — as each customer's WHMCS renewal comes up, recreate them in
  PNLCS and let PNLCS bill the next cycle. Lowest risk.
- **All at once** — recreate everyone in a maintenance window, set due dates to
  match, and switch billing.

### 5. Point domains/links at PNLCS

Update your billing URL, client links and any signup forms to your PNLCS
install. Redirect the old WHMCS URL if you can.

## Import from the WHMCS database

**Utilities → Import WHMCS**. The WHMCS database is only read; nothing in it
is changed.

1. **Connect**: enter the WHMCS database's host, port, database, username,
   password and **Table prefix** (`tbl` by default). **Test connection**
   checks it; **Save and continue** opens the mapper. PNLCS must be able to
   reach that database server over the network.
2. **Map the fields**: pick a **Source table**: `tblclients` imports clients,
   `tbldomains` domains, `tblhosting` services. Each WHMCS field is matched to
   a PNLCS field (with a suggestion where the names agree) or skipped. You can
   also set constant values and search-and-replace rules, and save the
   mapping to reuse it. WHMCS client custom fields appear as `custom:<name>`;
   one with the same name as a PNLCS custom field maps onto it.
3. **Import mode**: **Add new**, **Add and update** or **Update only**, with a
   **Match key** that decides whether a record already exists (email for
   clients, domain name for domains and services).
4. **Preview** shows the first 10 rows as WHMCS has them and as PNLCS will
   store them, with any problems listed. **Run import** then imports them and
   opens the import log: how many were added, updated, skipped and failed,
   with the reason for each.

Import in this order:

- **Clients first.** They get a random password: each customer sets their
  own with "Forgot password" on their first visit. Tell them before you
  switch.
- **Domains** are linked to the PNLCS client with the same email as their
  WHMCS owner.
- **Services** are linked to the client by email, to a PNLCS product through
  **Product mapping** (or a product with the same name), and to the PNLCS
  server with the same name. A service whose product or server is not found
  is still imported without it and noted in the log. The WHMCS service
  password is not imported.

## Handy facts for planners

- **Data model parity:** WHMCS's clients/products/orders/invoices/services map
  1:1 to PNLCS, so exported CSVs are easy to re-enter or script against the API.
- **API:** the PNLCS API uses the WHMCS action names (`addclient`,
  `addorder`, `getclientsproducts`...), so migration scripts written for WHMCS
  carry over with a new address. See the [API reference](../api/index.md),
  and [Coming from WHMCS](../api/index.md#coming-from-whmcs) for the
  differences.
- **Passwords:** hosting account passwords live on the control panel, not in
  PNLCS — moving billing doesn't disturb live sites.
- **Hooks:** many WHMCS hook names keep working, but the parameters are
  PNLCS objects and some hooks are not there; see
  [Hooks](../developer/hooks.md) for the differences.

## Get help

Migrations are the kind of thing the community loves to compare notes on — ask
in the [PNLCS community](https://community.pnlcs.com/c/help) or open an
[issue](https://github.com/Panelica/pnlcs/issues) with your scenario.
