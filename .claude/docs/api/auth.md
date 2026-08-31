# Authentication & account

Generated from the Postman export. Prose added outside the markers below is preserved when this file is regenerated.

<!-- BEGIN GENERATED -->
<!-- Everything between these markers is produced by .claude/tools/gen-api-docs.py. Edit the collection, not this. -->

## OTP

### Challenge (register)

`POST /api/auth/otp/challenge`

Send OTP for registration. On production, SMS is sent; in local dev check storage/logs/laravel.log.

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "phone": "{{phone}}",
  "purpose": "register"
}
```

**Response — `200`**

```json
{
  "message": "Verification code sent.",
  "expires_in": 300
}
```

### Register

`POST /api/auth/otp/register`

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "phone": "{{phone}}",
  "code": "{{otp}}",
  "user_type": "client"
}
```

**Response — `201`**

```json
{
  "token": "<REDACTED_TOKEN>",
  "token_type": "Bearer",
  "abilities": [
    "act-as:client"
  ],
  "mode": "client",
  "is_new_user": true,
  "needs_profile": true,
  "needs_phone": false,
  "user": {
    "id": 6,
    "name": null,
    "phone": "+201000000001",
    "email": null,
    "date_of_birth": null,
    "active_mode": "client",
    "locale": "ar",
    "is_active": true,
    "is_client": false,
    "is_merchant": false,
    "has_password": false,
    "phone_verified": true,
    "email_verified": false,
    "created_at": "2026-08-29T15:19:13.000000Z"
  }
}
```

### Challenge (login)

`POST /api/auth/otp/challenge`

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "phone": "{{phone}}",
  "purpose": "login"
}
```

**Response — `200`**

```json
{
  "message": "Verification code sent.",
  "expires_in": 300
}
```

### Login

`POST /api/auth/otp/login`

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "phone": "{{phone}}",
  "code": "{{otp}}"
}
```

**Response — `200`**

```json
{
  "token": "<REDACTED_TOKEN>",
  "token_type": "Bearer",
  "abilities": [
    "act-as:client"
  ],
  "mode": "client",
  "is_new_user": false,
  "needs_profile": true,
  "needs_phone": false,
  "user": {
    "id": 7,
    "name": "Mona Adel",
    "phone": "+201000000002",
    "email": null,
    "date_of_birth": null,
    "active_mode": "client",
    "locale": "ar",
    "is_active": true,
    "is_client": false,
    "is_merchant": false,
    "has_password": false,
    "phone_verified": true,
    "email_verified": false,
    "created_at": "2026-08-29T15:19:13.000000Z"
  }
}
```

**Response — `422`**

```json
{
  "message": "The verification code is invalid or has expired.",
  "errors": {
    "code": [
      "The verification code is invalid or has expired."
    ]
  }
}
```

### Challenge (link phone)

`POST /api/auth/otp/challenge`

Send OTP before linking a phone to an existing account.

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "phone": "+201000000099",
  "purpose": "link"
}
```

**Response — `200`**

```json
{
  "message": "Verification code sent.",
  "expires_in": 300
}
```

## Password

### Register

`POST /api/auth/password/register`

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "name": "Shop Owner",
  "phone": "{{phone}}",
  "email": "owner@example.com",
  "password": "secret123",
  "remember_me": true,
  "date_of_birth": "1990-05-20",
  "user_type": "merchant"
}
```

**Response — `201`**

```json
{
  "token": "<REDACTED_TOKEN>",
  "token_type": "Bearer",
  "abilities": [
    "act-as:client"
  ],
  "mode": "client",
  "is_new_user": true,
  "needs_profile": true,
  "needs_phone": false,
  "user": {
    "id": 8,
    "name": "Youssef Kamal",
    "phone": "+201000000011",
    "email": "youssef@example.com",
    "date_of_birth": null,
    "active_mode": "client",
    "locale": "ar",
    "is_active": true,
    "is_client": false,
    "is_merchant": false,
    "has_password": true,
    "phone_verified": false,
    "email_verified": false,
    "created_at": "2026-08-29T15:19:48.000000Z"
  }
}
```

**Response — `422`**

