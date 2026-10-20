# docs.pnlcs.com

The documentation of [PNLCS](https://github.com/Panelica/pnlcs), the open-source hosting billing platform and client portal.
The product site is [pnlcs.com](https://pnlcs.com/) ([source](https://github.com/ertugrulkeyvan/pnlcs.com)); both share the Panelica brand.

Built with [Zensical](https://zensical.org/), from the makers of Material for MkDocs. The pages are plain Markdown in `docs/`.

## Build and preview

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
python3 tools/build.py                          # docs/ -> site/
python3 -m http.server 8094 --directory site    # http://127.0.0.1:8094/
```

Deploy the `site/` folder at the root of docs.pnlcs.com.

`tools/build.py` runs Zensical and then moves the page date and the command-variables box below each page title,
and fills in "Updated <date>" from git.

## Layout

| Path | What it is |
|---|---|
| `docs/` | The pages. Navigation order is `nav:` in `mkdocs.yml` |
| `docs/api/`, `docs/mcp/tools.md` | Generated in PNLCS (`php artisan pnlcs:api-docs`, `node mcp/scripts/docs.mjs`); copy them over, do not edit by hand |
| `overrides/` | Templates: header, footer, home page, page top (date, variables) and feedback |
| `docs/assets/pnlcs.css`, `pnlcs.js` | Brand colours, fonts and the small scripts |
| `data/upstream.json` | Which PNLCS commit the docs were last checked against, and per-page import dates |
| `tools/upstream.py` | Compares the docs with the PNLCS source |
| `AUDIT.md` | The open list of wrong, outdated and missing content |

## Writing a page

Front matter keys this site uses:

```yaml
---
sources:                 # code this page describes; tools/upstream.py watches it
  - app/Services/InvoiceService.php
  - modules/Servers/Proxmox/
vars:                    # optional: readers fill these in and every command on the page follows
  domain: example.com
  install_folder: /var/www/pnlcs
feedback: false          # optional: hide "Did this page help you?"
---
```

Write for an operator who has never used WHMCS. Every number, menu path and setting name must match the code;
cite the file when you check it. No marketing language.

## Keeping up with PNLCS

```bash
python3 tools/upstream.py status    # new PNLCS commits since the last check, and any docs/ pages they changed
python3 tools/upstream.py stale     # pages whose `sources:` changed since the last check
python3 tools/upstream.py mark <commit>
python3 tools/upstream.py sync      # merge the PNLCS docs/ changes since the last sync, three ways
```

`PNLCS_SRC` points to a local clone of PNLCS.

Two workflows do this on GitHub:

- **Follow PNLCS** (daily, or by hand): runs `sync` and opens or updates the `pnlcs-sync` pull request. Our
  own edits stay; a page both sides changed in the same place is listed as a conflict and left alone. It also
  keeps one issue, "Pages that may be out of date", from `stale`.
- **Publish** (every push to `main`): builds with `tools/build.py` and copies `site/` to the server with
  rsync. It needs the `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`, `DEPLOY_SSH_KEY` and
  `DEPLOY_KNOWN_HOSTS` secrets; without them it only builds.

## For AI assistants

Each page is also published as Markdown next to its HTML (`/install/native/index.md`), and the build writes
`/llms.txt` and `/llms-full.txt`.

## License

MIT, like PNLCS.
