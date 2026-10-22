---
sources:
  - app/Services/ThemeService.php
  - app/Http/Controllers/Admin/SettingController.php
  - app/View/Composers/ThemeComposer.php
  - app/Services/ThemeManager.php
  - resources/views/
  - themes/
---

# Theme Tokens

The 56 design tokens of a PNLCS colour set: 34 colours, 8 typography, 6
spacing and 8 layout values. How a theme sets them in `theme.json` is on
[Themes](../developer/themes.md); choosing and editing them in the admin area
is on [Themes and branding](../guides/themes-and-branding.md).

## How they are used

- The active set is printed on the public site, the client area and the admin area as CSS variables in a
  `<style id="theme-vars">` block: `--theme-<token>` with each `_` written as
  `-` (`primary_light` becomes `--theme-primary-light`). Use them in a
  theme's CSS as `var(--theme-primary)`.
- **Setup → Appearance**, **Color Presets** tab, edits them: the colour
  tokens with a colour picker, the others as text. Saving any change switches
  the preset to *Custom*; a field left empty takes the Starter value.
- A theme's `theme.json` `colors` sets some or all of them when the theme is
  activated; tokens it leaves out come from Starter.
- Values are written into CSS as they are. Colour tokens take a hex colour
  (`#1a4d80`) or any CSS colour (`card_shadow` and `overlay_bg` are `rgba()`
  in Starter); sizes need their unit (`16px`).
- **Used by PNLCS**: the 18 tokens the built-in views and the bundled themes
  read in 1.6.1. The other 38 are printed all the same, for your own theme's
  CSS to use; changing them has no visible effect on the built-in pages.

**Starter** is the default preset ("Clean professional blue theme"). The two
other presets, Nightforge and Lumina, set all 56 with their own values.

## Colors

| Token | CSS variable | Label | Starter | Used by PNLCS |
|---|---|---|---|---|
| `primary` | `--theme-primary` | Primary | `#1a4d80` | yes |
| `primary_light` | `--theme-primary-light` | Primary Light | `#e8f0fb` | yes |
| `primary_dark` | `--theme-primary-dark` | Primary Dark | `#143d66` | yes |
| `accent` | `--theme-accent` | Accent | `#337ab7` | yes |
| `accent_dark` | `--theme-accent-dark` | Accent Dark | `#286090` | yes |
| `nav_bg` | `--theme-nav-bg` | Navigation BG | `#1a4d80` | yes |
| `sidebar_bg` | `--theme-sidebar-bg` | Sidebar BG | `#f6f6f6` | |
| `sidebar_text` | `--theme-sidebar-text` | Sidebar Text | `#555555` | |
| `body_bg` | `--theme-body-bg` | Body BG | `#f6f6f6` | yes |
| `card_bg` | `--theme-card-bg` | Card BG | `#ffffff` | yes |
| `border_color` | `--theme-border-color` | Border | `#e2e8f0` | yes |
| `text_color` | `--theme-text-color` | Text | `#333333` | yes |
| `muted_color` | `--theme-muted-color` | Muted Text | `#64748b` | yes |
| `footer_bg` | `--theme-footer-bg` | Footer BG | `#1a4d80` | yes |
| `hero_bg_start` | `--theme-hero-bg-start` | Hero Gradient Start | `#0c1222` | yes |
| `hero_bg_mid` | `--theme-hero-bg-mid` | Hero Gradient Mid | `#162447` | yes |
| `hero_bg_end` | `--theme-hero-bg-end` | Hero Gradient End | `#1a1a3e` | yes |
| `welcome_accent` | `--theme-welcome-accent` | Welcome Accent | `#10b981` | yes |
| `welcome_primary` | `--theme-welcome-primary` | Welcome Primary | `#2563eb` | |
| `welcome_secondary` | `--theme-welcome-secondary` | Welcome Secondary | `#7c3aed` | |
| `table_header_bg` | `--theme-table-header-bg` | Table Header BG | `#1a4d80` | yes |
| `success` | `--theme-success` | Success | `#10b981` | yes |
| `danger` | `--theme-danger` | Danger | `#ef4444` | |
| `warning` | `--theme-warning` | Warning | `#f59e0b` | |
| `info` | `--theme-info` | Info | `#3b82f6` | |
| `link_color` | `--theme-link-color` | Link Color | `#2563eb` | |
| `link_hover_color` | `--theme-link-hover-color` | Link Hover | `#1d4ed8` | |
| `heading_color` | `--theme-heading-color` | Heading Color | `#1e293b` | |
| `card_shadow` | `--theme-card-shadow` | Card Shadow Color | `rgba(0,0,0,0.08)` | |
| `input_bg` | `--theme-input-bg` | Input BG | `#ffffff` | |
| `input_border` | `--theme-input-border` | Input Border | `#d1d5db` | |
| `input_focus_border` | `--theme-input-focus-border` | Input Focus Border | `#1a4d80` | |
| `badge_bg` | `--theme-badge-bg` | Badge BG | `#e8f0fb` | |
| `overlay_bg` | `--theme-overlay-bg` | Overlay BG | `rgba(0,0,0,0.5)` | |

## Typography

| Token | CSS variable | Label | Starter | Used by PNLCS |
|---|---|---|---|---|
| `font_family` | `--theme-font-family` | Font Family | `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` | |
| `font_size_base` | `--theme-font-size-base` | Font Size Base | `16px` | |
| `font_size_sm` | `--theme-font-size-sm` | Font Size SM | `14px` | |
| `font_size_lg` | `--theme-font-size-lg` | Font Size LG | `18px` | |
| `font_weight_normal` | `--theme-font-weight-normal` | Font Weight Normal | `400` | |
| `font_weight_bold` | `--theme-font-weight-bold` | Font Weight Bold | `700` | |
| `heading_font_family` | `--theme-heading-font-family` | Heading Font | `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` | |
| `line_height_base` | `--theme-line-height-base` | Line Height | `1.6` | |

## Spacing

| Token | CSS variable | Label | Starter | Used by PNLCS |
|---|---|---|---|---|
| `spacing_xs` | `--theme-spacing-xs` | Spacing XS | `4px` | |
| `spacing_sm` | `--theme-spacing-sm` | Spacing SM | `8px` | |
| `spacing_md` | `--theme-spacing-md` | Spacing MD | `16px` | |
| `spacing_lg` | `--theme-spacing-lg` | Spacing LG | `24px` | |
| `spacing_xl` | `--theme-spacing-xl` | Spacing XL | `32px` | |
| `spacing_2xl` | `--theme-spacing-2xl` | Spacing 2XL | `48px` | |

## Layout

| Token | CSS variable | Label | Starter | Used by PNLCS |
|---|---|---|---|---|
| `radius_sm` | `--theme-radius-sm` | Radius SM | `4px` | |
| `radius_md` | `--theme-radius-md` | Radius MD | `8px` | |
| `radius_lg` | `--theme-radius-lg` | Radius LG | `16px` | |
| `radius_full` | `--theme-radius-full` | Radius Full | `9999px` | |
| `shadow_sm` | `--theme-shadow-sm` | Shadow SM | `0 1px 3px rgba(0,0,0,0.08)` | |
| `shadow_md` | `--theme-shadow-md` | Shadow MD | `0 4px 15px rgba(0,0,0,0.1)` | |
| `shadow_lg` | `--theme-shadow-lg` | Shadow LG | `0 20px 60px rgba(0,0,0,0.12)` | |
| `container_max_width` | `--theme-container-max-width` | Container Max Width | `1240px` | |

