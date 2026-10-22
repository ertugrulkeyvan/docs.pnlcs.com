---
sources:
  - config/
  - .env.example
  - app/Http/Controllers/InstallController.php
  - app/Support/FirstRunEnvironment.php
  - app/Support/MailTransport.php
  - app/Http/Middleware/SetLocale.php
  - app/Services/Updates/Preflight.php
---

# Environment Variables

Every variable PNLCS reads from `.env`: each `env()` call in `config/`,
together with what `.env.example` ships. That is 124 variables read in
`config/` and 4 more that only `.env.example` names.

Most settings live in the admin area, not here. `.env` holds what PNLCS needs
before it can reach its database, plus the framework's drivers.

## Before you edit `.env`

- The install wizard caches the configuration. After a change to `.env`, run
  `php artisan config:cache` (or `php artisan optimize`) from the PNLCS
  directory as the web server user, or the change is not seen.
- `.env` holds the database password and the application key: keep it owned
  by the web server user, mode `640` ([Security](../install/security.md)).
- **Default** below is what PNLCS uses when the variable is missing.
  **.env.example** is the value the shipped file sets; a copy of that file
  is where every installation starts. "—" means none.
- **Wizard**: the install wizard writes these into `.env`. The database page
  writes the `DB_*` values (only once the connection works); the last page
  writes the `APP_*` ones. `APP_KEY` is created before the wizard opens, on
  the first web request to a copy that has no key.

