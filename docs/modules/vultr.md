---
sources:
  - modules/Servers/Vultr/VultrModule.php
  - modules/Servers/AbstractServerModule.php
  - app/Http/Controllers/Admin/ConfigController.php
  - app/Http/Controllers/Admin/ProductController.php
  - app/Services/ProvisioningService.php
  - resources/views/admin/config/servers.blade.php
vars:
  install_folder: /var/www/pnlcs
---

# Vultr cloud servers

The `vultr` server module creates one **Vultr cloud instance** per service through Vultr's API
(`https://api.vultr.com/v2`). The customer gets root access to the instance with the password Vultr generates.

It is a small module: create, power off and on for suspension, destroy, and plan change. There is no VPS panel for
the customer (power buttons, console, reinstall); that exists only for [Proxmox VE](../guides/sell-vps-on-proxmox.md).

## Requirements

- A Vultr account with an **API key** (Vultr account → API). PNLCS sends it as a bearer token.
- If you limit the key's access by IP address on Vultr, allow the address PNLCS connects from.
- Enough balance or credit on the Vultr account for the instances you sell.

Vultr's certificate is verified.

## Configure PNLCS

1. In **Setup → Servers**, add a server of type **Vultr**:
    - **Hostname**: `api.vultr.com`. The module itself always calls Vultr's API address, but **Test** first opens a
      connection to this host and port, so it must be a host that answers.
    - **Port**: 443 (the form fills it in). A server saved with no port is tested on port 22.
    - **API Key**: your Vultr API key. Password, username and nameservers are not used.
    - **Max Accounts** counts instances when PNLCS chooses a server from a [server group](../guides/connect-a-server.md#server-groups).
2. Press **Test**. It passes when the host and port answer and Vultr accepts the key on its account endpoint
   (`GET /account`).

An active server cannot be saved without the API key.

| Test message | Meaning |
|---|---|
| `Connection to <host>:<port> successful (… ms). Module: vultr` | The host answered and Vultr accepted the key |
| `Connection to <host>:<port> failed: …` | The hostname or port on the server record does not answer |
| `Reached <host>, but VULTR refused the credentials. Check the API key.` | Vultr refused the key, or the call failed |

## The product

Set **Server Module** to **Vultr**. The module reads three keys from the product's settings:

| Key | Also read as | Default |
|---|---|---|
| `vultr_region` | `region` | `ewr` |
| `vultr_plan` | `plan` | `vc2-1c-1gb` |
| `vultr_os_id` | `os_id` | `1743` |

!!! warning "The product form has no fields for these"
    The **Plan on the server** list stays empty for Vultr (the form says the server "returned no plans"), and
    nothing on the form writes these keys. Until you set them, every Vultr product creates a `vc2-1c-1gb`
    instance in `ewr` with OS id `1743`. Set them on the product directly, replacing `12` with the product's id:

    ```bash
    cd /var/www/pnlcs
    php artisan tinker --execute='$p = App\Models\Product::find(12); $p->config_options = array_merge((array) $p->config_options, ["vultr_region" => "fra", "vultr_plan" => "vc2-2c-4gb", "vultr_os_id" => 1743]); $p->save();'
    ```

    Saving the product form later keeps them. Use the region, plan and OS ids from your Vultr account.

The **Vultr API Key**, **Default Region**, **Default Plan** and **Default OS ID** settings the module declares are not
shown anywhere and not read; the defaults above are fixed in the module.

## Creating an instance

PNLCS asks Vultr for a new instance with:

- the region, plan and OS id from the product;
- **label**: the service's domain, or `pnlcs-<service id>`;
- **hostname**: the service's domain, or `vps-<service id>.pnlcs.local`;
- **tag**: `pnlcs-service-<service id>`.

The service is set active with username `root` and the password Vultr returns for the new instance. The instance id
and its main IP address (`pending` until Vultr assigns one) are stored on the service. PNLCS does not wait for the
instance to finish building.

## Supported operations

| Operation | What happens on Vultr |
|---|---|
| Create | A new instance, as above |
| Suspend | The instance is **halted** (powered off). It still exists on your Vultr account |
| Unsuspend | The instance is **started** |
| Terminate | The instance is **deleted**, with its disk. This cannot be undone |
| Change package | The instance is moved to the plan in the new product's `vultr_plan` (or `plan`) key |
| Usage, hourly | For each active service: the plan's disk size (stored as the disk limit, in MB), RAM, vCPU count and main IP. Vultr does not report disk use |

**Change password is not supported.** It always fails with "Password change via API is not supported for Vultr VPS.
Use SSH or reinstall."

Not offered for Vultr: a customer panel, sign-in links, a list of existing instances to link a service to, and
reinstall.

The hourly usage check reads at most 500 instances from the Vultr account in one request; a service whose instance
is not among them is counted as an error.

## Error messages

| Message | Cause |
|---|---|
| `No Vultr server configured.` | No active Vultr server, or none with room in the product's server group |
| `Vultr API key not configured.` | The server record has no API key |
| `VPS creation failed: <Vultr's error>` | Vultr refused the instance: plan not in that region, OS id unknown, no balance, invalid key |
| `Vultr instance ID not found.` | The service was never created on Vultr, or was added by hand |
| `Halt failed: …`, `Start failed: …`, `Destroy failed: …` | Vultr refused the suspend, unsuspend or terminate |
| `No vultr_plan configured in product.` | Package change to a product without a `vultr_plan` or `plan` key |
| `Upgrade failed: <Vultr's error>` | Vultr refused the plan change |

Vultr's own `error` text is shown when it gives one, otherwise `HTTP <status>`. Each call waits up to 60 seconds.
Failed creates, suspends, unsuspends and terminates go to the module queue and are retried; see
[Scheduled Commands](../reference/scheduled-commands.md).
