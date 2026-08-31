# Print requests

Generated from the Postman export. Prose added outside the markers below is preserved when this file is regenerated.

<!-- BEGIN GENERATED -->
<!-- Everything between these markers is produced by .claude/tools/gen-api-docs.py. Edit the collection, not this. -->

## Print requests (client)

### Create print request

`POST /api/print-requests`

Requires active subscription.

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "car_id": {{carId}},
  "quantity": 1,
  "shipping_address": "12 Tahrir St, Cairo",
  "notes": "Please print glossy"
}
```

**Response — `201`**

```json
{
  "id": 1,
  "status": "pending",
  "status_label": "Pending",
  "quantity": 2,
  "shipping_address": "12 Tahrir St, Cairo",
  "notes": "Please ship before the weekend.",
  "ready_at": null,
  "delivered_at": null,
  "created_at": "2026-08-31T15:55:05.000000Z",
  "car": {
    "id": 4,
    "plate_number": "ABC 1234",
    "qr_code": "QAR-9VONKTCSUA",
    "qr_url": "https://qar-4uh5.onrender.com/storage/qr/QAR-9VONKTCSUA.svg"
  }
}
```

**Response — `403`**

```json
{
  "message": "An active subscription is required to request a printed QR code.",
  "code": "subscription_required"
}
```

### List my print requests

`GET /api/print-requests`

Headers: `Accept: application/json`

**Response — `200`**

```json
[
  {
    "id": 1,
    "status": "pending",
    "status_label": "Pending",
    "quantity": 2,
    "shipping_address": "12 Tahrir St, Cairo",
    "notes": "Please ship before the weekend.",
    "ready_at": null,
    "delivered_at": null,
    "created_at": "2026-08-31T15:55:05.000000Z",
    "car": {
      "id": 4,
      "plate_number": "ABC 1234",
      "qr_code": "QAR-9VONKTCSUA",
      "qr_url": "https://qar-4uh5.onrender.com/storage/qr/QAR-9VONKTCSUA.svg"
    }
  }
]
```

### Show print request

`GET /api/print-requests/{printRequestId}`

Headers: `Accept: application/json`

**Response — `200`**

```json
{
  "id": 1,
  "status": "pending",
  "status_label": "Pending",
  "quantity": 2,
  "shipping_address": "12 Tahrir St, Cairo",
  "notes": "Please ship before the weekend.",
  "ready_at": null,
  "delivered_at": null,
  "created_at": "2026-08-31T15:55:05.000000Z",
  "car": {
    "id": 4,
    "plate_number": "ABC 1234",
    "qr_code": "QAR-9VONKTCSUA",
    "qr_url": "https://qar-4uh5.onrender.com/storage/qr/QAR-9VONKTCSUA.svg"
  }
}
```

<!-- END GENERATED -->
