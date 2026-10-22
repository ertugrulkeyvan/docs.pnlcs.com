---
sources:
  - app/Support/MailTransport.php
  - resources/views/admin/settings/general.blade.php
  - app/Http/Controllers/Admin/ConfigController.php
  - resources/views/admin/config/email-templates.blade.php
  - database/seeders/EmailTemplateSeeder.php
  - app/Http/Controllers/Admin/LogController.php
---

# Configure Email

Email is **required**. Invoices, order confirmations, password resets, welcome
messages and ticket replies all go out by email.

## Set up sending

**Setup → General Settings → Mail Configuration**

| Field | What to enter |
|---|---|
| **Enable outgoing emails** | On. Off stops every email PNLCS sends; the log then records `Outgoing mail suppressed: mail is disabled in the panel settings.` |
| **Mail Type** | **SMTP** (recommended), or **PHP Mail** to hand mail to the server's own `sendmail`. The line under it shows the transport in use now. |
| **System Email Address** | The sender address, for example `noreply@example.com`. |
| **Email From Name** | The sender name customers see, for example your company name. |
| **SMTP Host** | Your mail provider's SMTP server. |
| **SMTP Port** | `587` for STARTTLS (the default), `465` for SSL. |
| **SMTP Encryption** | **TLS (STARTTLS)** for port 587, **SSL** for 465, **None** only for a relay on a trusted network. |
| **SMTP Username / Password** | From your mail provider. Left empty on a later save, the stored password is kept. |

Save, then press **Send Test Email** and check that it arrives, spam folder
included. The test goes through exactly the same settings as real mail.

!!! note "The panel wins over `.env`"
    Once a mail type is saved here, these settings replace the `MAIL_*` values
    in `.env`. Until then `.env` decides, even though the form shows **PHP
    Mail** selected, and a fresh install's `.env` has `MAIL_MAILER=log`: mail
    is written to the log, not sent, and the page says so under Mail Type.

## Keep it out of spam folders

Set these DNS records for the domain you send from:

- **SPF**: allows your mail server to send for the domain.
- **DKIM**: signs outgoing mail (your mail provider gives you the record).
- **DMARC**: a policy that ties SPF and DKIM together.

A transactional mail service (Amazon SES, Postmark, Mailgun, SendGrid and the
like) usually reaches the inbox more reliably than a self-hosted SMTP server.

## Email templates

PNLCS ships ready-made templates: sign-up and email verification, invoice
created, payment confirmation, reminders and overdue notices, order
confirmation, service welcome, suspension and termination, domain renewal,
SSL certificates, ticket replies, failed automatic payments, sign-in from a new
device, confirmation codes and more. Manage them under **Setup → Email
Templates**:

- Each language has its own set; pick the language at the top of the page.
- **Edit** a template to change its subject and text, or tick **Disabled** to
  stop that email.
- Until you change the text, the email goes out in the built-in design. Once
  you change it, your text is sent instead; **Use the built-in email** goes
  back to the built-in one and keeps your text for later.
- **New Device Sign-in** is installed disabled.

## What was sent

Every email PNLCS sends to a customer is recorded. Customers read theirs under
**Email History** in the client area; staff see them on the client's record,
and all of them under **Utilities → System Logs → Email Logs**, which can be
filtered by Sent, Pending or Failed and searched by subject or recipient.

## Not arriving?

See [Emails are not being sent](../troubleshooting/common-issues.md#emails-are-not-being-sent).
