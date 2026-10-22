---
sources:
  - app/Console/Commands/
  - modules/Servers/PanelicaLicense/Console/SyncLicensesCommand.php
  - routes/console.php
---

# Artisan Commands

Every `pnlcs:*` command, with its options. Most of them run by themselves
from the scheduler; when, and what the schedule passes, is on
[Scheduled commands](scheduled-commands.md). The rest are run by hand or by
the updater.

Run them from the PNLCS directory as the web server user:

```bash
cd /var/www/pnlcs
sudo -u www-data php artisan pnlcs:domain-sync --dry-run    # AlmaLinux/Rocky: -u apache
php artisan list pnlcs                                      # the commands this copy has
php artisan help pnlcs:update                               # one command's options
```

With Docker, run them inside the container:
`docker exec -w /var/www/pnlcs pnlcs php artisan …` (`pnlcs` is the
container name used in [Install with Docker](../install/docker.md)).

`--dry-run`, where a command has it, lists what would happen and changes
nothing.

## Billing

| Command | What it does | Options |
|---|---|---|
| `pnlcs:generate-invoices` | Raises invoices for services, addons and domains due within the next billing period | none |
| `pnlcs:mark-overdue` | Marks unpaid invoices past their due date as overdue | none |
| `pnlcs:auto-charge` | Charges stored cards for invoices that are due | `--limit=` how many cards one run may charge (default 1000); `--dry-run`; `--rescue` only finishes charges a killed run left halfway, and collects no new invoices |
| `pnlcs:apply-late-fees` | Adds late fees to overdue invoices | none |
| `pnlcs:payment-reminders` | Reminds customers of invoices coming due and of invoices already past due | none |
| `pnlcs:unsuspend-on-payment` | Unsuspends services once their overdue invoices are paid | none |
| `pnlcs:cc-expiry-alerts` | Tells customers their stored card is about to expire | none |
| `pnlcs:detach-payment-methods` | Asks the gateway to forget cards customers removed | none |
| `pnlcs:currency-update` | Updates exchange rates against the default currency | `--force` runs even while the daily rate update is switched off |

## Services

| Command | What it does | Options |
|---|---|---|
| `pnlcs:process-cancellations` | Carries out cancellations due at the end of the billing period | none |
| `pnlcs:auto-suspend` | Suspends services with overdue invoices | `--dry-run` |
| `pnlcs:auto-terminate` | Terminates services that have stayed suspended over an unpaid invoice | `--dry-run` |
| `pnlcs:module-queue` | Retries server actions that failed (create, suspend, unsuspend, terminate, renew) | `--id=` retries one queue entry now |
| `pnlcs:usage-polling` | Reads disk and bandwidth use from the servers into the active services | none |
| `pnlcs:proxmox-tasks` | Moves on Proxmox reinstalls, restores and rollbacks that are under way | none |
| `pnlcs:panelica-licenses` | Finds servers installed with a Panelica license link, buys their licenses and reads bought ones back | `--service=` checks one service now |

## Domains and SSL

| Command | What it does | Options |
|---|---|---|
| `pnlcs:domain-sync` | Reads expiry, status and nameservers from the registrars | `--domain=` one domain name; `--dry-run` reports what would change |
| `pnlcs:domain-renewal-reminders` | Warns customers before their domains expire, and again during the grace period | `--dry-run` lists what would be sent |
| `pnlcs:registrar-balance` | Warns when the registrar balance falls to the floor you set | `--force` sends the warning even if one went out today |
| `pnlcs:ssl-expiry-check` | Emails about certificates about to expire | none |
| `pnlcs:ssl-status-poll` | Asks the certificate authorities about pending SSL orders | none |

## Support and upkeep

| Command | What it does | Options |
|---|---|---|
| `pnlcs:mail-import` | Turns mail in the support mailboxes (IMAP or POP3) into tickets | `--department=` one department, by ID |
| `pnlcs:ticket-escalation` | Applies the ticket escalation rules | none |
| `pnlcs:ticket-auto-close` | Closes tickets left inactive in a status that closes automatically | `--dry-run` |
| `pnlcs:prune-logs` | Deletes old rows from the log and history tables, by the retention settings | `--dry-run`; `--table=` one table only |
| `pnlcs:db-backup` | Dumps the database to a gzip file and removes the oldest ([Backups](../install/backups.md)) | `--dir=` target folder (default `storage/app/backups/db`); `--retention=` how many to keep (default: the backup retention setting, else 7); `--php` dumps over PHP's own connection even when `mysqldump` is installed |

## Updates

How updating works, and what it keeps, is on [Updating](../install/updating.md).

| Command | What it does | Options |
|---|---|---|
| `pnlcs:update [version]` | Updates PNLCS to a published release, keeping every change made to this copy. Without a version: the newest on the channel | `--channel=` `stable` or `beta` (default: the one chosen on **Setup → Updates**); `--check` downloads, verifies and compares, and changes nothing; `--resolve=` a conflict decision, `path=new` or `path=mine` (repeat it for several); `--allow-major` allows a new major version; `--ignore-requires=` a module or theme to update past although it says it does not support the new version (repeatable); `--yes` does not ask for confirmation; `--from-request` runs what was asked for on **Setup → Updates** (the scheduler's every-minute run) |
| `pnlcs:update-check` | Checks whether a newer release is published on the chosen channel. Installs nothing | none |
| `pnlcs:update-rollback` | Rolls back an update that did not finish: puts the files and the database back. Safe to run more than once | `--abandoned` acts only when the update's process is gone, and also lifts maintenance left on by a finished update (the scheduler's every-minute run) |
| `pnlcs:update-health` | Checks that the installation works: the database answers, no migration is left, and the home page, client login and admin login render. Run by the updater after an update; a failure rolls the update back | none |
| `pnlcs:addons-upgrade` | Runs the upgrade step of active addons whose files carry a newer version. A step of updating by hand, after `php artisan migrate --force`; exits with an error when one fails, and that addon is tried again next time | none |

## Translations and development

| Command | What it does | Options |
|---|---|---|
| `pnlcs:lang-write <locale>` | Writes a language's translations from the database (the editor, **Translate with AI**) into its `lang/<locale>/` files ([Translations](../developer/translations.md#from-an-install-into-the-files)) | `--group=` one file only (`admin`, `client`, `auth`, …); `--clear` removes the database rows once they are in the files; `--dry-run` |
| `pnlcs:api-docs` | Writes the API reference pages under `docs/api/` from the route table | `--check` fails when the pages on disk differ from what it would write |
| `pnlcs:i18n-convert` | Developer tool: rewrites hard-coded English in views, layouts, controllers and email templates into translation calls, after seeding the translations. It edits PNLCS's own files; do not run it on an installation | `--seed-only`, `--blades-only`, `--controllers-only`, `--layouts-only`, `--emails-only`, `--dry-run` |

## Not under `pnlcs:`

`docker-apps:import-logos` fetches the images of the Docker app catalogue
(`--overwrite` replaces stored ones; `--no-icon-set` tries only the links the
panel gives). See [Sell Docker apps](../guides/sell-docker-apps.md#logos).
