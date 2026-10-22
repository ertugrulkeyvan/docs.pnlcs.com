---
sources:
  - routes/admin.php
  - routes/client.php
  - app/Http/Controllers/Admin/TicketController.php
  - app/Http/Controllers/Client/TicketController.php
  - app/Http/Controllers/Client/ContactController.php
  - app/Http/Controllers/Admin/ConfigController.php
  - app/Http/Controllers/Admin/PredefinedReplyController.php
  - app/Services/TicketService.php
  - app/Services/TicketSpamService.php
  - app/Console/Commands/TicketAutoCloseCommand.php
  - app/Listeners/SendNotificationListener.php
  - app/Models/Ticket.php
  - app/Models/Download.php
  - database/seeders/DatabaseSeeder.php
  - resources/views/admin/config/ticket-departments.blade.php
  - resources/views/admin/config/ticket-statuses.blade.php
  - resources/views/admin/config/predefined-replies.blade.php
  - resources/views/admin/config/ticket-spam.blade.php
  - resources/views/admin/config/announcements.blade.php
  - resources/views/admin/config/downloads.blade.php
  - resources/views/admin/config/download-edit.blade.php
  - resources/views/admin/config/knowledge-base.blade.php
  - resources/views/admin/config/network-issues.blade.php
  - resources/views/admin/tickets/show.blade.php
  - resources/views/client/tickets/show.blade.php
  - app/Http/Controllers/Client/KbController.php
  - app/Http/Controllers/Client/AnnouncementController.php
  - app/Http/Controllers/Client/DownloadController.php
  - app/Http/Controllers/Client/NetworkStatusController.php
  - resources/views/client/network-status/index.blade.php
  - app/Support/ContentTranslations.php
---

# Support Desk

PNLCS has a ticket desk for customer questions, and four kinds of pages
customers can read for themselves: announcements, downloads, a knowledge base
and a network status page. This page covers all of them.

To let customers open and answer tickets by email, see
[Support Mail Piping](support-mail-piping.md).

## Before the first ticket

