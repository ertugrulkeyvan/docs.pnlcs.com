---
sources:
  - modules/Servers/Custom/CustomModule.php
  - modules/Servers/Custom/pnlcs.json
  - app/Services/ProvisioningService.php
  - app/Services/OrderService.php
  - app/Http/Controllers/Admin/ConfigController.php
  - app/Services/Module/ModuleRegistry.php
---

# Custom (manual provisioning)

The `custom` server module, shown as **Custom/No Module**, is for services you set up **by hand**. It never contacts
a server. Every action it is asked to do, it reports as done, so PNLCS runs the normal life cycle (activation,
suspension, termination, emails) while you do the actual work yourself.

Use it for anything sold as a service with no module that can create it: a managed server, a hosting account on a
panel PNLCS has no module for, a support contract.

## Requirements

None. No credentials, no API, no server record. A server record of type Custom is optional (see below).

## Configure PNLCS

1. On the product (**Setup → Products/Services**), set **Server Module** to **Custom/No Module**.
2. Choose **Auto Setup** as for any other product. "Created" means only that PNLCS marks the service active.
3. Leave **Plan on the server** on its default. The module has no plans; the list stays empty and the note under it
   says either that there is no active server of that type or that the server "returned no plans". Both can be
   ignored.

A server record of type **Custom** is not needed for the product to work: the module does not choose a server and
the service is not tied to one. Add one only if you want the machine listed under **Setup → Servers**. It needs no
credentials. **Test** on it only opens a connection to the hostname and port (port 22 when the record has none) and
reports `Connection to <host>:<port> successful (… ms). Module: custom` when the port is open.

## What each action does

| Action | In PNLCS | On any server |
|---|---|---|
| Create | The service becomes **Active**, with the message "Service created manually", and the welcome email and activation hooks run | Nothing |
| Suspend | The service becomes **Suspended**, with the reason | Nothing |
| Unsuspend | The service becomes **Active** | Nothing |
| Terminate | The service becomes **Terminated** | Nothing |
| Change password | The new password is saved on the service | Nothing |
| Change package | The service moves to the new product | Nothing |
| Usage | No figures | Nothing |

None of these can fail, so nothing goes to the module queue and no failure alerts are sent.

!!! warning "Suspension does not stop anything"
    When an invoice goes overdue, PNLCS suspends the service and tells the customer, but the service keeps running
    wherever it runs. The same goes for termination. Do these by hand on the real system, or the customer keeps
    using what they no longer pay for.

Not available: sign-in links to a panel, usage figures, a list of existing accounts, and the customer's hosting
tools.

## Custom or no module

The product's **Server Module** list also has **None - nothing is created on a server**. The two differ in small ways:

| | Custom/No Module | None |
|---|---|---|
| Activation when the order is accepted | Through the module: always succeeds | Set active directly; for a hosting, reseller or VPS product a warning is logged that nothing was created on any server |
| **Auto Setup**: when the order is placed | Activated when the order is placed | Waits until the order is accepted |
| Create, suspend, unsuspend, terminate and change password from the service page | Succeed and change the service's status | Refused with "No server module configured for this product." |

Choose Custom when you want PNLCS to keep the service's status in step with billing, and None for something with no
status of its own, such as a one-off download.
