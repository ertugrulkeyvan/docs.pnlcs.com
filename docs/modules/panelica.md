---
sources:
  - modules/Servers/Panelica/PanelicaModule.php
  - modules/Servers/AbstractServerModule.php
  - app/Services/ProvisioningService.php
  - app/Services/DomainHosting.php
  - app/Http/Controllers/Admin/ConfigController.php
  - app/Http/Controllers/Admin/ProductController.php
  - app/Http/Controllers/Admin/ClientController.php
  - app/Http/Controllers/Client/ServiceController.php
  - resources/views/admin/config/servers.blade.php
  - resources/views/admin/products/edit.blade.php
  - lang/en/panelica.php
---

# Panelica hosting accounts

The `panelica` server module creates **customer accounts on a Panelica server**: one panel user per service, with the
service's domain added as its first website and, if the product sells one, an app installed on it. Customers then
manage their mailboxes, files, databases, FTP accounts, subdomains, cron jobs, DNS, backups and apps from their
PNLCS service page, or sign in to the panel with one click.

## Requirements

- **A Panelica server PNLCS can reach** on the panel's HTTPS port (8443 unless you changed it). All calls go to
  `https://<server>:<port>/api/external`.
- **An API key and its secret**, created in the panel under **Settings → API Keys**. The secret (`sk_live_...`)
  is shown only once there.
- **Create the key on a root or admin account, with full access (`*:*`).** The module works on every customer
  account on the server, and the [Live Servers](../guides/live-servers.md) sign-in fails with "The API key needs
  full access (`*:*`) and must belong to a root or admin account" otherwise. A key with fewer scopes works only for
  what its scopes cover: apps need the `docker:*` scopes, and the mail certificate request needs the SSL scope.