1. **Setup → Ticket Departments**: check the departments and their addresses
   ([below](#departments)).
2. **Setup → General Settings → Company Email**: the address that gets an
   email for every new ticket and every customer reply
   ([Staff alerts](#staff-alerts)).
3. **Setup → Ticket Statuses**: decide whether answered tickets should close
   by themselves ([Statuses](#statuses-and-auto-close)).
4. **Setup → Ticket Spam Filter**, and reCAPTCHA under **Setup → General
   Settings → Google reCAPTCHA protection**, if the contact form is public.
5. Make sure [email sending](configure-email.md) works: customers get their
   ticket replies by email.

## Departments

**Setup → Ticket Departments**

A ticket always belongs to one department. **Add Department** asks for:

| Field | What it does |
|---|---|
| **Department Name** | Shown to customers on the ticket form and the contact form. |
| **Email Address** | The department's mailbox. The form says "for ticket notifications", but in 1.6.1 it is only used by [mail import](support-mail-piping.md): it is the address customers write to, and mail sent *from* it is skipped. No alert goes to it. |
| **Description** | For your own reference. |
| **Hidden from client ticket form** | Customers cannot pick the department, on the ticket form or the contact form. Staff can still move tickets into it. |

**Edit** opens the same fields plus the mailbox settings for
[mail import](support-mail-piping.md#set-it-up). **Delete** removes a
department.

!!! warning "Check the departments a fresh install made"
    The installer creates four departments: **General**, **Technical
    Support**, **Billing** and **Sales**, with placeholder addresses on
    `pnlcs.com` (`support@`, `tech@`, `billing@`, `sales@`). Change those
    addresses to your own, or clear them, and delete the departments you do
    not need.

The **Tickets** column on this page shows 0 for every department in 1.6.1,
whatever the real count.

## Statuses and auto-close

**Setup → Ticket Statuses**

A fresh install has six statuses: **Open**, **Answered**, **Customer-Reply**,
**On Hold**, **In Progress** and **Closed**. PNLCS sets three of them by
itself:

| Event | Status the ticket gets |
|---|---|
| A ticket is opened by the customer, the contact form or email | **Open** |
| A ticket is opened by staff (**Support → Open Ticket**) | **Answered**, because the next move is the customer's |
| Staff reply | **Answered** |
| The customer replies (also by email) | **Customer-Reply**, even on a closed ticket |
| Staff, the customer or auto-close close it | **Closed** |

The others (**On Hold**, **In Progress** and any you add) are only set by hand,
from the ticket page. Keep the names **Open**, **Answered**,
**Customer-Reply** and **Closed**: the code and the admin sidebar's ticket
filters (**Open**, **Awaiting Reply**, **Closed**) look for exactly these.

**Add Status** / **Edit**:

| Field | What it does |
|---|---|
| **Status Name** | The name staff pick from on the ticket page. |
| **Color (hex)** | The colour shown next to it on this page. |
| **Sort Order** | The order in the status list on the ticket page. |
| **Show to clients** | Tickets in this status count as open in the "open tickets" figure on the customer's home page. |
| **Close automatically when inactive** | Tickets in this status are closed by auto-close (below). |

### Close inactive tickets

At the top of the page, **Close inactive tickets after (hours)** (0 to 8760)
turns auto-close on. `0`, the default, turns it off.

Once an hour PNLCS closes every ticket that is in a status marked **Close
automatically when inactive** and has had no reply for that many hours. It is
closed exactly as if staff had closed it. No status is marked on a fresh
install: tick **Answered** if tickets you replied to and the customer never
came back to should close by themselves.

## Ticket escalation

Tickets nobody has answered for a while can be reassigned, moved, raised in
priority or given an automatic reply. This is set up on the **Ticket
Escalation Rules** page, which has no menu entry in 1.6.1; see
[Escalation rules](support-mail-piping.md#escalation-rules).

## Predefined replies

**Setup → Predefined Replies**

Saved answers staff can drop into a reply.

1. Under **Categories**, type a name in **New category** and press **Add**.
2. Under **Add a reply**, pick the category, give the reply a **Reply name**,
   write the **Reply text** and **Save**.

Each saved reply opens below for editing or **Delete**. Deleting a category
deletes its replies too.

On a ticket, **Insert a predefined reply…** above the reply box lists every
category that has replies. The chosen text is placed in the reply box, where
you can still change it before **Send reply**.

## Spam filter

**Setup → Ticket Spam Filter**

Checked when a new ticket comes in through the client area ticket form, the
**Contact Us** form or [mail import](support-mail-piping.md). Tickets opened
by staff or through the API, and replies to an existing ticket, are not
checked.

| Setting | How it matches |
|---|---|
| **Banned Email Patterns** | One per line. A ticket is refused when the sender's address *contains* the text, ignoring case: `@tempmail.com` blocks the whole domain, `noreply@` every such sender. |
| **Banned Keywords** | One per line. Refused when the subject or message contains the text, ignoring case. |
| **Max Tickets Per Hour (per email)** | Refused when that address has already opened this many tickets in the past hour. The default is `5`; `0` turns the limit off. |

**Save Spam Filter Settings** replaces both lists with what is in the boxes.
**Stored Spam Filters** below lists every pattern, with **Add Filter** for a
single one and **Delete** for each.

A refused ticket is not saved anywhere. On the client area form the customer
is told the message was flagged as spam.

## Working a ticket

**Support → Support Tickets** lists tickets, last reply first. The sidebar
filters by **Open**, **Awaiting Reply** (Customer-Reply) and **Closed**, and
by department and priority. **Only tickets without an account** and deleting
tickets are covered in
[Support Mail Piping](support-mail-piping.md#tickets-without-an-account-and-deleting-tickets).

**Support → Open Ticket** opens a ticket for a customer: their client ID or
email address, the department, subject, message, priority and, optionally,
one of their services. The customer gets it by email.

On a ticket page:

- **Add reply** sends your answer to the customer by email and sets the
  ticket to **Answered**.
- **Add internal note**: only staff see notes; they are never emailed. A note
  can be deleted only by the person who wrote it.
- The options bar changes **Status**, **Priority** (Low, Medium, High),
  **Department** and **Assigned to**. Choosing **Closed** closes the ticket.
- **Customer rating** shows the score once the customer has rated a closed
  ticket.

Staff permissions: **list tickets** for the list, **view tickets** to open
one, **reply tickets** to reply, write notes and open tickets, **manage
tickets** for the options bar and deleting. The setup pages above need
**manage ticket config**. See [Staff & Roles](staff-and-roles.md).

!!! warning "Attachments in 1.6.1"
    Customers can attach files, but the admin ticket page neither shows nor
    offers them for download, and staff replies cannot carry a file. Until
    that is fixed, ask the customer to paste text into the message, or fetch
    the file from the server's storage folder.

### Staff alerts

PNLCS emails the **Company Email** address (**Setup → General Settings**)
for:

- every new ticket that did not come from staff (client area, contact form,
  email, or the API without a staff user), and
- every customer reply.

Nothing is sent per department or to the assigned staff member. For alerts in
Slack, Telegram or another system, add rules for `ticket.opened` and
`ticket.replied` under [Notification channels](notifications.md).

## What the customer sees

In the client area, under **Support**:

- **Open Ticket**: department (hidden ones are left out), subject, priority
  (low, medium or high; medium by default), the service it is about, the
  message and one attachment.
- **My Tickets**: their tickets, and on each one the replies, **Post a Reply**
  with one attachment, and **Close ticket**. A closed ticket has no reply
  form; it offers a new ticket instead.
- Once a ticket is closed, a one-time rating from 1 to 5 with an optional
  comment.

Attachments: one file per message, up to 10 MB, of type `jpg`, `png`, `gif`,
`pdf`, `doc`, `docx`, `txt` or `zip`. Only the customer who owns the ticket
can download them. Attachments that arrive by email follow the
[mail import limits](support-mail-piping.md#how-it-works).

**Contact Us** at `/client/contact` is open to anyone, signed in or not. It
opens a ticket with medium priority in the department the visitor chose.

If **reCAPTCHA** is on for tickets (**Setup → General Settings → Google
reCAPTCHA protection**), the ticket form asks for it too.

## Announcements

**Support → Announcements**

**New Announcement**: **Title**, **Category** (free text; categories already
used are suggested), **Content** and **Publish immediately**. Untick it to
keep a draft. **Edit** has a **Published** switch.

Customers read them at `/client/announcements`, signed in or not: newest
first, 15 a page, with a filter for each category in use. The latest 20 are
also an RSS feed at `/client/announcements.rss`.

Content is plain text: line breaks are kept, HTML is shown as typed.

## Downloads

**Support → Downloads**

Files for customers: software, documentation, contracts.

1. **Add Category**: every download sits in one.
2. **Add Download**:

    | Field | What it does |
    |---|---|
    | **Name** | The title customers see. |
    | **Category** | Which category it is listed under. |
    | **Description** | Optional text below the name. |
    | **Upload a file** | The file is kept private on the server and only handed out through PNLCS, to customers allowed to have it. |
    | **Or a link to the file** | An address the customer is sent to instead. Anyone who has the link can open it. |
    | **Only for owners of** | Pick one or more products. Only customers with an **active** service of one of them see and can download it. Left empty, every signed-in customer can. |
    | **Published** | Untick to hide it while you prepare it. |

    A new download needs a file or a link.

Each category lists its downloads with the file name, a download count and
**Edit** / **Delete**. **Delete Category** deletes the category with all its
downloads and their uploaded files.

Customers must sign in. The list is at `/client/downloads`; the default
client area menu has no link to it, so put the address in your menu, an
announcement or your welcome email. A download a customer is not allowed to
have returns "not found". Each download is counted and recorded in the
**Activity Log**.

## Knowledge base

**Support → Knowledge Base**

1. **+ Category**: a **Category Name** and an optional **Description**.
   Categories can be renamed under **Categories** → **Edit**; there is no way
   to delete one from this page.
2. **+ New Article**: **Title**, **Category**, **Content** and **Publish
   immediately**. Pick a real category: **— Uncategorized —** is refused when
   you save.

The article list shows each article's views and whether it is **Published**
or a **Draft**.

The knowledge base is public, at `/client/knowledgebase`: no sign-in is
needed. Visitors see published articles grouped by category, with a search
over titles and text. Drafts return "not found" even with a direct link.
Article text is plain text, like announcements.

To hide the whole knowledge base, untick **Show the knowledge base to
customers** under **Setup → General Settings**. Its menu links disappear and
its addresses return "not found".

## Translations

When more than one language is active, the announcement, article and category
forms have a **Translations** section, one fold per active language other
than the default. Fill in the title (or the category name) and the text for
that language. Readers using that language see the translation; leave the
title empty and they see the default text. See [Languages](languages.md).

## Network status

**Support → Network Issues**

Tell customers about outages and planned maintenance. **Report Issue** asks
for:

| Field | Options |
|---|---|
| **Title** | Short name of the problem. |
| **Type** | General, Network, Server, Datacenter |
| **Status** | Open, Scheduled, Investigating, Resolved |
| **Description** | What is happening and what customers should expect. |

**Edit** also has **End Date (if resolved)**. When the problem is over, set
**Status** to **Resolved** and fill in the end date.

Customers see it at `/client/network-status` (**Support → Network Status** in
the client area), signed in or not. Issues that are not resolved are listed
first; the last 10 resolved ones are shown with their end date. With nothing
open, the page says all systems are operational.

Every issue created from this form shows priority **Medium**: the form has no
priority, start date or affected-server field in 1.6.1.

The pages in this section need the **manage announcements** permission
(announcements) or **manage kb** (downloads, knowledge base and network
issues).
