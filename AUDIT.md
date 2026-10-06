# Content audit, 2026-10-06

Every page was checked against PNLCS `main` at **2d724001**. Paths in brackets are in the PNLCS repository.
Tick an item when the page is fixed; when a whole page is done, add `sources:` to its front matter and
run `python3 tools/upstream.py mark <commit>` once the batch is in.

Tags: **W** wrong · **O** outdated · **M** missing.

## In sync, generated from code

- [x] `api/*` (except `index.md`) and `api/openapi.json`: `php artisan pnlcs:api-docs --check` passes, 171 actions.
      Regenerate inside a PNLCS checkout (`DB_CONNECTION=sqlite DB_DATABASE=:memory:` is enough) and copy the files over.
- [x] `mcp/tools.md`: `node mcp/scripts/docs.mjs --check` passes, 22 tools (15 read, 7 write).
- [ ] `api/index.md` M: `adminuser` is also accepted as the username parameter [app/Http/Middleware/ApiKeyAuth.php:37].

## Install

- [ ] `install/requirements.md` W: Node.js 18 → **20.19 or 22.12+** (vite 8, laravel-vite-plugin 3, rolldown) [package-lock.json].
- [ ] `install/native.md`
  - W: `node -v # v18 or newer` → 20.19+.
  - W: the wizard seeds 32 email templates, not 25 [database/seeders/EmailTemplateSeeder.php].
  - W: the knowledge base comes from migrations, not the wizard's seeding; translations come from `lang/`; domain pricing is seeded too.
  - W: step 12.4 asks for **Application Name** (`APP_NAME`), not the company name.
  - M: wizard default language offers 12 locales; requirements step also checks `vendor/`, `public/build/`, `storage/framework`, `storage/logs`; admin needs a first name and a 6+ character password; the database step only skips when `migrations` exists.
- [ ] `install/docker.md` W: invoice PDFs are rendered on demand, never stored [app/Services/InvoicePdfService.php].
- [ ] `install/backups.md` W: same, "generated invoice PDFs" are not in `storage/`.
- [ ] `install/security.md` M: reCAPTCHA switches; customer account protection (emailed code before EPP code / lock change); new-device sign-in alerts (template off by default); staff can be disabled (their API keys stop too); staff 2FA recovery codes; social login needs your own OAuth client.
- [ ] `guides/deploy-plesk.md`
  - W: PHP `^8.4` now (installer checks ≥ 8.4.0); drop the 8.3 fallback.
  - W: `.node-version` does not exist.
  - W: extensions are bcmath, curl, dom, fileinfo, gd, intl, mbstring, openssl, pdo_mysql, tokenizer, xml, zip [InstallController.php:32-35].
  - W: the cron line should use `/opt/plesk/php/8.4/bin/php`.
  - M: the `/install` wizard vs `migrate --seed` (admin/admin123); the scheduler already runs `queue:work` every minute, so the systemd worker is optional.

## Getting started and concepts

- [ ] `getting-started/setup-checklist.md`
  - W: the dashboard checklist has 5 items (logo, email, gateway, server, product), not this page's 10 [DashboardController.php:102-132]; the logo / Appearance step is missing here.
  - W: Localization has no currency (that is Setup → Currencies); Invoices has no tax-display setting; "support email" is **Company Email**.
  - M: Legal (Terms / Privacy URLs, otherwise sign-up links go to `#`) and Legal identity.
- [ ] `getting-started/your-first-sale.md`
  - W: prices are set on the edit page after **Create Product**, not on the create form.
  - W: a product picks a server module and optional server group, not a server.
  - M: domain registration or transfer on a hosting order is its own cart line (2026-09-25); free first-year domain.
- [ ] `concepts/overview.md` O: logins are separate users, one login can belong to several client accounts; W: invoice statuses.
- [ ] `concepts/products-services-orders-invoices.md`
  - O: 9 invoice statuses (add Draft, Collections) [app/Enums/InvoiceStatus.php]; service statuses add Fraud, Completed.
  - M: free domain with a product; downloads limited to product owners; domain statuses; domain move between accounts.
