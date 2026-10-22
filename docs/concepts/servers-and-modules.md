---
sources:
  - app/Providers/ModuleServiceProvider.php
  - app/Services/Module/ModuleRegistry.php
  - app/Contracts/ServerModuleInterface.php
  - app/Services/ProvisioningService.php
  - app/Console/Commands/ModuleQueueProcessCommand.php
  - app/Http/Controllers/Admin/LiveServerController.php
  - app/Services/DomainHosting.php
  - modules/Servers/
  - resources/views/admin/config/servers.blade.php
  - resources/views/admin/config/modules.blade.php
---

# Servers & Modules

Provisioning — automatically creating a hosting account when an order is paid —
is one of the most valuable things PNLCS does. This page explains how it works.

## Server

A **server** in PNLCS is a record describing a machine where customer accounts
live: its hostname, port, and API credentials. You add servers under
**Setup → Servers**.

Some types have settings of their own on the server form. A **Proxmox VE**
server, for example, has its **Node** (empty = the least busy node), a
**Resource pool**, and an optional **First VM id** / **Last VM id** range that
keeps customer machines apart from your own. See
[Connect a Server](../guides/connect-a-server.md#credentials-by-type).

## Module

A **module** is the code that knows how to talk to a particular control panel or
provider's API. PNLCS ships with these server modules:

| Module | What it provisions |
|--------|--------------------|
| **Panelica** | Accounts on a Panelica hosting panel (fully tested) |
| **Panelica Licenses** | Panelica licenses, sold with a Panelica partner account ([guide](../guides/sell-panelica-licenses.md)) |
| **cPanel/WHM** | WHM/cPanel accounts |
| **Plesk** | Plesk subscriptions |
| **DirectAdmin** | DirectAdmin users |
| **HestiaCP** | HestiaCP users |
| **aaPanel** | Sub aaPanel accounts (needs aaPanel Pro) |
| **Proxmox VE** | Proxmox VMs / LXC containers (VPS) |
| **Vultr** | Vultr cloud instances (VPS) |
| **Custom** | No automation — you create accounts by hand |

When you add a server you pick its **Server Type** (which module handles it).
A **product** then picks a **Server Module**, not a single server, and
optionally a **Server group**. When the account is created, PNLCS chooses a
server of that type: from the product's group if it has one, otherwise the
first active server with that module. The service then stays on that server.

**Setup → Modules** lists every installed module (servers, payment gateways,
registrars, SSL modules and addons), whether it is *Built-in* or
*Third-party*, how much uses it, and a **Switch off** button: a module that is
switched off is no longer offered for new servers or products, and what
already uses it keeps working. See [Modules](../guides/modules.md).

A third-party module is a folder under `modules/` with a `pnlcs.json`
manifest; PNLCS finds it by itself, and a built-in module of the same name
always wins. See [Writing a module](../developer/modules.md).

## Server groups

If you have several servers of the same type, put them in a **server group**.
A product can point at the group, and PNLCS picks a server from it, either
filling one server at a time (**Sequential**) or giving each new account to
the server with the fewest (**Round Robin**), and skipping servers that have
reached their **Max Accounts**. When no server in the group has room,
provisioning fails and is reported rather than using a server outside the
group.

## What the module does

For each service, the module can:

- **Create** the account (when the order is accepted, or at once if the
  product's **Auto Setup** says so)
- **Suspend** it (non-payment)
- **Unsuspend** it (payment received)
- **Terminate** it (cancellation)
- **Change password** and **change package** (upgrades/downgrades)
- **Report usage** (disk / bandwidth) back, checked every hour, for overage
  billing

## Reliable provisioning

PNLCS only marks a service **Active** *after* the module confirms the account
was created. If the module call fails (server down, bad credentials, quota
full), the service stays pending, you get an alert, and the action is
queued and **retried automatically** up to 5 times, with growing gaps
(about 5, 5, 10, 20 and 40 minutes); after the last attempt it stops and you
are alerted again. An error that can never come right (for example, no server
module configured) is not retried at all, and the alert says so.
Nothing silently shows "active" without a real account behind it.

You can see what is waiting and retry; see
[Provisioning did not happen](../troubleshooting/common-issues.md#provisioning-did-not-happen).

## Panelica extras

Two features work with Panelica servers only, because they use parts of its
API the other panels do not offer:

- **Live Servers**, on the admin dashboard, signs you in to any of your
  Panelica servers' control panels with one click. See
  [Live Servers](../guides/live-servers.md).
- **Set Up on My Hosting**, on a domain's page in the client area, adds the
  domain to the customer's Panelica hosting account and points its nameservers
  there. See [Sell Domains](../guides/sell-domains.md#set-up-on-my-hosting).

## Adding a server

Step-by-step: [Connect a Server](../guides/connect-a-server.md).

!!! tip "Which panel should I use?"
    PNLCS works with all the panels above. If you're still choosing, the
    **Panelica** module is the most thoroughly tested, and
    [Panelica](https://panelica.com) is a modern cPanel/Plesk alternative with
    built-in isolation (no CloudLinux) and universal migration.
