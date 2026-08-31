# Payments

Generated from the Postman export. Prose added outside the markers below is preserved when this file is regenerated.

<!-- BEGIN GENERATED -->
<!-- Everything between these markers is produced by .claude/tools/gen-api-docs.py. Edit the collection, not this. -->

## Payments (webhook)

### Paymob webhook

`POST /api/payments/paymob/webhook?hmac=REPLACE_WITH_VALID_HMAC`

Server-to-server Paymob callback. Requires valid HMAC query param.

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "obj": {
    "id": 123456789,
    "merchant_order_id": "PAY-EXAMPLE",
    "success": true,
    "amount_cents": 10000,
    "currency": "EGP"
  }
}
```

**Response — `200`**

```json
{
  "message": "ok"
}
```

<!-- END GENERATED -->