```json
{
  "message": "The phone has already been taken. (and 2 more errors)",
  "errors": {
    "phone": [
      "The phone has already been taken."
    ],
    "email": [
      "The email field must be a valid email address."
    ],
    "password": [
      "The password field must be at least 8 characters."
    ]
  }
}
```

### Login

`POST /api/auth/password/login`

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "email": "owner@example.com",
  "password": "secret123"
}
```

**Response — `200`**

```json
{
  "token": "<REDACTED_TOKEN>",
  "token_type": "Bearer",
  "abilities": [
    "act-as:client"
  ],
  "mode": "client",
  "is_new_user": false,
  "needs_profile": true,
  "needs_phone": false,
  "user": {
    "id": 8,
    "name": "Youssef Kamal",
    "phone": "+201000000011",
    "email": "youssef@example.com",
    "date_of_birth": null,
    "active_mode": "client",
    "locale": "ar",
    "is_active": true,
    "is_client": false,
    "is_merchant": false,
    "has_password": true,
    "phone_verified": false,
    "email_verified": false,
    "created_at": "2026-08-29T15:19:48.000000Z"
  }
}
```

**Response — `422`**

```json
{
  "message": "These credentials do not match our records.",
  "errors": {
    "credentials": [
      "These credentials do not match our records."
    ]
  }
}
```

### Forgot password

`POST /api/auth/password/forgot`

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "phone": "{{phone}}"
}
```

**Response — `200`**

```json
{
  "message": "If an account exists for this number, a reset code has been sent."
}
```

### Reset password

`POST /api/auth/password/reset`

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "phone": "{{phone}}",
  "code": "{{otp}}",
  "password": "newsecret1",
  "password_confirmation": "newsecret1"
}
```

**Response — `200`**

```json
{
  "token": "<REDACTED_TOKEN>",
  "token_type": "Bearer",
  "abilities": [
    "act-as:client"
  ],
  "mode": "client",
  "is_new_user": false,
  "needs_profile": true,
  "needs_phone": false,
  "user": {
    "id": 8,
    "name": "Youssef Kamal",
    "phone": "+201000000011",
    "email": "youssef@example.com",
    "date_of_birth": null,
    "active_mode": "client",
    "locale": "ar",
    "is_active": true,
    "is_client": false,
    "is_merchant": false,
    "has_password": true,
    "phone_verified": false,
    "email_verified": false,
    "created_at": "2026-08-29T15:19:48.000000Z"
  }
}
```

## Google

### Sign in / sign up

`POST /api/auth/google/login`

Sign-in and sign-up are the same call. A first-time token creates the account (is_new_user = true); a returning token is matched on the Google subject. Google never supplies a phone number, so the response sets needs_phone = true and the app must run the OTP link step next.

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "id_token": "{{googleIdToken}}",
  "user_type": "client"
}
```

**Response — `200`**

```json
{
  "token": "<REDACTED_TOKEN>",
  "token_type": "Bearer",
  "abilities": [
    "act-as:client"
  ],
  "mode": "client",
  "is_new_user": true,
  "needs_profile": true,
  "needs_phone": true,
  "user": {
    "id": 9,
    "name": "Nour",
    "phone": null,
    "email": "nour@example.com",
    "date_of_birth": null,
    "active_mode": "client",
    "locale": "ar",
    "is_active": true,
    "is_client": false,
    "is_merchant": false,
    "has_password": false,
    "phone_verified": false,
    "email_verified": true,
    "created_at": "2026-08-29T15:20:23.000000Z"
  }
}
```

**Response — `200`** Returning user

```json
{
  "token": "<REDACTED_TOKEN>",
  "token_type": "Bearer",
  "abilities": [
    "act-as:client"
  ],
  "mode": "client",
  "is_new_user": false,
  "needs_profile": true,
  "needs_phone": true,
  "user": {
    "id": 9,
    "name": "Nour",
    "phone": null,
    "email": "nour@example.com",
    "date_of_birth": null,
    "active_mode": "client",
    "locale": "ar",
    "is_active": true,
    "is_client": false,
    "is_merchant": false,
    "has_password": false,
    "phone_verified": false,
    "email_verified": true,
    "created_at": "2026-08-29T15:20:23.000000Z"
  }
}
```

### Register

`POST /api/auth/google/register`

