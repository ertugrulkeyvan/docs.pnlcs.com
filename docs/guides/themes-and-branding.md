---
sources:
  - app/Http/Controllers/Admin/SettingController.php
  - app/Services/ThemeManager.php
  - app/Services/ThemeService.php
  - app/Support/ThemeInfo.php
  - app/Support/formatting.php
  - resources/views/admin/settings/appearance.blade.php
  - resources/views/admin/settings/general.blade.php
  - database/seeders/HomepageSectionSeeder.php
  - themes/
---

# Themes & Branding

Make PNLCS look like *your* company. Most of this is under
**Setup → Appearance**, which has five tabs: **Themes**, **Color Presets**,
**Homepage Builder**, **White-Label** and **Dark Mode**.

## Pick a theme

**Themes** tab. PNLCS includes 16 built-in themes: Arctic, Aurora, Coral,
Ember, Flavor, Forest, Midnight, Mint, Neon, Ocean, Panelica, Royal, Slate,
Starter, Sunset and Terra. The active theme sets the layout and colors of the
public welcome page and the client area. Press **Activate** on a theme to use
it; you can switch any time.

- **Upload Theme** installs a theme from a ZIP file (up to 20 MB) that
  contains a `theme.json`. Uploading a theme that is already installed
  replaces it; a built-in theme cannot be replaced this way.
- The download button on a theme's card (**Download ZIP**) downloads it, to
  keep a copy or to start your own theme from it.
- The bin button deletes an uploaded theme. Built-in themes and the active theme
  cannot be deleted.

## Logo, favicon and colors

- On the **Themes** tab, upload your **logo** (PNG, JPG, SVG or WebP, up to
  2 MB) and **favicon** (PNG, ICO or SVG, up to 512 KB). The logo is shown in
  the admin panel, on the public site and client area, and on invoice PDFs.
- On the **Color Presets** tab, apply a preset (Starter, Nightforge or
  Lumina) or change individual color tokens; changing a token sets the preset
  to *Custom*.

## Homepage builder

**Homepage Builder** tab. The public welcome page is built from
**reorderable sections**: hero, domain search, promo cards, hosting plans,
infrastructure, stats, VPS plans, testimonials, FAQ, call-to-action banner,
footer, and One-Click Apps (off until you switch it on, see
[Sell Docker Apps](sell-docker-apps.md)). Drag to reorder, switch sections on
and off, and edit their content; changes show on the welcome page at once.

## White-label

**White-Label** tab:

- **Company Name**, **Company URL**, **Support Email** and **Copyright Text**
  (shown in the footer after © and the year). The company name set here is
  used in place of the one in General Settings.
- **Remove PNLCS / Panelica branding references**: takes the PNLCS and GitHub
  mentions out of the public footer and the admin footer.

## Dark mode

**Dark Mode** tab: **Enable dark mode toggle for visitors** shows a light/dark
switch on the welcome page and in the client area. It applies to every theme.

## About page and knowledge base

Two related switches are in **Setup → General Settings**, in the **Legal
identity** card:

- **About us**: the text of the public About page (plain text, paragraphs
  separated by a blank line).
- **Show the knowledge base to customers**: on by default. Turned off, the
  knowledge base disappears from every menu, the footer, the contact page and
  the sitemap, and its pages answer "not found".

## Custom domain for the portal

Point the domain your customers should use (for example `example.com`) at
your PNLCS server, and set `APP_URL` in `.env` to it. The client area then
lives entirely on your own domain.

To build a theme of your own, see [Themes](../developer/themes.md).
