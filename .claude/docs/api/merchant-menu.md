# Merchant menu

Generated from the Postman export. Prose added outside the markers below is preserved when this file is regenerated.

<!-- BEGIN GENERATED -->
<!-- Everything between these markers is produced by .claude/tools/gen-api-docs.py. Edit the collection, not this. -->

## Merchants (client)

### List merchants

`GET /api/merchants`

Client mode. Directory of active merchant shops. Premium shops are listed first.

Headers: `Accept: application/json`

**Response — `200`**

```json
[
  {
    "id": 4,
    "shop_name": "Drive Style Accessories",
    "owner_name": "Sara Ibrahim",
    "activity_type": "accessories",
    "activity_type_label": "Accessories",
    "address": "88 El Tesaeen St, New Cairo",
    "maps_url": "https://maps.google.com/?q=30.0287,31.4098",
    "shop_photo_url": null,
    "is_premium": true,
    "phone": "+201012345604",
    "email": "sara.ibrahim@drive-style.test"
  },
  {
    "id": 1,
    "shop_name": "Spark Wash Maadi",
    "owner_name": "Ahmed Hassan",
    "activity_type": "car_wash",
    "activity_type_label": "Car wash",
    "address": "15 Road 9, Maadi, Cairo",
    "maps_url": "https://maps.google.com/?q=29.9602,31.2569",
    "shop_photo_url": null,
    "is_premium": true,
    "phone": "+201012345601",
    "email": "ahmed.hassan@sparkwash.test"
  },
  {
    "id": 7,
    "shop_name": "Spark Wash Maadi",
    "owner_name": "Ahmed Hassan",
    "activity_type": "car_wash",
    "activity_type_label": "Car wash",
    "address": "15 Road 9, Maadi, Cairo",
    "maps_url": "https://maps.google.com/?q=29.9602,31.2569",
    "shop_photo_url": null,
    "is_premium": true,
    "phone": "+201000000070",
    "email": "catalog.ahmed@sparkwash.test"
  },
  {
    "id": 2,
    "shop_name": "AutoCare Nasr City",
    "owner_name": "Mohamed El-Sayed",
    "activity_type": "maintenance",
    "activity_type_label": "Maintenance",
    "address": "42 Abbas El-Akkad St, Nasr City, Cairo",
    "maps_url": "https://maps.google.com/?q=30.0561,31.3300",
    "shop_photo_url": null,
    "is_premium": false,
    "phone": "+201012345602",
    "email": "mohamed.elsayed@autocare.test"
  },
  {
    "id": 3,
    "shop_name": "Green Fuel 6th October",
    "owner_name": "Karim Mostafa",
    "activity_type": "gas_station",
    "activity_type_label": "Gas station",
    "address": "Central Axis, 6th of October City, Giza",
    "maps_url": "https://maps.google.com/?q=29.9285,30.9188",
    "shop_photo_url": null,
    "is_premium": false,
    "phone": "+201012345603",
    "email": null
  },
  {
    "id": 5,
    "shop_name": "Quick Serve Heliopolis",
    "owner_name": "Omar Nabil",
    "activity_type": "other",
    "activity_type_label": "Other",
    "address": "12 El Merghany St, Heliopolis, Cairo",
    "maps_url": "https://maps.google.com/?q=30.0875,31.3248",
    "shop_photo_url": null,
    "is_premium": false,
    "phone": "+201012345605",
    "email": "omar.nabil@quickserve.test"
  },
  {
    "id": 6,
    "shop_name": "Spark Wash Maadi",
    "owner_name": "Talon Boehm MD",
    "activity_type": "car_wash",
    "activity_type_label": "Car wash",
    "address": "1555 Conroy Rue Apt. 550\nPourosville, CO 56955",
    "maps_url": "https://maps.google.com/?q=81.401734,11.335886",
    "shop_photo_url": null,
    "is_premium": false,
    "phone": "+201000000021",
    "email": "salma@example.com"
  }
]
```

### List menu items

`GET /api/menu-items`

Client mode. Available items from every published merchant menu. Each item includes its shop.

Headers: `Accept: application/json`

**Response — `200`**

