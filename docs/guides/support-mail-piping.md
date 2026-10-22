---
sources:
  - app/Services/TicketMailImportService.php
  - app/Services/Mail/ImapMailboxClient.php
  - app/Console/Commands/MailImportCommand.php
  - resources/views/admin/config/ticket-departments.blade.php
  - app/Services/TicketEscalationService.php
  - resources/views/admin/config/ticket-escalation.blade.php
  - routes/console.php
---

# Support Mail Piping

Let customers open and reply to tickets **by email** — they email your support
address and it becomes a ticket automatically, and their email replies land on
the right ticket.

## How it works

PNLCS checks each department's mailbox on a schedule (every 5 minutes), up to
25 new messages per mailbox per run. For each message:

- A message whose subject names an existing ticket is added to that ticket as
  a reply. The match is lenient: `[Ticket #123456]`, `Ticket #123456`,
  `Ticket ID: 123456` and `Ticket 123456` all work.
- The reply is accepted only from the ticket's client, the address the ticket
  was opened from, or a contact on the same account. From anyone else, or for
  a ticket number that does not exist, the message is treated as a new ticket.
- Anything else opens a **new ticket**, with medium priority.

Outgoing ticket emails already carry the `[Ticket #TID]` marker, so customer
replies thread correctly.

**Attachments**: up to 5 per message, each at most 5 MB, of these types only:
`jpg`, `jpeg`, `png`, `gif`, `pdf`, `txt`, `log`, `zip`. Others are dropped;
the message itself is still imported.

## Set it up

**Setup → Ticket Departments → (edit a department) → Mail Import**

Fill in the mailbox this department should read:

| Field | Example |
|-------|---------|
| Protocol | IMAP (recommended) or POP3 |
| Mail Server Host | your mail provider's IMAP or POP3 server |
| Port | `993` (IMAP over SSL) / `995` (POP3 over SSL); left empty, these are used |
| Encryption | SSL, STARTTLS, or No |
| Username | the support mailbox, for example `support@example.com` |
| Password | the mailbox password; left empty on a later save, the stored one is kept |
| Folder | `INBOX` (IMAP only; POP3 always reads the inbox) |

Options:

- **Delete messages from the mailbox after import**. Without it, IMAP messages
  are marked as read and left in place. With POP3 messages are always deleted,
  because POP3 cannot mark them as read.
- **Accept mail from unknown senders** — create tickets from people who don't
  yet have a client account (useful for presales). Off by default.

Tick **Enable mail import (email piping)** and save. The **Ticket Departments**
list then shows, per department, whether import is on and when it last ran.

## Safety built in

- **Auto-replies and bounces** (out-of-office, mailer-daemon, postmaster,
  no-reply) are ignored, so you never get a ticket loop.
- Mail from the department's own address is skipped.
- New tickets from email go through the **Ticket Spam Filter**, like the
  ticket form.
- A message that fails to process is left in the mailbox and retried next run.
- The mail server's certificate is not verified.

## Requirements

- A dedicated support mailbox you can connect to over IMAP/POP3.
- PHP's `imap` extension. The Docker image has it; on your own server install
  `php8.4-imap` (Ubuntu, ondrej PPA) or `php-imap` (AlmaLinux/Rocky, Remi).
  Debian 13 does not package it. Without it the import logs
  `the PHP imap extension is not installed` and does nothing; the rest of
  PNLCS does not need it.

## Escalation rules

Tickets nobody has answered can be escalated automatically. The **Ticket
Escalation Rules** page has no menu entry in PNLCS 1.6.1; open
`/admin/config/ticket-escalation` on your PNLCS address. **Add Rule**:

- **Time Threshold (minutes)**: how long since the last reply.
- **Applies To**: departments, statuses and priorities. An empty list matches
  any value; with no status picked, only Open and Customer-Reply tickets
  match.
- What to do: **Assign To** a staff member, **New Priority**, **Move to
  Department**, and an **Auto-Reply Message** that is emailed to the customer.

Rules run every 15 minutes. Each escalation adds a note to the ticket, and a
ticket is escalated only once until it gets a new reply. **Send notification
on escalation** is saved but sends nothing in 1.6.1.

## Tickets without an account, and deleting tickets

Tickets do not only come from signed-in customers. The public **Contact Us**
form opens a ticket for anybody who fills it in, and mail import does the same
for unknown senders when you allow them. These tickets have no client account
behind them, so they are also where spam collects.

- **Support → Support Tickets → Only tickets without an account** lists just
  those.
- Tick tickets in the list (or the box in the header for the whole page) and
  press **Delete selected**. A single ticket has a **Delete** button on its
  page.
- Deleting removes the ticket with its replies, notes and attachments. It
  cannot be undone, and it needs the **manage tickets** permission.

To keep spam out in the first place, switch on reCAPTCHA for the contact form
and the ticket form (**Setup → General Settings → Google reCAPTCHA
protection**) and fill in the **Ticket Spam Filter** (**Setup → Ticket Spam
Filter**).
