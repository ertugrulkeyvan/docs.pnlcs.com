---
sources:
  - app/Models/Product.php
  - resources/views/admin/products/create.blade.php
  - resources/views/admin/products/edit.blade.php
  - app/Http/Controllers/Client/CartController.php
  - app/Services/CartService.php
  - resources/views/admin/clients/show.blade.php
  - app/Http/Controllers/Admin/ClientController.php
  - lang/en/whmcs_import.php
  - app/Console/Commands/DbBackupCommand.php
  - app/Console/Commands/CurrencyUpdateCommand.php
  - routes/console.php
---

# FAQ

## How do I offer a free (zero-cost) plan?

Create the product and set **Payment Type → Free** (the dropdown offers
Recurring / One Time / Free), then put `0` in the billing cycle you offer;
`-1` means the cycle is not sold. The order's zero-total invoice is marked
paid by itself. On a Recurring or One Time product, `0` does not make a free
plan: that cycle is simply not sold.

## Can I give a free domain with hosting?

Yes. On the hosting product's edit page, in the **Domain** card, tick **Free
domain with this product**, list the extensions under **Free for these
extensions** (e.g. `.com, .net`) and, if you like, tick the billing cycles
under **On these billing cycles** (none ticked means every cycle). **Offer a
domain on the order form** must be on too. When a customer registers or
transfers a domain of a listed extension with the product, the first year of
the domain costs nothing; it renews at its normal price. With no extension
listed, no domain is free.

## How do I bring an existing customer/account into PNLCS?

Open the client → **Services** tab → **Add Service**. Leave the options empty
for a billing-only record; on a Panelica or Proxmox server, use **Link to an
existing account** to attach the account or virtual server that already runs
there (PNLCS then bills *and* manages it); or tick **Create the account on the
server now** to provision a brand-new one.

## How does PNLCS know which server account belongs to which service?

It stores the panel's internal **account ID** on the service (in `module_data`)
and every action — suspend, terminate, password — uses that ID. It does *not*
rely on usernames matching, so names can differ freely.

## How do I update to the latest version?

From the admin area: **Setup → Updates**. Docker:
`docker exec pnlcs /usr/local/bin/update.sh`. From the command line and the
other cases: see [Updating](../install/updating.md). Your data is left
untouched either way.

## Can PNLCS import my WHMCS data?

Yes: **Utilities → Import WHMCS** connects to your WHMCS database, read-only,
and imports its tables into PNLCS with a field mapping you check first.
The API also speaks WHMCS's action names, so migration scripts carry over; see
[Migrate from WHMCS](../guides/migrate-from-whmcs.md).

## Where are my backups?

`storage/app/backups/db/`, one gzip file a night, the last 7 kept. See
[Backups](../install/backups.md).

## Can customers pay automatically?

Yes, with Stripe, iyzico or PayPal: the customer stores a card at the gateway
and renewals are charged to it once **Automatic Payment** is switched on
(**Setup → General Settings**). See [Payment Gateways](../guides/payment-gateways.md#stored-cards-and-automatic-payment).

## Can I sell in several currencies?

Yes: add currencies under **Setup → Currencies**. Exchange rates update every
morning at 05:30 while **Update exchange rates every day** is ticked on the
same page (it is by default).

## Can an AI assistant work with PNLCS?

Yes, through the [MCP server](../mcp/index.md).

