# Content audit, 2026-10-06

Every page was checked against PNLCS `main` at **2d724001**. Paths in brackets are in the PNLCS repository.
Tick an item when the page is fixed; when a whole page is done, add `sources:` to its front matter and
run `python3 tools/upstream.py mark <commit>` once the batch is in.

Tags: **W** wrong · **O** outdated · **M** missing.

## In sync, generated from code

- [x] `api/*` (except `index.md`) and `api/openapi.json`: `php artisan pnlcs:api-docs --check` passes, 171 actions.
      Regenerate inside a PNLCS checkout (`DB_CONNECTION=sqlite DB_DATABASE=:memory:` is enough) and copy the files over.
- [x] `mcp/tools.md`: `node mcp/scripts/docs.mjs --check` passes, 22 tools (15 read, 7 write).
- [x] `api/index.md` M: `adminuser` is also accepted as the username parameter [app/Http/Middleware/ApiKeyAuth.php:37].
  - M: `adminpass` likewise; the password is sent as typed (WHMCS sends an MD5), checked with `Hash::check`.

## Install

PNLCS `docs/` changes up to **6af8ac59** (2026-10-20) are merged in: 13 pages updated, `developer/releasing.md` and
`modules/aapanel.md` added. Fixes below were checked against that commit.

- [x] `install/requirements.md` W: Node.js 18 → **20.19 or 22.12+** (vite 8, laravel-vite-plugin 3, rolldown) [package-lock.json].
- [x] `install/native.md`
  - W: `node -v # v18 or newer` → 20.19+.
  - W: the wizard seeds 32 email templates, not 25 [database/seeders/EmailTemplateSeeder.php].
  - W: the knowledge base comes from migrations, not the wizard's seeding; translations come from `lang/`; domain pricing is seeded too.
  - W: step 12.4 asks for **Application Name** (`APP_NAME`), not the company name.
  - M: wizard default language offers 12 locales; requirements step also checks `vendor/`, `public/build/`, `storage/framework`, `storage/logs`; admin needs a first name and a 6+ character password; the database step only skips when `migrations` exists.
- [x] `install/docker.md` W: invoice PDFs are rendered on demand, never stored [app/Services/InvoicePdfService.php].
- [x] `install/backups.md` W: same, "generated invoice PDFs" are not in `storage/`.
- [x] `install/security.md` M: reCAPTCHA switches; customer account protection (emailed code before EPP code / lock change); new-device sign-in alerts (template off by default); staff can be disabled (their API keys stop too); staff 2FA recovery codes; social login needs your own OAuth client.
- [x] `guides/deploy-plesk.md`
  - W: PHP `^8.4` now (installer checks ≥ 8.4.0); drop the 8.3 fallback.
  - W: `.node-version` does not exist.
  - W: extensions are bcmath, curl, dom, fileinfo, gd, intl, mbstring, openssl, pdo_mysql, tokenizer, xml, zip [InstallController.php:32-35].
  - W: the cron line should use `/opt/plesk/php/8.4/bin/php`.
  - M: the `/install` wizard vs `migrate --seed` (admin/admin123); the scheduler already runs `queue:work` every minute, so the systemd worker is optional.

## Getting started and concepts

- [x] `getting-started/setup-checklist.md`
  - W: the dashboard checklist has 5 items (logo, email, gateway, server, product), not this page's 10 [DashboardController.php:102-132]; the logo / Appearance step is missing here.
  - W: Localization has no currency (that is Setup → Currencies); Invoices has no tax-display setting; "support email" is **Company Email**.
  - M: Legal (Terms / Privacy URLs, otherwise sign-up links go to `#`) and Legal identity.
- [x] `getting-started/your-first-sale.md`
  - ~~W: prices are set on the edit page~~ — no longer true at 6af8ac59: the create form has a Pricing card again.
  - W: a product picks a server module and optional server group, not a server.
  - M: domain registration or transfer on a hosting order is its own cart line (2026-09-25); free first-year domain.
- [x] `concepts/overview.md` O: logins are separate users, one login can belong to several client accounts; W: invoice statuses.
  - W: contacts do not sign in (the `client` guard uses `users`); they receive the email kinds ticked for them.
  - M: aaPanel module; orders can end Cancelled / Fraud; product picks a module + optional server group.
- [x] `concepts/products-services-orders-invoices.md`
  - O: 9 invoice statuses (add Draft, Collections) [app/Enums/InvoiceStatus.php]; service statuses add Fraud, Completed.
  - M: free domain with a product; downloads limited to product owners; domain statuses; domain move between accounts.
  - W: Auto Setup labels, product types, payment type (Recurring / One Time / Free), `-1` disables a cycle; manual-accept orders stay Pending after payment [OrderService::acceptOrder].
