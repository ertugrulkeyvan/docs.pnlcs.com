---
sources:
  - modules/Servers/CPanel/
  - modules/Servers/AbstractServerModule.php
  - app/Services/ProvisioningService.php
  - app/Services/Module/ModuleRegistry.php
  - app/Http/Controllers/Admin/ConfigController.php
  - app/Http/Controllers/Admin/ProductController.php
  - resources/views/admin/config/servers.blade.php
  - resources/views/client/services/show.blade.php
---

# cPanel/WHM hosting accounts

The `cpanel` server module creates and manages **cPanel accounts** on a WHM server through WHM API 1 (`/json-api/`). Each PNLCS hosting service is one cPanel account, created with the service's domain and a WHM package.

This page covers what is specific to cPanel. Adding the server, server groups and linking products are in [Connect a Server](../guides/connect-a-server.md).

## Requirements

- A WHM server you can sign in to as `root` (or another WHM user allowed to create accounts).
- A **WHM API token** for that user, created under **WHM → Development → Manage API Tokens**. The token needs the rights to create, suspend, unsuspend and remove accounts, change passwords and packages, and list accounts, packages and bandwidth.
- WHM's HTTPS port (2087 by default) reachable from the PNLCS server. If WHM's Host Access Control or a firewall restricts that port, allow the PNLCS server's IP address.
- At least one **package** in WHM (**Packages → Add a Package**) if products are to sell a specific plan.

The module does not verify the server's TLS certificate, so a self-signed WHM certificate works. Each call times out after 60 seconds.

The module never creates packages, opens ports or changes WHM settings.

## Configure PNLCS

1. In **Setup → Servers**, add a server of type **cPanel/WHM**. Port: 2087.
2. **Username**: the WHM user, usually `root`. Left empty, `root` is used.
3. Paste the API token into the field labelled **Access Hash (legacy)**. The module signs every call with the header `Authorization: whm <username>:<token>`. Server credentials are stored encrypted.

    !!! warning "The token goes in Access Hash"
        The form labels the password field **API Token**, but the module reads the token only from **Access Hash**. A server saved as active without an Access Hash is refused with "A CPANEL server signs in with an API key. Fill in the API key field - the password is not used for this module." When the Access Hash is empty the module falls back to HTTP Basic authentication with the username and the password field; that only applies to a server saved inactive.

4. Save and press **Test**. PNLCS first opens a TCP connection to the port, then calls WHM's `version` function. The test passes only when WHM answers with `result = 1`. If the port is open but WHM refuses, you see "Reached <host>, but CPANEL refused the credentials. Check the API key."

## Product settings

On the product (**Setup → Products/Services**), set **Server Module** to cPanel/WHM. The **Plan on the server** list is read live from the first active cPanel server with WHM's `listpkgs`, sorted by name, each shown with its disk quota and mailbox limit, for example `starter (disk 1024, email 10)`. The package name is stored on the product.

With **Use the server default**, account creation sends no `plan`, and WHM applies its own default.

In a server group, give the package the same name on every server: the product stores a name, not a server.

The list only offers what the server returned. If it cannot be read when you open the product, only **Use the server default** is offered, and saving the product then stores that in place of the plan it had.

## Creating an account

On create, the module calls `createacct` with:

| Field | Value |
|---|---|
| `username` | Built from the domain, see below |
| `domain` | The service's domain |
| `password` | The service's password if one is set, otherwise 16 random hexadecimal characters |
| `contactemail` | The client's email address |
| `plan` | The product's package, when one is chosen |

A service without a client or a domain is refused with "Service is missing client or domain."

**Username rules.** The first label of the domain (`example` for `example.com`), lowercased, with everything except `a-z` and `0-9` removed and leading digits stripped, cut to 8 characters. If nothing is left, `u` followed by the service id is used. A username typed on the service beforehand is not used.

If WHM refuses because the name is taken (its message contains "already"), the module retries up to three times with a digit appended: `exampl1`, `exampl2`, `exampl3` (the name is shortened to keep it at 7 characters).

The final username is saved on the service and in its module data (`cpanel_username`). Later actions use that stored name.

WHM checks the password against its own password strength setting. If you have raised it, a generated password of lowercase hexadecimal characters may be refused; set a stronger password on the service before creating the account.

## Supported operations

| Operation | WHM function | Notes |
|---|---|---|
| Test connection | `version` | |
| List packages | `listpkgs` | For the product form |
| Create | `createacct` | See above |
| Suspend | `suspendacct` | Sends the suspension reason |
| Unsuspend | `unsuspendacct` | |
| Terminate | `removeacct` | With `keepdns=0`: the account's DNS zone is removed too |
| Change password | `passwd` | Sends `pass` and `password` with `db_pass_update=1`, so the account's database users get the new password as well |
| Change package | `changepackage` | See below |
| Usage | `listaccts` and `showbw` | See below |

**Termination is destructive.** WHM deletes the account, its files, databases, mail and DNS zone. Back up anything you need first.

**Change package** runs when an admin changes a service to another cPanel product, and on paid upgrades and downgrades. It uses the new product's package. If the new product has no package chosen, it fails with "New product does not have a cpanel_package configured."

**Usage** is read every hour by `pnlcs:usage-polling`, for every active cPanel service on an active server, with two calls per server (not one per account). From `listaccts`: disk used and disk limit in MB (an `unlimited` limit is not stored). From `showbw`: bandwidth used, converted from bytes to MB, and the bandwidth limit when it is above zero. cPanel is the only one of these panel modules that records both limits, which [overage billing](../concepts/servers-and-modules.md#what-the-module-does) compares against.

### Not supported

- **Login to panel** (single sign-on): the module has no sign-in link, so the customer's service page shows no **Login to panel** button. Customers sign in to cPanel themselves with their username and password.
- **Listing or importing existing accounts** from the server.
- Hosting tools inside the PNLCS client area (files, mail, databases, DNS): customers do that in cPanel.
- Reseller accounts and dedicated IP addresses: the module only sends the fields listed above.

## What the customer sees

The service page shows the server name, the cPanel username, and the server's hostname and IP address. The welcome email can include the username and password through the `service_username` and `service_password` merge fields.

## Error messages

| Message | Cause |
|---|---|
| `No cPanel/WHM server configured.` | No active cPanel server, or none with room in the product's server group |
| `Service is missing client or domain.` | The service has no domain |
| `cPanel account creation failed: <WHM reason>` | WHM refused `createacct`; its reason follows |
| `WHM API HTTP error <status>` | WHM answered with an HTTP error, for example 401 or 403 for a wrong or under-privileged token |
| `cPanel username not found in service notes.` | The service has no stored cPanel username. The retry queue does not retry this error |
| `Suspend failed: …`, `Unsuspend failed: …`, `Terminate failed: …`, `Password change failed: …`, `Package change failed: …` | WHM refused the action; its reason follows |

Failed create, suspend, unsuspend and terminate actions go to the retry queue; see [Provisioning did not happen](../troubleshooting/common-issues.md#provisioning-did-not-happen). Password and package changes are not queued: the error is shown at once.
