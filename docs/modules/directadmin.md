---
sources:
  - modules/Servers/DirectAdmin/
  - modules/Servers/AbstractServerModule.php
  - app/Services/ProvisioningService.php
  - app/Services/Module/ModuleRegistry.php
  - app/Http/Controllers/Admin/ConfigController.php
  - app/Http/Controllers/Admin/ProductController.php
  - resources/views/admin/config/servers.blade.php
  - resources/views/client/services/show.blade.php
---

# DirectAdmin hosting accounts

The `directadmin` server module creates and manages **DirectAdmin user accounts** through DirectAdmin's `CMD_API_*` commands. Each PNLCS hosting service is one DirectAdmin user with the service's domain, on a DirectAdmin user package.

This page covers what is specific to DirectAdmin. Adding the server, server groups and linking products are in [Connect a Server](../guides/connect-a-server.md).

## Requirements

- A DirectAdmin admin (or reseller) account. Users are created under the account PNLCS signs in with, and the package list is that account's user packages.
- Its password, or a DirectAdmin **login key** for it. A login key must allow the commands the module uses: `CMD_API_ACCOUNT_USER`, `CMD_API_SELECT_USERS`, `CMD_API_USER_PASSWD`, `CMD_API_MODIFY_USER`, `CMD_API_SHOW_USER_USAGE`, `CMD_API_SHOW_USER_CONFIG`, `CMD_API_PACKAGES_USER` and `CMD_API_SHOW_ALL_USERS`. If you restrict the key to IP addresses, include the PNLCS server's.
- DirectAdmin's HTTPS port (2222 by default) reachable from the PNLCS server.
- At least one **user package** in DirectAdmin. Accounts are created on the server's shared IP address.

The module does not verify the server's TLS certificate. Each call times out after 30 seconds.

The module never creates packages, opens ports or changes DirectAdmin settings.

## Configure PNLCS

1. In **Setup → Servers**, add a server of type **DirectAdmin**. Port: 2222.
2. **Username**: the admin or reseller account.
3. Either the account's password in the **Password / Login Key** field, or a login key in the **Access Hash** field. The module signs in with HTTP Basic authentication: the username, and the Access Hash when it is filled in, otherwise the password. Credentials are stored encrypted. A server saved as active needs one of the two; without either it is refused with "A DIRECTADMIN server needs either an API key or a password before it can be used."

    !!! note
        The form says Access Hash is "Not used by DirectAdmin". It is used: a login key there takes precedence over the password.

4. Save and press **Test**. PNLCS opens a TCP connection to the port, then requests `CMD_API_SHOW_ALL_USERS`.

    !!! warning "A passing test does not prove the credentials"
        The test passes on any successful HTTP answer. DirectAdmin answers wrong credentials with its login page, which can also be a successful answer, so Test can pass with a bad password. Check that the product form lists the server's packages: that call does detect the login page.

## Product settings

On the product, set **Server Module** to DirectAdmin. The **Plan on the server** list is read from the first active DirectAdmin server with `CMD_API_PACKAGES_USER`, sorted by name. The package name is stored on the product.

Choose a package. A product that has never had a package saved creates accounts on the package named `Default`; with **Use the server default** selected and saved, the module sends an empty package name, which DirectAdmin is likely to refuse.

In a server group, give the package the same name on every server.

The list only offers what the server returned. If it cannot be read when you open the product, only **Use the server default** is offered, and saving the product then stores that in place of the plan it had.

## Creating an account

On create, the module posts to `CMD_API_ACCOUNT_USER` with `action=create` and:

| Field | Value |
|---|---|
| `username` | See below |
| `email` | The client's email address |
| `passwd`, `passwd2` | The service's password if one is set, otherwise 16 random letters and digits |
| `domain` | The service's domain |
| `package` | The product's package |
| `ip` | `shared` |
| `notify` | `no`: DirectAdmin sends no email of its own |

**Username rules.** If the service already has a username, it is lowercased and stripped to `a-z` and `0-9`; when the result does not start with a digit, its first 10 characters are used. Otherwise the username comes from the first label of the domain, lowercased, stripped to `a-z0-9`, with leading digits removed. When that is shorter than 4 characters, the service id is appended (`user` and the id when nothing is left). The result is cut to 10 characters.

There is no retry with another name: if the username is taken, creation fails with DirectAdmin's message.

The username and password are saved on the service, and the username in its module data (`da_username`). Later actions use the stored name.

## Supported operations

| Operation | DirectAdmin command | Notes |
|---|---|---|
| Test connection | `CMD_API_SHOW_ALL_USERS` | See the warning above |
| List packages | `CMD_API_PACKAGES_USER` | For the product form |
| Create | `CMD_API_ACCOUNT_USER` | See above |
| Suspend | `CMD_API_SELECT_USERS` with `suspend=Suspend` | |
| Unsuspend | `CMD_API_SELECT_USERS` with `suspend=Unsuspend` | |
| Terminate | `CMD_API_SELECT_USERS` with `delete=yes` | Deletes the user |
| Change password | `CMD_API_USER_PASSWD` | |
| Change package | `CMD_API_MODIFY_USER` with `action=package` | See below |
| Usage | `CMD_API_SHOW_USER_USAGE` and `CMD_API_SHOW_USER_CONFIG` | See below |

**Termination is destructive.** DirectAdmin deletes the user with its domains, files, mail and databases. Back up first.

**Change package** uses the new product's package. When the new product has none, the module sends the **new product's name** as the package name. Without a username or package it fails with "Missing server, username, or package name."

**Usage** is read every hour by `pnlcs:usage-polling`, two calls per active service: disk and bandwidth used from `CMD_API_SHOW_USER_USAGE` (`quota` and `bandwidth`, in MB), and the limits from `CMD_API_SHOW_USER_CONFIG` when they are numbers. An `unlimited` limit is not stored.

### Not supported

- **Login to panel** (single sign-on): no **Login to panel** button is shown. Customers sign in to DirectAdmin with their username and password.
- **Listing or importing existing users** from the server.
- Dedicated IP addresses or reseller accounts: accounts are always created as users on the shared IP.

## What the customer sees

The service page shows the server name, the DirectAdmin username, and the server's hostname and IP address. The welcome email can include the username and password through the `service_username` and `service_password` merge fields.

## Error messages

| Message | Cause |
|---|---|
| `No server assigned to this service.` | No active DirectAdmin server, or none with room in the product's server group |
| `Failed to create DirectAdmin account: <message>` | DirectAdmin refused, for example a username or domain already in use or an unknown package |
| `DirectAdmin authentication failed (login page returned)` | DirectAdmin answered with its login page: wrong username, password or login key, or a login key without the command |
| `Missing server or DirectAdmin username.` | The service has no stored username |
| `Missing server, username, or package name.` | Package change without a username or package |
| DirectAdmin's own `text` | Any other refusal |

Failed create, suspend, unsuspend and terminate actions go to the retry queue; see [Provisioning did not happen](../troubleshooting/common-issues.md#provisioning-did-not-happen).