```json
[
  {
    "id": 1,
    "name": "Exterior wash",
    "description": "Body wash and rinse",
    "price": "80.00",
    "currency": "EGP",
    "image_url": null,
    "category": "Exterior",
    "duration_minutes": 20,
    "is_available": true,
    "sort_order": 0,
    "merchant": {
      "id": 1,
      "shop_name": "Spark Wash Maadi",
      "activity_type": "car_wash",
      "activity_type_label": "Car wash"
    }
  },
  {
    "id": 2,
    "name": "Interior clean",
    "description": "Vacuum and dashboard wipe",
    "price": "120.00",
    "currency": "EGP",
    "image_url": null,
    "category": "Interior",
    "duration_minutes": 30,
    "is_available": true,
    "sort_order": 1,
    "merchant": {
      "id": 1,
      "shop_name": "Spark Wash Maadi",
      "activity_type": "car_wash",
      "activity_type_label": "Car wash"
    }
  },
  {
    "id": 3,
    "name": "Full valet",
    "description": "Exterior plus interior deep clean",
    "price": "250.00",
    "currency": "EGP",
    "image_url": null,
    "category": "Add-ons",
    "duration_minutes": 60,
    "is_available": true,
    "sort_order": 2,
    "merchant": {
      "id": 1,
      "shop_name": "Spark Wash Maadi",
      "activity_type": "car_wash",
      "activity_type_label": "Car wash"
    }
  },
  {
    "id": 4,
    "name": "Oil change",
    "description": "Engine oil and filter",
    "price": "450.00",
    "currency": "EGP",
    "image_url": null,
    "category": "Maintenance",
    "duration_minutes": 40,
    "is_available": true,
    "sort_order": 0,
    "merchant": {
      "id": 2,
      "shop_name": "AutoCare Nasr City",
      "activity_type": "maintenance",
      "activity_type_label": "Maintenance"
    }
  },
  {
    "id": 5,
    "name": "Brake check",
    "description": "Pads, discs, and fluid inspection",
    "price": "200.00",
    "currency": "EGP",
    "image_url": null,
    "category": "Maintenance",
    "duration_minutes": 30,
    "is_available": true,
    "sort_order": 1,
    "merchant": {
      "id": 2,
      "shop_name": "AutoCare Nasr City",
      "activity_type": "maintenance",
      "activity_type_label": "Maintenance"
    }
  },
  {
    "id": 6,
    "name": "Fuel fill-up",
    "description": "Attendant fill-up service",
    "price": "0.00",
    "currency": "EGP",
    "image_url": null,
    "category": "Fuel",
    "duration_minutes": 10,
    "is_available": true,
    "sort_order": 0,
    "merchant": {
      "id": 3,
      "shop_name": "Green Fuel 6th October",
      "activity_type": "gas_station",
      "activity_type_label": "Gas station"
    }
  },
  {
    "id": 7,
    "name": "Tire pressure",
    "description": "Check and adjust all tires",
    "price": "20.00",
    "currency": "EGP",
    "image_url": null,
    "category": "Add-ons",
    "duration_minutes": 10,
    "is_available": true,
    "sort_order": 1,
    "merchant": {
      "id": 3,
      "shop_name": "Green Fuel 6th October",
      "activity_type": "gas_station",
      "activity_type_label": "Gas station"
    }
  },
  {
    "id": 8,
    "name": "Phone holder",
    "description": "Magnetic dashboard mount",
    "price": "150.00",
    "currency": "EGP",
    "image_url": null,
    "category": "Accessories",
    "duration_minutes": null,
    "is_available": true,
    "sort_order": 0,
    "merchant": {
      "id": 4,
      "shop_name": "Drive Style Accessories",
      "activity_type": "accessories",
      "activity_type_label": "Accessories"
    }
  },
  {
    "id": 9,
    "name": "Seat covers",
    "description": "Universal front-seat pair",
    "price": "600.00",
    "currency": "EGP",
    "image_url": null,
    "category": "Accessories",
    "duration_minutes": null,
    "is_available": true,
    "sort_order": 1,
    "merchant": {
      "id": 4,
      "shop_name": "Drive Style Accessories",
      "activity_type": "accessories",
      "activity_type_label": "Accessories"
    }
  },
  {
    "id": 10,
    "name": "Standard service",
    "description": "Ask the shop for details",
    "price": "100.00",
    "currency": "EGP",
    "image_url": null,
    "category": "Other",
    "duration_minutes": 30,
    "is_available": true,
    "sort_order": 0,
    "merchant": {
      "id": 5,
      "shop_name": "Quick Serve Heliopolis",
      "activity_type": "other",
      "activity_type_label": "Other"
    }
  },
  {
    "id": 11,
    "name": "Exterior wash",
    "description": "Body wash and rinse",
    "price": "80.00",
    "currency": "EGP",
    "image_url": null,
    "category": "Exterior",
    "duration_minutes": 20,
    "is_available": true,
    "sort_order": 1,
    "merchant": {
      "id": 7,
      "shop_name": "Spark Wash Maadi",
      "activity_type": "car_wash",
      "activity_type_label": "Car wash"
    }
  }
]
```

