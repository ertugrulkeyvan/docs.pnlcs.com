# Deploy on Plesk

PNLCS runs well on a Plesk server, either through Plesk's **Laravel Toolkit**
extension (recommended — handles most of the build steps for you) or fully
manually over SSH. This guide covers both paths and the gotchas that are easy
to miss on Plesk specifically.

## Prerequisites

- A Plesk subscription/domain already created for the app (e.g.
  `app.example.com`)
- PHP **8.4 required** in Plesk (check **Domain → PHP Settings**) — see note
  below
- MySQL 8 (or MariaDB 10.11+)
- Root or SSH access to the server for the manual steps below

!!! warning "PHP 8.4 is required"
    PNLCS's `composer.json` requires PHP `^8.4` and the install wizard refuses
    anything older. Set the domain's PHP version to **8.4** in Plesk
    (**Domain → PHP Settings**) before installing.

## Option A — Using Plesk's Laravel Toolkit (recommended)

1. Install the **Laravel Toolkit** extension in Plesk if it isn't already.
2. Go to Laravel in Plesk and click on Install Application
   <img width="943" height="425" alt="image" src="https://github.com/user-attachments/assets/059a963d-7033-4b56-89a0-e9eb4cecdb5b" />


   <img width="1471" height="722" alt="image" src="https://github.com/user-attachments/assets/d838d72b-08e6-43af-805c-2e78317e06d1" />


3. Choose a Domain, add the repository `https://github.com/Panelica/pnlcs.git`,
   and click **Install Application**
   <img width="449" height="455" alt="image" src="https://github.com/user-attachments/assets/727d94f7-8ea7-414b-95f1-df9ed93944fb" />

4. Set **Deployment mode** to **Manual** (safer for a first install — you
   control exactly when it deploys) or **Automatic** if you want it to
   redeploy on every push.
5. Under **Deployment steps**, leave the defaults checked: fetch source,
   install Composer dependencies, install npm dependencies, disable
   maintenance mode. The "Run deployment script" step is only needed if you
   add a custom `.deploy` script later.
6. Click **Deploy**.
7. Once deployed, edit the app's **environment variables (.env)** from the
   toolkit's dashboard tab (see [Environment](#environment) below).
8. Run the [Artisan commands](#artisan-commands) from the toolkit's **Artisan**
   tab — no SSH needed for this part.
9. Enable the **Scheduled Tasks** and **Queue** toggles on the toolkit
   dashboard. This replaces the manual cron/systemd steps in Option B
   entirely — Plesk manages the worker process and the `schedule:run` cron
   entry for you.

!!! note "Node.js version"
    The frontend build needs **Node.js 20.19+ or 22.12+** (Vite 8). The
    Laravel Toolkit's own **Node.js** tab lets you pick a Node version for the
    *build step* independently of what's installed system-wide, so this
    usually isn't a manual concern under Option A.

## Option B — Manual deployment over SSH

1. **Clone outside the web root**, then point the document root at `public/`
   rather than the repo root — Laravel apps must never serve their own
   project root:

   ```bash
   cd /var/www/vhosts/example.com
   git clone https://github.com/Panelica/pnlcs.git pnlcs
   ```

   In Plesk: **Domain → Hosting Settings → Document Root** → `pnlcs/public`.

2. **Install PHP extensions.** The install wizard checks for: `bcmath, curl,
   dom, fileinfo, gd, intl, mbstring, openssl, pdo_mysql, tokenizer, xml, zip`. On
   Plesk/Debian-based systems these come as `plesk-php84-<extension>`
   packages — check what's active first:

   ```bash
   /opt/plesk/php/8.4/bin/php -m | sort
   ```

3. **Install Composer dependencies** using the Plesk PHP binary explicitly,
   so you don't accidentally use a different system PHP:

   ```bash
   /opt/plesk/php/8.4/bin/php $(which composer) install --no-dev --optimize-autoloader
   ```

4. **Install Node and build assets.** You need Node.js 20.19+ or 22.12+. If
   your distro's package manager ships an older one, use
   [nvm](https://github.com/nvm-sh/nvm) rather than fighting distro packages:

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   nvm install 22
   npm ci
   npm run build
   ```

5. **Configure `.env`** — see [Environment](#environment) below.

6. **Run the Artisan commands** — see [below](#artisan-commands).

7. **Fix ownership/permissions.** Anything run as `root` during setup (e.g. an
   interactive `su` session that didn't fully take, or a manual `chown` that
   Plesk's ACL model disagrees with) can leave files owned incorrectly for
   the subscription's system user. Rather than hand-crafting `chown`/`chmod`,
   let Plesk reconcile it against its own conventions:

   ```bash
   plesk repair fs example.com -y
   ```

8. **Queue worker (optional).** The scheduler in step 9 already starts a
   `queue:work` run every minute, so with `QUEUE_CONNECTION=database` queued
   jobs wait at most a minute without any extra process. Add a permanent
   worker only if you want them to run instantly. Plesk doesn't run
   long-lived processes on its own, so create a systemd unit:

   ```ini
   # /etc/systemd/system/pnlcs-queue.service
   [Unit]
   Description=PNLCS Queue Worker
   After=network.target mysql.service

   [Service]
   User=your_subscription_system_user
   WorkingDirectory=/var/www/vhosts/example.com/pnlcs
   ExecStart=/opt/plesk/php/8.4/bin/php artisan queue:work --tries=3 --timeout=90
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   systemctl enable --now pnlcs-queue
   ```

9. **Scheduler cron.** Add to the subscription's crontab (Plesk → Scheduled
   Tasks, or `crontab -u your_subscription_system_user -e`):

   ```
   * * * * * /opt/plesk/php/8.4/bin/php /var/www/vhosts/example.com/pnlcs/artisan schedule:run >> /dev/null 2>&1
   ```

## Environment

Set at minimum:

```
APP_NAME=PNLCS
APP_ENV=production
APP_DEBUG=false
APP_URL=https://app.example.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

QUEUE_CONNECTION=database
```

Leave `APP_KEY` blank if you haven't generated one yet — the Artisan step
below handles it. If you're deploying through the Laravel Toolkit, it may
already have generated a key for you during the first deploy; check before
overwriting it.

## Artisan commands

Run these once, in order, after dependencies are installed and `.env` is set:

```bash
php artisan config:clear
php artisan key:generate   # skip if APP_KEY is already set
php artisan migrate --force
php artisan storage:link
```

Then open `https://app.example.com/install`. The install wizard seeds the
starting data and creates the administrator with the username and password
you choose. Do **not** add `--seed` to the migrate line: seeding by hand
creates a default `admin` / `admin123` account, and the wizard, seeing an
administrator, closes itself. Seed by hand only for a headless install with
no browser step, and change that password first — see
[First Login](../getting-started/first-login.md).

## Verify

1. Visit `https://app.example.com/admin/login` and confirm the login page
   loads (not a 500 or blank page — if so, check
   `storage/logs/laravel.log`).
2. Confirm SSL is active (Plesk → SSL/TLS Certificates → Let's Encrypt) with
   HTTP→HTTPS redirect enabled.
3. Confirm the queue worker and scheduler are actually running — see
   [Scheduled Commands](../reference/scheduled-commands.md).
4. Continue with the [Setup Checklist](../getting-started/setup-checklist.md).
