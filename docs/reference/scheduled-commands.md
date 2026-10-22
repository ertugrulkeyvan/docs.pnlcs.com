---
sources:
  - routes/console.php
  - app/Console/Commands/
  - modules/Servers/PanelicaLicense/Console/SyncLicensesCommand.php
  - modules/Servers/PanelicaLicense/LicenseSync.php
  - app/Services/ScheduleStatusService.php
  - app/Http/Controllers/Admin/LogRetentionController.php
  - resources/views/admin/settings/log-retention.blade.php
---

# Scheduled Commands

Everything PNLCS does by itself runs from Laravel's scheduler, driven by
**one** cron line for the web server user:

```
* * * * * cd /var/www/pnlcs && php artisan schedule:run >> /dev/null 2>&1
```

The Docker image runs the scheduler inside the container; there is no cron
line to add there.

## What runs, and when

Times are UTC: PNLCS fixes its time zone to UTC, whatever the server's own time zone is.

### Billing

| Command | When | What it does |
|---|---|---|
| `pnlcs:currency-update` | daily 05:30 | Updates exchange rates against the default currency. Skipped while **Update exchange rates every day** (**Setup → Currencies**) is off; it is on by default. `--force` runs it anyway |
| `pnlcs:generate-invoices` | daily 06:00 | Raises renewal invoices for services, addons and domains coming due |
| `pnlcs:mark-overdue` | daily 06:30 | Marks unpaid invoices past their due date as overdue |
| `pnlcs:auto-charge` | daily 06:45 | Charges stored cards for due invoices; does nothing until **Automatic Payment** is switched on (**Setup → General Settings**) |
| `pnlcs:auto-charge --rescue` | every 15 minutes | Finishes card charges a crashed run left halfway; collects nothing new, and does nothing while automatic payment is off |
| `pnlcs:apply-late-fees` | daily 07:30 | Adds late fees to overdue invoices, if late fees are set up |
| `pnlcs:payment-reminders` | daily 08:00 | Emails reminders for invoices coming due and overdue |
| `pnlcs:unsuspend-on-payment` | every 30 minutes | Unsuspends services whose overdue invoices have been paid |
| `pnlcs:cc-expiry-alerts` | monthly, on the 1st at 00:00 | Tells customers whose stored card expires this month or next |
| `pnlcs:detach-payment-methods` | every 5 minutes | Asks the gateway to forget cards customers removed |

### Services

| Command | When | What it does |
|---|---|---|
| `pnlcs:process-cancellations` | daily 02:00 | Carries out cancellation requests that are due |
| `pnlcs:auto-suspend` | daily 07:00 | Suspends services whose invoice has been overdue longer than **Suspend after (days overdue)** (**Setup → General Settings → Automation**, default 3) |
| `pnlcs:auto-terminate` | daily 08:00 | Terminates services suspended over an unpaid invoice for longer than **Terminate after (days suspended)** (default 30); does nothing until **Automatically terminate services suspended for non-payment** is ticked on the same card |
| `pnlcs:module-queue` | every 5 minutes | Retries server actions that failed (create, suspend, unsuspend, terminate, renew): after 5, 10, 20, then 40 minutes, five attempts in all |
| `pnlcs:usage-polling` | hourly | Reads disk and bandwidth use from the servers, for usage display and overage billing |
| `pnlcs:proxmox-tasks` | every minute | Moves on Proxmox reinstalls, restores, snapshot rollbacks and image downloads that are under way ([Sell VPS on Proxmox](../guides/sell-vps-on-proxmox.md)) |
| `pnlcs:panelica-licenses` | every 5 minutes | Finds the servers customers installed with their Panelica license link and buys the license; reads bought licenses back from Panelica once an hour. Does nothing while the Panelica Licenses module is off or no partner account is connected ([Sell Panelica licenses](../guides/sell-panelica-licenses.md)) |

### Domains and SSL

