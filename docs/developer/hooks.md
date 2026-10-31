---
sources:
  - app/Providers/HookServiceProvider.php
  - app/Services/HookManager.php
  - app/Support/hooks.php
  - app/Events/
  - app/Hooks/
  - app/Services/ProvisioningService.php
  - app/Services/OrderService.php
  - app/Services/PaymentService.php
  - app/Models/Client.php
  - app/Listeners/RunEmailPreSendHook.php
  - app/Http/Controllers/Client/CartController.php
  - app/Http/Controllers/Client/QuoteController.php
  - app/Http/Controllers/Client/DownloadController.php
  - app/Http/Controllers/SitemapController.php
  - app/Console/Commands/DbBackupCommand.php
  - app/Console/Commands/CurrencyUpdateCommand.php
  - routes/console.php
---

# Hooks

A WHMCS-style hook system. Register callbacks against named hook points;
core code fires them at the right moments. A throwing callback is logged and
skipped — a broken hook can never break billing or provisioning. Hook names are
case-insensitive.

!!! note "Differences from WHMCS"
    Many hook names are the WHMCS ones, and several points fire under both a PNLCS name and the
    WHMCS alias, but this is not a drop-in copy of WHMCS:

    - Parameters are PNLCS model objects (`$vars['invoice']` is an `App\Models\Invoice`), not the
      WHMCS arrays of ids and fields.
    - Only the points listed on this page fire. There is no `InvoiceRefunded` (use `RefundIssued`),
      `AcceptQuote` (use `QuoteAccepted`), `TicketUserReply` or `TicketAdminReply` (use
      `TicketReplied` and its `isStaffReply`), and no `AfterModuleChangePassword` (PNLCS fires
      `AfterModulePassword`).

## Registering a hook

```php
// priority optional (default 10, lower runs first; same priority runs in registration order)
add_hook('InvoicePaid', 1, function (array $vars) {
    $invoice = $vars['invoice'];          // App\Models\Invoice
    // ...
});
```

## Where to put hook files

| Location | Loaded |
|---|---|
| `app/Hooks/*.php` | always (project-level hooks) |
| `modules/Gateways/<Name>/hooks.php` | always |
| `modules/Servers/<Name>/hooks.php` | always |
| `modules/Registrars/<Name>/hooks.php` | always |
| `modules/Ssl/<Name>/hooks.php` | always |
| `modules/Addons/<Name>/hooks.php` | only when the addon is **active** |

Each file simply calls `add_hook(...)` at top level. Files are loaded once per
request during application boot. A file that throws while loading is logged and skipped.

## Firing a hook from your own code

```php
$results = run_hook('MyCustomPoint', ['foo' => $bar]);   // non-null return values, in run order
```

## Hook points

Points marked "event" are fired from a Laravel event in `app/Events/`; the event's public
properties are the parameters, and every name in the first column fires.

### Billing
| Hook | Params | When |
|---|---|---|
| `InvoiceCreated` / `InvoiceCreation` (event) | invoice | new invoice generated (also the VAT invoice issued from a paid proforma) |
| `InvoicePaid` (event) | invoice, transactionId | invoice fully settled (any payment source); fires again, without the event, for the VAT invoice issued from a paid proforma |
| `InvoicePartiallyPaid` | invoice, amount, balance | partial payment recorded |
| `InvoiceCancelled` (event) | invoice | an invoice was cancelled (admin, bulk action or API) |
| `RefundIssued` | invoice, amount, gateway, refund_id | a refund was issued |

### Orders
| Hook | Params | When |
|---|---|---|
| `ShoppingCartValidateCheckout` | cart, clientId, paymentMethod | the customer submits checkout; return a message (or a list) to refuse the order with it |
| `OrderPlaced` / `AfterShoppingCartCheckout` (event) | order | order created |
| `AcceptOrder` | order, manual | order accepted (auto or by admin) |
| `PendingOrder` | order | paid order awaiting manual acceptance |
| `CancelOrder` | order | order about to be cancelled |
| `FraudOrder` | order | order about to be marked as fraud |

### Quotes
| Hook | Params | When |
|---|---|---|
| `QuoteAccepted` | quote, invoice | the customer accepted a quote (invoice raised) |
| `QuoteDeclined` | quote, reason | the customer declined a quote |

