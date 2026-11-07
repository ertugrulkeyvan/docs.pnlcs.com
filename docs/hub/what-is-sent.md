---
description: The once-a-day message every PNLCS installation sends to the PNLCS team at hub.pnlcs.com, field by field, and what the team does with it.
---

# What is sent

Once a day, a PNLCS installation sends a short message to the PNLCS team at
`hub.pnlcs.com`. It tells the team how to reach whoever runs the installation
about security problems and updates. This page lists everything in that message,
when it goes, how long it is kept and how to have it deleted.

Your customers, invoices, money, modules, passwords, keys and file paths are
**never** sent.

## Why

When a security flaw is found in a release, the team must be able to warn
everyone who runs it. Without this message, the team does not know who you are.
The message is also what lets the team answer you with signed notices (below),
count how many installations are in use, and offer support or services.

## What is in the message

| Field | What it is | Where it comes from |
|---|---|---|
| `install_id` | A random identifier for this installation | Made on the first message |
| `install_secret` | A random secret that proves later messages come from the same installation. The hub keeps only a fingerprint of it, never the secret itself | Made on the first message |
| `url` | The address of your PNLCS site | `APP_URL` |
| `company_name` | Your company name | **Setup → General Settings** (the site name when empty) |
| `company_email` | Your company e-mail address | **Setup → General Settings** |
| `phone` | Your company phone number | **Setup → General Settings** |
| `country` | Your company country, two letters | **Setup → General Settings** |
| `admin_name`, `admin_email` | The name and e-mail address of the oldest active administrator with full access | **Setup → Admin Accounts** |
| `locale` | The default language | **Setup → General Settings** |
| `version` | The PNLCS version | The installation |
| `install_method` | How PNLCS was installed: `docker`, `script` (the one-command installer), `git`, `package` (the release package, unpacked by hand or in a hosting panel) or `unknown` | The installation |
| `install_mode`, `docker` | Whether the installation updates as a package or from git, and whether it runs in a container | The installation |
| `php`, `db` | The PHP and database server versions | The server |
| `purpose` | `live` or `test`, if you answered **What is this install for?** | The install wizard, or **Setup → General Settings** |
| `source` | Your answer to **How did you hear about PNLCS?**, if you gave one | The install wizard, or the one-time box on the dashboard. Sent once |
| `community_profile` | Whether you ticked **Create my PNLCS community profile** | The install wizard, or the one-time box on the dashboard. Sent once |

The hub also sees the IP address the message comes from. It uses it at that
moment to slow down floods of messages and, when you left the country empty,
to guess the country. **It does not store the IP address.**

If you tick **Create my PNLCS community profile**, the hub sends an invitation
to the administrator's e-mail address for
[community.pnlcs.com](https://community.pnlcs.com), once, a few days after
the installation starts sending.

## When it is sent

- **Once a day**, at an hour picked from the installation's identifier, so
  installations do not all call at the same moment. It runs from the scheduler
  (`pnlcs:hub-ping`, see [Scheduled commands](../reference/scheduled-commands.md)).
- **At the end of the install wizard**, once.
- **Without a cron job**, the admin dashboard sends it, after the page has
  loaded, when the last message is more than a week old.

Only an installation with `APP_ENV=production` sends it. Development copies
and the PNLCS test suite do not. This is not a setting, and there is no
switch to turn the message off.

If the hub is slow, down or unreachable, nothing changes in PNLCS: the message
waits at most five seconds, the failure is written to the log, and the next
day's message tries again. Update checks do not depend on the hub.

## What comes back

The hub answers with the latest version numbers and, sometimes, a **notice**
from the PNLCS team, such as a security warning.

- Every notice is **signed** by the PNLCS team with a key that is not on the
  hub. PNLCS checks the signature against the key built into it and ignores
  anything that does not match. Someone who took over the hub could not show
  you a false notice.
- Every notice ends: it expires within 90 days at most.
- A notice links only to `pnlcs.com`, `docs.pnlcs.com`, `community.pnlcs.com`
  or the PNLCS project on GitHub.
- A **critical** notice shows as a red bar on every admin page until you update
  past the affected versions, and your administrators get one e-mail about it,
  sent by your own installation. An **info** notice shows on the dashboard and
  can be closed.

The answer is plain data: no code, no download, no redirect.

## Test copies

If you copy a live installation to try something, answer **A test or trial copy**
in **Setup → General Settings**. A copy made from a database copy is noticed by the
hub and gets its own identifier. Installations on `localhost`, a bare IP address, a name without a dot, or a
name ending in `.test`, `.local`, `.localhost`, `.lan` or `.internal` are
counted as trials anyway.

## How long it is kept

- Every message replaces the previous one: the hub keeps the latest details,
  not a history (apart from the list of earlier site addresses).
- An installation that has sent nothing for **30 days** is marked closed.
- A closed installation's record is **deleted 24 months** after its last message.
- Contact details are stored encrypted. The hub's admin screen is not open to
  the internet and needs a second factor.

## Deletion and "do not contact"

Write to **info@pnlcs.com** from your company or administrator e-mail
address, with your PNLCS site address:

- **Delete my record:** the record is deleted and the installation's identifier
  is blocked, so the next day's message does not create it again. The hub then
  answers that installation with nothing but the protocol number.
- **Do not contact me:** the record stays for security notices, but the team
  will not contact you for anything else.

You can also ask for a copy of what the hub holds about your installation.

The hub and its data are run by Panelica, LLC. See the
[pnlcs.com privacy policy](https://pnlcs.com/privacy.html) for your rights.
