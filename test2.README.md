# PoultryLink v1 API testing

Import any cURL request into Postman with **Import > Raw text**, or copy its method, URL, headers, and JSON body into a Postman request.

Base URL: `http://localhost:5000/api/v1`

Start the server from the repository root:

```bash
npm run dev
```

Set `DATABASE_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` in `.env`. The default payment provider is `mock`; set `PAYMENT_PROVIDER=paystack` and `PAYSTACK_SECRET_KEY` for Paystack. With `OTP_PROVIDER=console`, OTP codes are printed in the backend terminal.

Use these placeholders throughout:

- `<access-token>`: `data.accessToken` returned by registration verification or login.
- `<refresh-token>`: `data.refreshToken` returned by registration verification or login.
- `<user-id>`, `<listing-id>`, `<farm-id>`, `<order-id>`, `<conversation-id>`, `<notification-id>`, `<category-id>`, and `<transporter-id>`: IDs returned by earlier requests or the database.

Authenticated requests use:

```text
Authorization: Bearer <access-token>
```

## Health

```bash
curl --request GET 'http://localhost:5000/api/check'
```

```bash
curl --request GET 'http://localhost:5000/api/v1/health'
```

## Authentication

### Register

```bash
curl --request POST 'http://localhost:5000/api/v1/auth/register' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "farmer@example.com",
    "phone": "+2348012345678",
    "password": "Password1",
    "role": "FARMER",
    "firstName": "Ada",
    "lastName": "Farmer",
    "businessName": "Ada Poultry Farm"
  }'
```

### Verify registration OTP

```bash
curl --request POST 'http://localhost:5000/api/v1/auth/verify-otp' \
  --header 'Content-Type: application/json' \
  --data '{
    "userId": "<user-id>",
    "code": "<six-digit-otp>",
    "purpose": "REGISTRATION"
  }'
```

### Resend registration OTP

```bash
curl --request POST 'http://localhost:5000/api/v1/auth/resend-otp' \
  --header 'Content-Type: application/json' \
  --data '{
    "userId": "<user-id>",
    "purpose": "REGISTRATION"
  }'
```

### Login

```bash
curl --request POST 'http://localhost:5000/api/v1/auth/login' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "farmer@example.com",
    "password": "Password1"
  }'
```

### Current user

```bash
curl --request GET 'http://localhost:5000/api/v1/auth/me' \
  --header 'Authorization: Bearer <access-token>'
```

### Refresh token

```bash
curl --request POST 'http://localhost:5000/api/v1/auth/refresh-token' \
  --header 'Content-Type: application/json' \
  --data '{"refreshToken":"<refresh-token>"}'
```

### Logout

```bash
curl --request POST 'http://localhost:5000/api/v1/auth/logout' \
  --header 'Content-Type: application/json' \
  --data '{"refreshToken":"<refresh-token>"}'
```

### Request password reset

```bash
curl --request POST 'http://localhost:5000/api/v1/auth/forgot-password' \
  --header 'Content-Type: application/json' \
  --data '{"email":"farmer@example.com"}'
```

### Reset password

```bash
curl --request POST 'http://localhost:5000/api/v1/auth/reset-password' \
  --header 'Content-Type: application/json' \
  --data '{
    "userId": "<user-id>",
    "code": "<six-digit-password-reset-otp>",
    "newPassword": "NewPassword1"
  }'
```

## Users

### Update my profile

```bash
curl --request PATCH 'http://localhost:5000/api/v1/users/me' \
  --header 'Authorization: Bearer <access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"firstName":"Ada","lastName":"Poultry","businessName":"Ada Poultry Farm","state":"Lagos","lga":"Ikeja"}'
```

### Get public profile

```bash
curl --request GET 'http://localhost:5000/api/v1/users/<user-id>'
```

### List users (ADMIN)

```bash
curl --request GET 'http://localhost:5000/api/v1/users?role=FARMER&page=1&limit=20' \
  --header 'Authorization: Bearer <admin-access-token>'
```

### Set verification status (ADMIN)

```bash
curl --request PATCH 'http://localhost:5000/api/v1/users/<user-id>/verification' \
  --header 'Authorization: Bearer <admin-access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"status":"VERIFIED"}'
```

### Activate or deactivate user (ADMIN)

```bash
curl --request PATCH 'http://localhost:5000/api/v1/users/<user-id>/active' \
  --header 'Authorization: Bearer <admin-access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"isActive":false}'
```

## Farms

### Create farm (FARMER)

```bash
curl --request POST 'http://localhost:5000/api/v1/farms' \
  --header 'Authorization: Bearer <farmer-access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Ada Poultry Farm","description":"Layer farm","address":"12 Farm Road","state":"Lagos","lga":"Ikeja","latitude":6.6018,"longitude":3.3515}'
```

### List my farms (FARMER)

```bash
curl --request GET 'http://localhost:5000/api/v1/farms/mine' \
  --header 'Authorization: Bearer <farmer-access-token>'
```