### Provisioning (server modules)
| Hook | Params | When |
|---|---|---|
| `PreModuleCreate` | service | before module create |
| `AfterModuleCreate` | service, result | module create succeeded |
| `PreModuleSuspend` | service, reason | before suspend |
| `AfterModuleSuspend` | service, reason | suspend succeeded |
| `PreModuleUnsuspend` | service | before unsuspend |
| `AfterModuleUnsuspend` | service | unsuspend succeeded |
| `PreModuleTerminate` | service | before terminate |
| `AfterModuleTerminate` | service | terminate succeeded |
| `AfterModulePassword` (also `AfterModuleChangePassword`) | service | password change succeeded, VPS root password included |
| `AfterModuleChangePackage` | service, newProduct | package change succeeded |
| `ModuleActionFailed` | service, action, error | a module action failed and was queued for retry (the Panelica License module also fires it with action `license`) |

### Services
| Hook | Params | When |
|---|---|---|
| `ServiceActivated` (event) | service | service became active (module create, or order activation for a product with no server; not for SSL certificates at order time) |
| `ServiceSuspended` (event) | service, reason | service suspended |
| `ServiceUnsuspended` (event) | service | suspension lifted (on a server, or locally for a service with none) |
| `ServiceTerminated` (event) | service | service terminated |

### Domains
| Hook | Params | When |
|---|---|---|
| `DomainRegistered` / `AfterRegistrarRegistration` (event) | domain | the registrar registered an ordered domain |
| `AfterRegistrarRegistrationFailed` | domain, domainid, error | a paid domain's registration was refused, or its registrar module is not available (at payment, or a retry from the admin domain page) |
| `DomainRenewed` / `AfterRegistrarRenewal` (event) | domain, years | a renewal went through at the registrar, or was recorded for a domain with no registrar module |
| `DomainTransferStarted` / `AfterRegistrarTransfer` (event) | domain | the registrar accepted a transfer request (it completes days later at the registry) |
| `DomainExpired` (event) | domain, status | the daily domain sync moved a domain past its expiry date to `grace`, `redemption` or `expired` |

### Clients & Support
| Hook | Params | When |
|---|---|---|
| `ClientCreated` / `ClientAdd` (event) | client | a customer opened an account: the sign-up page, sign-up at checkout, Google or GitHub sign-in, or the API `addclient` with a password. Not for clients created by staff in the admin area, or by `addclient` without a password |
| `UserLogin` / `ClientLogin` (event) | user, method, ipAddress, newDevice | a client-area user signed in (`method`: `password`, `google` or `github`; `newDevice`: first sign-in from this device for a user seen before) |
| `ClientEdit` | client, userid, changes, olddata | a client's own details changed (not the balance or login stamps) |
| `ClientDelete` | client, userid | a client is about to be deleted |
| `TicketOpened` / `TicketOpen` (event) | ticket, isAdmin | ticket opened (isAdmin: opened by staff) |
| `TicketReplied` (event) | ticket, replyMessage, isStaffReply | ticket reply added |
| `TicketClosed` / `TicketClose` (event) | ticket, byClient | ticket closed by staff, by the customer (`byClient`) or by the auto-close task |

### Mail and downloads
| Hook | Params | When |
|---|---|---|
| `EmailPreSend` | to, subject, message | a mail is about to leave (`to`: list of addresses, `message`: the Symfony `Email`); return `['abortsend' => true]` to stop it |
| `DownloadRequested` | download, clientId, user | a customer asks for a download, after the access check; return `['abort' => 'reason']` to refuse (403) or `['path' => '/absolute/file', 'name' => 'file.zip']` to hand over that file instead |

### System
| Hook | Params | When |
|---|---|---|
| `DailyCronJob` | — | once a day (00:10, scheduler) |
| `AfterDatabaseBackup` | file, size | the database backup was written |
| `CurrencyRatesUpdated` | base, updated, missing | the daily exchange-rate update ran (`base`: currency code; `updated`, `missing`: lists of codes) |
| `SitemapUrls` | — | `/sitemap.xml` is built; return a list of absolute `http(s)` URLs, or of `['loc' => ..., 'lastmod' => ...]` arrays, to add them |

## Debugging

```php
app(\App\Services\HookManager::class)->registered(); // point => callback count
app(\App\Services\HookManager::class)->firedLog();   // fired this request
```

## Output hooks

A callback returns an HTML string, which is printed as it is; anything else is ignored. As in WHMCS.

| Hook | Vars | Printed |
|---|---|---|
| `ClientAreaHeadOutput` | user | before `</head>` on the client area, the sign-in, sign-up, two-factor, password reset and invitation pages, the home page and the legal pages |
| `ClientAreaFooterOutput` | user | before `</body>` on the same pages |
| `ClientAreaProductDetailsOutput` | service | in a panel on the client's service page |
| `AdminAreaHeadOutput` | admin | before `</head>` in the admin area |
| `AdminAreaFooterOutput` | admin | before `</body>` in the admin area |

A theme that replaces one of these layouts should call `hook_output()` at the same places, so addons keep working with it.
