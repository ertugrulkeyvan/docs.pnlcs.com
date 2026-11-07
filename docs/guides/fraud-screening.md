---
sources:
  - app/Services/FraudDetectionService.php
  - app/Services/Fraud/MaxMindMinFraudClient.php
  - app/Services/Fraud/FraudLabsProClient.php
  - app/Services/OrderService.php
  - app/Http/Controllers/Admin/OrderController.php
  - app/Http/Controllers/Api/OrderApiController.php
  - app/Models/BannedEmail.php
  - resources/views/admin/settings/general.blade.php
  - resources/views/admin/orders/show.blade.php
---

# Fraud Screening

Every new order is given a risk score from 0 to 100 the moment it is placed.
An order that scores **60 or more** is held as **Fraud**: nothing is set up
for it, and it waits for you under **Orders → Fraud**.

Screening runs for every order: from the shop, from **Add New → New Order**,
and from the API (`addorder`). It never stops an order because of a missing
key or a provider outage; it just scores with what it has.

## The built-in rules

These always run, with no setup. Their points are added up, to at most 100.

| Signal | Points |
|---|---|
| The customer already has an order marked Fraud | 50 |
| Three or more other orders from the same IP address in the last 24 hours | 30 |
| The account is less than 24 hours old and the order is over 100 (in your default currency) | 20 |
| The customer's email address, or its domain, is on **Setup → Banned Emails** | 80 |
| The order's IP address is on **Setup → Banned IPs** (exact match) | 80 |

A banned email or IP is enough on its own to hold an order. A banned IP also
cannot open the client area at all, so in practice that rule catches orders
entered by staff or through the API.

!!! note "Orders you enter yourself"
    An order is recorded with the IP address of whoever placed it. For
    **Add New → New Order** that is your own address, so several orders
    entered by hand within a day count towards the same-IP rule.

## MaxMind and FraudLabs Pro

For a second opinion, connect one or both services under **Setup → General
Settings → Security → Fraud Screening**:

| Setting | |
|---|---|
| **Screen orders with MaxMind minFraud** | with **MaxMind account ID** and **MaxMind license key** |
| **Screen orders with FraudLabs Pro** | with **FraudLabs Pro API key** |

A service is asked only when it is ticked and its keys are filled in. Key
fields show dots once saved; leave them blank to keep the stored key.

What is sent: the order's IP address, the customer's email, the order amount,
and to MaxMind also the customer's name and two-letter country. An order with
no usable IP address is not sent. Each request waits at most 10 seconds. The
amount is sent with the currency it is in (your default currency).

## How the score is decided

The final score is the **highest** of:

- the built-in rules' total;
- MaxMind's risk score;
- FraudLabs Pro's score, counted as at least 90 when its verdict is
  *REJECT* and at least 60 when it is *REVIEW*.

Signals are not added together: two mild warnings do not make a rejection.
The threshold of 60 is fixed. The score and its reasons are written to the
application log for any order that scores above 0.

## What happens to a held order

1. The order's status becomes **Fraud**, and its page shows a **Fraud
   Information** box: *Held by fraud screening (score 72): …* with the
   reasons and the provider scores.
2. Its unpaid invoice is cancelled, so the customer is not asked to pay.
3. Units of stock-controlled products go back on the shelf.
4. Nothing is provisioned, not even for products set to set up on order, and
   paying a held order later does not set it up either.

The customer is not told. The `FraudOrder` hook runs, so an addon can react
([Hooks](../developer/hooks.md)).

## Marking an order yourself

On the order's page, **Mark as Fraud** (it asks first) does the same as an
automatic hold. Since you usually do this after the order went through, it
matters that it also **suspends** the order's active services, on their
server too. The order's page then reads *Manually
marked as fraud by admin on* and the date. A paid invoice stays paid: refund
it if you want the money to go back ([Invoices, Credit and Refunds](invoices.md#refunds)).

## Clearing a false alarm

On the page of an order held as **Fraud** (or a **Cancelled** one), **Set back
to Pending** releases it (needs the **manage orders** permission; the API's
[`pendingorder`](../api/orders.md#pendingorder) does the same):

- the order is **Pending** again, and units of stock-controlled products are
  taken off the shelf again;
- its cancelled invoice is payable again, with a new due date. Anything that
  had been paid on it, and was given back as credit when it was cancelled, is
  taken back from the credit balance; if the customer has spent that credit
  since, the invoice stays cancelled and you settle it by hand;
- services that **Mark as Fraud** suspended are unsuspended, on their server
  too. A service suspended for another reason stays suspended.

Then **Accept Order** on its page as usual. Or **Delete Order** and let the
customer order again.

To test what screening says about an order without changing it, call
[`orderfraudcheck`](../api/orders.md#orderfraudcheck).
