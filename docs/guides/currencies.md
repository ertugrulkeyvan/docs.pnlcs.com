---
sources:
  - app/Http/Controllers/Admin/ConfigController.php
  - resources/views/admin/config/currencies.blade.php
  - app/Models/Currency.php
  - app/Console/Commands/CurrencyUpdateCommand.php
  - app/Services/TcmbRateService.php
  - app/Support/CustomerCurrency.php
  - app/Http/Middleware/SetDisplayCurrency.php
  - app/Models/Invoice.php
  - app/Models/Product.php
  - app/Support/formatting.php
  - app/Http/Controllers/Client/FundsController.php
  - resources/views/admin/settings/general.blade.php
  - resources/views/pdf/invoice.blade.php
  - routes/console.php
---

# Currencies and Exchange Rates

PNLCS keeps its books in one currency, the **default currency**. Every price,
invoice amount, credit balance, refund and report is in it. Other currencies
are for showing prices to customers and for the currency an invoice is
billed in; their amounts are always converted from the default currency at a
rate.

Currencies are under **Setup → Currencies**. A new installation has four:
USD (the default), EUR, GBP and TRY, with placeholder rates that the first
rate update replaces.

## Add a currency

**Setup → Currencies → + Add Currency**:

| Field | What it is |
|---|---|
| **Code** | Three letters, for example `PLN`. Must be unique |
| **Exchange Rate** | How many units of this currency one unit of the default currency buys. With USD as the default, EUR is about `0.92` |
| **Prefix (symbol)** | Printed before the amount, for example `€` |
| **Suffix** | Printed after the amount, for example ` EUR` |
| **Number format** | `1,234.56`, `1.234,56`, `1 234,56` or `1234.56` |

Amounts always have two decimals. **Edit** changes the same fields. A
currency can be deleted only if it is not the default and no customer is
billed in it: the **Customers** column counts them, and you move those
customers to another currency on their profiles first.

## The default currency

**Make default** on a currency's row makes it the books currency. It changes
nothing else: prices are not converted and rates are not recalculated. Press
**Update rates now** straight afterwards, so every rate is against the new
default.

!!! warning "Choose the default currency before you sell"
    Each invoice remembers the currency its amounts were in, so old invoices
    still read correctly after a change. But the shop then sells at the
    prices entered for the new default currency (below), and credit
    balances, which hold a bare number, are read in the new currency.

## Prices in other currencies

A product's **Pricing** box has one block per currency. The shop, the cart,
and the invoices all use the block of the **default currency** (or the first
block that has prices, if the default one has none). The other blocks are
only used once their currency becomes the default.

A price shown in another currency is always the default-currency price
multiplied by that currency's rate, rounded to two decimals. Domain prices
and invoice items have no currency of their own and are converted the same
way.

## Rate updates

With **Update exchange rates every day** ticked (card **Customer currency and
exchange rates** on **Setup → Currencies**; on by default), rates are fetched
every morning at 05:30, against the default currency.
**Update rates now** fetches them at once, whether the daily update is on or
not.

- Rates come from open.er-api.com; if that fails, from frankfurter.app
  (European Central Bank reference rates). Neither needs a key.
- Each rate is stored with five decimals. A currency neither source quotes
  keeps the rate it had.
- The default currency's rate is set back to 1.
- If both sources fail, every rate is kept as it was and the run reports an
  error.

A rate you type by hand is overwritten by the next update. To keep your own
rates, untick **Update exchange rates every day**.

The command is `pnlcs:currency-update` ([Scheduled Commands](../reference/scheduled-commands.md)).

### Official lira rate (TCMB)

For a shop whose default currency is USD and that has TRY, the lira rate can
come from the Central Bank of the Republic of Turkey instead, so customers can
check it. Under **Setup → General Settings → Billing currency**:

- **Official rate source**: *None (commercial rate)* (the default) or
  *TCMB (Central Bank of Turkey)*.
- **TCMB rate**: *forex selling rate* (the default) or *forex buying rate*.

Each update then takes the USD rate from the latest TCMB bulletin (the bank
publishes on business days, so on a weekend it is Friday's) and remembers its
date and bulletin number for the invoice note. If TCMB cannot be reached, the
commercial rate stays for that day. Other base currencies are not affected.

## Which currency an invoice is billed in

Amounts on an invoice are always in the default currency. An invoice can also
carry a **billing currency**: the currency the customer pays in, with the rate
fixed on the day the invoice was created. Reprinting it later shows the same
figure.

PNLCS picks the billing currency in this order:

1. **The customer's own currency**, when **Let customers choose their
   currency** is on and their account has a currency other than the default.
2. **Bill customers in** (**Setup → General Settings → Billing currency**),
   when it is set to a currency other than the default. The default choice is
   *Shop currency only*.
3. Otherwise none: the invoice is in the default currency only.

How a card payment is charged depends on the gateway: in the default currency,
unless its **Charge in the invoice's billing currency** option is on
([Payment Gateways](payment-gateways.md#stripe)).

## Letting customers choose

**Let customers choose their currency** (**Setup → Currencies**, off by
default) needs at least two currencies.

- A visitor picks a currency in the top bar and sees every price converted at
  the current rate. The cart and checkout say which rate is used and that the
  invoice will be in that currency.
- The account they open keeps that currency. After that, a signed-in customer
  cannot change it: staff do, under **Clients → the client → Edit →
  Currency**.
- The admin area always shows the default currency.

## On the invoice PDF

Lines and totals are printed in the default currency. An invoice with a
billing currency adds an **Amount due (TRY)** line (with that invoice's
currency code) and a note under the totals:

- with a commercial rate: *Billed in TRY, converted from USD at a rate of
  41.8500.*
- with the TCMB rate: *Converted at the forex selling rate published by TCMB
  on 21.10.2026: 1 USD = 41.8500 TRY (bulletin 2026/201)*

The rate is printed with four decimals.

## Rounding

- A converted amount is the amount times the rate, rounded to two decimals.
  On an invoice, only the total is converted, so line amounts in the billing
  currency are never added up and cannot drift from it.
- **Add Funds** asks for the amount in the billing currency. It is divided by
  the rate and rounded to two decimals; that figure goes on the invoice and,
  once paid, on the credit balance. The quick amounts (10 to 500 in the
  default currency) are converted and rounded to round figures, and so are
  the limits: 5 to 10,000 in the default currency.
