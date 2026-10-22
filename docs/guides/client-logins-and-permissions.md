---
sources:
  - app/Support/ClientPermissions.php
  - app/Http/Controllers/Client/AccountUserController.php
  - app/Http/Controllers/Client/AccountController.php
  - app/Services/ClientInviteService.php
  - app/Services/ClientLoginEmail.php
  - app/Services/LoginRecorder.php
  - app/Services/SensitiveActionConfirmation.php
  - app/Http/Controllers/Client/EmailVerificationController.php
  - resources/views/client/account/users.blade.php
  - resources/views/client/account/security.blade.php
---

# Client Logins & Permissions

A **client** is an account: the company or person you bill. A **login** is a
person who signs in to the client area. They are separate on purpose:

- one account can have **several logins**: an owner, an accountant, a
  developer;
- one login can open **several accounts**, and switches between them from the
  client area menu.

## The owner

The login that opened the account (by registering, or created with the
account) is its **owner**. The owner can do everything, always.

## Changing the email address

A customer changes the address they sign in with on **My Profile**, confirmed
with their current password; the account's address changes with it.

When you change an account's email address on its edit page (or with the
API's [updateclient](../api/clients.md#updateclient)), the login that signed in
with the old address moves to the new one, so the customer signs in with the
address you entered. Either way:

- the new address is asked to confirm itself, as at sign-up;
- the old address is told that the sign-in address changed;
- a login on another address (an invited accountant, a login imported from
  WHMCS with its own address) keeps it;
- an address another login already signs in with is refused, and nothing is
  changed.

## Other logins and what they may do

Each other login on an account has a set of **permissions**. A login without a
permission cannot open that part of the client area; the page answers with a
message telling them to ask the account owner.

| Permission | Opens |
|---|---|
| `profile` | The account's profile and billing details |
| `contacts` | Contacts |
| `products` | Services: the list and their pages |
| `manageproducts` | Changing services: upgrades, cancellations, hosting management |
| `productsso` | Signing in to a service's control panel |
| `domains` | Domains: the list and their pages |
| `managedomains` | Changing domains: nameservers, lock, auto-renew, EPP code |
| `invoices` | Invoices, payment methods and account credit |
| `quotes` | Quotes |
| `tickets` | Support tickets |
| `affiliates` | The affiliate programme |
| `emails` | Email history |
| `orders` | Checking out new orders |

Logins created before permissions existed keep full access.

## Inviting someone to an account

The owner manages the other logins on the client area's **Users** page (in
the account menu; only the owner sees it):

- **Invite a user**: an email address and the permissions to give. The
  invitation is an email with a link, valid for **7 days**. The person opens
  it, creates a login (or signs in with the one they have) and joins the
  account with those permissions.
- **Open invitations** lists the ones not yet accepted; **Cancel** withdraws
  one.
- **Logins on this account**: change a login's permissions and save, or
  **Remove** its access. The owner's own login cannot be changed or removed.

The admin area has no screen for this. Staff, and integrations, use the API:
[createclientinvite](../api/clients.md#createclientinvite),
[getuserpermissions](../api/clients.md#getuserpermissions),
[updateuserpermissions](../api/clients.md#updateuserpermissions) and, to take
a login off an account, [deleteuserclient](../api/clients.md#deleteuserclient).

## Contacts are not logins

**Contacts** (the **Contacts** page in the client area; admin: the client's
contacts) are people you may email about the account, for example a billing
contact. They do not sign in.

## Signing a customer in for them

- From the admin area, staff who may edit clients can press **Login as
  Client** on the client's page to open the client area as the customer, and
  see what they see.
- Integrations can create a **one-time sign-in link** with
  [createssotoken](../api/clients.md#createssotoken): valid for 60 seconds and
  one use, to the client area page you choose.

## Protecting logins

Each login has a **Security** page in the client area:

- **Two-factor authentication**: turn it on with an authenticator app.
  PNLCS then shows backup codes once; each signs the login in one time if the
  app is lost.
- **Sign-in history**: the last 20 sign-ins and wrong passwords for this
  login.
- **Active sessions**, with a button to sign out each other session. The list
  needs the database session driver; with another driver it is not shown.
- **Phone Verification**, when you have switched on Twilio SMS codes (see
  below): the client confirms their phone number with a code.
- **Your data** (the account owner only): download a copy of everything kept
  about the account, as JSON.

A sign-in from a browser the login has not used before can be emailed to the
login's address with the **New Device Sign-in** email template. The template
is installed switched off; open it under **Setup → Email Templates** and untick
**Disabled**. The
very first sign-in PNLCS records for a login sends nothing.

## Sign-in settings

These are under **Setup → General Settings**:

- **Email Verification**: *New customers must confirm their email address* is
  on by default. They can sign in and look around either way, but an
  unconfirmed address is stopped at the checkout. Existing accounts are not
  affected.
- **Social Login**: let customers sign in with Google or GitHub. Each needs
  an OAuth client ID and secret; the section shows the redirect address to
  register with the provider.
- **SMS Verification**: lets clients verify their phone number with a Twilio
  SMS code. Off by default.
- **Customer account protection**: ask for a six-digit code sent by email
  before the client area shows a domain's transfer code, changes its lock or
  offers the domain to another account. Off by default. The code is valid for
  10 minutes; one confirmation lasts 15 minutes.
