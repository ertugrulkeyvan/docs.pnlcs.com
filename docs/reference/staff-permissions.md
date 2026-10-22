---
sources:
  - app/Constants/Permissions.php
  - routes/admin.php
  - app/Http/Middleware/CheckAdminPermission.php
  - app/Models/AdminRole.php
  - app/Support/ApiPermissionMap.php
  - app/Services/AdminSearch.php
  - app/Widgets/
  - app/Http/Controllers/Admin/DashboardController.php
  - resources/views/admin/config/admin-roles.blade.php
  - resources/views/admin/layouts/app.blade.php
  - modules/Ksef/routes.php
  - modules/Servers/PanelicaLicense/routes.php
---

# Staff Permissions

Every staff permission a role can grant, and what each one opens: admin pages,
buttons, dashboard widgets and API calls. How to create roles and staff
accounts is in [Staff and roles](../guides/staff-and-roles.md).

There are 46 permissions, in 10 groups. The role editor (**Setup → Admin
Roles**) shows each one as its key with spaces for the underscores
(`list_clients` is **list clients**), under the group names below.

## How the checks work

- A role with **Full administrator** ticked has every permission, including
  ones added in later versions. Its own list of ticked boxes is ignored.
- Every admin page sits behind one permission. A few read-only pages accept
  either of two (`list_quotes` or `manage_quotes`, for example); having one is
  enough. A missing permission answers *403 Insufficient permissions*.
- **List** permissions open the list pages; **view** permissions open one
  record's page. Staff who can list invoices but not view them see the list
  and cannot open an invoice. Give both for normal use.
- The admin search box shows each kind of result only to staff who may open
  it: clients need `view_clients`, invoices `view_invoices`, services
  `view_services`, domains `manage_domains`, tickets `view_tickets`, orders
  `view_orders`, settings pages `manage_settings`.
