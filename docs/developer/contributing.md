---
sources:
  - CONTRIBUTING.md
  - SECURITY.md
  - .env.testing.example
---

# Contributing

PNLCS is built in the open and contributions are welcome: bug reports, fixes,
modules, translations, themes and documentation.

## Ways to help

1. **Report a bug** with the steps to reproduce it, on
   [GitHub Issues](https://github.com/Panelica/pnlcs/issues). Screenshots
   help.
2. **Test a module against a real provider account** and tell us what worked.
   Most modules are tested with faked provider answers; a report from a live
   account catches what those cannot.
3. **Translate**, or fix a translation ([Translations](translations.md)).
4. **Write a module** ([Writing a module](modules.md)).
5. **Improve this documentation**: every page has an edit button at the top,
   and the source is the `docs/` folder.

## Pull requests

- For anything larger than a fix, open an issue first so the scope can be
  agreed before code is written.
- Include a test that fails without your change and passes with it.
- Keep a pull request to one subject; unrelated fixes go in their own.
- Match the existing style: `./vendor/bin/pint --test` and
  `./vendor/bin/phpstan analyse` must pass, as CI runs both. Commit messages
  loosely follow Conventional Commits (`fix: ...`, `feat(billing): ...`); a
  pull request is not refused over the format alone.
- A new text goes in `lang/en/` and in `tr`, `de`, `pl` and `zh`, or the pull
  request says which of these it could not write ([Translations](translations.md)).
- Your commits keep your name: merged work is credited to you in the history
  and the changelog.

## Running the tests

The suite runs against a MySQL database of its own. Copy
`.env.testing.example` to `.env.testing` and set the database there
(`DB_DATABASE=pnlcs_test`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_SOCKET` or
`DB_HOST`), give it a key with `php artisan key:generate --env=testing`, then run:

```bash
php artisan test
```

The full guide, with the development setup and conventions, is
[CONTRIBUTING.md](https://github.com/Panelica/pnlcs/blob/main/CONTRIBUTING.md).

## Security issues

Do not open a public issue. Write to
[security@panelica.com](mailto:security@panelica.com); see the
[security policy](https://github.com/Panelica/pnlcs/blob/main/SECURITY.md).
