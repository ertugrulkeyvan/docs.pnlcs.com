---
sources:
  - app/Support/ClientPermissions.php
  - app/Http/Middleware/CheckClientPermission.php
  - routes/client.php
  - lang/en/client.php
  - app/Http/Controllers/Client/AccountUserController.php
  - app/Http/Controllers/Client/AccountController.php
---

# Client Permissions

The 13 permissions a login can hold on a client account, and the client area
pages each one opens. How logins, owners and invitations work is in
[Client logins and permissions](../guides/client-logins-and-permissions.md).

## How the checks work

- The account's **owner** always has all 13.
- Another login has the set it was given when invited, or that the owner (or
  the API's [updateuserpermissions](../api/clients.md#updateuserpermissions))
  set later. A login whose set was never restricted has all 13; that is how
  logins made before permissions existed keep their access.
- Each client area page is matched to at most one permission by its route
  name. A login without it gets *403: Your login does not have access to this
  part of the account. Ask the account owner.*
- The check is made against the account the login is working in, so a login
  on several accounts can hold different permissions on each.
- The API takes the set as a comma list of the keys below, or `all`.

## The permissions

The label is what the owner sees on the client area's **Users** page.

| Key | Label | Opens |
|---|---|---|
| `profile` | Profile | **My Profile**: the account's name, address and billing details, and saving them |
| `contacts` | Contacts | **Contacts**: listing, adding, editing and deleting the account's contacts |
| `products` | View services | The service list and a service's page; usage figures; a VPS's status, graphs and its lists of snapshots and backups; the SSL certificate list and a certificate's page |
| `manageproducts` | Manage services | Every other service page: the module's buttons; VPS power, password, reinstall, and taking or restoring snapshots and backups; cancellation and upgrade requests, configurable option upgrades; auto-renew, renewing and changing the billing cycle; adding and cancelling addons; the hosting tools (email accounts, FTP, subdomains, cron jobs, DNS, backups, databases, the file manager, Laravel, Node.js and Python apps, Docker containers). For SSL: configuring a certificate, approver emails, downloading it and resending validation |
| `productsso` | Open control panels | A service's **Login to Control Panel** button (one-click sign-in to the hosting panel), and the links that go through it: downloading a hosting backup and opening a container's terminal |
| `domains` | View domains | The domain list and a domain's page |
| `managedomains` | Manage domains | Every other domain page: transfer in, renewing (one or several), nameservers, linking hosting, lock, auto-renew, ID protection, domain contacts, glue records, restore, the EPP code, offering a domain to another account; and accepting, declining or withdrawing such an offer |
| `invoices` | Invoices and payments | Invoices (list, page, PDF), paying several at once, paying with credit, telling you about a bank payment; stored payment methods and cards, the default card and automatic charging; adding funds to the account |
| `quotes` | Quotes | Quotes: list, page, accepting and declining |
| `tickets` | Support tickets | Support tickets: list, opening one, replying, closing, rating, and attachments |
| `affiliates` | Affiliates | The affiliate programme: joining, the referral code, withdrawals and moving commission to account credit |
| `emails` | Emails | The history of emails sent to the account |
| `orders` | Place orders | The checkout (**Checkout** and placing the order). Browsing the store and filling the cart need no permission |

## Pages open to every login

These have no permission and open to any login on the account: the client
area home page, downloads, the knowledge base, announcements, network status,
the store, domain search and the cart (up to the checkout), and the login's
own things: password, two-factor authentication, the **Security** page
(sign-in history and sessions), phone verification, email verification, and
switching accounts.

Two pages are kept to the **owner** by their own check, whatever the
permissions: **Users** (inviting logins and setting what they may do) and
**Your data** (the download of everything kept about the account).
