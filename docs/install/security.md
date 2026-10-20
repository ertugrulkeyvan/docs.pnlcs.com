# Security checklist

Go through this list after installing, and again whenever you change the
server.

## The server

- [ ] **HTTPS everywhere.** `APP_URL` starts with `https://`, and HTTP
  redirects to HTTPS ([installation step 15](native.md#15-turn-on-https)).
  Checkout and the admin login must never run over plain HTTP.
- [ ] **The web root is `public/`**, never the project directory.
  `curl -sI https://example.com/.env` must answer 403 or 404.
- [ ] **`APP_DEBUG=false`** in `.env`. With debug on, an error page shows
  stack traces and configuration to anyone.
- [ ] **`.env` belongs to the web server user, mode `640`.** It holds the
  database password and `APP_KEY`.
- [ ] **The install wizard is closed.** `https://example.com/install` answers
  404 once the wizard has finished.
- [ ] **Backups leave the server** ([Backups](backups.md)), and `.env` is part
  of them: without its `APP_KEY` the stored gateway and registrar keys cannot
  be read back.
- [ ] **You update regularly** ([Updating](updating.md)).

## Staff accounts

- [ ] **Two-factor authentication** on every staff account: each person turns
  it on under **My Account** (the menu under their name). PNLCS then shows
  backup codes once; each works one time in place of the app's code, so they
  belong in a password manager.
- [ ] **Least privilege.** Every role grants only what its people need
  ([Staff & Roles](../guides/staff-and-roles.md)); keep full-administrator
  roles for the few who need them.
- [ ] **Disable or delete accounts when people leave** (**Setup → Admin
  Accounts**). A disabled account keeps its history but cannot sign in, and
  its API credentials stop working at once; deleting does the same for good.
- [ ] **Read the activity log** now and then: **Utilities → Activity Log**
  records who did what.

## API credentials

- [ ] One credential per integration, owned by a staff account with only the
  permissions that integration needs.
- [ ] **Restricted to the addresses it is used from**: **Setup → API
  Credentials → Edit → Allowed IP addresses**.
- [ ] Credentials are sent in the `X-API-Key` / `X-API-Secret` headers, never in
  URLs ([API overview](../api/index.md#authentication)).

## Customers and orders

- [ ] **Email verification for sign-ups** is on (**Setup → General Settings →
  Email Verification**; on by default).
- [ ] **Fraud screening** is set up if you sell to people you do not know:
  MaxMind or FraudLabs Pro under **Setup → General Settings → Fraud
  Screening**. Orders it holds wait in **Orders → Fraud**.
- [ ] **reCAPTCHA** on the forms bots go for: **Setup → General Settings →
  Google reCAPTCHA protection**. Enter the keys of a v2 "I'm not a robot"
  site once, then switch it on per form: sign-in, account sign-up (register
  page and checkout), password reset, the public contact form, and new
  support tickets.
- [ ] **Customer account protection** (same page, off by default): a customer
  confirms with a six-digit code from their email before they can see a
  domain's transfer code or change its lock. One confirmation lasts 15
  minutes.
- [ ] **New-device sign-in alerts**: customers get an email when their account
  is signed in to from a device PNLCS has not seen. The **New Device Sign-in**
  template ships disabled; enable it under **Setup → Email Templates**.
- [ ] Customers can protect their own logins with two-factor authentication
  from their **Security** page in the client area.
- [ ] **Social login** (Google, GitHub) uses your own OAuth client: create it
  in the Google Cloud console or under GitHub → Settings → Developer
  settings, with the redirect address shown under **Setup → General Settings
  → Social Login**. Leave it off if you have not set one up.
- [ ] Abusive addresses and domains go on **Setup → Banned IPs** and
  **Setup → Banned Emails**.

## Reporting a vulnerability

Please do not open a public issue. Write to
[security@panelica.com](mailto:security@panelica.com); the
[security policy](https://github.com/Panelica/pnlcs/blob/main/SECURITY.md)
explains what happens next.
