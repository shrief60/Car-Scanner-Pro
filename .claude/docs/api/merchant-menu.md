# Merchant menu

Generated from the Postman export. Prose added outside the markers below is preserved when this file is regenerated.

<!-- BEGIN GENERATED -->
<!-- Everything between these markers is produced by .claude/tools/gen-api-docs.py. Edit the collection, not this. -->

## Merchant menu

### Public menu

`GET /api/merchants/{merchantId}/menu`

Published menu and available items for a merchant shop.

Headers: `Accept: application/json`

**Response — `200`**

```json
{
  "id": 6,
  "title": "Spark Wash — Services",
  "description": "Interior and exterior car care.",
  "is_published": true,
  "merchant": {
    "id": 7,
    "shop_name": "Spark Wash Maadi",
    "activity_type": "car_wash"
  },
  "items": [
    {
      "id": 11,
      "name": "Full exterior wash",
      "description": "Foam wash, rinse, hand dry.",
      "price": "175.00",
      "currency": "EGP",
      "image_url": "https://qar-4uh5.onrender.com/storage/menu-items/5sx58drgG2gNNnwCFCPPPJWP78hBcWWqiAgOjJs3.jpg",
      "category": "Wash",
      "duration_minutes": 30,
      "is_available": true,
      "sort_order": 1
    }
  ]
}
```

### Get my menu

`GET /api/menu`

Merchant mode. Returns the shop menu including unavailable items.

Headers: `Accept: application/json`

**Response — `200`**

```json
{
  "id": 6,
  "title": null,
  "description": null,
  "is_published": true,
  "merchant": {
    "id": 7,
    "shop_name": "Spark Wash Maadi",
    "activity_type": "car_wash"
  },
  "items": []
}
```

**Response — `201`**

```json
{
  "id": 6,
  "title": null,
  "description": null,
  "is_published": true,
  "merchant": {
    "id": 7,
    "shop_name": "Spark Wash Maadi",
    "activity_type": "car_wash"
  },
  "items": []
}
```

### Update my menu

`PUT /api/menu`

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "title": "Spark Wash menu",
  "description": "Wash packages",
  "is_published": true
}
```

**Response — `200`**

```json
{
  "id": 6,
  "title": "Spark Wash — Services",
  "description": "Interior and exterior car care.",
  "is_published": true,
  "merchant": {
    "id": 7,
    "shop_name": "Spark Wash Maadi",
    "activity_type": "car_wash"
  },
  "items": []
}
```

### Create menu item

`POST /api/menu/items`

Headers: `Accept: application/json`

**Request body** — `multipart/form-data`

| Field | Type | Example | Notes |
| --- | --- | --- | --- |
| `name` | text | `Exterior wash` | — |
| `description` | text | `Body wash and rinse` | — |
| `price` | text | `80` | — |
| `category` | text | `Exterior` | — |
| `duration_minutes` | text | `20` | — |
| `is_available` | text | `1` | — |

**Response — `201`**

```json
{
  "id": 11,
  "name": "Full exterior wash",
  "description": "Foam wash, rinse, hand dry.",
  "price": "150.00",
  "currency": "EGP",
  "image_url": "https://qar-4uh5.onrender.com/storage/menu-items/5sx58drgG2gNNnwCFCPPPJWP78hBcWWqiAgOjJs3.jpg",
  "category": "Wash",
  "duration_minutes": 30,
  "is_available": true,
  "sort_order": 1
}
```

### Update menu item

`POST /api/menu/items/{menuItemId}`

Headers: `Accept: application/json`

**Request body** — `multipart/form-data`

| Field | Type | Example | Notes |
| --- | --- | --- | --- |
| `_method` | text | `PUT` | — |
| `price` | text | `90` | — |
| `is_available` | text | `1` | — |

**Response — `200`**

```json
{
  "id": 11,
  "name": "Full exterior wash",
  "description": "Foam wash, rinse, hand dry.",
  "price": "175.00",
  "currency": "EGP",
  "image_url": "https://qar-4uh5.onrender.com/storage/menu-items/5sx58drgG2gNNnwCFCPPPJWP78hBcWWqiAgOjJs3.jpg",
  "category": "Wash",
  "duration_minutes": 30,
  "is_available": true,
  "sort_order": 1
}
```

### Delete menu item

`DELETE /api/menu/items/{menuItemId}`

Headers: `Accept: application/json`

**Response — `200`**

```json
{
  "message": "Menu item deleted."
}
```

<!-- END GENERATED -->
