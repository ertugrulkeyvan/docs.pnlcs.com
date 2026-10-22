---
sources:
  - modules/Servers/HestiaCP/
  - modules/Servers/AbstractServerModule.php
  - app/Services/ProvisioningService.php
  - app/Services/Module/ModuleRegistry.php
  - app/Http/Controllers/Admin/ConfigController.php
  - app/Http/Controllers/Admin/ProductController.php
  - resources/views/admin/config/servers.blade.php
  - resources/views/client/services/show.blade.php
---

# HestiaCP hosting accounts

The `hestiacp` server module creates and manages **HestiaCP users** through HestiaCP's API (`/api/`), which runs Hestia's `v-*` commands. Each PNLCS hosting service is one HestiaCP user on a HestiaCP package, with the service's domain added as a web domain.

This page covers what is specific to HestiaCP. Adding the server, server groups and linking products are in [Connect a Server](../guides/connect-a-server.md).

## Requirements

- HestiaCP with its API enabled, and the PNLCS server's IP address allowed to use it.
- An **access key** for the admin user, created on the server with:

    ```bash
    v-add-access-key 'admin' '*'
    ```

    It prints an Access Key ID and a Secret Access Key. HestiaCP 1.4 and later use access keys; older installs can still sign in with the admin username and password.
- HestiaCP's port (8083 by default) reachable from the PNLCS server.
- The **packages** your products sell, under **Packages** in HestiaCP.

The module does not verify the server's TLS certificate. Each call times out after 30 seconds.

The module never creates packages, access keys or firewall rules.

## Configure PNLCS

1. In **Setup → Servers**, add a server of type **HestiaCP**. Port: 8083.
2. **Access Key**: paste the two values joined by a colon, `ACCESS_KEY_ID:SECRET_ACCESS_KEY`. The module sends this as the API `hash`. Credentials are stored encrypted.
3. **Username** and **Admin Password**: only for the older login. They are sent (username default `admin`) only when the Access Key field is empty. A server saved as active needs one of the two; without either it is refused with "A HESTIACP server needs either an API key or a password before it can be used."
4. Save and press **Test**. PNLCS opens a TCP connection to the port, then runs `v-list-sys-info` and passes when HestiaCP answers with JSON. Wrong credentials or a blocked IP address give "Reached <host>, but HESTIACP refused the credentials. Check the API key."

Commands that change something are sent with `returncode=yes`, and HestiaCP must answer with a bare exit code; `0` is success. List commands are sent with `returncode=no` and must answer with JSON.

## Product settings

On the product, set **Server Module** to HestiaCP. The **Plan on the server** list is read from the first active HestiaCP server with `v-list-user-packages`, sorted by name. The package name is stored on the product.

Choose a package. A product that has never had a package saved creates users on the package named `default`; with **Use the server default** selected and saved, the module sends an empty package name, which HestiaCP is likely to refuse.

In a server group, give the package the same name on every server.

The list only offers what the server returned. If it cannot be read when you open the product, only **Use the server default** is offered, and saving the product then stores that in place of the plan it had.

## Creating an account

Create runs two commands:

1. `v-add-user <username> <password> <client email> <package>`
2. `v-add-domain <username> <domain>`

If the second command fails, the account is still reported as created and the service becomes active; the failure is only written to the log. Check that the domain exists in HestiaCP, or add it there.

A service without a client or a domain is refused with "Service is missing client or domain."

**Username rules.** The first label of the domain, lowercased, with everything except `a-z` and `0-9` removed, cut to 16 characters; `user` if nothing is left. Leading digits are kept, and a username typed on the service beforehand is not used. There is no retry with another name: `example.com` and `example.net` both give `example`, so the second of them fails.

**Password.** The service's password if one is set; otherwise 16 random hexadecimal characters.

The username and password are saved on the service, and the username in its module data (`hestia_username`). Later actions use the stored name.

## Supported operations

| Operation | HestiaCP command | Notes |
|---|---|---|
| Test connection | `v-list-sys-info json` | |
| List packages | `v-list-user-packages json` | For the product form |
| Create | `v-add-user`, then `v-add-domain` | See above |
| Suspend | `v-suspend-user` | |
| Unsuspend | `v-unsuspend-user` | |
| Terminate | `v-delete-user` | Deletes the user |
| Change password | `v-change-user-password` | |
| Change package | `v-change-user-package` | See below |
| Usage | `v-list-users json` | See below |

**Termination is destructive.** HestiaCP deletes the user with all its domains, mail, databases and files. Back up first.

**Change package** uses the new product's package. If the new product has none, it fails with "No hestia_package configured in product."

**Usage** is read every hour by `pnlcs:usage-polling`, with one `v-list-users` call per server. Disk used (`U_DISK`), bandwidth used (`U_BANDWIDTH`), disk limit (`DISK_QUOTA`) and bandwidth limit (`BANDWIDTH`) are stored in MB when they are numbers; an `unlimited` limit is not stored.

### Not supported

- **Login to panel** (single sign-on): no **Login to panel** button is shown. Customers sign in to HestiaCP with their username and password.
- **Listing or importing existing users** from the server.
- Live usage on the customer's service page: the module can read it (`v-list-user`), but the service page only shows live figures for Panelica services.

## What the customer sees

The service page shows the server name, the HestiaCP username, and the server's hostname and IP address. The welcome email can include the username and password through the `service_username` and `service_password` merge fields.

## Error messages

| Message | Cause |
|---|---|
| `No HestiaCP server configured.` | No active HestiaCP server, or none with room in the product's server group |
| `Account creation failed: HestiaCP command failed (exit code <n>)` | `v-add-user` failed, for example the username already exists or the package does not |
| `HestiaCP API HTTP <status>` | HestiaCP answered with an HTTP error |
| `Unexpected HestiaCP response: <text>` | A command answered with something other than an exit code, usually an error text about the key or the IP address |
| `HestiaCP returned non-JSON: <text>` | A list command answered with an error text instead of JSON |
| `HestiaCP username not found.` | The service has no stored username |
| `No hestia_package configured in product.` | Package change to a product without a package |
| `Suspend failed: …`, `Unsuspend failed: …`, `Terminate failed: …`, `Password change failed: …`, `Package change failed: …` | HestiaCP refused the action |

Failed create, suspend, unsuspend and terminate actions go to the retry queue; see [Provisioning did not happen](../troubleshooting/common-issues.md#provisioning-did-not-happen).