| Command | When | What it does |
|---|---|---|
| `pnlcs:domain-sync` | daily 03:00 | Reads expiry, status, lock and nameservers from the registrars |
| `pnlcs:registrar-balance` | 08:00 and 20:00 | Warns when the prepaid balance at the watched registrar falls to the floor |
| `pnlcs:ssl-expiry-check` | daily 09:00 | Warns about certificates about to expire |
| `pnlcs:domain-renewal-reminders` | daily 09:15 | Emails customers whose domains are about to expire |
| `pnlcs:ssl-status-poll` | every 5 minutes | Checks pending certificate orders with the SSL provider |

### Support and upkeep

| Command | When | What it does |
|---|---|---|
| `DailyCronJob` hook | daily 00:10 | Runs the `DailyCronJob` hook, for addons that need a daily task (shown as `hook:DailyCronJob`) |
| `pnlcs:prune-logs` | daily 03:45 | Deletes old log entries ([below](#log-retention)) |
| `pnlcs:db-backup` | daily 04:30 | Backs up the database ([Backups](../install/backups.md)) |
| `pnlcs:update-check` | daily 05:10 | Looks for a newer PNLCS release on the chosen channel and says so; installs nothing ([Updating](../install/updating.md)) |
| `pnlcs:mail-import` | every 5 minutes | Turns email in support mailboxes into tickets |
| `pnlcs:ticket-escalation` | every 15 minutes | Applies your ticket escalation rules |
| `pnlcs:ticket-auto-close` | hourly | Closes tickets in a status marked **Close automatically when inactive** once they have had no reply for **Close inactive tickets after (hours)** (**Setup → Ticket Statuses**). Off while that is `0`, the default |
| `pnlcs:update --from-request` | every minute, even in maintenance | Runs the check or update an administrator asked for on **Setup → Updates**; does nothing otherwise |
| `pnlcs:update-rollback --abandoned` | every minute, even in maintenance | Self-healing: rolls back an update whose process died part way and brings up a finished one left in maintenance; does nothing otherwise ([Updating](../install/updating.md)) |
| `queue:work` | every minute | Sends queued mail and runs queued jobs, then stops |

## The queue

With `QUEUE_CONNECTION=sync` (what `.env.example` ships), mail and jobs run
immediately and the `queue:work` line has nothing to do. With
`QUEUE_CONNECTION=database`, the scheduler's `queue:work` sends queued work
within a minute: no separate worker is needed. Run a permanent worker only if
you want queued jobs to go out instantly; see
[installation step 14](../install/native.md#14-queue-no-separate-worker-needed).

## Log retention

`pnlcs:prune-logs` keeps each log for a set number of days. Change them on
**Utilities → System Logs → Log retention**; `0` keeps a log for ever, and
**Prune now** removes the old entries of one log at once.

| Log | Kept by default |
|---|---|
| Sent emails | 180 days |
| Ticket mail log | 90 days |
| Payment gateway log | 90 days |
| Payment webhooks | 90 days |
| Activity log | 365 days |
| Domain searches | 90 days |
| Module queue (finished) | 30 days |

From the module queue only completed and cancelled entries are removed; work
still waiting and failed entries are kept.

## Running a command by hand

From the PNLCS directory, as the web server user:

```bash
php artisan schedule:list                     # everything scheduled, with the next run time
php artisan pnlcs:db-backup
php artisan pnlcs:currency-update --force
php artisan pnlcs:prune-logs --dry-run        # --table=emails for one log
php artisan pnlcs:auto-suspend --dry-run      # what would be suspended
php artisan pnlcs:auto-terminate --dry-run    # what would be terminated
php artisan pnlcs:auto-charge --dry-run       # what would be charged
php artisan pnlcs:ticket-auto-close --dry-run
php artisan pnlcs:domain-sync --domain=example.com
php artisan pnlcs:module-queue --id=12        # retry one waiting entry now
php artisan pnlcs:mail-import --department=3
php artisan pnlcs:panelica-licenses --service=42
```

`--dry-run` lists what would happen and changes nothing. The module queue's
entry numbers come from the [getmodulequeue](../api/system.md#getmodulequeue)
API call.

**Utilities → Automation Status** in the admin area lists every scheduled job
and shows when it last ran.
