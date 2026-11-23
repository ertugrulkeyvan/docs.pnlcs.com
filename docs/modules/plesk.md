---
sources:
  - modules/Servers/Plesk/
  - modules/Servers/AbstractServerModule.php
  - app/Services/ProvisioningService.php
  - app/Services/Module/ModuleRegistry.php
  - app/Http/Controllers/Admin/ConfigController.php
  - app/Http/Controllers/Admin/ProductController.php
  - resources/views/admin/config/servers.blade.php
  - resources/views/client/services/show.blade.php
  - app/Support/ServerAddress.php
  - app/Services/ServerAccountSync.php
  - app/Http/Controllers/Admin/ServerSyncController.php
  - app/Http/Controllers/Admin/ClientController.php
  - resources/views/admin/config/server-sync.blade.php
---

# Plesk hosting accounts

The `plesk` server module provisions hosting on a **Plesk Obsidian** server through its REST API (`/api/v2`). Each PNLCS hosting service becomes a Plesk **customer** with one **subscription** for the service's domain, optionally on a Plesk service plan. A product sold on a Plesk reseller plan creates a **reseller** instead.

This page covers what is specific to Plesk. Adding the server, server groups and linking products are in [Connect a Server](../guides/connect-a-server.md). Installing PNLCS itself on a Plesk server is a different topic: [Deploy on Plesk](../guides/deploy-plesk.md).

## Requirements

- Plesk Obsidian with the REST API (`/api/v2`) available.
- A Plesk **API key** for the administrator, for example created on the server with `plesk bin secret_key --create`. If you restrict the key to an IP address, use the PNLCS server's address. PNLCS calls Plesk over the same address family (IPv4 or IPv6) as the **IP Address** recorded on the server, so a key issued for the PNLCS server's IPv4 address keeps working when the hostname also has an IPv6 address.
- Plesk's HTTPS port (8443 by default) reachable from the PNLCS server.
- **Service plans** under **Service Plans** in Plesk if products are to sell a specific plan, and reseller plans if products are to sell reseller accounts.

The module does not verify the server's TLS certificate, so Plesk's self-signed certificate works. Each call times out after 30 seconds.

The module never creates service plans, opens ports or changes Plesk settings.

## Configure PNLCS

1. In **Setup → Servers**, add a server of type **Plesk**. Port: 8443.
2. **Username**: the Plesk administrator, usually `admin`.
3. Paste the API key into the **API Key** field. The module sends it in the `X-API-Key` header to the REST API, and in the `KEY` header to the XML API that lists plans. The **Admin Password** field is not needed. Server credentials are stored encrypted.

    A server saved as active without an API key is refused with "A PLESK server signs in with its API Key. Fill in the API Key field - the password is not used for this module." Without a key the module falls back to HTTP Basic authentication with the username (default `admin`) and password; that only applies to a server saved inactive.

4. Save and press **Test**. PNLCS first opens a TCP connection to the port, then calls `GET /api/v2/server`. Any successful HTTP answer passes. If the port is open but Plesk refuses, you see "Reached <host>, but PLESK refused the credentials. Check the API key."

## Product settings

On the product, set **Server Module** to Plesk. The **Plan on the server** list is read from the first active Plesk server. The REST API has no plans endpoint, so the list comes from Plesk's XML API (`/enterprise/control/agent.php`, `service-plan` → `get`), sorted by name. The server's reseller plans follow, sorted by name and shown as **Reseller: <plan>**. The plan name is stored on the product.

With **Use the server default**, the subscription is created without a plan.

In a server group, give the plan the same name on every server.

The list only offers what the server returned. If it cannot be read when you open the product, only **Use the server default** is offered, and saving the product then stores that in place of the plan it had.

## Creating an account

On a service plan, or with **Use the server default**, create is two calls:

1. `POST /clients` creates a customer: name = the client's first and last name (or the login when both are empty), the client's email, `type: customer`, and the login and password below.
2. `POST /domains` creates the subscription: the service's domain, `hosting_type: virtual`, an FTP login and password equal to the customer's login and password, the new customer as owner, and the plan by name when one is chosen.

If the subscription fails, the module deletes the customer it just created, so no empty customer is left behind.

A service without a client or a domain is refused with "Service is missing client or domain."

**Login rules.** The first label of the domain, lowercased, with everything except `a-z` and `0-9` removed and leading digits stripped (`u` and the service id if nothing is left), cut to 16 characters, **followed by the service id**. `example.com` on service 42 becomes `example42`. A username typed on the service beforehand is not used.

**Password rules.** The service's password if one is set; otherwise 12 characters with at least one lowercase letter, one uppercase letter and one digit, without the look-alike characters `l`, `O`, `I`, `0` and `1`.

The login and password are saved on the service. The Plesk customer id and subscription id are saved in its module data (`plesk_client_id`, `plesk_domain_id`); every later action uses them.

### Reseller accounts

A product whose plan is a **Reseller: <plan>** entry creates a Plesk reseller on that reseller plan through the XML API (`reseller` → `add`), with the client's company name, name and email. A reseller has no domain of its own, so the service needs none; it creates its own customers and subscriptions in Plesk. The login is built like the one above from the service's domain, or from the client's company name, else their first and last name when there is no domain, cut to 14 characters, followed by the service id (`r` when nothing is left). The password follows the rules above. The reseller id is saved as `plesk_client_id`, marked as a reseller.

## Supported operations

