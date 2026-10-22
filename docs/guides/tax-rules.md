---
sources:
  - app/Http/Controllers/Admin/ConfigController.php
  - app/Models/TaxRule.php
  - app/Services/InvoiceService.php
  - app/Http/Controllers/Admin/InvoiceController.php
  - app/Http/Controllers/Admin/ProductController.php
  - resources/views/admin/config/tax.blade.php
---

# Tax Rules

If you charge VAT, GST or sales tax, set the rates under **Setup → Tax
Rules**.

## Add rates

Rates are grouped by **country** and, optionally, **state**. For each group you
add one or more named rates (for example "VAT 20%") and mark one as the group's
**Default**.

1. **Setup → Tax Rules → Add Tax Rule**
2. Enter the **Country** as its two-letter code (for example `PL`), and the
   **State** if the rate is regional. Leave the state blank for the whole
   country.
3. Add each rate: a **Tax Name** and a **Rate (%)**. **Add another rate** adds
   a row; tick **Default** on the one customers are charged. With none ticked,
   the first row is the default.
4. **Save Changes**.

Every group needs a country. An install upgraded from an older release may
also show one group listed as **All countries**: that is the global default.
It can be deleted, but not edited without giving it a country.

## Which rate a customer pays

PNLCS looks at the customer's country and state, and uses the default rate of
the first of these groups that exists:

1. the group for that **country and state**;
2. the group for the **country** (state blank);
3. the **All countries** group, if your install has one. Only its default
   rate counts.

No match, no tax. The tax is added on top of the price and shown on the
invoice as its own line.

## Invoices you build by hand

On a new invoice (**Add New → New Invoice**), each line has its own tax rate.
PNLCS offers the rates of the customer's group with the default first; a line
at 0% or with no rate is untaxed.

The items under **Setup → Products/Services → Products/Services** (goods and
services you bill on invoices) carry their own price, unit and tax: pick one of
your rates by name, or 0%. The list offers the rates of your company's own
country. The rate is copied onto the item when you save it, so a later change
to the tax rule does not change the item until you save it again.

## Customers who pay no tax

A customer marked **Tax Exempt** gets no tax on the invoices PNLCS raises
(orders and renewals), whatever the rules say. On an invoice you build by hand,
the rate you pick on each line is applied even to an exempt customer, so pick
0% there. The flag is shown on the client's profile (**Clients → the
client**), but PNLCS 1.6.1 has no field in the admin area or the API to change
it.

## Good to know

- Prices are entered **before tax**: the rate is added to them. There is no
  setting to enter prices with tax already included.
- Every hosting product is taxable; there is no per-product switch on the
  product screen.

!!! warning "Tax is your responsibility"
    PNLCS applies the rates you configure; it is not tax advice. EU VAT, B2B
    reverse charge and US sales-tax nexus depend on the jurisdiction. Confirm
    your obligations with an accountant.
