---
sources:
  - modules/Addons/Ksef/
  - modules/Ksef/
  - modules/Addons/CompanyLookup/
  - modules/CompanyLookup/
  - app/Listeners/SendNotificationListener.php
  - app/Services/InvoicePdfService.php
  - app/Mail/KsefInvoiceIssuedMail.php
  - resources/views/admin/ksef/index.blade.php
  - resources/views/admin/config/addon-output.blade.php
  - resources/views/components/company-lookup.blade.php
  - app/Http/Controllers/Admin/AddonController.php
---

# Polish E-Invoicing (KSeF) and Company Lookup

Two addons for selling in Poland:

- **KSeF (e-Invoices)** hands paid invoices to KSeF, the Polish national
  e-invoicing system, and emails the customer the invoice with its KSeF
  number.
- **Company Lookup (PL)** fills in a Polish company's name and address from
  its NIP (tax number) on the admin client form.

They are independent: use either one, or both. Both are off on a fresh
install.

## Switch an addon on

Addons live on the **Extensions** page, in the sidebar of the **Setup**
pages (see [Modules](modules.md#extensions)). Press **Activate** next to the
addon, then **Open** to reach its settings. Settings can only be saved while
the addon is active. They are stored encrypted in the database.

Both pages need the **manage products** permission.

## KSeF (e-Invoices)

### What it does

1. An invoice is paid.
2. If it is a VAT invoice (not a proforma), PNLCS queues it for KSeF. Unpaid
   invoices are never sent.
3. In the background, PNLCS signs in to KSeF with your certificate, sends the
   invoice in the FA(2) format, and waits for KSeF's answer.
4. When KSeF gives the invoice a number, PNLCS emails the customer's billing
   address "e-Invoice (KSeF) - #*invoice number*" with the PDF attached. The
   PDF now carries the KSeF number and a verification QR code.

!!! warning "Invoice emails change while KSeF is on"
    While the addon is active, customers get **no "invoice created" email**
    for VAT invoices. The only email with the invoice is the KSeF one, sent
    after payment once KSeF has numbered it. Proforma invoices keep the
    normal email. Payment confirmations are not affected.

### What you need

- The **NIP** your invoices are issued under.
- A **qualified seal or signature certificate from MCU**, KSeF's certificate
  module, with its **private key**, both in PEM format. KSeF 2.0 signs in
  with this certificate; there is no separate API token.
- Your company name filled in under **Setup → General Settings**: it is the
  seller name on the invoice.
- Your customers' NIP in their **Tax ID / VAT Number** field. A customer
  without one is sent as a buyer with no tax number.
- A working [queue](../reference/scheduled-commands.md#the-queue). With
  `QUEUE_CONNECTION=database` the submission runs within a minute of the
  payment. With `sync` it runs while the payment is being recorded, which
  can make that request take up to a minute.

### Settings

**Extensions → KSeF (e-Invoices) → Open → Settings**

| Setting | What to enter |
|---|---|
| **Taxpayer NIP** | Your NIP, the seller. |
| **Environment** | **Integracja** (test system with test data, no legal effect; the default), **Demo** (pre-production, no legal effect) or **Prod** (real invoices). |
| **Private key (PEM)** | The private key of your MCU certificate. |
| **Private key passphrase** | Only if the key is protected by one. Left empty on a later save, the stored one is kept. |
| **Certificate (PEM)** | The MCU certificate. |
| **Connect timeout (seconds)** | Default `10`. |
| **Request timeout (seconds)** | Default `60`. |

NIP, private key and certificate are all required; without them nothing is
sent and the connection test says so. The private key and certificate are
shown again in their boxes whenever the page is opened, so keep this page to
the staff who need it.

Save, then press **Test connection** at the top of the page. It signs in to
the chosen environment and reports `Connection to the KSeF API works.`, or
KSeF's reason for refusing.

Start on **Integracja**, pay a test invoice, check the result (below), and
only then switch to **Prod**.

### Follow the submissions

**Billing → KSeF Status** (shown only while the addon is active; also the
**KSeF Status** button on the addon page) lists every invoice handed to KSeF,
newest first: invoice, client, amount, status, KSeF number and when it was
sent. A failed submission shows KSeF's error message under its row.

| Status | Meaning |
|---|---|
| **Pending** | Queued, not sent yet. |
| **Accepted** | KSeF accepted the invoice and gave it a KSeF number. |
| **Sent** | KSeF took the invoice but had not finished processing it within about 20 seconds. PNLCS does not ask again later. |
| **Error** | Signing in, sending or KSeF's check failed. The reason is shown under the row. |
| **Corrected** | You marked it as replaced by a correction invoice. |

Every submission and every connection test is also written to **Utilities →
System Logs → Module Logs**, as module `KSeF`, with the result, the KSeF
number or the error.

### Retries and corrections

- There is **no automatic retry**. An invoice in **Error** (or stuck in
  **Pending**) stays there until you press **Resend**, which queues it again.
  Fix the cause first: the error text says what KSeF refused.
- **Mark corrected** on a sent or accepted invoice only changes its status
  here. It does not send anything to KSeF. Issue the correction invoice
  yourself; once paid it is sent to KSeF like any other invoice, as a normal
  invoice rather than a correction.

### Known limits in 1.6.1

!!! warning "Check these before going live"
    - **Sent** never moves on to **Accepted**, and the number shown for it is
      KSeF's reference for the submission, not a KSeF number. The customer
      is emailed with that reference.
    - When KSeF rejects the invoice after taking it, the row shows **Error**,
      but the customer still gets the KSeF email with the reference number.
    - The verification QR on the PDF points at KSeF's test site whatever
      environment you chose.
    - The seller address sent to KSeF is `Polska`, not your company address.

    Check each invoice on **Billing → KSeF Status** and in KSeF itself until
    these are fixed.

### Switching it off

**Deactivate** on the Extensions page. Paid invoices are no longer queued,
**Billing → KSeF Status** disappears, the KSeF block leaves the PDFs, and the
normal "invoice created" email comes back. Submissions already made stay
recorded.

## Company Lookup (PL)

### What it does

On the admin client form (**Clients → Add New Client**, or editing a
client), a **Fetch data** button appears next to **Tax ID / VAT Number**.
Type a Polish NIP and press it. PNLCS asks the Polish public registers and
fills in:

- **Company** (the registered name)
- **Tax ID / VAT Number**
- street and number, postcode, city and voivodeship (state)

Only empty fields are filled. Where a field already holds something
different, the button lists it under "Some fields differ from the register:"
with **Overwrite all**. Next to the button it also shows the REGON, legal
form, VAT status and business status; hover the ⓘ for bank accounts and PKD
codes.

The NIP is checked (10 digits and the check digit) before any register is
asked; a wrong one shows "Invalid NIP."

The button is not on the sign-up form or at checkout: customers fill in
their details themselves.

### The registers

| Register | What it gives | Key |
|---|---|---|
| **GUS** (REGON, BIR service) | Name, REGON, address, legal form, PKD | **GUS BIR API key**, issued by GUS |
| **MF** (VAT white list) | VAT status, bank accounts | None |
| **CEIDG** (sole traders) | Business status and activity dates; name and address when GUS has none | **CEIDG API key** |
| **OpenBRIS** | Company data, used when the others have none | **OpenBRIS API key** |

A register without a key is skipped. With no key at all, only the MF white
list answers. A register that fails is left out of that lookup and noted in
the application log; the others are still used.

### Settings

**Extensions → Company Lookup (PL) → Open**

The top of the page lists the four registers, whether each has a key, its
address, and a **Test** button that tries a connection.

| Setting | Default |
|---|---|
| **GUS BIR API key** | empty |
| **GUS endpoint** | `https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc` |
| **CEIDG API key** | empty |
| **CEIDG endpoint** | `https://dane.biznes.gov.pl/api/ceidg/v3` |
| **OpenBRIS API key** | empty |
| **OpenBRIS endpoint** | `https://api.openbris.eu` |
| **MF endpoint** | `https://wl-api.mf.gov.pl/api` |
| **Cache TTL (seconds)** | `86400` (one day); `0` turns the cache off |
| **Connect timeout (seconds)** | `5` |
| **Request timeout (seconds)** | `10` |

Keys left empty on a later save are kept. Leave the endpoints as they are
unless a register moves.

A found company is cached for the **Cache TTL**, so asking for the same NIP
again within a day does not reach the registers. Lookups and failing
registers are written to the application log, not to Module Logs.

!!! note "The lookup address is public"
    The browser asks PNLCS, and PNLCS asks the registers, so your keys never
    reach the browser. That address answers anyone, signed in or not, up to
    30 requests a minute.