Explicit registration endpoint. Same strategy as login but returns 201 for a newly created account.

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "id_token": "{{googleIdToken}}",
  "user_type": "client"
}
```

**Response — `201`**

```json
{
  "token": "<REDACTED_TOKEN>",
  "token_type": "Bearer",
  "abilities": [
    "act-as:client"
  ],
  "mode": "client",
  "is_new_user": true,
  "needs_profile": true,
  "needs_phone": true,
  "user": {
    "id": 10,
    "name": "Lina",
    "phone": null,
    "email": "lina@example.com",
    "date_of_birth": null,
    "active_mode": "client",
    "locale": "ar",
    "is_active": true,
    "is_client": false,
    "is_merchant": false,
    "has_password": false,
    "phone_verified": false,
    "email_verified": true,
    "created_at": "2026-08-29T15:20:23.000000Z"
  }
}
```

### Link Google

`POST /api/auth/link/google`

Attach a Google identity to the authenticated account so the user can sign in either way. Requires a bearer token.

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "id_token": "{{googleIdToken}}"
}
```

**Response — `200`**

```json
{
  "linked": "google"
}
```

## Account (authenticated)

### Me

`GET /api/auth/me`

Headers: `Accept: application/json`

**Response — `200`**

```json
{
  "id": 12,
  "name": "Salma Farid",
  "phone": "+201000000021",
  "email": "salma@example.com",
  "date_of_birth": null,
  "active_mode": "client",
  "locale": "ar",
  "is_active": true,
  "is_client": true,
  "is_merchant": true,
  "has_password": true,
  "phone_verified": true,
  "email_verified": false,
  "created_at": "2026-08-29T15:20:23.000000Z"
}
```

**Response — `401`**

```json
{
  "message": "Unauthenticated."
}
```

### Switch mode

`POST /api/auth/switch-mode`

mode: client | merchant. Requires matching profile.

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "mode": "merchant"
}
```

**Response — `200`**

```json
{
  "token": "<REDACTED_TOKEN>",
  "token_type": "Bearer",
  "abilities": [
    "act-as:merchant"
  ],
  "mode": "merchant",
  "is_new_user": false,
  "needs_profile": false,
  "needs_phone": false,
  "user": {
    "id": 12,
    "name": "Salma Farid",
    "phone": "+201000000021",
    "email": "salma@example.com",
    "date_of_birth": null,
    "active_mode": "merchant",
    "locale": "ar",
    "is_active": true,
    "is_client": true,
    "is_merchant": true,
    "has_password": true,
    "phone_verified": true,
    "email_verified": false,
    "created_at": "2026-08-29T15:20:23.000000Z"
  }
}
```

### Link password

`POST /api/auth/link/password`

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "password": "secret123",
  "password_confirmation": "secret123"
}
```

**Response — `200`**

```json
{
  "linked": "password"
}
```

### Link OTP (phone)

`POST /api/auth/link/otp`

Headers: `Accept: application/json`, `Content-Type: application/json`

**Request body**

```json
{
  "phone": "+201000000099",
  "code": "{{otp}}"
}
```

**Response — `200`**

```json
{
  "linked": "otp"
}
```

### Unlink provider

`DELETE /api/auth/link/google`

Headers: `Accept: application/json`

**Response — `200`**

```json
{
  "unlinked": "google"
}
```

### Logout

`POST /api/auth/logout`

Headers: `Accept: application/json`

**Response — `200`**

```json
{
  "message": "Logged out."
}
```

### Logout all

`POST /api/auth/logout-all`

Headers: `Accept: application/json`

**Response — `200`**

```json
{
  "message": "Logged out from all devices."
}
```

### User (sanctum check)

`GET /api/user`

Headers: `Accept: application/json`

**Response — `200`**

```json
{
  "id": 12,
  "name": "Salma Farid",
  "phone": "+201000000021",
  "email": "salma@example.com",
  "phone_verified_at": "2026-08-29T15:20:23.000000Z",
  "email_verified_at": null,
  "active_mode": "client",
  "locale": "ar",
  "is_active": true,
  "created_at": "2026-08-29T15:20:23.000000Z",
  "updated_at": "2026-08-29T15:20:23.000000Z",
  "date_of_birth": null
}
```

<!-- END GENERATED -->