- [API credentials](../api/index.md#authentication) act with the permissions
  of the staff account that owns them. Each API call needs the permission
  named in the tables below; calls not covered (the SSL calls among them) need
  a full administrator.

Open to every member of staff, whatever the role: the dashboard, the search
box, **My Account** and two-factor setup, the **To-Do List**, the
**Calendar**, **WHOIS Lookup** and **API Documentation**.

For the API, the client, invoice, order, service, domain and ticket calls
follow one rule: reading (a `GET` call) needs the area's **list** permission;
a call whose name starts with `add` or `create` needs the **create**
permission where the area has one; `delete…` needs the **delete** permission
where there is one; anything else needs the **manage** (or **edit**)
permission.

## Clients

| Permission | Opens |
|---|---|
| `list_clients` | The client list (`/admin/clients`) and its CSV export; the billing identity table and its CSV. The **Clients** dashboard widget. API: client reads, `getemails`, `getuserpermissions` |
| `view_clients` | A client's page (`/admin/clients/{id}`), and downloading that client's personal data from it. Client results in the search. API: `validatelogin` |
| `create_clients` | **Add New Client**, and its dashboard shortcut. API: client calls starting with `add` or `create` |
| `edit_clients` | Editing a client; admin notes; adding a service or domain to a client by hand (and listing a server's accounts to pick one); **Login as Client** and ending it; **Setup → Client Groups**. API: other client writes, `updateadminnotes`, `createssotoken`, `createclientinvite`, `updateuserpermissions`, `resetpassword` |
| `delete_clients` | Deleting a client. API: client calls starting with `delete` |

## Orders

| Permission | Opens |
|---|---|
| `list_orders` | The order list (`/admin/orders`). The **Orders** dashboard widget. API: order reads |
| `view_orders` | An order's page. Order results in the search |
| `manage_orders` | **New Order**; accepting, cancelling, marking as fraud and deleting orders; bulk order actions; changing the domain on an order's service. The order list's action buttons and the pending-orders count on the dashboard. API: every order call that is not a read |

## Invoices

| Permission | Opens |
|---|---|
| `list_invoices` | The invoice list (`/admin/invoices`) and its CSV export. API: invoice reads |
| `view_invoices` | An invoice's page and its PDF. Invoice results in the search |
| `create_invoices` | **Create Invoice**, and invoicing selected items in bulk (`/admin/bulk/invoice`). The dashboard shortcut. API: invoice calls starting with `add` or `create` |
| `manage_invoices` | On an invoice: mark paid, **Charge now**, release a charge held for review, cancel, refund, send, remind, and add, change or remove lines. Adding credit to a client (and the link on the client's page). **Payment Notifications** (approving or rejecting customers' transfer receipts). **Billable Items**. Bulk invoice actions. The unpaid-invoice and charge-review counts on the dashboard. API: other invoice writes and all invoice deletes |

## Products

| Permission | Opens |
|---|---|
| `list_products` | **Products/Services** (`/admin/products`), the package list and the Proxmox catalogue view. API: `getproducts` |
| `manage_products` | Creating, editing and deleting products and product groups; product custom fields; the invoice product catalogue; Proxmox options on a product; the Docker app catalogue; **Product Addons**, **Product Bundles** and configurable options; **Manage extensions** (`/admin/config/addons/modules`: switching extensions on and off and their settings). With the modules on: the **KSeF Status** pages and the **Panelica Licenses** page. Dashboard shortcuts to products |

## Services

| Permission | Opens |
|---|---|
| `list_services` | The service list (`/admin/services`) and the SSL certificate list (`/admin/ssl-orders`). The **Services** dashboard widget. API: service reads, `getmodulequeue` |
| `view_services` | A service's page; an SSL order's page and its certificate download. Service results in the search |
| `manage_services` | Server actions on a service (create, suspend, unsuspend, terminate and the module's own buttons); VPS power, password, reinstall, snapshots and backups, and their status and graphs; addons on a service; next due date, custom fields, status and the rest of the service form; deleting a service; bulk service changes; importing SSL orders and acting on them; attaching a Panelica license. API: every service call that is not a read |

## Domains

| Permission | Opens |
|---|---|
| `list_domains` | The domain list (`/admin/domains`) and the log of domain searches. The **Domains** dashboard widget. API: domain reads |
| `manage_domains` | A domain's page and everything on it: sync, register, renew, nameservers, lock, auto-renew, EPP code, ID protection, contacts, glue records, changing registrar and moving the domain to another client. Domain results in the search. API: every domain call that is not a read, except `createorupdatetld` (that needs `manage_servers`) |

## Tickets

| Permission | Opens |
|---|---|
| `list_tickets` | The ticket list (`/admin/tickets`). The **Support** dashboard widget and the open-tickets count. API: ticket reads |
| `view_tickets` | A ticket's page. Ticket results in the search |
| `reply_tickets` | Opening a ticket for a client, replying, and adding or deleting staff notes on a ticket. API: ticket calls with `reply` or `openticket` in the name |
| `manage_tickets` | Changing a ticket's status, department, priority and assigned staff (the options panel); deleting tickets, one at a time or in bulk. API: other ticket writes and deletes |

## Configuration

| Permission | Opens |
|---|---|
| `manage_staff` | **Admin Accounts** and **API Credentials**. The **Staff Online** dashboard widget. API: `getadminusers`, `getadmindetails`, `getstaffonline` and the credential calls |
| `manage_roles` | **Admin Roles**: creating, editing and deleting roles. Staff can only grant permissions they hold themselves |
| `manage_currencies` | **Currencies**: adding, editing, deleting, choosing the default, the automatic rate setting and updating the rates by hand |
| `manage_tax` | **Tax Rules** |
| `manage_servers` | **Servers** (with their test and the Proxmox image list), **Server Groups**, **Live Servers** and signing in to a server's panel from there, **Domain Pricing**, and **SSL Modules** (their settings and connection test). API: `getservers`, `createorupdatetld` |
| `manage_gateways` | **Payment Gateways** and their settings |
| `manage_registrars` | **Domain Registrars**: settings, connection test and the balance check. The **Registrar balance** dashboard widget. API: `getregistrars` |
| `manage_promotions` | **Promotions** (promo codes). API: `getpromotions` |
| `manage_email_templates` | **Email Templates** (editing and resetting) and **Mass Email** to clients. API: `getemailtemplates`, `sendemail`, `sendadminemail` |
| `manage_ticket_config` | **Ticket Departments**, **Ticket Statuses** (and the auto-close setting), **Predefined Replies**, ticket escalation rules and the **Ticket Spam Filter** |
| `manage_announcements` | **Announcements**. API: the announcement calls |
| `manage_kb` | **Knowledge Base** (categories and articles), **Downloads** and **Network Issues** |
| `manage_security` | **Banned IPs** and **Banned Emails**; also opens **System Database** and **PHP Info** (as `view_system` does). API: `addbannedip` |
| `manage_affiliates` | **Affiliates**: the list, an affiliate's page, editing, payouts and moving commission to credit. API: `getaffiliates`, `affiliateactivate` |

## Reports & System

| Permission | Opens |
|---|---|
| `view_reports` | **Reports** (each report and its export) and **Transactions**. The **Billing** dashboard widget |
| `manage_settings` | **General Settings** (and its test email), **Log Retention**, **Appearance** (themes, logo, favicon, colours, homepage sections, white-label, dark mode), **Custom Fields**, **Modules** (switching server, registrar and other modules on and off), **Notification Channels**, **Automation Status**, **Languages** and the translation editor, and **Import WHMCS**. Settings pages in the search. API: `SystemApiController` writes not named elsewhere |
| `view_activity_log` | **Activity Log** and **System Logs** (with the gateway, module and email logs). The **Recent Activity** dashboard widget. API: `getactivitylog`, `logactivity` |
| `view_system` | **System Database** and **PHP Info**. The **System Health** and **Automation** dashboard widgets. API: `SystemApiController` reads not named elsewhere |
| `manage_updates` | **Setup → Updates**: checking for, preparing and applying PNLCS updates, choosing the channel, deciding conflicts. Replaces the application's own code, so keep it to people you would trust with the server |

## Quotes & Projects

| Permission | Opens |
|---|---|
| `list_quotes` | The quote list and a quote's page. API: `getquotes` |
| `manage_quotes` | Everything `list_quotes` opens, plus creating, editing and deleting quotes, sending them, converting one to an invoice, and marking it accepted or declined. API: `createquote`, `updatequote`, `deletequote`, `sendquote`, `acceptquote` |
| `list_projects` | The project list and a project's page. API: `getproject`, `getprojects` |
| `manage_projects` | Everything `list_projects` opens, plus creating, editing and deleting projects, their tasks and messages. API: the other project calls, task timers included |