- [ ] `concepts/servers-and-modules.md` W: products link to a module type plus an optional server group. M: per-type server settings (Proxmox node, pool, VM ID range); Setup → Modules; `pnlcs.json` third-party modules; Live Servers; "Set up on my hosting" (Panelica only).
- [ ] `concepts/billing-lifecycle.md`
  - W: reminder stages are fixed: 7, 3, 1 days before; 1, 3, 7, 30 days after [PaymentReminderCommand.php:30-37].
  - O: auto-charge only when **Automatic Payment** is on (off by default), client has not opted out, Stripe / iyzico / PayPal only; runs 06:45 with retries.
  - M: auto-terminate off by default (30 days), suspension default 3 days; late fees (none / flat / percent, minimum days).

## Guides

- [ ] `guides/connect-a-server.md`
  - W: cPanel needs **Access Hash** (`whm user:<hash>`), saving an active server is refused without it; Plesk too. (The form hints are wrong upstream as well; report it.)
  - W: HestiaCP falls back to port 8443, not 8083.
  - W: products have no single-server field; with no group the first active server of the type is used.
  - M: server groups (Sequential / Round Robin, max accounts 500, group full = provisioning fails); IP field, Active checkbox, hostname-IP warning, Proxmox Images button.
- [ ] `guides/tax-rules.md` W: a group must have a country (only the migrated `@global` group has none); for the global group only the default rate is used. O: invoice items and catalogue items carry their own rate and label; 0% = untaxed.
- [ ] `guides/custom-fields.md` W: "Show on order" and "Show on invoice" are implemented, not "future"; non-admin fields are shown and editable on the client Profile. M: per-product custom fields. Move the implementation notes to developer docs.
- [ ] `guides/client-logins-and-permissions.md` W: there is a client-area **Users** page now (invite, edit permissions, remove, cancel invite). M: sign-in history, new-device alerts, 2FA backup codes, phone verification, sensitive-action codes (15 min), social login, required email verification.
- [ ] `guides/configure-email.md` W: SMTP encryption has "none"; the default is PHP Mail. O: templates are per language, with Reset. M: newer templates; Logs → Email Logs.
- [ ] `guides/payment-gateways.md` M: Automatic Payment card in full; rejecting bank-transfer notifications; payment reference prefix; Logs → Gateway Logs.
- [ ] `guides/support-mail-piping.md` W: menu is Support → **Support Tickets**; encryption has "No". M: lenient subject matching; allowed attachment types; import status per department; escalation rules.
- [ ] `guides/staff-and-roles.md` M: roles pick dashboard widgets; staff can only grant roles they could hold; 2FA backup codes; Module / Gateway / Email logs.
- [ ] `guides/themes-and-branding.md` M: ZIP upload, delete, download; Appearance tabs; White-label (remove PNLCS / Panelica branding); About text; Knowledge Base switch.
- [ ] `guides/modules.md` M: built-in addons (Company Lookup, KSeF, Project Management, Staff Board); Extensions top-bar menu; 27 report modules.
- [ ] `guides/sell-domains.md` M: new pricing fields (restore, privacy, category, popular, min/max years, grace, auto-registrar); ID protection; contacts; child nameservers; bulk renew; restore; domain move between accounts; free domain; HRD PESEL / CSA mapping; WHOIS lookup.
- [ ] `guides/sell-docker-apps.md` O: 7 KB articles, not 6. M: Panelica product section (managed mode, limits); save refused when Max Containers is 0; client app card; logo refetch; runtime app tabs.
- [ ] `guides/languages.md` W: Default Language is on the Settings tab. M: model list; the two editor markers; frozen database overrides removed on upgrade.
- [ ] `guides/migrate-from-whmcs.md` W: Proxmox also lists existing machines, not only Panelica. M: WHMCS hook names keep working (with the exceptions under Developer).
- [ ] `guides/live-servers.md` M (minor): direct URL, new tab, 20 sign-ins per minute.
- [ ] `guides/proxmox/troubleshooting.md` W: customers **can** add SSH keys (at checkout and on reinstall, up to 10).
- [ ] `guides/proxmox/customer-panel.md` M: SSH keys on reinstall. W: confirmation word is the service domain or `vps-<service id>`; the server name is shown.
- [ ] `guides/proxmox/create-the-product.md` W: IPv6 SLAAC is LXC only. M: SSH keys at order.
- [ ] `guides/proxmox/running-vps.md`, `guides/sell-vps-on-proxmox.md` M: SSH keys; label is "Link to an existing account".

## Developer

