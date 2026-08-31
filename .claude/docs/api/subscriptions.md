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
    "is_active": false,
    "period": "monthly",
    "duration_months": 1,
    "price": "99.00",
    "currency": "EGP",
    "starts_at": null,
    "ends_at": null,
    "cancelled_at": null,
    "created_at": "2026-08-29T15:20:23.000000Z",
    "package": {
      "id": 1,
      "name": "Monthly",
      "slug": "monthly",
      "period": "monthly",
      "duration_months": 1,
      "price": "99.00",
      "currency": "EGP",
      "description": "Billed every month."
    },
    "payments": [
      {
        "id": 1,
        "method": "cash",
        "status": "pending",
        "amount": "99.00",
        "currency": "EGP",
        "reference": "QAR-4GDUTBUCKBZWQQYDNXHZ",
        "paid_at": null,
        "created_at": "2026-08-29T15:20:23.000000Z"
      }
    ]
  },
  "payment": {
    "method": "cash",
    "status": "pending",
    "reference": "QAR-4GDUTBUCKBZWQQYDNXHZ",
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
    "is_active": false,
    "period": "monthly",
    "duration_months": 1,
    "price": "99.00",
    "currency": "EGP",
    "starts_at": null,
    "ends_at": null,
    "cancelled_at": null,
    "created_at": "2026-08-29T15:20:23.000000Z",
    "package": {
      "id": 1,
      "name": "Monthly",
      "slug": "monthly",
      "period": "monthly",
      "duration_months": 1,
      "price": "99.00",
      "currency": "EGP",
      "description": "Billed every month."
    },
    "payments": [
      {
        "id": 2,
        "method": "paymob",
        "status": "pending",
        "amount": "99.00",
        "currency": "EGP",
        "reference": "QAR-TDH1YH9NL799OQRTZ7NS",
        "paid_at": null,
        "created_at": "2026-08-29T15:20:23.000000Z"
      }
    ]
  },
  "payment": {
    "method": "paymob",
    "status": "pending",
    "reference": "QAR-TDH1YH9NL799OQRTZ7NS",
    "requires_redirect": true,
    "checkout_url": "https://accept.paymob.com/unifiedcheckout/?publicKey=&clientSecret=fake_QAR-TDH1YH9NL799OQRTZ7NS",
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
    "is_active": false,
    "period": "monthly",
    "duration_months": 1,
    "price": "99.00",
    "currency": "EGP",
    "starts_at": null,
    "ends_at": null,
    "cancelled_at": null,
    "created_at": "2026-08-29T15:20:23.000000Z",
    "package": {
      "id": 1,
      "name": "Monthly",
      "slug": "monthly",
      "period": "monthly",
      "duration_months": 1,
      "price": "99.00",
      "currency": "EGP",
      "description": "Billed every month."
    },
    "payments": [
      {
        "id": 1,
        "method": "cash",
        "status": "pending",
        "amount": "99.00",
        "currency": "EGP",
        "reference": "QAR-4GDUTBUCKBZWQQYDNXHZ",
        "paid_at": null,
        "created_at": "2026-08-29T15:20:23.000000Z"
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
  "is_active": false,
  "period": "monthly",
  "duration_months": 1,
  "price": "99.00",
  "currency": "EGP",
  "starts_at": null,
  "ends_at": null,
  "cancelled_at": null,
  "created_at": "2026-08-29T15:20:23.000000Z",
  "package": {
    "id": 1,
    "name": "Monthly",
    "slug": "monthly",
    "period": "monthly",
    "duration_months": 1,
    "price": "99.00",
    "currency": "EGP",
    "description": "Billed every month."
  },
  "payments": [
    {
      "id": 1,
      "method": "cash",
      "status": "pending",
      "amount": "99.00",
      "currency": "EGP",
      "reference": "QAR-4GDUTBUCKBZWQQYDNXHZ",
      "paid_at": null,
      "created_at": "2026-08-29T15:20:23.000000Z"
    }
  ]
}
```

<!-- END GENERATED -->
