---
sources:
  - resources/views/admin/layouts/app.blade.php
  - lang/en/admin.php
  - lang/en/whmcs_import.php
  - routes/admin.php
  - routes/api.php
  - app/Http/Controllers/Api/
  - app/Providers/HookServiceProvider.php
  - app/Contracts/
  - app/Enums/
  - app/Http/Controllers/Admin/SettingController.php
  - app/Services/Mail/ImapMailboxClient.php
---

# WHMCS to PNLCS

Where to find what you know from WHMCS. Most names are the same; this page
lists where each one lives in PNLCS, the ones that are named differently, and
what PNLCS does not have. For moving your data, see
[Migrate from WHMCS](../guides/migrate-from-whmcs.md).

## Records and statuses

| WHMCS | PNLCS |
|---|---|
| Client | Client: the account you bill ([Concepts](../concepts/products-services-orders-invoices.md)) |
| User (a person who signs in) | Login. One account can have several logins, one login can open several accounts ([Client logins](../guides/client-logins-and-permissions.md)) |
| Contact | Contact. As in WHMCS, a contact is not a login |
| Product/Service (what a client owns) | Service |
| Product (what you sell) | Product, in a product group |
| Product addon | Product addon (**Setup → Product Addons**, [guide](../guides/promotions-and-addons.md)) |
| Configurable options | Configurable options ([below](#setup-menu)) |
| Order, invoice, quote, transaction, credit | Same names |
| Service statuses | Pending, Active, Suspended, Terminated, Cancelled, Fraud, Completed: the WHMCS set |
| Invoice statuses | Draft, Unpaid, Paid, Cancelled, Refunded, Collections, Payment Pending, plus **Overdue** and **Partially Paid**, which are statuses of their own in PNLCS |
| Order statuses | Pending, Active, Cancelled, Fraud. There is no screen to add your own |
| Login as Client | **Login as Client** on the client's page ([details](../guides/client-logins-and-permissions.md#signing-a-customer-in-for-them)) |

## Top menu

| WHMCS | PNLCS |
|---|---|
| Clients → View/Search Clients, Add New Client, Products/Services, Domains | **Clients** menu, same entries, plus **Billing identity** and **SSL Certificates** |
| Clients → Manage Affiliates | **Billing → Affiliates** ([Affiliates](../guides/affiliates.md)) |
| Clients → Cancellation Requests | No list in the admin area. Requests are carried out by the daily run ([Scheduled commands](scheduled-commands.md)); the API's `getcancelledpackages` lists them |
| Clients → Mass Mail Tool | **Mass Email**, a page with no menu entry: open `/admin/bulk/mass-email`. Picks clients by product, server, group, status or domain extension |
| Orders → List All Orders, Pending, Active, Fraud, Cancelled | **Orders** menu, same entries |
| Orders → Add New Order | **Add New → New Order** |
| Billing → Invoices, Transactions List, Billable Items, Quotes | **Billing** menu: **Invoices**, **Transactions**, **Billable Items**, **Quotes** |
| Billing → Gateway Log | **Utilities → System Logs**, then **Gateway Logs** in the sidebar |
| Support → Support Tickets, Open New Ticket | **Support → Support Tickets**, **Open Ticket** ([Support desk](../guides/support.md)) |
| Support → Announcements, Downloads, Knowledgebase, Network Issues | **Support** menu, same entries (**Knowledge Base**) |
| Support → Predefined Replies | **Setup → Predefined Replies** |
| Reports | **Reports** |
| Addons menu | **Extensions** menu, shown only while an active addon adds pages ([Modules](../guides/modules.md#extensions)) |

## Utilities menu

| WHMCS | PNLCS |
|---|---|
| Calendar, To-Do List, WHOIS Lookup | **Utilities** menu, same names |
| System → Automation Status | **Utilities → Automation Status** |
| System → Database Status | **Utilities → System Database** |
| System → PHP Info | **Utilities → PHP Info** |
| System → Update WHMCS | **Setup → Updates** ([Updating](../install/updating.md)) |
| Logs → Activity Log | **Utilities → Activity Log** |
| Logs → Module Log, Email Message Log | **Utilities → System Logs**, then **Module Logs** or **Email Logs** in the sidebar |
| (none) | **Utilities → Import WHMCS** reads clients, domains and services from a WHMCS database ([guide](../guides/migrate-from-whmcs.md#import-from-the-whmcs-database)) |

## Setup menu

| WHMCS | PNLCS |
|---|---|
| General Settings | **Setup → General Settings**, one page of cards ([General Settings](general-settings.md)) |
| Automation Settings | The **Automation**, **Automatic Payment** and **Late Fees** cards on **General Settings**. Run times are fixed ([Scheduled commands](scheduled-commands.md)) |
| Fraud Protection | **General Settings → Fraud Screening** (MaxMind, FraudLabs Pro; [guide](../guides/fraud-screening.md)) |
| Sign-In Integrations | **General Settings → Social Login** (Google, GitHub) |
| Staff Management → Administrator Users, Administrator Roles | **Setup → Admin Accounts**, **Admin Roles** ([Staff and roles](../guides/staff-and-roles.md)) |
| Staff Management → Manage API Credentials | **Setup → API Credentials** |
| Payments → Currencies, Payment Gateways, Promotions | **Setup → Currencies**, **Payment Gateways**, **Promotions** |
| Payments → Tax Configuration | **Setup → Tax Rules** ([Tax rules](../guides/tax-rules.md)) |
| Products/Services → Products/Services | **Setup → Products/Services**; product groups from the sidebar |
| Products/Services → Configurable Options | **Configurable Options**, with no menu entry: reached from a Proxmox product, or at `/admin/config/config-options` ([guide](../guides/promotions-and-addons.md)) |
| Products/Services → Product Addons, Product Bundles | **Setup → Product Addons**, **Product Bundles** |
| Products/Services → Domain Pricing, Domain Registrars, Servers | **Setup → Domain Pricing**, **Domain Registrars**, **Servers**, **Server Groups** |
| Support → Support Departments | **Setup → Ticket Departments**, where email import is also set up ([Support mail piping](../guides/support-mail-piping.md)) |
| Support → Ticket Statuses | **Setup → Ticket Statuses** |
| Support → Escalation Rules | **Ticket Escalation**, with no menu entry ([details](../guides/support-mail-piping.md#escalation-rules)) |
| Support → Spam Control | **Setup → Ticket Spam Filter** |
| Email Templates | **Setup → Email Templates** |
| Addon Modules | **Extensions** page in the settings sidebar ([Modules](../guides/modules.md#extensions)) |
| Client Groups | **Setup → Client Groups** |
| Custom Client Fields | **Setup → Custom Fields** ([Custom client fields](../guides/custom-fields.md)) |
| Notifications | **Setup → Notification Channels** |
| Other → Banned IPs, Banned Emails | **Setup → Banned IPs**, **Banned Emails** |
| Other → Database Backups | The nightly `pnlcs:db-backup` ([Backups](../install/backups.md)) |
| (none) | **Setup → Modules**, one list of every server, gateway, registrar, SSL and addon module ([Modules](../guides/modules.md)) |
| (none) | **Setup → Appearance**: themes, logo, colours, home page ([Themes and branding](../guides/themes-and-branding.md)) |
| (none) | **Setup → Languages**: languages and translations ([Languages](../guides/languages.md)) |

## Behind the scenes

| WHMCS | PNLCS |
|---|---|
| `cron.php` | One cron line running `php artisan schedule:run` every minute ([Scheduled commands](scheduled-commands.md)) |
| Email piping (`pipe.php`) or POP3 import | Mailbox import only: PNLCS reads each department's mailbox over IMAP or POP3 every 5 minutes ([Support mail piping](../guides/support-mail-piping.md)) |
| `configuration.php` | The `.env` file in the install folder (database, `APP_URL`) |
| Custom admin folder | None. The admin area is always at `/admin`; the **Admin Login URL Prefix** setting is saved but not used |
| Client area templates (Smarty `.tpl`) | Themes with a `theme.json`, chosen under **Setup → Appearance** ([Themes](../developer/themes.md)) |
| Provisioning (server), registrar and gateway modules | Server, registrar, gateway and SSL modules: a class implementing PNLCS's interface plus a `pnlcs.json` manifest ([Writing a module](../developer/modules.md)). WHMCS module files do not load in PNLCS |
| Module functions `CreateAccount`, `SuspendAccount`, `UnsuspendAccount`, `TerminateAccount`, `ChangePassword`, `ChangePackage` | Server module methods `create`, `suspend`, `unsuspend`, `terminate`, `changePassword`, `changePackage` |

## Hooks

`add_hook()` works as in WHMCS, but each hook gets PNLCS objects, not WHMCS
arrays ([Hooks](../developer/hooks.md)). These names differ:

| WHMCS hook | PNLCS |
|---|---|
| `InvoiceRefunded` | `RefundIssued` |
| `AcceptQuote` | `QuoteAccepted` |
| `TicketUserReply`, `TicketAdminReply` | `TicketReplied`, with `isStaffReply` telling them apart |
| `AfterModuleChangePassword` | `AfterModulePassword` |

These WHMCS names fire next to a PNLCS name for the same moment:

| WHMCS hook | Also fires as |
|---|---|
| `InvoiceCreation` | `InvoiceCreated` |
| `AfterShoppingCartCheckout` | `OrderPlaced` |
| `AfterRegistrarRegistration` | `DomainRegistered` |
| `AfterRegistrarRenewal` | `DomainRenewed` |
| `AfterRegistrarTransfer` | `DomainTransferStarted` |
| `ClientAdd` | `ClientCreated` |
| `ClientLogin` | `UserLogin` |
| `TicketOpen` | `TicketOpened` |
| `TicketClose` | `TicketClosed` |

Any WHMCS hook not listed on the [Hooks](../developer/hooks.md#hook-points)
page never fires in PNLCS.

## API

| WHMCS | PNLCS |
|---|---|
| `https://your-whmcs/includes/api.php` with `action=GetClients` | `https://example.com/api/v1/getclients`: the action name, in lower case, is part of the address |
| `identifier` and `secret` parameters | The same, or the `X-API-Key` and `X-API-Secret` headers |
| Every action by POST | GET for actions that read, POST for actions that change |
| `WhmcsDetails` | `whmcsdetails`, and `pnlcsdetails` |
| `EncryptPassword`, `DecryptPassword`, `CapturePayment`, `AddPayMethod`, `DomainRelease` | Answer `501`: not offered |
| `GetClientPassword` | Answers `403` |

Details: [Coming from WHMCS](../api/index.md#coming-from-whmcs), and
[All endpoints](../api/all-endpoints.md).

## Not in PNLCS

- **MarketConnect** and its resold services.
- **Offline credit card processing.** Card numbers never pass through PNLCS:
  customers enter them on the gateway's own form, and the gateway stores
  them ([Stored cards](../guides/payment-gateways.md#stored-cards-and-automatic-payment)).
- **Custom order statuses**, link tracking and security questions: no screen
  or setting for them.
- **A custom admin folder** (see above).
- **Email piping by script** (see above).
