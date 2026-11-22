---
sources:
  - modules/Servers/Plesk/PleskModule.php
  - app/Services/ServerAccountSync.php
  - app/Http/Controllers/Admin/ServerSyncController.php
  - app/Http/Controllers/Admin/ClientController.php
  - resources/views/admin/config/server-sync.blade.php
  - resources/views/admin/config/servers.blade.php
  - resources/views/admin/clients/show.blade.php
  - routes/admin.php
  - app/Services/BillingCycleHelper.php
---

# Plesk: Existing Accounts & Resellers

If you already host customers on Plesk, you can bill them from PNLCS without recreating anything, by linking each service to its existing Plesk subscription.

## Linking a service

1. Connect the Plesk server under **Setup → Servers**.
2. On the client's page, add a service for a Plesk product, select the server and leave **Create the account on the server now** unticked.
3. In **Link to an existing account**, choose the subscription. The list shows the domain and its owner.

Linking only records the subscription and its owner in PNLCS. **Nothing on Plesk changes.** When a customer or reseller owns the subscription, the service's username becomes the owner's login; its domain, if empty, becomes the subscription's name. A subscription already managed by another live service cannot be linked twice.

## Importing every subscription at once

**Setup → Servers → Sync accounts** lists every subscription on the server. Each row shows its domain, owner, service plan, creation date and status, and the service that bills it if there is one. Subscriptions without a service can be imported in batches of up to 100:

1. Tick the subscriptions to import. **Only accounts not linked** hides the ones already billed.
2. Check the client (by id; the field offers matching names), product, cycle, amount and next due date.
3. Click **Import selected**. Each subscription becomes a service of that client, linked as above. **Nothing on Plesk changes.**

Each row opens with a guess you can change:

| Field | Taken from |
|---|---|
| Client | The price list; else a domain or service already in PNLCS; else the owner's email |
| Product | The product whose Plesk plan matches the subscription's; the only Plesk product if there is one |
| Cycle | The price list; else annually, or the product's shortest cycle when it does not sell annual terms. The list offers the cycles the product sells, terms of months included |
| Amount | The price list; else the product's price for the cycle |
| Next due date | The price list; else the first date after today that is a whole number of cycles after the subscription's creation (empty if Plesk gives no creation date) |
| Status | Active, or suspended if the subscription is suspended on Plesk |

### Price list

To fill many rows at once, upload a CSV with a header row and these columns: `domain`, `client_id` (or `client_email`), `amount`, `billing_cycle` (`Monthly`, `Quarterly`, `Semi-Annually`, `Annually`, `Biennially`, `Triennially`, or a term of 1 to 12 months written as `7 months`) and `next_due_date` (`YYYY-MM-DD`). Commas or semicolons both work. `domain` is required; any other column can be left empty. `client_email` is matched against the client's main email address. The file must be CSV or plain text, up to 2 MB. The list is kept for your session; rows filled from it are marked.

```csv
domain,client_id,amount,billing_cycle,next_due_date
rossi.it,12,60.00,Annually,2027-03-15
```

!!! note
    Subscriptions that the Plesk administrator owns have no owner email, so their client can only come from the price list or from data already in PNLCS.

The page needs the **manage servers** permission; importing also needs **edit clients** and **manage services**.

## Reseller accounts

A product can sell a Plesk **reseller** account instead of a single subscription. In the product's module settings, the package list shows the server's reseller plans after the service plans, as **Reseller: <plan>**. Choose one, and an order for that product creates a reseller on that plan, with its own login, instead of a customer and subscription. A reseller service needs no domain.

| Action | Effect on Plesk |
|---|---|
| Suspend, unsuspend | The reseller, and with it every customer and site it hosts |
| Terminate | **Deletes the reseller with all its customers and sites** |
| Change password | The reseller's login password |
| Change package | Moves the reseller to another reseller plan; a reseller cannot become a subscription or the other way round |

Existing resellers appear on the sync page marked **Reseller**, with their reseller plan, and are imported and linked like subscriptions. Disk and traffic usage is read for resellers as for customers.

## What the actions do

| Action | Effect on Plesk |
|---|---|
| Suspend, unsuspend | That subscription only; the customer's other subscriptions keep running |
| Terminate | **Deletes the subscription and its content.** The Plesk customer is deleted too once no subscriptions are left |
| Change password | Changes the **Plesk customer's** password, which applies to all their subscriptions, and this subscription's FTP password. It fails on a subscription the Plesk administrator owns |

!!! danger
    Terminate cannot be undone. On a service billed for an existing site, use it only when you really want the site removed from Plesk.

A service recorded before the subscription id was stored keeps the old behaviour: suspend, unsuspend and terminate act on the whole Plesk customer.

## Limits

Usage statistics are read per customer, not per subscription.