- **At least one plan** on the panel, unless every product uses [managed mode](#managed-mode).

The panel's certificate is **not verified**, so a self-signed certificate works. Requests are signed with
HMAC-SHA256 over the method, path, a timestamp and the body, using the secret, and carry the key in `X-API-Key`.

The module never installs Panelica, opens firewall ports or creates API keys.

## Configure PNLCS

1. In **Setup → Servers**, add a server of type **Panelica** (see [Connect a Server](../guides/connect-a-server.md)):
    - **Hostname**: the panel's host name, the name its certificate is for. The customer's webmail, phpMyAdmin
      and sign-in links are built from it.
    - **IP Address** (optional): when the host name does not resolve, or resolves to a different address, API
      calls go to this address instead.
    - **Port**: the panel port, 8443 by default.
    - **API Key**: the `pk_live_...` key. **API Secret**: the `sk_live_...` secret. Both are stored encrypted.
      Username is not used.
    - **Nameservers**: the servers customers' domains should use. [Set up on my hosting](#set-up-on-my-hosting)
      points domains at them.
2. Press **Test**. It passes when the port answers within five seconds and the panel's server status
   (`/v1/server/status`) answers `online` to a signed request.
3. Create the product, below.

An active server cannot be saved without the API Secret. The message says "A PANELICA server signs in with an API
key. Fill in the API key field": it is the **API Secret** box that is checked.

### What Test reports

| Message | Meaning |
|---|---|
| `Connection to <host>:<port> successful (… ms). Module: panelica` | The port is open, the key and secret were accepted and the panel is online |
| `Connection to <host>:<port> failed: …` | Nothing answered on that port within five seconds: wrong host or port, or a firewall |
| `Reached <host>, but PANELICA refused the credentials. Check the API key.` | The port answered, but the signed request failed or the panel did not report `online` |

## The product

On **Setup → Products/Services**, set **Server Module** to **Panelica**. Two parts of the form matter.

**Plan on the server** lists the panel's plans (read live from the first active Panelica server). This is the plan
a new account is created on. Left on **Use the server default**, no plan is sent and the panel applies its own
default, unless managed mode is on.

The **Panelica Resources** card holds the rest:

| Setting | Effect |
|---|---|
| **Managed mode** | PNLCS builds a panel plan from the limits in this card. See [Managed mode](#managed-mode) |
| **Or use an existing panel plan ID** | The plan used when a service **changes package** to this product. See [Package changes](#package-changes) |
| **App Hosting** | Install this app when the account is created and serve it on the customer's domain |
| **Customer picks the app** | The order form shows the app catalogue; the chosen app is installed |
| **Container plan** | Sells container resources only: no domain is asked for or created |
| Resource limits | CPU, RAM, inodes, IOPS, disk I/O, disk, bandwidth, processes, websites, subdomains, mailboxes, databases, FTP, cron jobs, containers, network, PHP memory, execution time and upload size, SSH access, quota mode, ModSecurity, backups. Used only in managed mode |

The apps options are described in [Sell Docker Apps](../guides/sell-docker-apps.md). A product that sells apps cannot
be saved with **Max Containers** at 0.

### Managed mode

With **Managed mode** ticked, each account creation first prepares a panel plan named `pnlcs-p<product id>`:

- If no plan of that name exists, it is created with the card's limits.
- If it exists, it is updated to the card's current limits.

The basic limits (disk, bandwidth, counts, SSH, backups) and the advanced ones (CPU, memory, processes, I/O,
network, containers, inodes, IOPS, quota mode, SSH level, ModSecurity, PHP limits) are both sent. Disk I/O in MB/s
is sent as bytes per second for reads and for writes; network in Mbit/s is sent as bytes per second. PHP's post size
follows the upload size. Cron jobs are switched off on the plan when **Max Cron** is 0.

If any of these calls is refused, the account is not created: "Managed plan could not be prepared on the panel; the
account was not created." The panel's answer is written to the log.

### Package changes

A package change (an upgrade, a downgrade, or staff choosing another product) moves the account to the plan in the
new product's **Or use an existing panel plan ID** field. It does not read **Plan on the server** and does not
build a managed plan. A product without that field set refuses package changes with "New product does not have a
panelica_plan_id configured." On products you upgrade between, set that field to the same plan as **Plan on the
server**.

## Creating an account

1. **Checks before anything is created.** The service needs a client and a domain (a container plan needs no
   domain). The domain must look like `name.extension`, and must not already exist on the server. A product that
   installs an app in managed mode with Max Containers at 0 is refused.
2. **Username.** The first label of the domain (for a container plan, the client's first and last name, or their
   email), lowercased, with everything but letters and digits removed, cut to 16 characters, followed by three
   random digits: `example.com` becomes for example `example482`.
3. **Password.** The service's password if it has one, otherwise 16 random hexadecimal characters. It is saved on
   the service, so it reaches the welcome email.
4. **The account** is created with the client's email and full name, on the product's **Plan on the server**, or
   on the managed plan in managed mode. The panel allows one account per email address: when it
   answers `emailAlreadyExists`, PNLCS tries once more with a tagged address, `name+pnlcs<service id>@domain`,
   which reaches the same inbox.
5. **The domain** is added to the account with PHP 8.3 and the `nginx_only` web server. If the panel refuses it,
   the account is deleted again.
6. **The app**, if the product installs one or the customer chose one. If it cannot be installed, the account is
   deleted again.

The service stores the panel user id, the domain id and, for an app, its container id. Every later action on the
service uses the stored user id.

There is no recovery for a create whose answer was lost. If the account was made but PNLCS did not hear back, the
next attempt stops at the domain check ("already exists on this server"); remove the account in the panel, or link
the service to it (below).

## Supported operations

- **Create**, as above.
- **Suspend** and **unsuspend** the panel account. The suspension reason is passed to the panel.
- **Terminate**: deletes the panel account. **This removes the customer's account from the server.** Take a backup
  first if you may need the data.
- **Change password** of the panel account. The new password is saved on the service.
- **Change package**: see [Package changes](#package-changes).
- **Usage**, every hour: disk used and disk quota in MB, and this month's bandwidth in MB, for each active service.
  A service without a stored panel user id, or one the panel gives no figures for, is counted as an error. The
  customer's service page also reads disk, bandwidth, counts of domains, mailboxes, FTP accounts and databases, and,
  on panels that report it, the account's own CPU and memory use, live.
- **Login to Control Panel**: the customer's button asks the panel for a single-use sign-in link for their account.
  It is refused for a cancelled, terminated or fraud service and for a service with no server.
- **Live Servers**: staff sign in to the panel as the owner of the API key. See [Live Servers](../guides/live-servers.md).
- **Link to an existing account**: see [Migrating existing accounts](#migrating-existing-accounts).
- **Set up on my hosting**: see below.

### Sign-in links

The panel is asked for a link to its host-name address. A panel that lists several addresses has the one whose host
is the server's **Hostname** chosen, then any host-name address. An older panel that returns a single link built on
an IP address has that address replaced with the server's hostname and port when the IP is private, or when it is
public and the hostname resolves to it, so the browser reaches a name the certificate covers.

### Set up on my hosting

A customer with an active Panelica service can put a domain they hold in PNLCS on that account, from the domain's
page (see [Sell Domains](../guides/sell-domains.md#set-up-on-my-hosting)). The domain is added to the account with the
PHP version and web server of the account's first domain; a domain already on the account counts as done. The
domain's nameservers are then set to the server's **Nameservers**.

## The customer's tools

A service linked to a panel account shows these on its page: mailboxes, files, databases (with a phpMyAdmin link),
FTP accounts, subdomains, cron jobs, DNS, backups, apps, and lists of the account's Laravel, Node.js and Python
apps. A container plan shows apps only.

Every one of them is limited to the account's own resources. The API key can see every account on the server, so
PNLCS checks each mailbox, database, record, file path, backup and container against the account's own domains or
user id before acting, and refuses with "That … does not belong to this service".

What they cannot do from PNLCS:

- **Restore a backup.** Customers can list, take and delete backups; restoring stays in the panel.
- **Create or deploy Laravel, Node.js or Python apps.** These are listed only; the panel does the rest.
- **Change the zone's own records.** SOA and NS records, and A records for `@` and `www`, are shown read-only.
  New records can be A, AAAA, CNAME, MX, TXT, SRV or CAA.

Limits are taken from the account's panel plan when PNLCS can read it, and left to the panel when it cannot.

When a domain gets its first mailbox, PNLCS asks the panel for the domain's mail certificate if it has none or the
last attempt failed. Mail settings and the DNS records a customer may need are described under the Panelica tab of
[Connect a Server](../guides/connect-a-server.md#credentials-by-type).

## Migrating existing accounts

To bill an account that already exists on the panel, open the client, use **Add Service**, choose the Panelica
server, leave **Create the account on the server now** unticked, and pick the account under **Link to an existing
account**. The list shows the panel's customer accounts (role USER), sorted by username. PNLCS stores the panel user
id and copies the username; from then on suspend, unsuspend, terminate, password and package changes and the
customer's tools act on that account.

A linked service has no stored domain id, so the mail certificate status and the mail DNS help are not shown for
it.

## Error messages

| Message | Cause |
|---|---|
| `No Panelica server configured.` | No active Panelica server, or none with room in the product's server group |
| `Service is missing client or domain.` | An order without a domain on a product that is not a container plan |
| `"<domain>" is not a valid domain name. It needs a name and an extension, like example.com.` | The domain has no dot or invalid characters |
| `The domain "<domain>" already exists on this server. Use a different domain, or remove it from the panel first.` | The domain is on the panel already |
| `Managed plan could not be prepared on the panel; the account was not created.` | The panel refused to create or update the `pnlcs-p<id>` plan |
| `Account creation failed: <panel message>` | The panel refused the account |
| `Domain creation failed (account rolled back): <panel message>` | The panel refused the domain; the account was deleted |
| `App installation failed (account rolled back): <reason>` | The app could not be installed; the account was deleted |
| `Panelica user ID not found in service notes.` | The service is not linked to a panel account. Not retried |
| `Suspend failed: the account does not exist on the Panelica server (user <id>).` | The panel reports the account missing, and a lookup confirms it. Not retried; the same wording is used for unsuspend and terminate |
| `New product does not have a panelica_plan_id configured.` | See [Package changes](#package-changes) |

Failed creates, suspends, unsuspends and terminates go to the module queue and are retried; see
[Scheduled Commands](../reference/scheduled-commands.md).

The module waits 10 seconds for the panel to accept a connection (5 seconds on a customer's own page) and 30 seconds
for most answers. Installing an app waits up to five minutes.