### Update farm (FARMER)

```bash
curl --request PATCH 'http://localhost:5000/api/v1/farms/<farm-id>' \
  --header 'Authorization: Bearer <farmer-access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Updated Farm Name","state":"Oyo"}'
```

## Listings and categories

### Search listings

```bash
curl --request GET 'http://localhost:5000/api/v1/listings/search?q=eggs&state=Lagos&sort=price_asc&page=1&limit=20'
```

### List categories

```bash
curl --request GET 'http://localhost:5000/api/v1/listings/categories'
```

### Create listing (FARMER)

```bash
curl --request POST 'http://localhost:5000/api/v1/listings' \
  --header 'Authorization: Bearer <farmer-access-token>' \
  --header 'Content-Type: application/json' \
  --data '{
    "farmId":"<farm-id>",
    "categoryId":"<category-id>",
    "productName":"Fresh Eggs",
    "description":"Farm fresh eggs",
    "quantity":100,
    "unit":"crate",
    "price":4500,
    "minOrderQuantity":1,
    "location":"Ikeja",
    "state":"Lagos",
    "lga":"Ikeja",
    "images":["https://example.com/eggs.jpg"]
  }'
```

### List my listings (FARMER)

```bash
curl --request GET 'http://localhost:5000/api/v1/listings/mine?page=1&limit=20' \
  --header 'Authorization: Bearer <farmer-access-token>'
```

### Get listing

```bash
curl --request GET 'http://localhost:5000/api/v1/listings/<listing-id>'
```

### Update listing (FARMER)

```bash
curl --request PATCH 'http://localhost:5000/api/v1/listings/<listing-id>' \
  --header 'Authorization: Bearer <farmer-access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"price":5000,"quantity":80,"status":"ACTIVE"}'
```

### Deactivate listing (FARMER or ADMIN)

```bash
curl --request DELETE 'http://localhost:5000/api/v1/listings/<listing-id>' \
  --header 'Authorization: Bearer <access-token>'
```

## Market prices

### List market prices

```bash
curl --request GET 'http://localhost:5000/api/v1/market-prices?state=Lagos&categoryId=<category-id>&page=1&limit=20'
```

### Record market price (ADMIN)

```bash
curl --request POST 'http://localhost:5000/api/v1/market-prices' \
  --header 'Authorization: Bearer <admin-access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"categoryId":"<category-id>","productName":"Eggs","state":"Lagos","avgPrice":4500,"unit":"crate"}'
```

## Orders

### Create order (BUYER)

```bash
curl --request POST 'http://localhost:5000/api/v1/orders' \
  --header 'Authorization: Bearer <buyer-access-token>' \
  --header 'Content-Type: application/json' \
  --data '{
    "items":[{"listingId":"<listing-id>","quantity":2}],
    "deliveryAddress":"25 Market Street, Ikeja",
    "deliveryState":"Lagos",
    "deliveryLga":"Ikeja",
    "notes":"Call before delivery"
  }'
```

### List my buying orders (BUYER)

```bash
curl --request GET 'http://localhost:5000/api/v1/orders/mine/buying?page=1&limit=20' \
  --header 'Authorization: Bearer <buyer-access-token>'
```

### List my selling orders (FARMER)

```bash
curl --request GET 'http://localhost:5000/api/v1/orders/mine/selling?page=1&limit=20' \
  --header 'Authorization: Bearer <farmer-access-token>'
```

### Get order (BUYER or seller)

```bash
curl --request GET 'http://localhost:5000/api/v1/orders/<order-id>' \
  --header 'Authorization: Bearer <access-token>'
```

### Accept order (FARMER)

```bash
curl --request POST 'http://localhost:5000/api/v1/orders/<order-id>/accept' \
  --header 'Authorization: Bearer <farmer-access-token>'
```

### Reject order (FARMER)

```bash
curl --request POST 'http://localhost:5000/api/v1/orders/<order-id>/reject' \
  --header 'Authorization: Bearer <farmer-access-token>'
```

### Cancel order (BUYER)

```bash
curl --request POST 'http://localhost:5000/api/v1/orders/<order-id>/cancel' \
  --header 'Authorization: Bearer <buyer-access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"reason":"No longer needed"}'
```

### Initialize payment (BUYER)

```bash
curl --request POST 'http://localhost:5000/api/v1/orders/<order-id>/pay' \
  --header 'Authorization: Bearer <buyer-access-token>'
```

### Dispatch order (FARMER)

```bash
curl --request POST 'http://localhost:5000/api/v1/orders/<order-id>/dispatch' \
  --header 'Authorization: Bearer <farmer-access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"transporterId":"<transporter-id>"}'
```

### Confirm delivery (BUYER)

```bash
curl --request POST 'http://localhost:5000/api/v1/orders/<order-id>/confirm-delivery' \
  --header 'Authorization: Bearer <buyer-access-token>'
```

