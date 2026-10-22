---
sources:
  - app/Models/CustomField.php
  - app/Http/Controllers/Admin/ConfigController.php
  - app/Http/Controllers/Admin/ClientController.php
  - app/Http/Controllers/Admin/ProductCustomFieldController.php
  - app/Http/Controllers/Client/AccountController.php
  - app/Http/Controllers/Client/CartController.php
  - app/Models/Invoice.php
  - resources/views/admin/config/custom-fields.blade.php
---

# Custom Client Fields

Collect extra information about your clients — a tax ID such as **NIP**, PESEL,
a company VAT number, a billing reference, or anything else your business needs.

Custom client field definitions live in **Setup → Custom Fields** (the page is
called **Custom Client Fields**). Staff fill them in when they create or edit a
client, and clients see and edit the ones that are not **Admin only** on their
own Profile.

For questions about one product, such as the site to migrate or a licence's
domain, see [Questions on one product](#questions-on-one-product).

## Add a field

1. **Setup → Custom Fields → Add Custom Field**
2. Fill in the field definition (see below).
3. **Save Field**.

The new field immediately appears on the client create/edit forms.

## Field settings

| Setting | Description |
|---------|-------------|
| **Field Name** | The label shown on the form (e.g. `NIP`). |
| **Field Type** | How the field is entered: Text, Long Text, Dropdown, Checkbox, Number or Date. |
| **Field Options** | One option per line, used by the **Dropdown** type. |
| **Regex Validation** | A pattern the value must match, e.g. `^\d{10}$` for a 10-digit NIP. Enter it **without** surrounding slashes. It applies to Text fields on the admin client forms and is checked by the browser. |
| **Description** | Optional helper text. |
| **Sort Order** | Lower numbers first in the form. |
| **Required** | The field must be filled in on the admin client forms and when a new customer signs up at checkout. |
| **Admin only** | Reserved for staff: never shown in the client area or at checkout. |
| **Show on order** | Asked at checkout when a new customer opens their account there. Customers who are already signed in are not asked. |
| **Show on invoice** | The client's value is printed in the buyer details of their invoices. |

!!! tip "NIP example"
    For a Polish tax ID use `^\d{10}$`, or `^(\d{3}-\d{3}-\d{2}-\d{2}|\d{10})$`
    if you also want to accept typographic dashes (123-456-78-90).

## Editing, ordering and deleting

- **Edit** a field with the edit button in the row and change any setting.
- **Reorder** by setting **Sort Order** — fields are shown in ascending order.
- **Delete** a field (with confirmation). Deleting a field also removes every
  saved value.

## Where values are used

- **Clients → Add New Client, or a client's edit page** renders each field
  according to its type (checkbox, dropdown options, date/number input, regex
  validation). Emptying a field removes its saved value.
- **Clients → a client's summary tab** lists the client's values in a
  "Custom Fields" panel.
- **The client's Profile** in the client area shows every field that is not
  Admin only, and the client can change the values there.
- **Checkout** asks new customers the fields marked **Show on order**.
- **Invoices**: fields marked **Show on invoice** appear in the buyer details
  on the admin invoice page and the invoice PDF. The values are copied onto the
  invoice when it is issued, so a later change on the client does not alter
  invoices already issued.

## Questions on one product

A product can ask its own questions on its order form. Open the product
(**Setup → Products/Services**, then edit it) and use **Order questions →
Add question**: a name, a type (the same six as above), options for a list,
**Required** and **Staff only**.

The answers are kept on each service. Staff see and correct them on the
service page; the customer sees the answers to questions that are not Staff
only on their service page. Deleting a question deletes every answer to it.

## For developers

| Area | Details |
|------|---------|
| **Tables** | `custom_fields` (`type` `client` with `rel_id` 0, or `product` with `rel_id` = product id; field_name, field_type, field_options, regex, admin_only, required, sort_order, show_on_invoice, show_on_order) and `custom_field_values` (field_id, rel_id = client id or service id, value). |
| **Config controller** | `ConfigController` — `customFields`, `storeCustomField`, `updateCustomField`, `destroyCustomField` under the `config.` route group. Product questions: `ProductCustomFieldController`. |
| **Routes** | `admin/config/custom-fields*`, guarded by the `manage_settings` permission. |
| **Model** | `CustomField` — `clientFields()`, `productFields($productId)`, `orderFields()`, `rulesFor()`, `storeValues()`, `invoiceSnapshot()`, `valueFor($relId)`, `options()`; `CustomFieldValue` stores one row per record and field. |
| **Invoices** | The show-on-invoice values are frozen into `invoices.buyer_custom_fields` at issue time; `Invoice::buyerCustomFields()` falls back to live values for older invoices. |
| **Validation** | Server-side rules (`CustomField::rulesFor`) check required, type and dropdown options at checkout and for product questions. They do not check the regex; the admin client forms rely on the browser's `required` and `pattern` attributes. |
| **Persistence** | A blank value deletes the stored row instead of saving an empty one. |
