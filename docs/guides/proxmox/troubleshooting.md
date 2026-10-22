---
sources:
  - modules/Servers/Proxmox/
  - lang/en/proxmox.php
  - app/Http/Controllers/Concerns/ServesVps.php
  - app/Http/Controllers/Client/CartController.php
  - app/Console/Commands/ProxmoxTasksCommand.php
  - app/Console/Commands/ModuleQueueProcessCommand.php
  - resources/views/components/vps-panel.blade.php
---

# Troubleshooting and questions

## Problems and their fixes

| What you see | Why | Fix |
|--------------|-----|-----|
| Test: *"refused the credentials"* | Wrong token ID or secret, or the secret pasted without its ID | Enter the ID as `user@realm!name` and the UUID as the secret. A token shown as `root@pam!test 0eeb…` in Proxmox is ID `root@pam!test`, secret `0eeb…` |
| Test: the token **has no permissions** | Created with *Privilege Separation* and nothing granted to the token | Run the printed commands, or untick privilege separation ([step 1](prepare-proxmox.md#the-pool-the-role-the-user-and-the-token)) |
| Test: a right is **missing on /pool/…** | The role lacks it, or the ACL is on another path | Run the printed `pveum` commands |
| Test: **SDN.Use** missing | Since Proxmox 8, a server cannot be put on a bridge without it | `pveum acl modify /sdn/zones/localnetwork --users pnlcs@pve --roles PVESDNUser` |
| Test: *no templates visible* | No template, or not in the pool | Install one from the [image library](operating-systems.md), or `pveum pool modify pnlcs --vms <id>` |
| Order paid, but the service stays *Pending* | The create failed | It is retried after 5, 10, 20 and 40 minutes and you are notified; the reason is in the notification and the log. Fix it and press **Create Account** on the service |
| The customer cannot sign in over SSH with the password | The image refuses password logins and root | Set the [vendor snippet](prepare-proxmox.md#the-cloud-init-snippet) on the server, then reinstall the server |
| *Addresses: none reported yet* | The guest agent is not running in the server yet | Wait for the first boot to finish; with the vendor snippet the agent is installed on first boot |
| A new password *"takes effect at the next reboot"* | The guest agent does not run in that server | Reboot it, or install `qemu-guest-agent` in it |
| The disk card shows only the size | Same: no guest agent | As above |
| Image library: *"may not fetch images yet"* | The token lacks `Datastore.AllocateTemplate` / `Sys.AccessNetwork` | Run the three commands on that page |
| Image library: *no storage holds import content* | No directory storage has the *import* type | `pvesm set local --content <its current types>,import` |
| Reinstall or restore *"under way"* for a long time | The scheduler is not running | Check the [cron runner](../../install/native.md#13-schedule-the-cron-runner); it moves jobs on every minute. A job not finished after two hours is stopped as failed |
| Ordering or reinstalling: *"This does not look like an SSH public key"* | A line is not an OpenSSH public key, a private key was pasted, or there are more than 10 keys | One public key per line, the contents of the `.pub` file |
| A backup fails | The backup storage lacks the *backup* content type, or the token's rights on it | Press Test: it checks both and says which |
| In a cluster, creating on another node fails | The template is on one node's local storage, which only that node can clone from | Set the product's node to the template's node, or keep templates on shared storage |

## Questions

**Do I need nameservers?**
No. Nameservers are for web hosting accounts; the Proxmox form hides them.

**Where do the operating systems come from — is there a ready list, or does
every operator make their own?**
Both. The [image library](operating-systems.md) installs the official cloud
images of Debian, Ubuntu, AlmaLinux and Rocky Linux and any container template
from Proxmox's catalogue, in one click each. You can also use any template
you built yourself, as long as it has cloud-init.

**Can I sell CloudLinux, Windows or another licensed system?**
Not out of the box: there is no ready-made image for them. You can build a
template yourself (with cloud-init, or cloudbase-init for Windows), add it to
the product's operating systems and put a price on it in the checkout options.
Licences are yours to arrange with the vendor. Only the Linux cloud images
above have been tested with PNLCS.

**KVM or LXC?**
KVM is a full virtual machine: any kernel, the customer's own firewall and
modules. LXC is lighter and denser but shares the host's kernel. For LXC the
customer's panel has no root-password change (Proxmox's API has no
container password setting to change it with) and *Reset* reboots it. The live tests of this module were
done on KVM; LXC is covered by the automated tests.

**Is there a browser console?**
Not yet.

**Can customers add SSH keys?**
Yes, up to 10 public keys: in the **SSH public keys** box when they order, and
again in the **Reinstall** form, which shows the current keys (change them, or
empty the box to remove them). The keys are put on the server when it is
built or reinstalled: through cloud-init on KVM, at creation on LXC. A KVM
server installed from an ISO does not get them. The root password is set as
well.

**Does PNLCS change anything else on my Proxmox?**
No. It works only on the servers it made or that you linked to a service —
both carry a tag for that service — and, if you use the image library, it
downloads files and creates templates. It does not touch other machines,
users, storage settings or the firewall.

**How do I remove PNLCS from a Proxmox host?**
Terminate or unlink its services in PNLCS, then remove what step 1 created:
`pveum user delete pnlcs@pve`, `pveum role delete PNLCS` (and `PNLCSImages`),
`pveum pool delete pnlcs` once it is empty, and the snippet file.
