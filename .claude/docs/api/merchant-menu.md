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

---

## Endpoints the app needs but the API does not have

The client-side browsing flow (`app/(main)/service.tsx` → Menu / Merchants tabs) is
**built and shipping against local fixtures** because these routes do not exist.
Verified against the live server, not just the Postman export:

| Probe | Result |
| --- | --- |
| `GET /api/merchants` | **404 — route does not exist** |
| `GET /api/menu-items` | **404** |
| `GET /api/services` | **404** |
| `GET /api/menu/items` | **405** — POST only; it is the merchant-authoring route |
| `GET /api/merchants/{id}/menu` | route exists, but **ids 1–15 all 404 — no merchant profiles are seeded** |

### Requested routes

```
GET /api/merchants?activity_type=maintenance&page=1          public
  → paginated Merchant[]
    { id, shop_name, activity_type, logo_url|null, address|null, items_count }
  activity_type ∈ car_wash|maintenance|fuel_station|accessories|other; omit = all.

GET /api/menu-items?activity_type=maintenance&page=1         public
  → paginated MenuItem[], EACH ROW EMBEDDING its merchant:
    { …MenuItem, merchant: { id, shop_name, activity_type } }
  Only published menus. Stable ordering (merchant_id, sort_order, id).
  ← the embedded `merchant` is not optional: without it the client N+1s to
    name the shop on every card.

GET /api/menu-items/{id}                                     public, nice-to-have
  → one MenuItem + embedded merchant. Enables deep links. The client works
    without it (cache + GET /api/merchants/{id}/menu fallback).
```

### Two things to decide explicitly

1. **Pagination has no envelope anywhere in this API yet** — `GET /api/packages`
   returns a bare array, and no endpoint exposes `current_page` / `meta` / `links`.
   Please use Laravel's default paginated resource collection
   (`{ data, links, meta: { current_page, last_page, per_page, total } }`), which
   survives `JsonResource::withoutWrapping()`. The client already parses both that and
   a bare array, but the bare array cannot express "there is another page".
2. **Seed merchant profiles.** Until then even the existing
   `GET /api/merchants/{id}/menu` returns 404 for every id, so the feature has nothing
   to show regardless of the new routes.

### When these ship

Flip `USE_FIXTURES` to `false` in `artifacts/mobile/services/merchants.ts` and delete
`services/merchants.fixtures.ts` — no screen or hook changes. Then remember this doc
set is generated: bump `EXPECT_ENDPOINTS` / `EXPECT_RESPONSES` in
`.claude/tools/gen-api-docs.py` and add the new Postman folder to its `GROUP_FILE`
map, or the generator will refuse to run.