- [x] `concepts/servers-and-modules.md` W: products link to a module type plus an optional server group. M: per-type server settings (Proxmox node, pool, VM ID range); Setup → Modules; `pnlcs.json` third-party modules; Live Servers; "Set up on my hosting" (Panelica only).
- [x] `concepts/billing-lifecycle.md`
  - W: reminder stages are fixed: 7, 3, 1 days before; 1, 3, 7, 30 days after [PaymentReminderCommand.php:30-37].
  - O: auto-charge only when **Automatic Payment** is on (off by default), client has not opted out, Stripe / iyzico / PayPal only; runs 06:45 with retries.
  - M: auto-terminate off by default (30 days), suspension default 3 days; late fees (none / flat / percent, minimum days).
  - M: renewal invoices 14 days ahead (not a setting), skipped when auto-renew is off or a cancellation is waiting; unsuspend runs every 30 min, not on payment; schedule times from routes/console.php.
  - W: auto-suspend suspends every active service of the client with an overdue invoice past grace [SuspensionCommand.php], not only the invoiced one.

## Guides

- [x] `guides/connect-a-server.md`
  - W: cPanel needs **Access Hash** (`whm user:<hash>`), saving an active server is refused without it; Plesk too. (The form hints are wrong upstream as well; report it.)
  - W: HestiaCP falls back to port 8443, not 8083.
    - Not so at cf89b175: module and form both use 8083 [HestiaCPModule.php:54]; page kept 8083.
  - Also: aaPanel type was missing; Vultr key field is labelled **API Key**; Proxmox and DirectAdmin credential rules; delete refused while live services; Max Accounts only applies inside a group.
  - W: products have no single-server field; with no group the first active server of the type is used.
  - M: server groups (Sequential / Round Robin, max accounts 500, group full = provisioning fails); IP field, Active checkbox, hostname-IP warning, Proxmox Images button.
- [x] `guides/tax-rules.md` W: a group must have a country (only the migrated `@global` group has none); for the global group only the default rate is used. O: invoice items and catalogue items carry their own rate and label; 0% = untaxed.
  - Also: **Tax Exempt** cannot be set anywhere in the admin area or API in 1.6.1 (only shown); the page said "mark a customer tax exempt on their profile".
- [x] `guides/custom-fields.md` W: "Show on order" and "Show on invoice" are implemented, not "future"; non-admin fields are shown and editable on the client Profile. M: per-product custom fields. Move the implementation notes to developer docs.
  - Notes moved to a "For developers" section on the page. Also: regex is only checked by the browser on admin forms; Required is not enforced on the client Profile.
- [x] `guides/client-logins-and-permissions.md` W: there is a client-area **Users** page now (invite, edit permissions, remove, cancel invite). M: sign-in history, new-device alerts, 2FA backup codes, phone verification, sensitive-action codes (15 min), social login, required email verification.
- [x] `guides/configure-email.md` W: SMTP encryption has "none"; the default is PHP Mail. O: templates are per language, with Reset. M: newer templates; Logs → Email Logs.
- [x] `guides/payment-gateways.md` M: Automatic Payment card in full; rejecting bank-transfer notifications; payment reference prefix; Logs → Gateway Logs.
  - Gateway Logs are only written by Tpay and iyzico at cf89b175; page says so. Bank Transfer has exactly three bank slots.
- [x] `guides/support-mail-piping.md` W: menu is Support → **Support Tickets**; encryption has "No". M: lenient subject matching; allowed attachment types; import status per department; escalation rules.
  - Also: POP3 always deletes after import; replies only from the ticket's client, address or account contacts; spam filter applies. Escalation page has no menu link and its "Send notification" switch does nothing (upstream bugs).
- [x] `guides/staff-and-roles.md` M: roles pick dashboard widgets; staff can only grant roles they could hold; 2FA backup codes; Module / Gateway / Email logs.
  - Roles do not pick widgets: each widget needs a permission and is hidden without it. Also: 46 permissions, not 45; full-admin note on `manage_updates`; role with staff cannot be deleted; cannot remove own `manage_roles`; API credentials are deleted with the account; Module Logs are only written by the SSL module and KSeF.
- [x] `guides/themes-and-branding.md` M: ZIP upload, delete, download; Appearance tabs; White-label (remove PNLCS / Panelica branding); About text; Knowledge Base switch.
  - Also: dark mode is one global switch (Dark Mode tab), not per theme; homepage sections listed from the seeder (no "features" section); color presets Starter / Nightforge / Lumina; logo and favicon limits.
- [x] `guides/modules.md` M: built-in addons (Company Lookup, KSeF, Project Management, Staff Board); Extensions top-bar menu; 27 report modules.
  - Also: server list now matches the 10 registered modules (aaPanel added, Panelica Licenses described); "In use" is only counted for server and SSL modules.
