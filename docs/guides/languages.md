---
sources:
  - app/Http/Controllers/Admin/TranslationController.php
  - app/Models/Language.php
  - app/Services/AiTranslationService.php
  - app/Support/LocaleUrl.php
  - resources/views/admin/config/languages/index.blade.php
  - resources/views/admin/config/languages/translations.blade.php
  - database/migrations/2026_10_05_120000_drop_frozen_copies_of_shipped_translations.php
---

# Languages & Translations

PNLCS ships in **30 languages**. English, Turkish, Polish, Chinese and German
are complete; the others cover most of the interface and fall back to English
where a text is missing.

## Switch languages on

**Setup → Languages**, **Languages** tab:

- **Progress** shows how much of each language is translated.
- Switch a language on to offer it to customers and staff.

**Settings** tab:

- **Default Language**: the language new visitors and new customers get. The
  list offers every language that is switched on, and every language that is
  fully translated; choosing one that is off switches it on.
- **Show the language in the address**: the default language keeps its
  addresses, and every other active language is served under its code (for
  example `/en/client/store`), so search engines can index each language.

## Change a translation

Press **Translate** next to a language. The editor shows every text with its
English source; search by key or wording, filter by group, and edit in place.
Your changes are stored in the database and take priority over the files that
ship with PNLCS, so they survive updates.

If a change does not show at once, press **Clear Cache** on the Languages
page.

## Translate with AI

1. **Setup → Languages**: the **AI Translation Settings** card at the top of the
   page takes an **OpenAI API Key** and the **OpenAI Model** (`gpt-4o-mini`,
   the default, `gpt-4o`, `gpt-4.1-mini`, `gpt-4.1`, `gpt-5-mini` or `gpt-5`).
   Save them once. The key is never shown again; leave the field empty to
   keep it.
2. Press **Translate** next to a language. The **Translate with AI** panel at
   the top of the editor offers two choices, each with the number of texts it
   covers:
    - **Only missing texts**: fills what the language has no text for. Nothing
      that is already there is touched.
    - **Everything again from English**: translates the whole language anew and
      replaces the current texts. Use it for a language whose texts you cannot
      trust.
3. Press **Start**. Texts go to OpenAI in batches of 30 and are saved as each
   batch comes back; the progress bar moves and every translated line appears
   in the panel as it arrives. **Stop** halts after the current batch, and
   **Continue** carries on from where it stopped, even after the page was
   closed.

A translation that drops or renames a placeholder (`:name`, `:amount`) is not
saved; the line shows as skipped and the text keeps what it had.

In the editor, a robot icon marks a text **Translated with AI**, and a tick
marks one **Saved in the editor** by hand.

Read the result before you rely on it: machine translation gets tone and
context wrong. Correct any line in the editor and press **Save Changes**.

!!! note "Save stores only what you changed"
    The editor saves a line only when it differs from the text that ships with
    PNLCS. Setting a line back to the shipped text removes your override, so
    later improvements to the language reach you again.

    Updates also clean up overrides that are only copies: a saved text that
    is exactly what the language file now says, or one the project has since
    replaced in the file, is removed. Texts that are your own wording stay.

## Export and import

In a language's editor, **Export JSON** downloads every text; **Import** loads
a JSON file in the same shape. Use it to have a translator work offline.

## Contribute a translation

Sending your translation to the project puts it in every PNLCS install. See
[Translations](../developer/translations.md).