| Operation | Plesk call | Notes |
|---|---|---|
| Test connection | `GET /server` | |
| List plans | XML API `service-plan` → `get`, `reseller-plan` → `get` | For the product form |
| Create | `POST /clients`, then `POST /domains` | See above. A reseller: XML API `reseller` → `add` |
| Suspend | XML API `webspace` → `set`, status 16 | Suspends only this service's subscription; the customer's other subscriptions keep running |
| Unsuspend | XML API `webspace` → `set`, status 0 | |
| Terminate | XML API `webspace` → `del`, then `DELETE /clients/{id}` | Removes the subscription; the customer is removed only when no subscription of theirs is left, and only after PNLCS checks that the recorded owner is a Plesk customer (never a reseller) |
| Change password | `PUT /clients/{id}`, then `PUT /domains/{id}` | Changes the panel login password, then the subscription's FTP password. A linked subscription with no customer recorded (the administrator's or a reseller's) changes only its FTP password |
| Change package | `PUT /domains/{id}` with the plan name | See below |
| Usage | `GET /clients/{id}/statistics` | See below |
| List accounts | XML API `webspace` → `get`, with `customer` and `reseller` → `get` for the owners | For linking and the sync page; see [Existing subscriptions](#existing-subscriptions) |

**Termination is destructive.** Deleting the subscription deletes its websites, mail and databases. Back up first. If the customer still has other subscriptions on the server, the customer is kept and the message says so; if removing the customer fails, the subscription stays removed and the message gives Plesk's reason.

A service that has a customer id but no subscription id still acts on the whole customer: `PUT /clients/{id}/suspend` and `/activate`, and `DELETE /clients/{id}`, which removes all of the customer's subscriptions.

**Reseller services** act on the reseller through the XML API: suspend and unsuspend set the reseller's status (16 or 0), terminate removes the reseller (`reseller` → `del`), with the customers and sites it hosts, and change password sets the reseller's password.

**Change password.** If Plesk accepts the new panel password but refuses the FTP password, the service keeps the new password and the action reports "Control panel password changed, but Plesk kept the old FTP password: <Plesk message>".

**Change package** moves the subscription to the new product's plan. A reseller moves only to another reseller plan (`reseller` → `switch-subscription`); a reseller cannot become a subscription, nor a subscription a reseller. When the new product has no plan chosen, the module sends the **new product's name** as the plan name, so name the product after the plan or choose a plan on it. Without a customer id or subscription id, it fails with "Missing server, domain ID, or plan name."

**Usage** is read every hour by `pnlcs:usage-polling`, one call per active service: `disk_space` and `traffic`, converted from bytes to MB. The figures are the whole customer's (or reseller's), not one subscription's. A service with no customer id, such as a linked subscription the Plesk administrator owns, is skipped. No disk or bandwidth limit is recorded, so overage billing compares against the product's own disk and bandwidth figures.

### Existing subscriptions

Subscriptions that already run on the server can be billed without creating anything:

- **One at a time**: on the client's page, **Add Service** with a Plesk product and server, leave **Create the account on the server now** unticked, and pick the subscription under **Link to an existing account**. The list shows each subscription's domain and owner.
- **In bulk**: **Sync accounts** on the server's row in **Setup → Servers** lists every subscription and reseller on the server and imports the ones no service bills yet.

Linking records the subscription id and, only when a customer owns it, the customer's id; the service's username then becomes the customer's login, and an empty domain becomes the subscription's name. Nothing changes on Plesk. A subscription another live service manages is refused. See [Plesk: existing accounts and resellers](../guides/plesk-existing-accounts.md).

### Not supported

- **Login to panel** (single sign-on): no **Login to panel** button is shown. Customers sign in to Plesk with their login and password.
- Creating a subscription for an existing customer: **Create** always makes a new customer.
- Hosting tools inside the PNLCS client area.

## What the customer sees

The service page shows the server name, the Plesk login, and the server's hostname and IP address. The welcome email can include the login and password through the `service_username` and `service_password` merge fields. The same login and password work for the Plesk panel and for FTP.

## Error messages

| Message | Cause |
|---|---|
| `No server assigned to this service.` | No active Plesk server, or none below its **Max Accounts** (in the product's server group, when it has one) |
| `Service is missing client or domain.` | The service has no domain |
| `Failed to create Plesk client: <message>` | Plesk refused the customer, for example a login already in use |
| `Failed to create Plesk subscription: <message>` | Plesk refused the subscription, for example a domain that already exists or an unknown plan name; the customer was removed again |
| `Failed to create Plesk reseller: <message>` | Plesk refused the reseller, for example a login already in use |
| `Service is missing its client.` | A reseller service without a client |
| `Missing server or Plesk subscription ID.` | Suspend, unsuspend or terminate on a service with neither a subscription id nor a customer id |
| `Missing server or Plesk client ID.` | Password change on a service with neither a Plesk customer id nor a subscription id |
| `Plesk client #<id> is not a customer; it was not removed.` | Terminate on an older service with only a stored owner id that turns out not to be a customer (for example a reseller); nothing is deleted |
| `Missing server, domain ID, or plan name.` | Package change without a subscription id or plan name |
| `A reseller moves only to another reseller plan, and a subscription only to a service plan.` | Package change between a reseller plan and a service plan |
| `Plesk has no reseller plan named <plan>.` | The new product's reseller plan is not on the server |
| `Service #<id> already manages this Plesk subscription.` | Linking a subscription another live service manages (`… this Plesk reseller.` for a reseller) |
| `Plesk has no subscription #<id>.` | Linking a subscription that is not on the server (`Plesk has no reseller #<id>.` for a reseller) |
| `Plesk did not answer.` | An XML API call returned nothing readable |
| Plesk's own message | Any other refusal; the module shows Plesk's `message`, or the first error, or the raw answer; for an XML API call, its `errtext` |

Failed create, suspend, unsuspend and terminate actions go to the retry queue; see [Provisioning did not happen](../troubleshooting/common-issues.md#provisioning-did-not-happen).
