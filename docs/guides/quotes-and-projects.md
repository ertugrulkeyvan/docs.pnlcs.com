---
sources:
  - app/Services/QuoteService.php
  - app/Http/Controllers/Admin/QuoteController.php
  - app/Http/Controllers/Client/QuoteController.php
  - app/Models/Quote.php
  - resources/views/admin/quotes/create.blade.php
  - resources/views/admin/quotes/show.blade.php
  - resources/views/client/quotes/show.blade.php
  - modules/Addons/ProjectManagement/ProjectManagementModule.php
  - app/Http/Controllers/Admin/ProjectController.php
  - resources/views/admin/projects/show.blade.php
  - modules/Addons/StaffBoard/StaffBoardModule.php
  - app/Http/Controllers/Admin/AddonController.php
  - routes/admin.php
---

# Quotes, Projects and the Staff Board

**Quotes** are price offers you send a customer before any work is billed.
When the customer accepts one, PNLCS turns it into an invoice. **Projects**
track one-off work for a client as tasks and messages, and the **Staff
Board** collects the internal notes your staff write on client profiles.

## Quotes

**Billing → Quotes** lists all quotes, with buttons to filter by status (All,
Draft, Sent, Accepted, Declined) and a search on subject and client name.
Seeing quotes needs the **list quotes** permission. Creating, editing,
sending, accepting and converting them needs **manage quotes**.

### Create a quote

**Billing → Quotes → New Quote**, or **Add New → New Quote**.

| Field | What it does |
|---|---|
| **Client** | Who the quote is for. Required. |
| **Subject** | The quote's title. Required. |
| **Date** | Defaults to today. |
| **Valid Until** | The last day the customer can accept. Defaults to 30 days from today. |
| **Line Items** | Each line has a description, quantity, unit price, discount (an amount taken off that line) and a **Taxable** box. |
| **Admin Notes** | For staff. Copied onto the invoice when the quote is accepted (see the warning below). |
| **Customer Notes** | Shown on the quote's admin page only. A reason the customer gives when declining is saved here and replaces what you wrote. |
| **Proposal** | Longer text the customer reads on the quote. |

Tax is worked out at the customer's own rate, the way their invoices will
be (see [Tax Rules](tax-rules.md)).

A new quote is a **Draft**. Customers don't see drafts.

### Send it

On the quote's page, press **Send to Client**. The status becomes **Sent**
and the customer can see the quote under **Billing → Quotes** in the client
area.

!!! note "No email is sent"
    **Send to Client** only changes the status. PNLCS doesn't email the
    customer, so let them know yourself, for example in a ticket.

### Accept or decline

**The customer** opens the quote and, under *Your Decision*, chooses:

- **Accept Quote & Generate Invoice**: PNLCS raises the invoice at once and
  takes the customer to it so they can pay.
- **Decline**, with an optional **Reason**.

The customer can do this only while the quote is **Sent** and its **Valid
Until** day has not passed. After that day they see *This quote has expired*
and the buttons are gone.

**Staff** use the buttons on the quote's page: **Accept Quote** or **Decline
Quote** while it is Sent, then **Convert to Invoice** once it is Accepted.
Staff can convert after the Valid Until date.

### The invoice

- One line per quote line, at quantity × unit price minus discount, taxed
  where the quote line was marked **Taxable**.
- Due **30 days** after the quote is accepted.
- One quote gives one invoice. Pressing **Convert to Invoice** again opens
  the same invoice. Only if that invoice was cancelled or refunded does a
  new one get raised.
- It is an invoice only. No order or service is created: to set up hosting
  the customer has bought, create an order for it as well.

!!! warning "Admin Notes are printed on the invoice"
    The quote's **Admin Notes** become the invoice's notes, and those appear
    on the invoice PDF the customer downloads. Don't put anything private in
    Admin Notes.

### Statuses

| Status | Meaning |
|---|---|
| Draft | Being written. Not visible to the customer. |
| Sent | Visible to the customer, waiting for an answer. |
| Accepted | Accepted by the customer (invoice raised) or by staff. |
| Declined | Declined by the customer or by staff. |

A quote past its Valid Until date keeps the status *Sent*. PNLCS doesn't
change it to expired.

Developers can react to the customer's decision with the `QuoteAccepted`
and `QuoteDeclined` hooks ([Hooks](../developer/hooks.md)). Quotes are also
in the API ([Quotes](../api/quotes.md)).

## Switching on an extension

Project Management and Staff Board are **extensions** (addon modules). Both
are off until you activate them:

1. Open the **Extensions** page: in the Setup sidebar under *Other*, or
   **Setup → Modules** and **Configure** next to *Addons*.
2. Press **Activate** on the extension.
3. Its entries then appear in the **Extensions** menu in the top bar.
   **Open** on the Extensions page shows the extension's own page and its
   **Settings**.

See [Modules → Extensions](modules.md#extensions).

## Project Management

Projects record work you do for a client: a status, dates, a task list and
a message timeline.

With the extension active, the **Extensions** menu has **Projects** and
**Create Project**. The extension's own page (**Open**) lists the 50 most
recent projects.

The project screens themselves need the **list projects** permission to
view and **manage projects** to create or change.

**Create Project**:

- **Client**, **Title**, **Description**
- **Status**: Pending, In Progress, Completed or Cancelled
- **Start Date** and **Due Date**

On a project's page:

- **Add Task**: a task with optional notes and due date. Tick tasks off as
  they are done. The project shows its progress as the share of tasks done.
- **Timeline / Messages**: **Post Message** adds an update, signed with your
  name.
- **Edit Project** and **Delete Project** (deleting removes its tasks and
  messages too).

Projects are only for staff. Clients don't see them in the client area.

!!! note "What the extension doesn't do yet"
    The extension's description mentions assigning staff, time tracking and
    invoicing from project hours, and its settings list *Default Task Limit
    per Project*, *Allow Clients to View Projects* and *Auto-create Invoice
    on Project Completion*. None of these is implemented in 1.6.1: the
    settings are saved but have no effect. To bill a project, raise an
    invoice or a [quote](#quotes) by hand.

Projects are also in the API ([Projects](../api/projects.md)).

## Staff Board

The Staff Board shows, on one page, the **20 latest notes** your staff have
written on client profiles (the **Notes** tab of a client), with the
author and how long ago each was written. Notes marked **Sticky** come first,
labelled *PINNED*. Only staff can see the board.

With the extension active, it is under **Extensions → Staff Board**.

You don't post on the board itself: write a note on a client's **Notes** tab
and it appears there. The settings *Posts Per Page* and *Allow Markdown in
Posts* have no effect in 1.6.1: the board always shows 20 notes, as plain
text.