A variable set in the real environment (Docker's `-e`, the web server or
PHP-FPM) wins over the same line in `.env`; [Install with Docker](../install/docker.md)
passes the `DB_*` values and `APP_URL` that way. The image also has its own
start-up variables (`PNLCS_CHANNEL`, `PNLCS_VERSION`, `AUTO_UPDATE`): see
[Install with Docker](../install/docker.md#environment).

## Application

| Variable | Default | .env.example | Wizard | What it does |
|---|---|---|---|---|
| `APP_NAME` | `Laravel` | `PNLCS` | yes | The application name. Also the default mail sender name and the start of the session cookie name and of the cache and Redis key prefixes: changing it signs everybody out |
| `APP_ENV` | `production` | `production` | yes (`production`) | The environment name. Keep `production` |
| `APP_KEY` | — | empty | first request | The encryption key for sessions, cookies and stored secrets (service passwords, SSL private keys, two-factor backup codes and more). Made on the first web request when missing, or with `php artisan key:generate`. Never change it on a running installation: what was encrypted with it can no longer be read. Back it up with the database |
| `APP_PREVIOUS_KEYS` | empty | — | | Comma list of older keys, still accepted for decrypting while you rotate `APP_KEY` |
| `APP_DEBUG` | `false` | `false` | yes (`false`) | `true` shows full error pages with code and settings. Never on a public site |
| `APP_URL` | `http://localhost` | `https://your-domain.com` | yes | The site's address. Used wherever a full address is built, links in emails among them; also the default for `MAIL_EHLO_DOMAIN` |
| `APP_LOCALE` | `en` | `en` | yes | The language used when no other is chosen. The default language picked in **Setup → Languages** takes precedence once set; the wizard sets both |
| `APP_FALLBACK_LOCALE` | `en` | `en` | | The language a missing translation falls back to |
| `APP_FAKER_LOCALE` | `en_US` | `en_US` | | Language of generated test data (development only) |
| `APP_MAINTENANCE_DRIVER` | `file` | `file` | | Where maintenance mode is recorded: `file`, or `cache` to share it between several servers |
| `APP_MAINTENANCE_STORE` | `database` | — | | The cache store used when `APP_MAINTENANCE_DRIVER=cache` |
| `BCRYPT_ROUNDS` | `12` | `12` | | Cost of password hashing. Read by Laravel's own hashing configuration, not by a file in `config/` |

There is no `APP_TIMEZONE`: `config/app.php` fixes the application time zone
at `UTC`.

## Database

PNLCS needs MySQL 8 or MariaDB; keep `DB_CONNECTION=mysql` for both. The
defaults are those of the `mysql` connection.

| Variable | Default | .env.example | Wizard | What it does |
|---|---|---|---|---|
| `DB_CONNECTION` | `sqlite` | `mysql` | yes (`mysql`) | Which connection to use. Set it: the built-in default, `sqlite`, does not work with PNLCS |
| `DB_HOST` | `127.0.0.1` | `127.0.0.1` | yes | Database server |
| `DB_PORT` | `3306` | `3306` | yes | Database port |
| `DB_DATABASE` | `laravel` | `pnlcs` | yes | Database name |
| `DB_USERNAME` | `root` | `pnlcs` | yes | Database user |
| `DB_PASSWORD` | empty | empty | yes | Database password |
| `DB_SOCKET` | empty | commented out | | Unix socket path, used instead of host and port |
| `DB_URL` | — | — | | A whole connection as one URL (`mysql://user:pass@host:3306/db`), in place of the separate values |
| `DB_CHARSET` | `utf8mb4` | — | | Connection character set |
| `DB_COLLATION` | `utf8mb4_unicode_ci` | — | | Connection collation |
| `MYSQL_ATTR_SSL_CA` | — | — | | Path to a CA certificate, to connect to the database over TLS |

Read only by connections PNLCS does not use: `DB_FOREIGN_KEYS` (SQLite,
default `true`) and `DB_SSLMODE` (PostgreSQL, default `prefer`). The
PostgreSQL and SQL Server connections also read `DB_HOST`, `DB_PORT` (5432 and
1433) and the other `DB_*` values.

## Sessions

| Variable | Default | .env.example | What it does |
|---|---|---|---|
| `SESSION_DRIVER` | `database` | `file` | Where sessions are kept: `file`, `database`, `redis` and others. The **Active sessions** list on a client's Security page needs `database` |
| `SESSION_LIFETIME` | `120` | `120` | Minutes of inactivity before a session expires |
| `SESSION_EXPIRE_ON_CLOSE` | `false` | — | `true` ends the session when the browser closes |
| `SESSION_ENCRYPT` | `false` | `false` | Encrypt the stored session data |
| `SESSION_CONNECTION` | — | — | Database or Redis connection for the `database` and `redis` drivers |
| `SESSION_TABLE` | `sessions` | — | Table for the `database` driver |
| `SESSION_STORE` | — | — | Cache store for the cache-based drivers |
| `SESSION_COOKIE` | `<APP_NAME as a slug>-session` | — | Name of the session cookie |
| `SESSION_PATH` | `/` | `/` | Cookie path |
| `SESSION_DOMAIN` | — | `null` | Cookie domain. Leave empty unless the site is reached under several subdomains |
| `SESSION_SECURE_COOKIE` | — | — | `true` sends the cookie over HTTPS only. Set it once the site runs on HTTPS |
| `SESSION_HTTP_ONLY` | `true` | — | Keep the cookie out of reach of JavaScript |
| `SESSION_SAME_SITE` | `lax` | — | The cookie's SameSite setting: `lax`, `strict`, `none` |
| `SESSION_PARTITIONED_COOKIE` | `false` | — | Partitioned cookie (only with `SESSION_SAME_SITE=none` and a secure cookie) |

## Cache

| Variable | Default | .env.example | What it does |
|---|---|---|---|
| `CACHE_STORE` | `database` | `file` | The cache: `file`, `database`, `redis`, `memcached`, `dynamodb`, `array` |
| `CACHE_PREFIX` | `<APP_NAME as a slug>-cache-` | — | Prefix of every cache key, for stores shared between applications |
| `DB_CACHE_CONNECTION` | — | — | Database connection of the `database` store |
| `DB_CACHE_TABLE` | `cache` | — | Its table |
| `DB_CACHE_LOCK_CONNECTION` | — | — | Connection for its locks |
| `DB_CACHE_LOCK_TABLE` | — | — | Table for its locks |
| `REDIS_CACHE_CONNECTION` | `cache` | — | Redis connection of the `redis` store |
| `REDIS_CACHE_LOCK_CONNECTION` | `default` | — | Redis connection for its locks |
| `MEMCACHED_HOST` | `127.0.0.1` | `127.0.0.1` | Memcached server |
| `MEMCACHED_PORT` | `11211` | — | Memcached port |
| `MEMCACHED_PERSISTENT_ID` | — | — | Memcached persistent connection id |
| `MEMCACHED_USERNAME` | — | — | Memcached SASL user |
| `MEMCACHED_PASSWORD` | — | — | Memcached SASL password |
| `DYNAMODB_CACHE_TABLE` | `cache` | — | DynamoDB table of the `dynamodb` store (it also uses the `AWS_*` keys) |
| `DYNAMODB_ENDPOINT` | — | — | DynamoDB endpoint, for a local or compatible service |

## Queue

How queued mail and jobs are sent is explained in
[Scheduled commands](scheduled-commands.md#the-queue).

| Variable | Default | .env.example | What it does |
|---|---|---|---|
| `QUEUE_CONNECTION` | `database` | `sync` | `sync` runs mail and jobs at once, in the request. `database` queues them for the scheduler's `queue:work`, which needs the cron line running |
| `QUEUE_FAILED_DRIVER` | `database-uuids` | — | Where failed jobs are recorded |
| `DB_QUEUE_CONNECTION` | — | — | Database connection of the `database` queue |
| `DB_QUEUE_TABLE` | `jobs` | — | Its table |
| `DB_QUEUE` | `default` | — | Its queue name |
| `DB_QUEUE_RETRY_AFTER` | `90` | — | Seconds before a job that has not finished is tried again |
| `REDIS_QUEUE_CONNECTION` | `default` | — | Redis connection of the `redis` queue |
| `REDIS_QUEUE` | `default` | — | Its queue name |
| `REDIS_QUEUE_RETRY_AFTER` | `90` | — | Seconds before an unfinished job is tried again |
| `BEANSTALKD_QUEUE_HOST` | `localhost` | — | Beanstalkd server |
| `BEANSTALKD_QUEUE` | `default` | — | Beanstalkd queue name |
| `BEANSTALKD_QUEUE_RETRY_AFTER` | `90` | — | Seconds before an unfinished job is tried again |
| `SQS_PREFIX` | `https://sqs.us-east-1.amazonaws.com/your-account-id` | — | Amazon SQS queue address prefix (it also uses the `AWS_*` keys) |
| `SQS_QUEUE` | `default` | — | SQS queue name |
| `SQS_SUFFIX` | — | — | Suffix added to the SQS queue name |

## Redis

Used only when a session, cache or queue setting above names `redis`.

| Variable | Default | .env.example | What it does |
|---|---|---|---|
| `REDIS_CLIENT` | `phpredis` | `phpredis` | PHP client: `phpredis` (the PHP extension) or `predis` |
| `REDIS_HOST` | `127.0.0.1` | `127.0.0.1` | Redis server |
| `REDIS_PORT` | `6379` | `6379` | Redis port |
| `REDIS_USERNAME` | — | — | Redis user (ACL) |
| `REDIS_PASSWORD` | — | `null` | Redis password |
| `REDIS_URL` | — | — | The whole connection as one URL |
| `REDIS_DB` | `0` | — | Database number of the default connection |
| `REDIS_CACHE_DB` | `1` | — | Database number of the cache connection |
| `REDIS_PREFIX` | `<APP_NAME as a slug>-database-` | — | Prefix of every key |
| `REDIS_CLUSTER` | `redis` | — | Cluster mode |
| `REDIS_PERSISTENT` | `false` | — | Keep connections open between requests |
| `REDIS_MAX_RETRIES` | `3` | — | Retries of a failed command |
| `REDIS_BACKOFF_ALGORITHM` | `decorrelated_jitter` | — | How the wait between retries grows |
| `REDIS_BACKOFF_BASE` | `100` | — | First wait, in milliseconds |
| `REDIS_BACKOFF_CAP` | `1000` | — | Longest wait, in milliseconds |

## Mail

Once a mail type is saved under **Setup → General Settings** (SMTP or PHP
mail), the panel's settings replace `MAIL_MAILER` and the SMTP values here,
and the panel's sender address and name replace `MAIL_FROM_*`. Until then
`.env` decides, and `.env.example` ships `MAIL_MAILER=log`: mail is written to
the log, not sent. See [Configure email](../guides/configure-email.md).

| Variable | Default | .env.example | What it does |
|---|---|---|---|
| `MAIL_MAILER` | `log` | `log` | How mail leaves: `smtp`, `sendmail`, `ses`, `postmark`, `resend`, `log`, `array`, `failover`, `roundrobin` |
| `MAIL_HOST` | `127.0.0.1` | `127.0.0.1` | SMTP server |
| `MAIL_PORT` | `2525` | `587` | SMTP port |
| `MAIL_USERNAME` | — | `null` | SMTP user |
| `MAIL_PASSWORD` | — | `null` | SMTP password |
| `MAIL_SCHEME` | — | `null` | `smtps` for TLS from the first byte (port 465); empty for SMTP with STARTTLS |
| `MAIL_URL` | — | — | The whole SMTP connection as one URL |
| `MAIL_EHLO_DOMAIN` | the host of `APP_URL` | — | The name PNLCS gives itself to the SMTP server |
| `MAIL_SENDMAIL_PATH` | `/usr/sbin/sendmail -bs -i` | — | The sendmail command, for `MAIL_MAILER=sendmail` (also what **PHP mail** in the panel uses) |
| `MAIL_LOG_CHANNEL` | — | — | Log channel the `log` mailer writes to |
| `MAIL_FROM_ADDRESS` | `hello@example.com` | `noreply@your-domain.com` | Sender address |
| `MAIL_FROM_NAME` | `APP_NAME` | `${APP_NAME}` | Sender name |
| `MAIL_ENCRYPTION` | — | `tls` | Not read: `config/mail.php` has no setting for it. Use `MAIL_SCHEME` |
| `POSTMARK_API_KEY` | — | — | API key for `MAIL_MAILER=postmark` |
| `RESEND_API_KEY` | — | — | API key for `MAIL_MAILER=resend` |

`MAIL_MAILER=ses` uses the `AWS_*` keys below.

## Logging

| Variable | Default | .env.example | What it does |
|---|---|---|---|
| `LOG_CHANNEL` | `stack` | `stack` | Where the application log goes |
| `LOG_STACK` | `daily` | `daily` | The channels the `stack` channel writes to, comma separated |
| `LOG_LEVEL` | `info` (`debug` for stderr, syslog, errorlog and papertrail; `critical` for slack) | `warning` | The least severe level written |
| `LOG_DAILY_DAYS` | `14` | — | Days of `storage/logs/laravel-<date>.log` files the `daily` channel keeps |
| `LOG_DEPRECATIONS_CHANNEL` | `null` | `null` | Where PHP and framework deprecation warnings go; `null` drops them |
| `LOG_DEPRECATIONS_TRACE` | `false` | — | Add a stack trace to deprecation warnings |
| `LOG_SLACK_WEBHOOK_URL` | — | — | Slack webhook of the `slack` channel |
| `LOG_SLACK_USERNAME` | `APP_NAME` | — | Name it posts as |
| `LOG_SLACK_EMOJI` | `:boom:` | — | Icon it posts with |
| `PAPERTRAIL_URL` | — | — | Papertrail host of the `papertrail` channel |
| `PAPERTRAIL_PORT` | — | — | Papertrail port |
| `LOG_PAPERTRAIL_HANDLER` | `SyslogUdpHandler` | — | Monolog handler of the `papertrail` channel |
| `LOG_STDERR_FORMATTER` | — | — | Monolog formatter of the `stderr` channel |
| `LOG_SYSLOG_FACILITY` | `LOG_USER` | — | Syslog facility of the `syslog` channel |

## File storage

| Variable | Default | .env.example | What it does |
|---|---|---|---|
| `FILESYSTEM_DISK` | `local` | `local` | Default disk: `local`, `public` or `s3` |
| `AWS_ACCESS_KEY_ID` | — | empty | Access key for S3, and for SES, SQS and DynamoDB when used |
| `AWS_SECRET_ACCESS_KEY` | — | empty | Its secret |
| `AWS_DEFAULT_REGION` | `us-east-1` (none for the `s3` disk) | `us-east-1` | Region |
| `AWS_BUCKET` | — | empty | S3 bucket of the `s3` disk |
| `AWS_URL` | — | — | Public address of the bucket |
| `AWS_ENDPOINT` | — | — | Endpoint of an S3-compatible service |
| `AWS_USE_PATH_STYLE_ENDPOINT` | `false` | `false` | Path-style addresses, which most S3-compatible services need |

## PNLCS

| Variable | Default | .env.example | What it does |
|---|---|---|---|
| `PNLCS_UPDATE_INDEX_URL` | `https://api.github.com/repos/Panelica/pnlcs/releases?per_page=30` | — | Where the updater looks for releases ([Updating](../install/updating.md)) |
| `PNLCS_UPDATE_PUBLIC_KEY` | the PNLCS release key | — | Base64 of a PEM public key that replaces the release key. For testing the updater only: a package not signed with this key is refused |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | — | Address of the service behind **Translate with AI**, for an OpenAI-compatible endpoint other than OpenAI's. The key and model are set on **Setup → Languages** |

## Other

| Variable | Default | .env.example | What it does |
|---|---|---|---|
| `SLACK_BOT_USER_OAUTH_TOKEN` | — | — | Slack bot token for Laravel's Slack notifications. PNLCS's own Slack alerts are set up under **Notification Channels**, not here |
| `SLACK_BOT_USER_DEFAULT_CHANNEL` | — | — | Default channel for that bot |
| `BROADCAST_CONNECTION` | — | `log` | Laravel's broadcasting driver. PNLCS broadcasts nothing |
| `VITE_APP_NAME` | — | `${APP_NAME}` | Passed to the front-end build (`npm run build`) |