- [x] `guides/sell-domains.md` M: new pricing fields (restore, privacy, category, popular, min/max years, grace, auto-registrar); ID protection; contacts; child nameservers; bulk renew; restore; domain move between accounts; free domain; HRD PESEL / CSA mapping; WHOIS lookup.
- [x] `guides/sell-docker-apps.md` O: 7 KB articles, not 6. M: Panelica product section (managed mode, limits); save refused when Max Containers is 0; client app card; logo refetch; runtime app tabs.
  - Also: limits only apply in Managed mode (otherwise the existing panel plan's); an App Hosting failure is reported in the PROVISIONING FAILED notification, not a module log (Panelica writes none).
- [x] `guides/languages.md` W: Default Language is on the Settings tab. M: model list; the two editor markers; frozen database overrides removed on upgrade.
- [x] `guides/migrate-from-whmcs.md` W: Proxmox also lists existing machines, not only Panelica. M: WHMCS hook names keep working (with the exceptions under Developer).
  - W: there **is** an importer now (Utilities → Import WHMCS: clients, domains, services from the WHMCS database); the page said there was none. Added a section on it.
- [x] `guides/live-servers.md` M (minor): direct URL, new tab, 20 sign-ins per minute.
- [x] `guides/proxmox/troubleshooting.md` W: customers **can** add SSH keys (at checkout and on reinstall, up to 10).
  - 1.6.1: a failed create is queued and retried (5/10/20/40 min) with a notification; jobs time out after two hours; row for the SSH-key validation error. KVM from ISO gets no keys.
- [x] `guides/proxmox/customer-panel.md` M: SSH keys on reinstall. W: confirmation word is the service domain or `vps-<service id>`; the server name is shown.
  - W: only reinstall and restore ask for the typed word; snapshot rollback/delete and backup delete ask a plain confirm. The node is not shown to the customer (admin-only row).
- [x] `guides/proxmox/create-the-product.md` W: IPv6 SLAAC is LXC only. M: SSH keys at order.
  - W: protection is also lifted during reinstall/restore (put back after); Installer ISO, Login user and Upgrade packages are KVM only; Auto Setup labels updated.
- [x] `guides/proxmox/running-vps.md`, `guides/sell-vps-on-proxmox.md` M: SSH keys; label is "Link to an existing account".
  - M: Create Account button while no server exists; LXC is created from its template, not cloned; rollbacks also advance every minute and are logged. Step table menu paths are under Setup.

## Developer

- [x] `developer/hooks.md`
  - M: `UserLogin` / `ClientLogin` (user, method, ipAddress, newDevice) and `TicketClosed` / `TicketClose` (ticket, byClient).
  - W: a blank line breaks the `RefundIssued` table row; several hooks are filed under the wrong heading.
  - O: "WHMCS-compatible" needs limits: `AfterModuleChangePassword` never fires (PNLCS fires `AfterModulePassword`); no `InvoiceRefunded`, `AcceptQuote`, `TicketUserReply`, `TicketAdminReply`; parameters are model objects, not WHMCS id arrays.
  - M: `ClientAdd` does not fire for staff-created clients or API `addclient` without a password; `InvoicePaid` also fires for the VAT invoice made from a paid proforma.
  - M (1.6.1): `SitemapUrls` hook [SitemapController] was not listed; regrouped into Billing / Orders / Quotes / Provisioning / Services / Domains / Clients & Support / Mail and downloads / System.
- [x] `developer/modules.md` M: registrar capability interfaces (`ChecksAvailabilityInBulk`, `ManagesChildNameservers`, `ManagesDomainContacts`, `ManagesWhoisPrivacy`, `RestorableRegistrar`); report and widget modules; `PhoneVerifier`, `MailboxClientInterface`; list of built-in modules.
  - widgets are not discovered: registered on `WidgetManager` in AppServiceProvider (an addon can register its own).
- [x] `developer/themes.md` W: the starter theme has 8 colours; the full set is 56 tokens [ThemeService::getPresets]. M: built-in themes cannot be deleted; `dark_colors`, `fonts`, `supports` are parsed but unused.
  - M: tokens become `--theme-<name>` CSS variables; a theme without `colors` keeps the current set; default active theme is `panelica`.
- [x] `developer/translations.md` M: `lang/en.json` (~460 keys, no English fallback for JSON); the group files.
  - 1.6.1: en.json has 462 keys, all duplicates of `lang/en/{admin,common}.php`, and wins in English; `common.form.postcode`/`state` differ from common.php. Complete languages must also keep English key order [CONTRIBUTING.md].
- [x] `developer/contributing.md` W: DB user and password come from `.env.testing`, not `phpunit.xml`.
  - page had no test-setup section; added one from `.env.testing.example`. Commit format is "loosely" Conventional Commits; Pint + PHPStan in CI.

## Help

- [x] `troubleshooting/common-issues.md` W: the switch is **Enable Email Sending**. M: a switched-off template suppresses mail (log line); `pnlcs:module-queue --id=N` to retry provisioning.
  - W: `.env` decides until a **Mail Type** is saved (not "until SMTP is set"); provisioning needs a module plus an active server of its type or in the product's server group, not "a server"; Auto Setup labels; retry schedule 5/10/20/40 min, 5 attempts, hopeless refusals not retried.
- [x] `troubleshooting/faq.md` M: "Can I give a free domain with hosting?"
  - W (1.6.1): WHMCS import exists (**Utilities → Import WHMCS**); free plan needs `0` (not `-1`) in a cycle; Setup → Updates for updating; rates at 05:30 behind the **Update exchange rates every day** switch; account listing for Panelica and Proxmox.
- [x] `reference/scheduled-commands.md` M: `pnlcs:ticket-auto-close` (hourly), `pnlcs:proxmox-tasks` (every minute), `DailyCronJob` (00:10); Log retention screen; useful manual options.
  - M (1.6.1): `pnlcs:panelica-licenses` runs **every five minutes** (not hourly; bought licenses are re-read hourly inside it). cc-expiry runs on the 1st and covers this month and next; currency switch is on Setup → Currencies; auto-suspend/terminate setting names.

## New pages

Concepts
- [x] Domains and their lifecycle (statuses, grace, redemption, sync, ordered with hosting, free domain, move between accounts) → `covered in concepts/products-services-orders-invoices.md#domains and guides/sell-domains.md`
- [x] Clients, logins and contacts (multi-account logins, permissions, SSO links, invites) → `covered in concepts/overview.md and guides/client-logins-and-permissions.md`

Guides
- [x] Customer account security (reCAPTCHA, email / SMS verification, social login, sensitive-action codes, new-device alerts, 2FA) → `covered in guides/client-logins-and-permissions.md (sign-in settings) and install/security.md`
- [x] Automatic payment and stored cards → `covered in guides/payment-gateways.md and concepts/billing-lifecycle.md`
- [x] Currencies and exchange rates (billing currency, TCMB rates, rate note on PDFs) → `guides/currencies.md`
- [x] Fraud screening (MaxMind, FraudLabs) → `guides/fraud-screening.md`
- [x] Legal pages (`/legal`, versioning, customising, terms acceptance, marketing consent) → `guides/legal-pages.md`
- [x] Promotions, product addons, bundles, free domain → `guides/promotions-and-addons.md`
- [x] Invoice catalogue, per-line tax, late fees → `guides/invoices.md`
- [x] Affiliates → `guides/affiliates.md`
- [x] Support content (announcements, downloads, knowledge base, network issues, ticket statuses, escalation, predefined replies, spam filter) → `guides/support.md`
- [x] Notification channels (email, Slack, Telegram, webhook) → `guides/notifications.md`
- [x] Reports (27) → `guides/reports.md`
- [x] Polish e-invoicing (KSeF) and Company Lookup → `guides/ksef-and-company-lookup.md`
- [x] Quotes, Project Management and Staff Board → `guides/quotes-and-projects.md`
- [x] One page per server module: cPanel, Plesk, DirectAdmin, HestiaCP, Vultr, Custom, Panelica end to end → `modules/*.md`

Reference (generate from code where possible)
- [x] Hooks: from `HookServiceProvider::$eventHookMap`, event properties, and `run_hook` / `hook_output` calls → `developer/hooks.md, checked against the event map`
- [x] Staff permissions (46): `App\Constants\Permissions::grouped()` → `reference/staff-permissions.md`
- [x] Client permissions (13): `App\Support\ClientPermissions::ALL` → `reference/client-permissions.md`
- [x] Environment variables: `env()` calls in `config/` joined with `.env.example` → `reference/environment.md`
- [x] Artisan commands: `php artisan list pnlcs --format=json` → `reference/artisan-commands.md`
- [x] Built-in modules: `ModuleServiceProvider` plus `modules/*/*/pnlcs.json` → `developer/modules.md#built-in-modules`
- [x] Theme colour tokens (56) → `reference/theme-tokens.md`
- [x] General Settings, card by card (curated; there is no settings registry) → `reference/general-settings.md`
- [x] WHMCS to PNLCS glossary, including hook names that differ → `reference/whmcs-glossary.md`

## To report upstream (code, not docs)

- cPanel / Plesk server form hints contradict the module code (Access Hash is required).
- `routes/api.php` section comments give stale endpoint counts.
- Theme `dark_colors`, `fonts`, `supports` are parsed but never used.
