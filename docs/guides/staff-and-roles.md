---
sources:
  - app/Constants/Permissions.php
  - app/Http/Controllers/Admin/ConfigController.php
  - app/Models/AdminRole.php
  - app/Services/WidgetManager.php
  - app/Widgets/
  - app/Http/Controllers/Admin/AuthController.php
  - app/Services/TwoFactorService.php
  - resources/views/admin/config/admin-roles.blade.php
  - resources/views/admin/config/admins.blade.php
  - routes/admin.php
---

# Staff & Roles

Give your team access without handing everyone every key. Each member of staff
has an account, and each account has a **role**: a set of permissions chosen
from 46.

## Create a role

**Setup → Admin Roles**

1. Name the role (for example "Support Agent" or "Billing Manager") and
   describe it.
2. Tick the **permissions** it grants. They are grouped as Clients, Orders,
   Invoices, Products, Services, Domains, Tickets, Configuration (one for each
   setup area: staff, roles, servers, gateways, registrars, email templates
   and so on), Reports & System, and Quotes & Projects.
3. Or tick **Full administrator**: the role then has every permission,
   including ones added in later versions. **manage updates** (applying a
   PNLCS update) is the one to think twice about: it replaces the
   application's own code.

A role that still has staff on it cannot be deleted. You cannot edit your own
role so that it loses **manage roles**, which would leave nobody able to fix
roles from the admin area.

### You can only hand out what you have

Someone who is not a full administrator can only create or edit a role, or
give a role to an account, when every permission in it is one they hold
themselves, and never **Full administrator**. They also cannot edit an account
(its password included) whose role they could not have granted. Otherwise
PNLCS answers "That role carries rights you do not hold yourself."

### The dashboard follows the role

Each dashboard widget needs a permission, and a member of staff only sees the
widgets their role allows: the billing figures need **view reports**, the
clients, orders, services, domains and tickets widgets need the matching
**list** permission, system health and automation need **view system**, and
the registrar balance needs **manage registrars**. The overview counts and
the to-do list are shown to everyone.

## Add a member of staff

**Setup → Admin Accounts**

1. Enter their first and last name, email and username, and choose a password
   (at least 6 characters).
2. Assign a **role**.
3. Save, and give them the username and password yourself: PNLCS does not email
   them. They sign in at `https://example.com/admin/login` and can change the
   password under **My Account**.

## When someone leaves

Delete their account on **Setup → Admin Accounts**. They can no longer sign
in, and every API credential the account owned is deleted with it. You cannot
delete your own account.

## Example roles

| Role | Typical permissions |
|---|---|
| **Support Agent** | List and view clients, all ticket permissions, list services |
| **Billing Manager** | Invoices, orders, clients, reports; no servers, roles or settings |
| **Administrator** | Full administrator |

## Good practice

- Give each person the **least access** their job needs.
- Ask everyone to turn on **two-factor authentication** under **My Account**.
  PNLCS then shows 8 backup codes once; each works one time in place of the
  app's code, so they belong in a password manager.
- Review roles now and then, and delete accounts as soon as people leave.

Staff actions are recorded in the **Activity Log** (**Utilities → Activity
Log**): who did what, and when. **Utilities → System Logs** has, in its
sidebar, the **Gateway Logs**, **Module Logs** (the calls the SSL module and
KSeF make) and **Email Logs**. All of these need the **view activity log**
permission.

## API access

Staff use the API through [API credentials](../api/index.md#authentication),
which act with the permissions of the account that owns them.