## Merchant menu

### Public menu

`GET /api/merchants/{merchantId}/menu`

Published menu and available items for a merchant shop.

Headers: `Accept: application/json`

**Response — `200`**

```json
{
  "id": 7,
  "title": "Spark Wash — Services",
  "description": "Interior and exterior car care.",
  "is_published": true,
  "merchant": {
    "id": 8,
    "shop_name": "Spark Wash Maadi",
    "activity_type": "car_wash",
    "activity_type_label": "Car wash"
  },
  "items": [
    {
      "id": 12,
      "name": "Full exterior wash",
      "description": "Foam wash, rinse, hand dry.",
      "price": "175.00",
      "currency": "EGP",
      "image_url": "https://qar-4uh5.onrender.com/storage/menu-items/45VBBX5SDmbh52X87mF9CIzJ1WQtjeEWxZRDAE1S.jpg",
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
  "id": 7,
  "title": null,
  "description": null,
  "is_published": true,
  "merchant": {
    "id": 8,
    "shop_name": "Spark Wash Maadi",
    "activity_type": "car_wash",
    "activity_type_label": "Car wash"
  },
  "items": []
}
```

**Response — `201`**

```json
{
  "id": 7,
  "title": null,
  "description": null,
  "is_published": true,
  "merchant": {
    "id": 8,
    "shop_name": "Spark Wash Maadi",
    "activity_type": "car_wash",
    "activity_type_label": "Car wash"
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
  "id": 7,
  "title": "Spark Wash — Services",
  "description": "Interior and exterior car care.",
  "is_published": true,
  "merchant": {
    "id": 8,
    "shop_name": "Spark Wash Maadi",
    "activity_type": "car_wash",
    "activity_type_label": "Car wash"
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
  "id": 12,
  "name": "Full exterior wash",
  "description": "Foam wash, rinse, hand dry.",
  "price": "150.00",
  "currency": "EGP",
  "image_url": "https://qar-4uh5.onrender.com/storage/menu-items/45VBBX5SDmbh52X87mF9CIzJ1WQtjeEWxZRDAE1S.jpg",
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
  "id": 12,
  "name": "Full exterior wash",
  "description": "Foam wash, rinse, hand dry.",
  "price": "175.00",
  "currency": "EGP",
  "image_url": "https://qar-4uh5.onrender.com/storage/menu-items/45VBBX5SDmbh52X87mF9CIzJ1WQtjeEWxZRDAE1S.jpg",
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

---

## Status: shipped and wired to the live API

`GET /api/merchants` and `GET /api/menu-items` now exist, and merchant profiles are
seeded. `app/(main)/service.tsx` (Menu / Merchants tabs) reads them directly — the local
fixture layer and its `USE_FIXTURES` flag are deleted.

### What the client had to adapt to

Verified against the live server on 2026-09-01 with a bearer token, not just the export:

| Behaviour | Consequence for the client |
| --- | --- |
| **Authenticated**, not public — an anonymous call is `401` | `services/merchants.ts` sends the token (`api.get(path)`, not `auth = false`) |
| **No `activity_type` filter** — `?activity_type=maintenance` returns the same 15 rows as the unfiltered call | the category filter runs client-side, in `select` in `hooks/useMerchants.ts`, so all tabs share one cached fetch |
| **No pagination** — both return a bare JSON array (15 merchants, 10 items) | `useInfiniteQuery` replaced with `useQuery`; no page cursor exists to follow |
| `Accept-Language` is ignored; content is Arabic in both languages | rendered as-is, per the standing "app copy only" rule |
| `image_url` and `shop_photo_url` are `null` on every seeded row | `RemoteImage` falls back to its icon — the layout already allowed for it |

### Field names are used verbatim

No renaming or reshaping happens on the way in. In particular the client renders
`shop_photo_url` (not `logo_url`), `activity_type_label` (a display string the server
localises — the client no longer derives one), and `address`. The invented `items_count`
is gone; the API does not provide it.

The activity enum is **`gas_station`**, not `fuel_station` — the client's type said the
latter, which would have silently mismatched.

### Regenerating

This doc set is generated. Replace `.claude/reference/Qar.postman_collection.json`, bump
`EXPECT_ENDPOINTS` / `EXPECT_RESPONSES` in `.claude/tools/gen-api-docs.py` and add any new
Postman folder to its `GROUP_FILE` map, or the generator refuses to run. Currently **43
endpoints / 54 responses**.
