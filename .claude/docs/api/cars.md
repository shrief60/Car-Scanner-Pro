# Cars

Generated from the Postman export. Prose added outside the markers below is preserved when this file is regenerated.

<!-- BEGIN GENERATED -->
<!-- Everything between these markers is produced by .claude/tools/gen-api-docs.py. Edit the collection, not this. -->

## Cars (client)

### Add car (generate QR)

`POST /api/cars`

Requires client-mode token (act-as:client).

Headers: `Accept: application/json`

**Request body** — `multipart/form-data`

| Field | Type | Example | Notes |
| --- | --- | --- | --- |
| `plate_number` | text | `ABC 1234` | — |
| `make` | text | `Kia` | — |
| `model` | text | `Sportage` | — |
| `color` | text | `Black` | — |
| `photo` | file | — | Optional |

**Response — `201`**

```json
{
  "id": 1,
  "plate_number": "ABC 1234",
  "make": "Kia",
  "model": "Sportage",
  "color": "Black",
  "photo_url": "https://qar-4uh5.onrender.com/storage/cars/eQqlqYpgFVWO4dR2YaFmUPPy8Aok8Zxd1SR3EC50.jpg",
  "qr_code": "QAR-JEYUXHJG09",
  "qr_url": "https://qar-4uh5.onrender.com/storage/qr/QAR-JEYUXHJG09.svg",
  "created_at": "2026-08-31T15:55:05.000000Z"
}
```

**Response — `422`**

```json
{
  "message": "The plate number field is required.",
  "errors": {
    "plate_number": [
      "The plate number field is required."
    ]
  }
}
```

### List my cars

`GET /api/cars`

Headers: `Accept: application/json`

**Response — `200`**

```json
[
  {
    "id": 1,
    "plate_number": "ABC 1234",
    "make": "Kia",
    "model": "Sportage",
    "color": "Black",
    "photo_url": "https://qar-4uh5.onrender.com/storage/cars/eQqlqYpgFVWO4dR2YaFmUPPy8Aok8Zxd1SR3EC50.jpg",
    "qr_code": "QAR-JEYUXHJG09",
    "qr_url": "https://qar-4uh5.onrender.com/storage/qr/QAR-JEYUXHJG09.svg",
    "created_at": "2026-08-31T15:55:05.000000Z"
  }
]
```

**Response — `401`**

```json
{
  "message": "Unauthenticated."
}
```

### Show car

`GET /api/cars/{carId}`

Headers: `Accept: application/json`

**Response — `200`**

```json
{
  "id": 1,
  "plate_number": "ABC 1234",
  "make": "Kia",
  "model": "Sportage",
  "color": "Black",
  "photo_url": "https://qar-4uh5.onrender.com/storage/cars/eQqlqYpgFVWO4dR2YaFmUPPy8Aok8Zxd1SR3EC50.jpg",
  "qr_code": "QAR-JEYUXHJG09",
  "qr_url": "https://qar-4uh5.onrender.com/storage/qr/QAR-JEYUXHJG09.svg",
  "created_at": "2026-08-31T15:55:05.000000Z"
}
```

**Response — `403`**

```json
{
  "message": ""
}
```

_Stack trace omitted._

### Delete car

`DELETE /api/cars/{carId}`

Headers: `Accept: application/json`

**Response — `200`**

```json
{
  "message": "Car deleted."
}
```

<!-- END GENERATED -->
