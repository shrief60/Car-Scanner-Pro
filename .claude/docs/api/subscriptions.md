# Packages & subscriptions

Generated from the Postman export. Prose added outside the markers below is preserved when this file is regenerated.

<!-- BEGIN GENERATED -->
<!-- Everything between these markers is produced by .claude/tools/gen-api-docs.py. Edit the collection, not this. -->

## Packages (public)

### List packages

`GET /api/packages`

Browse monthly / semi-annual / yearly subscription packages.

Headers: `Accept: application/json`

**Response — `200`**

```json
[
  {
    "id": 1,
    "name": "Monthly",
    "slug": "monthly",
    "period": "monthly",
    "period_label": "Monthly",
    "duration_months": 1,
    "price": "99.00",
    "currency": "EGP",
    "description": "Billed every month."
  },
  {
    "id": 2,
    "name": "6 Months",
    "slug": "semi-annual",
    "period": "semi_annual",
    "period_label": "Every 6 months",
    "duration_months": 6,
    "price": "499.00",
    "currency": "EGP",
    "description": "Billed every 6 months."
  },
  {
    "id": 3,
    "name": "Yearly",
    "slug": "annual",
    "period": "annual",
    "period_label": "Yearly",
    "duration_months": 12,
    "price": "899.00",
    "currency": "EGP",
    "description": "Billed every year."
  }
]
```

## Subscriptions (client)

### Subscribe (cash)

`POST /api/subscriptions`

Cash payment stays pending until admin confirms in Filament.

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "package_id": {{packageId}},
  "payment_method": "cash"
}
```

**Response — `201`**

```json
{
  "subscription": {
    "id": 1,
    "status": "pending",
    "status_label": "Pending",
    "is_active": false,
    "period": "monthly",
    "period_label": "Monthly",
    "duration_months": 1,
    "price": "99.00",
    "currency": "EGP",
    "starts_at": null,
    "ends_at": null,
    "cancelled_at": null,
    "created_at": "2026-08-31T15:55:05.000000Z",
    "package": {
      "id": 1,
      "name": "Monthly",
      "slug": "monthly",
      "period": "monthly",
      "period_label": "Monthly",
      "duration_months": 1,
      "price": "99.00",
      "currency": "EGP",
      "description": "Billed every month."
    },
    "payments": [
      {
        "id": 1,
        "method": "cash",
        "method_label": "Cash",
        "status": "pending",
        "status_label": "Pending",
        "amount": "99.00",
        "currency": "EGP",
        "reference": "QAR-9CKPWLYGJFVOGCZSY09Y",
        "paid_at": null,
        "created_at": "2026-08-31T15:55:05.000000Z"
      }
    ]
  },
  "payment": {
    "method": "cash",
    "status": "pending",
    "reference": "QAR-9CKPWLYGJFVOGCZSY09Y",
    "requires_redirect": false,
    "checkout_url": null,
    "message": "Your subscription will be activated once your cash payment is confirmed."
  }
}
```

### Subscribe (paymob)

`POST /api/subscriptions`

Returns checkout_url when Paymob redirect is required.

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "package_id": {{packageId}},
  "payment_method": "paymob"
}
```

**Response — `201`**

```json
{
  "subscription": {
    "id": 2,
    "status": "pending",
    "status_label": "Pending",
    "is_active": false,
    "period": "monthly",
    "period_label": "Monthly",
    "duration_months": 1,
    "price": "99.00",
    "currency": "EGP",
    "starts_at": null,
    "ends_at": null,
    "cancelled_at": null,
    "created_at": "2026-08-31T15:55:05.000000Z",
    "package": {
      "id": 1,
      "name": "Monthly",
      "slug": "monthly",
      "period": "monthly",
      "period_label": "Monthly",
      "duration_months": 1,
      "price": "99.00",
      "currency": "EGP",
      "description": "Billed every month."
    },
    "payments": [
      {
        "id": 2,
        "method": "paymob",
        "method_label": "Paymob",
        "status": "pending",
        "status_label": "Pending",
        "amount": "99.00",
        "currency": "EGP",
        "reference": "QAR-FS73GRG3N5BADILANLSD",
        "paid_at": null,
        "created_at": "2026-08-31T15:55:05.000000Z"
      }
    ]
  },
  "payment": {
    "method": "paymob",
    "status": "pending",
    "reference": "QAR-FS73GRG3N5BADILANLSD",
    "requires_redirect": true,
    "checkout_url": "https://accept.paymob.com/unifiedcheckout/?publicKey=&clientSecret=fake_QAR-FS73GRG3N5BADILANLSD",
    "message": "Paymob is running in fake mode; no real charge will occur."
  }
}
```

### List my subscriptions

`GET /api/subscriptions`

Headers: `Accept: application/json`

**Response — `200`**

```json
[
  {
    "id": 1,
    "status": "pending",
    "status_label": "Pending",
    "is_active": false,
    "period": "monthly",
    "period_label": "Monthly",
    "duration_months": 1,
    "price": "99.00",
    "currency": "EGP",
    "starts_at": null,
    "ends_at": null,
    "cancelled_at": null,
    "created_at": "2026-08-31T15:55:05.000000Z",
    "package": {
      "id": 1,
      "name": "Monthly",
      "slug": "monthly",
      "period": "monthly",
      "period_label": "Monthly",
      "duration_months": 1,
      "price": "99.00",
      "currency": "EGP",
      "description": "Billed every month."
    },
    "payments": [
      {
        "id": 1,
        "method": "cash",
        "method_label": "Cash",
        "status": "pending",
        "status_label": "Pending",
        "amount": "99.00",
        "currency": "EGP",
        "reference": "QAR-9CKPWLYGJFVOGCZSY09Y",
        "paid_at": null,
        "created_at": "2026-08-31T15:55:05.000000Z"
      }
    ]
  }
]
```

### Show subscription

`GET /api/subscriptions/{subscriptionId}`

Headers: `Accept: application/json`

**Response — `200`**

```json
{
  "id": 1,
  "status": "pending",
  "status_label": "Pending",
  "is_active": false,
  "period": "monthly",
  "period_label": "Monthly",
  "duration_months": 1,
  "price": "99.00",
  "currency": "EGP",
  "starts_at": null,
  "ends_at": null,
  "cancelled_at": null,
  "created_at": "2026-08-31T15:55:05.000000Z",
  "package": {
    "id": 1,
    "name": "Monthly",
    "slug": "monthly",
    "period": "monthly",
    "period_label": "Monthly",
    "duration_months": 1,
    "price": "99.00",
    "currency": "EGP",
    "description": "Billed every month."
  },
  "payments": [
    {
      "id": 1,
      "method": "cash",
      "method_label": "Cash",
      "status": "pending",
      "status_label": "Pending",
      "amount": "99.00",
      "currency": "EGP",
      "reference": "QAR-9CKPWLYGJFVOGCZSY09Y",
      "paid_at": null,
      "created_at": "2026-08-31T15:55:05.000000Z"
    }
  ]
}
```

<!-- END GENERATED -->