- [ ] `developer/hooks.md`
  - M: `UserLogin` / `ClientLogin` (user, method, ipAddress, newDevice) and `TicketClosed` / `TicketClose` (ticket, byClient).
  - W: a blank line breaks the `RefundIssued` table row; several hooks are filed under the wrong heading.
  - O: "WHMCS-compatible" needs limits: `AfterModuleChangePassword` never fires (PNLCS fires `AfterModulePassword`); no `InvoiceRefunded`, `AcceptQuote`, `TicketUserReply`, `TicketAdminReply`; parameters are model objects, not WHMCS id arrays.
  - M: `ClientAdd` does not fire for staff-created clients or API `addclient` without a password; `InvoicePaid` also fires for the VAT invoice made from a paid proforma.
- [ ] `developer/modules.md` M: registrar capability interfaces (`ChecksAvailabilityInBulk`, `ManagesChildNameservers`, `ManagesDomainContacts`, `ManagesWhoisPrivacy`, `RestorableRegistrar`); report and widget modules; `PhoneVerifier`, `MailboxClientInterface`; list of built-in modules.
- [ ] `developer/themes.md` W: the starter theme has 8 colours; the full set is 56 tokens [ThemeService::getPresets]. M: built-in themes cannot be deleted; `dark_colors`, `fonts`, `supports` are parsed but unused.
- [ ] `developer/translations.md` M: `lang/en.json` (~460 keys, no English fallback for JSON); the group files.
- [ ] `developer/contributing.md` W: DB user and password come from `.env.testing`, not `phpunit.xml`.

## Help

- [ ] `troubleshooting/common-issues.md` W: the switch is **Enable Email Sending**. M: a switched-off template suppresses mail (log line); `pnlcs:module-queue --id=N` to retry provisioning.
- [ ] `troubleshooting/faq.md` M: "Can I give a free domain with hosting?"
- [ ] `reference/scheduled-commands.md` M: `pnlcs:ticket-auto-close` (hourly), `pnlcs:proxmox-tasks` (every minute), `DailyCronJob` (00:10); Log retention screen; useful manual options.

## New pages

Concepts
- [ ] Domains and their lifecycle (statuses, grace, redemption, sync, ordered with hosting, free domain, move between accounts)
- [ ] Clients, logins and contacts (multi-account logins, permissions, SSO links, invites)

Guides
- [ ] Customer account security (reCAPTCHA, email / SMS verification, social login, sensitive-action codes, new-device alerts, 2FA)
- [ ] Automatic payment and stored cards
- [ ] Currencies and exchange rates (billing currency, TCMB rates, rate note on PDFs)
- [ ] Fraud screening (MaxMind, FraudLabs)
- [ ] Legal pages (`/legal`, versioning, customising, terms acceptance, marketing consent)
- [ ] Promotions, product addons, bundles, free domain
- [ ] Invoice catalogue, per-line tax, late fees
- [ ] Affiliates
- [ ] Support content (announcements, downloads, knowledge base, network issues, ticket statuses, escalation, predefined replies, spam filter)
- [ ] Notification channels (email, Slack, Telegram, webhook)
- [ ] Reports (27)
- [ ] Polish e-invoicing (KSeF) and Company Lookup
- [ ] Quotes, Project Management and Staff Board
- [ ] One page per server module: cPanel, Plesk, DirectAdmin, HestiaCP, Vultr, Custom, Panelica end to end

Reference (generate from code where possible)
- [ ] Hooks: from `HookServiceProvider::$eventHookMap`, event properties, and `run_hook` / `hook_output` calls
- [ ] Staff permissions (45): `App\Constants\Permissions::grouped()`
- [ ] Client permissions (13): `App\Support\ClientPermissions::ALL`
- [ ] Environment variables: `env()` calls in `config/` joined with `.env.example`
- [ ] Artisan commands: `php artisan list pnlcs --format=json`
- [ ] Built-in modules: `ModuleServiceProvider` plus `modules/*/*/pnlcs.json`
- [ ] Theme colour tokens (56)
- [ ] General Settings, card by card (curated; there is no settings registry)
- [ ] WHMCS to PNLCS glossary, including hook names that differ

## To report upstream (code, not docs)

- cPanel / Plesk server form hints contradict the module code (Access Hash is required).
- `routes/api.php` section comments give stale endpoint counts.
- Theme `dark_colors`, `fonts`, `supports` are parsed but never used.
