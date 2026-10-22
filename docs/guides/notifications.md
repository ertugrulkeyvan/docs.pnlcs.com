---
sources:
  - app/Services/NotificationService.php
  - app/Listeners/SendNotificationListener.php
  - app/Http/Controllers/Admin/ConfigController.php
  - app/Models/NotificationProvider.php
  - resources/views/admin/config/notifications.blade.php
  - app/Http/Controllers/Api/SystemApiController.php
  - app/Services/ProvisioningService.php
  - app/Services/OrderService.php
  - app/Http/Controllers/GatewayWebhookController.php
---

# Notification Channels

PNLCS can tell you when something happens, such as a new order, a ticket, a
failed payment or a backup that did not run, by email, in Slack, in Telegram
or by calling a URL of your own.

Two separate things send staff alerts:

- **Built-in emails** to the **Company Email** address (**Setup → General
  Settings**): a new ticket and a customer reply on a ticket. They need no
  setup beyond that address and [working email](configure-email.md). See
  [Staff alerts](support.md#staff-alerts).
- **Notification channels**, set up on this page: you choose which events go
  where.

## How it works

**Setup → Notification Channels**

- A **provider** is a destination: an email channel, a Slack webhook, a
  Telegram bot and chat, or a webhook URL.
- A **rule** connects one event to one provider. One rule per event and
  provider: to send `order.placed` to Slack and Telegram, add two rules.

Nothing is sent until at least one rule exists. A provider or rule that is
not **Active** is skipped.

## Add a provider

Press **Add Provider**, give it a **Provider Name** (only for you), pick the
**Type** and fill in its fields. Leave **Active** ticked.

=== "Email"

    No fields on the provider. The address goes on each rule, in **Recipient
    Email (for email providers)**; a rule without one is refused.

    The message is a plain-text email with the event's subject and text,
    sent through your normal [mail settings](configure-email.md).

=== "Slack"

    | Field | What to enter |
    |---|---|
    | **Slack Webhook URL** | An incoming webhook from your Slack workspace, `https://hooks.slack.com/services/...` |
    | **Bot Username** | The name the message is posted under. `PNLCS` by default. |

    The message is the event's text.

=== "Telegram"

    1. In Telegram, talk to **@BotFather**, create a bot and copy the token
       it gives you.
    2. Add the bot to the channel or group that should get the alerts, as an
       administrator for a channel.
    3. Find the chat ID. Channel IDs start with a minus sign, for example
       `-1001234567890`.

    | Field | What to enter |
    |---|---|
    | **Bot Token** | The token from @BotFather, `123456789:AA...` |
    | **Channel / Chat ID** | The chat ID from step 3. |

    The message has the subject in bold, the text, and a link to the
    matching admin page (ticket, invoice, order, service or client) when the
    event names one.

=== "Webhook"

    | Field | What to enter |
    |---|---|
    | **Webhook URL** | Your endpoint, `https://example.com/webhook` |
    | **Secret (optional)** | Sent with every call in the `X-Webhook-Secret` header, so your endpoint can check the call came from PNLCS. |

    PNLCS sends a JSON `POST`:

    ```json
    {
      "event": "ticket.opened",
      "data": {
        "event_type": "ticket.opened",
        "subject": "New Ticket Opened",
        "message": "Ticket #482913: Server down",
        "ticket_id": 17
      },
      "timestamp": "2026-10-22T09:15:00+00:00"
    }
    ```

    `data` holds the event's subject and text and the IDs it is about; the
    fields differ per event.

**Edit** never shows a stored bot token or webhook secret. Leave the field
empty to keep the stored value. **Delete** removes the provider and all its
rules.

## Add rules

Under **Notification Rules**, press **Add Rule** (shown once a provider
exists):

| Field | What to enter |
|---|---|
| **Provider** | Where to send it. |
| **Event Type** | Which event (list below). |
| **Recipient Email (for email providers)** | The address, for an email provider. Ignored for the others. |
| **Active** | Ticked to send. |

A rule cannot be edited: to change one, delete it and add it again.

## Events

Business events:

| Event | Sent when |
|---|---|
| `client.created` | A client account is created. |
| `order.placed` | An order is placed. |
| `order.awaiting_acceptance` | An order is paid but holds a product that needs manual acceptance. |
| `invoice.created` | An invoice is created. |
| `invoice.paid` | An invoice is paid. |
| `payment.notification_received` | A customer reports a bank transfer for an invoice; it waits for review. |
| `payment.failed` | A payment through a gateway was refused or could not be verified. |
| `payment.charge_needs_review` | An automatic card charge ended in a state PNLCS cannot settle by itself; someone has to check the gateway. |
| `ticket.opened` | A ticket is opened, by anyone. |
| `ticket.replied` | A ticket gets a reply; the text says whether from staff or the client. |
| `service.activated` | A service is activated. |
| `service.suspended` | A service is suspended, with the reason. |
| `service.terminated` | A service is terminated. |
| `service.provision_failed` | The customer paid and the server module refused to create the service. |

System events:

| Event | Sent when |
|---|---|
| `api.custom` | An integration calls [`triggernotificationevent`](../api/system.md#triggernotificationevent) in the API. |
| `backup.failed` | A [database backup](../install/backups.md) failed. |
| `module.failed` | A server module action failed and was queued to try again. |
| `module.failed_permanently` | A server module action failed and will not be tried again. |
| `domain.registration_failed` | A registrar refused to register a domain. |
| `domain.renew_failed` | A registrar refused to renew a domain. |
| `domain.manual_registration_required` | A paid domain has no registrar module; someone has to register it by hand. |
| `registrar.balance_low` | The prepaid balance at a registrar is at the warning level. |
| `update.available` | A newer PNLCS release is out on your [update channel](../install/updating.md). |
| `update.completed` | An update was installed. |
| `update.failed` | An update failed. |

Good first rules: `order.placed`, `payment.failed`, `ticket.opened`,
`service.provision_failed`, `module.failed_permanently` and `backup.failed`.

## Testing

A **Telegram** provider has a **Send Test** button in its row. It sends a
test message the same way a real alert goes, and shows Telegram's answer if
it fails, for example a wrong chat ID or a bot that is not in the channel.

Email, Slack and webhook providers have no test button. To check one, add a
rule for an event you can cause yourself, for example `ticket.opened`, and
open a ticket from the client area. Or add a rule for `api.custom` and send
one through the API's
[`triggernotificationevent`](../api/system.md#triggernotificationevent).

A send that fails is written to the application log and nothing else
happens: the order, payment or ticket that caused it goes through as normal.

## Good to know

- Alerts are sent at the moment of the event, while PNLCS handles it. A slow
  webhook URL slows that request down.
- A transfer refused by a registrar is not offered as an event in 1.6.1, so
  it cannot be sent anywhere.
- An `api.custom` alert reaches a webhook with `"event": "notification"`,
  not `api.custom`.
- This page needs the **manage settings** permission.
