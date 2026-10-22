---
sources:
  - app/Http/Controllers/Admin/LiveServerController.php
  - resources/views/admin/live-servers/index.blade.php
  - resources/views/admin/dashboard.blade.php
  - routes/admin.php
  - modules/Servers/Panelica/PanelicaModule.php
---

# Live Servers

**Live Servers** lists your Panelica servers and signs you into any of their
control panels with one click, without typing a password.

## Where

On the admin dashboard, under the quick actions: **Live Servers**, or go
straight to `https://example.com/admin/live-servers`. It is shown to staff
whose role has the *manage servers* permission.

## What it shows

Every server of type **Panelica** from **Setup → Servers**: its name,
hostname, IP address and whether it is active, with a **Log in** button. Other panel types are not listed: the one-click
sign-in uses Panelica's own single-use login link, which the other panels do
not offer.

## How the sign-in works

1. PNLCS asks the server, with the API key stored for it, for a single-use
   sign-in link for the panel account the key belongs to.
2. The panel opens in a new tab, already signed in.

Sign-ins are limited to 20 a minute.

Every sign-in, and every failed attempt, is written to the **Activity Log**
with your name and the server.

!!! note
    The panel account you land in is the one the server's API key belongs to.
    If the button fails, check the key with **Test** on **Setup → Servers**.