### Dispute order (BUYER or seller)

```bash
curl --request POST 'http://localhost:5000/api/v1/orders/<order-id>/dispute' \
  --header 'Authorization: Bearer <access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"reason":"Items arrived damaged"}'
```

## Payments

### Verify payment

```bash
curl --request GET 'http://localhost:5000/api/v1/payments/verify/<payment-reference>' \
  --header 'Authorization: Bearer <access-token>'
```

### Simulate mock payment (development/test)

```bash
curl --request POST 'http://localhost:5000/api/v1/payments/mock/simulate' \
  --header 'Authorization: Bearer <access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"reference":"<payment-reference>","outcome":"success"}'
```

### Paystack webhook

```bash
curl --request POST 'http://localhost:5000/api/v1/payments/webhook/paystack' \
  --header 'Content-Type: application/json' \
  --header 'x-paystack-signature: <paystack-signature>' \
  --data '{"event":"charge.success","data":{"reference":"<payment-reference>"}}'
```

For a real Paystack request, use the signature sent by Paystack. The mock provider does not require a real signature.

## Deliveries

### List my deliveries (TRANSPORTER or ADMIN)

```bash
curl --request GET 'http://localhost:5000/api/v1/deliveries/mine' \
  --header 'Authorization: Bearer <transporter-or-admin-access-token>'
```

### Update delivery status (TRANSPORTER or ADMIN)

```bash
curl --request PATCH 'http://localhost:5000/api/v1/deliveries/<order-id>/status' \
  --header 'Authorization: Bearer <transporter-or-admin-access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"status":"DELIVERED"}'
```

Allowed statuses: `IN_TRANSIT`, `DELIVERED`, `FAILED`.

## Reviews

### Review a completed order

```bash
curl --request POST 'http://localhost:5000/api/v1/reviews/orders/<order-id>' \
  --header 'Authorization: Bearer <buyer-or-seller-access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"rating":5,"comment":"Excellent transaction"}'
```

## Messages

### Start conversation and send first message

```bash
curl --request POST 'http://localhost:5000/api/v1/messages' \
  --header 'Authorization: Bearer <access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"recipientId":"<recipient-user-id>","listingId":"<listing-id>","content":"Is this listing still available?"}'
```

### List my conversations

```bash
curl --request GET 'http://localhost:5000/api/v1/messages' \
  --header 'Authorization: Bearer <access-token>'
```

### Get conversation messages

```bash
curl --request GET 'http://localhost:5000/api/v1/messages/<conversation-id>' \
  --header 'Authorization: Bearer <access-token>'
```

### Send message

```bash
curl --request POST 'http://localhost:5000/api/v1/messages/<conversation-id>' \
  --header 'Authorization: Bearer <access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"content":"Yes, it is available."}'
```

## Notifications

### List notifications

```bash
curl --request GET 'http://localhost:5000/api/v1/notifications?page=1&limit=20' \
  --header 'Authorization: Bearer <access-token>'
```

### Mark notification as read

```bash
curl --request PATCH 'http://localhost:5000/api/v1/notifications/<notification-id>/read' \
  --header 'Authorization: Bearer <access-token>'
```

### Mark all notifications as read

```bash
curl --request PATCH 'http://localhost:5000/api/v1/notifications/read-all' \
  --header 'Authorization: Bearer <access-token>'
```

## Admin

### Dashboard

```bash
curl --request GET 'http://localhost:5000/api/v1/admin/dashboard' \
  --header 'Authorization: Bearer <admin-access-token>'
```

### List disputes

```bash
curl --request GET 'http://localhost:5000/api/v1/admin/disputes' \
  --header 'Authorization: Bearer <admin-access-token>'
```

### Resolve dispute in seller's favor

```bash
curl --request POST 'http://localhost:5000/api/v1/admin/disputes/<order-id>/resolve' \
  --header 'Authorization: Bearer <admin-access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"resolution":"RELEASE_TO_SELLER"}'
```

### Resolve dispute in buyer's favor

```bash
curl --request POST 'http://localhost:5000/api/v1/admin/disputes/<order-id>/resolve' \
  --header 'Authorization: Bearer <admin-access-token>' \
  --header 'Content-Type: application/json' \
  --data '{"resolution":"REFUND_BUYER"}'
```

### Audit logs

```bash
curl --request GET 'http://localhost:5000/api/v1/admin/audit-logs' \
  --header 'Authorization: Bearer <admin-access-token>'
```

## Route ordering notes

Use registration/login first to obtain tokens, create a farmer farm and listing, then create an order from a buyer account. The normal order flow is seller acceptance, buyer payment, seller dispatch, transporter delivery status, buyer confirmation, then review. Validation errors return HTTP 400, authentication failures return HTTP 401, authorization failures return HTTP 403, and successful responses use `{ "success": true, "message": "...", "data": ... }`.
