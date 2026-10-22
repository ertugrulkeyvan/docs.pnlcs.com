---
sources:
  - app/Http/Controllers/Admin/ConfigController.php
  - app/Services/Module/ModuleRegistry.php
  - resources/views/admin/config/servers.blade.php
  - resources/views/admin/config/server-groups.blade.php
  - modules/Servers/
---

# Connect a Server

Connecting a server lets PNLCS create, suspend and terminate hosting accounts
by itself when orders are paid and cancelled. Servers live under **Setup →
Servers**.

## Add a server

1. **Setup → Servers → Add Server**
2. Choose the **Server Type**, which is the module that talks to it:
   Panelica, cPanel/WHM, Plesk, DirectAdmin, aaPanel, HestiaCP, Proxmox VE,
   Vultr, or Custom for accounts you create by hand. Only modules that are
   installed and switched on are offered. The form adjusts its fields and
   default port to the type.
3. Fill in the **Server Name**, **Hostname** and credentials (below). Type the
   host name only: a pasted `https://`, port or path is stripped when you save.
4. Optional: the server's **IP Address**. When you give one, PNLCS checks on
   save that the hostname resolves to it and warns you if it does not resolve
   or points somewhere else; calls then go to the IP address.
5. **Max Accounts** (default 500, `0` = unlimited) caps how many active and
   suspended services a server takes when PNLCS picks it from a
   [server group](#server-groups).
6. Optional: the server's **Nameservers**. Customers who
   [set a domain up on their hosting](sell-domains.md#set-up-on-my-hosting)
   are pointed at them.
7. Leave **Server Active** ticked for a server you sell on. An active server
   is refused unless its credentials are filled in; untick it to save a server
   you will finish later.
8. Save, then press **Test** next to the server in the list.

A server that still has accounts on it (any service that is not terminated,
cancelled or fraud) cannot be deleted.

## Credentials by type

=== "Panelica"
    - **Port:** 8443 (the panel port). No username.
    - **API Key:** the `pk_live_...` key, and **API Secret:** the `sk_live_...`
      secret. Create them in the Panelica panel under **Settings → API Keys**;
      the secret is shown only once there.
    - **Mail:** customers' mail apps are told the host name the panel gives
      the domain's mail certificate, or else `mail.<their domain>`. When a
      domain gets its first mailbox, PNLCS asks the panel for that domain's
      mail certificate if it has none. The key needs the SSL permission for
      that. A domain whose DNS is elsewhere needs its mail host name,
      `webmail.`, `autoconfig.` and `autodiscover.` pointed at the server
      before the certificate can be issued. When issuing failed, the
      customer's email page lists these records (CNAMEs to the server's
      hostname, or A records to its public address) with a button to request
      the certificate again; a mail host name outside the customer's domain is
      left to you.

=== "cPanel / WHM"
    - **Port:** 2087. **Username:** the WHM account, usually `root`.
    - **API token:** create one under **WHM → Development → Manage API
      Tokens** and paste it into the field labelled **Access Hash (legacy)**.
      PNLCS signs in with it as `whm <username>:<token>`. An active server is
      refused without it: a token in the **API Token** box above it is not
      enough.

=== "Plesk"
    - **Port:** 8443. **Username:** the Plesk administrator, usually `admin`.
    - **API key:** paste a Plesk API key into the **Access Hash** field,
      although the form says Plesk does not use it. An active server is
      refused without it; the password alone is not accepted.

=== "DirectAdmin"
    - **Port:** 2222. **Username:** the admin account.
    - **Password / Login Key:** its password or a login key. A login key in
      **Access Hash** is used instead of the password when both are set.

=== "aaPanel"
    - **Port:** the panel's HTTPS port (the form suggests 8888; recent
      installs pick a random one). No username, password or nameservers.
    - **API Key:** the API secret key from **aaPanel → Settings → API**. Add
      the PNLCS server's IP address to the aaPanel API whitelist.
    - Needs aaPanel Pro with the Account (Sub aaPanel) service running. See
      [aaPanel hosting accounts](../modules/aapanel.md).

=== "HestiaCP"
    - **Port:** 8083. **Username:** the admin account (default `admin`).
    - **Access Key:** run `v-add-access-key 'admin' '*'` on the server and
      paste the two values it prints, the Access Key ID and the Secret Access
      Key, joined by a colon: `ID:Secret`.
    - **Admin Password:** only for servers that still use the older
      user-and-password login. It is not sent when an access key is set.

=== "Proxmox VE"
    - **Port:** 8006. No nameservers are needed.
    - **API token ID** (e.g. `pnlcs@pve!billing`) and **API token secret**,
      from *Datacenter → Permissions → API Tokens*. A pasted
      `PVEAPIToken=user@realm!name=secret` line works too. An active server is
      refused without the secret.
    - With privilege separation on, the token has only the permissions given
      to the token itself. **Test** reads them and prints the `pveum` commands
      that fix what is missing.
    - Node, resource pool, VM id range, IPv4 addresses, backup storage and
      cloud-init snippet are set on the same form. The **Images** button next
      to the server installs official cloud images and container templates on
      it, which the product form then offers. See
      [Sell VPS on Proxmox VE](sell-vps-on-proxmox.md).

=== "Vultr"
    - Your Vultr API key in **API Key**. The module talks to Vultr's API
      directly, so the hostname is only a label.

!!! tip "Always test the connection"
    Press **Test** before you assign products. Most provisioning
    problems are wrong credentials, or a firewall closing the panel's API port.

## Server groups

With several servers of one type, group them under **Setup → Server Groups →
Add Server Group**: a **Group Name**, the **Servers** in it, and a **Fill
Type**:

- **Sequential (fill one at a time)**: the oldest server that still has room
  under its Max Accounts.
- **Round Robin (distribute evenly)**: the server with the fewest active and
  suspended services.

Only active servers of the product's module count. When none of them has room,
provisioning fails and lands in the module queue instead of using a server
outside the group. A group that products still use cannot be deleted.

## Link a product to the server

A server does nothing until a product uses it. On the product
(**Setup → Products/Services**), set its **Server Module**, optionally a
**Server group**, and choose when accounts are created (**Auto Setup**). A
product never names a single server: with *Any server of that type*, PNLCS
uses the first active server with that module, without checking Max Accounts.
Each service then stays on the server it was created on. See
[Your First Sale](../getting-started/your-first-sale.md).

## Check it works

Place a test order, pay it, and confirm the account exists on the server and
the service is **Active** in PNLCS. If not, see
[Provisioning did not happen](../troubleshooting/common-issues.md#provisioning-did-not-happen).

## One click into the panel

Panelica servers are listed on the admin dashboard under **Live Servers**, each
with a button that signs you into that panel. See
[Live Servers](live-servers.md).
