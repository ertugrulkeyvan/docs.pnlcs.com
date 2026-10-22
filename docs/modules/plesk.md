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
---

# Plesk hosting accounts

The `plesk` server module provisions hosting on a **Plesk Obsidian** server through its REST API (`/api/v2`). Each PNLCS hosting service becomes a Plesk **customer** with one **subscription** for the service's domain, optionally on a Plesk service plan.

This page covers what is specific to Plesk. Adding the server, server groups and linking products are in [Connect a Server](../guides/connect-a-server.md). Installing PNLCS itself on a Plesk server is a different topic: [Deploy on Plesk](../guides/deploy-plesk.md).

## Requirements

- Plesk Obsidian with the REST API (`/api/v2`) available.
- A Plesk **API key** for the administrator, for example created on the server with `plesk bin secret_key --create`. If you restrict the key to an IP address, use the PNLCS server's address.
- Plesk's HTTPS port (8443 by default) reachable from the PNLCS server.
- **Service plans** under **Service Plans** in Plesk if products are to sell a specific plan.

The module does not verify the server's TLS certificate, so Plesk's self-signed certificate works. Each call times out after 30 seconds.

The module never creates service plans, opens ports or changes Plesk settings.

## Configure PNLCS

1. In **Setup → Servers**, add a server of type **Plesk**. Port: 8443.
2. **Username**: the Plesk administrator, usually `admin`.
3. Paste the API key into the **Access Hash** field. The module sends it in the `X-API-Key` header. Server credentials are stored encrypted.

    !!! warning "The key goes in Access Hash"
        The form calls the password field **Password / API Key** and says Access Hash is "Not used by Plesk". The opposite is true: a key in the password field is sent as a password. A server saved as active without an Access Hash is refused with "A PLESK server signs in with an API key. Fill in the API key field - the password is not used for this module." Without a key the module falls back to HTTP Basic authentication with the username (default `admin`) and password; that only applies to a server saved inactive.

4. Save and press **Test**. PNLCS first opens a TCP connection to the port, then calls `GET /api/v2/server`. Any successful HTTP answer passes. If the port is open but Plesk refuses, you see "Reached <host>, but PLESK refused the credentials. Check the API key."

## Product settings

On the product, set **Server Module** to Plesk. The **Plan on the server** list is read from the first active Plesk server. The REST API has no plans endpoint, so the list comes from Plesk's XML API (`/enterprise/control/agent.php`, `service-plan` → `get`), sorted by name. The plan name is stored on the product.

With **Use the server default**, the subscription is created without a plan.

In a server group, give the plan the same name on every server.

The list only offers what the server returned. If it cannot be read when you open the product, only **Use the server default** is offered, and saving the product then stores that in place of the plan it had.

## Creating an account

Create is two calls:

1. `POST /clients` creates a customer: name = the client's first and last name (or the login when both are empty), the client's email, `type: customer`, and the login and password below.
2. `POST /domains` creates the subscription: the service's domain, `hosting_type: virtual`, an FTP login and password equal to the customer's login and password, the new customer as owner, and the plan by name when one is chosen.

If the subscription fails, the module deletes the customer it just created, so no empty customer is left behind.

A service without a client or a domain is refused with "Service is missing client or domain."

**Login rules.** The first label of the domain, lowercased, with everything except `a-z` and `0-9` removed and leading digits stripped (`u` and the service id if nothing is left), cut to 16 characters, **followed by the service id**. `example.com` on service 42 becomes `example42`. A username typed on the service beforehand is not used.

**Password rules.** The service's password if one is set; otherwise 12 characters with at least one lowercase letter, one uppercase letter and one digit, without the look-alike characters `l`, `O`, `I`, `0` and `1`.

The login and password are saved on the service. The Plesk customer id and subscription id are saved in its module data (`plesk_client_id`, `plesk_domain_id`); every later action uses them.

## Supported operations

| Operation | Plesk call | Notes |
|---|---|---|
| Test connection | `GET /server` | |
| List plans | XML API `service-plan` → `get` | For the product form |
| Create | `POST /clients`, then `POST /domains` | See above |
| Suspend | `PUT /clients/{id}/suspend` | Suspends the whole customer |
| Unsuspend | `PUT /clients/{id}/activate` | |
| Terminate | `DELETE /clients/{id}` | Removes the customer and all of its subscriptions |
| Change password | `PUT /clients/{id}`, then `PUT /domains/{id}` | Changes the panel login password, then the subscription's FTP password |
| Change package | `PUT /domains/{id}` with the plan name | See below |
| Usage | `GET /clients/{id}/statistics` | See below |

**Termination is destructive.** Deleting the customer deletes its subscriptions with their websites, mail and databases. Back up first.

**Change password.** If Plesk accepts the new panel password but refuses the FTP password, the service keeps the new password and the action reports "Control panel password changed, but Plesk kept the old FTP password: <Plesk message>".

**Change package** moves the subscription to the new product's plan. When the new product has no plan chosen, the module sends the **new product's name** as the plan name, so name the product after the plan or choose a plan on it. Without a customer id or subscription id, it fails with "Missing server, domain ID, or plan name."

**Usage** is read every hour by `pnlcs:usage-polling`, one call per active service: `disk_space` and `traffic`, converted from bytes to MB. No disk or bandwidth limit is recorded, so overage billing compares against the product's own disk and bandwidth figures.

### Not supported

- **Login to panel** (single sign-on): no **Login to panel** button is shown. Customers sign in to Plesk with their login and password.
- **Listing or importing existing customers** from the server.
- More than one subscription per customer, or hosting tools inside the PNLCS client area.

## What the customer sees

The service page shows the server name, the Plesk login, and the server's hostname and IP address. The welcome email can include the login and password through the `service_username` and `service_password` merge fields. The same login and password work for the Plesk panel and for FTP.

## Error messages

| Message | Cause |
|---|---|
| `No server assigned to this service.` | No active Plesk server, or none with room in the product's server group |
| `Service is missing client or domain.` | The service has no domain |
| `Failed to create Plesk client: <message>` | Plesk refused the customer, for example a login already in use |
| `Failed to create Plesk subscription: <message>` | Plesk refused the subscription, for example a domain that already exists or an unknown plan name; the customer was removed again |
| `Missing server or Plesk client ID.` | The service has no stored Plesk customer id (it was not created by this module) |
| `Missing server, domain ID, or plan name.` | Package change without a subscription id or plan name |
| Plesk's own message | Any other refusal; the module shows Plesk's `message`, or the first error, or the raw answer |

Failed create, suspend, unsuspend and terminate actions go to the retry queue; see [Provisioning did not happen](../troubleshooting/common-issues.md#provisioning-did-not-happen).
