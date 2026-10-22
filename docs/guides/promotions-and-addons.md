---
sources:
  - app/Models/Promotion.php
  - app/Http/Controllers/Admin/ConfigController.php
  - app/Http/Middleware/PromoLink.php
  - app/Services/CartService.php
  - app/Services/OrderService.php
  - app/Services/InvoiceGenerationService.php
  - resources/views/admin/config/promotions.blade.php
  - app/Models/ProductAddon.php
  - app/Services/AddonService.php
  - resources/views/admin/config/addons.blade.php
  - app/Services/ConfigOptionService.php
  - resources/views/admin/config/config-options.blade.php
  - app/Models/ProductBundle.php
  - resources/views/admin/config/bundles.blade.php
---

# Promotions, Addons and Bundles

This page covers the ways to change what a customer pays on top of a
product's own price: **promo codes** take money off, **product addons** and
**configurable options** add extras. **Product bundles** have a screen too,
but see [their section](#product-bundles) before you rely on them.

To give a free domain with a hosting plan, you don't need a promo code. Set
it on the product: see
[A free domain with a product](sell-domains.md#a-free-domain-with-a-product)
and the [FAQ](../troubleshooting/faq.md#can-i-give-a-free-domain-with-hosting).

## Promo codes

**Setup → Promotions** (needs the **manage promotions** permission)

The list shows each code with its type, value, **Uses** (used / maximum),
**Expires** date and status. A code is *Active* while it has uses left and
has not passed its expiry date. Otherwise it shows *Inactive*.

### Create a code

Press **Add Promo Code** and fill in:

| Field | What it does |
|---|---|
| **Promo Code** | The code customers type, for example `SUMMER20`. It must be unique. Use only letters, digits, `-` and `_`, at most 50 characters: the cart takes at most 50, and promo links accept nothing else. |
| **Discount Type** | **Percentage (%)** or **Fixed Amount**. |
| **Discount Value** | The percentage, or the amount in your default currency. |
| **Applies to products** | Leave empty to allow the code on any product. When you pick products, the code works only if one of them is in the basket, and the discount is taken off **those lines only**, not off the whole order. |
| **Requires all of** | Leave empty for none. When you pick products, the code only works when **every** one of them is in the basket: a discount for a set, such as hosting + SSL. |
| **Once per customer** | A customer who already has an order with this code cannot use it again. |
| **New customers only** | Only for customers who have never ordered. |
| **Existing customers only** | Only for customers who have ordered before. |
| **Max Uses** | How many times the code can be claimed in total. `0` = unlimited. |
| **Expiry Date** | Optional. The code still works on its expiry date and stops the day after. |

The Add form has no **Recurring** box: to make a code apply to renewals too,
create it, then press **Edit** on it (see below).

### Edit a code

**Edit** opens a shorter form: **Code**, **Type**, **Value**, **Max Uses**,
**Expires** and **Applies to renewals as well**. The product lists and the
customer rules can't be changed after creation. To change them, delete the
code and create it again.

The edit form lists three more types (*free setup*, *price override*,
*override recurring*). PNLCS doesn't calculate a discount for them, so don't
use them.

### First payment or renewals too

By default a code discounts **only the invoice of the order** it was used
on.

With **Applies to renewals as well** ticked, PNLCS takes the same discount
off every renewal invoice of the services bought with that order, for as
long as the code exists. Renewals don't count as uses, and the code's
expiry date and **Max Uses** don't stop them: they only limit new orders. If
the code is limited to certain products, renewals of other products are not
discounted. Deleting the code ends the renewal discount.

### How customers use a code

- **In the cart.** The cart page has a **Promo Code** box with an **Apply**
  button. A code that doesn't exist shows *Invalid promo code.*, and one whose
  rules aren't met shows *This promo code cannot be used on this order.*
- **In a link.** Add `?promo=CODE` to any page of your site, for example
  `https://example.com/?promo=SUMMER20`. `?promocode=CODE` (the WHMCS link
  format) works too. PNLCS remembers the code for that visit and applies it
  as soon as the cart holds something the code is valid for. A code the
  customer typed is never replaced by one from a link.
- **Staff orders.** **Add New → New Order** has a **Promo Code** field.
- **API.** The `promocode` field of the order call (see the
  [API reference](../api/orders.md)).

A visitor who isn't signed in can apply a code in the cart. The rules that
depend on the customer (new or existing customer, once per customer) are
checked again when the order is placed, against the real account.

### How the discount is calculated

In the cart and on the invoice, things happen in this order:

1. The lines (products, their options and addons, domains).
2. The customer's **client group** discount, if they are in a group with one.
3. The promo code. A percentage is taken off what's left, or only off the
   covered lines if the code is limited to certain products. A fixed amount
   never takes more than those lines are worth.
4. Tax, on what is left of the taxable part.

On the invoice the code appears as its own line, **Promo code CODE**, with a
negative amount. The invoice notes also record `Promo applied: CODE`, and
the code is saved on the order (**Promo Code** on the order page).

!!! warning "Known problems in 1.6.1"
    Test a code with a real order before you announce it. In PNLCS 1.6.1:

    - A **Fixed Amount** code shows its discount in the cart, but the discount
      isn't added to the order's invoice. Only **Percentage** codes reach the
      invoice.
    - Codes with **Once per customer** or **New customers only** pass in the
      cart but are dropped when the order is placed, because the new order
      already counts as the customer's order. The invoice then carries no
      discount.

### Promotions report

**Reports → Promotions Usage** lists every code with its uses, limit,
status (*Active*, *Expired* or *Maxed*), whether it recurs, and its dates.
See [Reports](reports.md).

## Product addons

An addon is an extra sold with a hosting package, such as a dedicated IP,
extra backup space or a licence. It has its own price and billing cycle.
A customer can buy it with the package or later, and cancel it on its own
while the package keeps running.

**Setup → Product Addons** (needs **manage products**). In the Setup sidebar
it is under *Other*.

Press **Add Addon**:

| Field | What it does |
|---|---|
| **Name** | What the customer sees, for example *Extra IP Address*. |
| **Description** | Optional, shown under the name. |
| **Applicable Products** | Which products offer it. Leave empty for all products. |
| **Sort Order** | Position in the list. |
| **Pricing** | A price per cycle: Monthly, Quarterly, Semi-Annually, Annually, Biennially, Triennially. Prices are in your default currency. |
| **Hidden** | Not offered to customers. Services that already have it keep it. |
| **Apply Tax** | Whether the addon is taxed (ticked by default). |

The edit form adds **Retired**: like hidden, for an addon you no longer sell.

!!! note "A zero price means free"
    The hint under **Pricing** says that a cycle left at zero is not
    offered. That isn't what happens: at zero, the addon is offered **for
    free** on that cycle. If you don't want it on a cycle, use a product with
    the matching cycles, or hide the addon.

### How addons are sold and billed

- **When ordering.** The product's order page lists its addons, each with a
  checkbox and its price for the chosen cycle. A chosen addon is added to
  the order invoice and starts as *Pending*. It becomes active when the
  order is accepted.
- **Later.** On a running service's page, the customer sees **Available
  Addons**. **Order** raises a separate invoice for the addon and takes the
  customer to it. The addon is billed on the service's billing cycle.
  Staff can add an addon from the service's page in the admin area. An
  addon can't be bought for a terminated, cancelled or fraud service.
- **Renewals.** An addon is renewed on its own due date, on the same
  renewal invoice as the customer's other items. It renews only while its
  service is not pending, terminated or cancelled, has auto-renew on, and
  has no cancellation request waiting.
- **Cancelling.** The customer presses **Cancel** next to the addon on the
  service page. Billing stops and the service is not touched.

## Configurable options

Configurable options are choices made while ordering a product that change
its price, for example memory size or number of IPs. Unlike an addon, an
option belongs to the service itself.

The **Configurable Options** page has no menu entry. Open
`https://example.com/admin/config/config-options`, or press **Change prices
and choices** on a Proxmox product (needs **manage products**).

1. **Add Group**: a group, for example *RAM Options*, with an optional
   description.
2. **Applies to products**: tick the products that offer the group.
3. **Add Option** in the group: a name and a **Type**: Dropdown, Radio,
   Checkbox, Quantity or Text.
4. **Sub**: add the choices of an option (for example `1 GB`, `2 GB`), each
   with a price per billing cycle.

The customer sees the groups on the product's order page, and the total
updates as they choose. The chosen options are saved on the service.
Modules that read options, such as Proxmox, use them when they create the
service. For how Proxmox names its options, see
[Create the product](proxmox/create-the-product.md).

## Product bundles

**Setup → Product Bundles** stores a named set of at least two products
with a **Discount Type** (percentage or fixed amount), a **Discount Value**
and an **Active** switch.

!!! warning "Bundles don't do anything yet"
    In PNLCS 1.6.1 nothing in the cart or the invoices reads bundles: a
    customer who orders the products of a bundle pays full price. For a
    discount on a set of products, use a promo code with **Requires all of**
    (but read the [known problems](#how-the-discount-is-calculated) first).
