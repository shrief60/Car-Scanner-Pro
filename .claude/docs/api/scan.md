# QR scan (public)

Generated from the Postman export. Prose added outside the markers below is preserved when this file is regenerated.

<!-- BEGIN GENERATED -->
<!-- Everything between these markers is produced by .claude/tools/gen-api-docs.py. Edit the collection, not this. -->

## QR scan (public)

### Scan QR code

`GET /api/scan/{qrCode}`

Public stranger view. No auth. Owner phone never returned.

Headers: `Accept: application/json`

**Response — `200`**

```json
{
  "headline": "Does this car need its owner?",
  "car": {
    "make": "Kia",
    "model": "Sportage",
    "color": "Black",
    "plate_number": "ABC 1234",
    "photo_url": null
  },
  "actions": [
    {
      "type": "double_parked",
      "label": "It's double-parked / blocking"
    },
    {
      "type": "lights_on",
      "label": "Lights are on"
    },
    {
      "type": "danger",
      "label": "Danger around the car"
    }
  ]
}
```

**Response — `404`**

```json
{
  "message": "Car not found."
}
```

_Stack trace omitted._

### Send alert

`POST /api/scan/{qrCode}/alerts`

type: double_parked | lights_on | danger

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "type": "double_parked"
}
```

**Response — `201`**

```json
{
  "message": "Alert sent."
}
```

<!-- END GENERATED -->
