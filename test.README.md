# Authentication API testing

Base URL: `http://localhost:5000/api/auth`

Start the API from the repository root with `npm run dev` or `npm start`. Set `DATABASE_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` in `.env`. With the default `OTP_PROVIDER=console`, registration and password-reset OTP codes are printed in the backend terminal.

Use each cURL command in Postman via **Import > Raw text**, or copy the method, URL, headers, and JSON body into a request manually.

## Register

```bash
curl --request POST 'http://localhost:5000/api/auth/register' \
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

The response contains `data.user.id` and `data.otpExpiresAt`. Read the six-digit OTP from the backend console.

## Verify registration OTP

```bash
curl --request POST 'http://localhost:5000/api/auth/verify-otp' \
  --header 'Content-Type: application/json' \
  --data '{
    "userId": "<user-id-from-register>",
    "code": "<six-digit-registration-otp>",
    "purpose": "REGISTRATION"
  }'
```

Save `data.accessToken` and `data.refreshToken` from the response.

## Resend OTP

```bash
curl --request POST 'http://localhost:5000/api/auth/resend-otp' \
  --header 'Content-Type: application/json' \
  --data '{
    "userId": "<user-id>",
    "purpose": "REGISTRATION"
  }'
```

## Login

```bash
curl --request POST 'http://localhost:5000/api/auth/login' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "farmer@example.com",
    "password": "Password1"
  }'
```

## Get current user

```bash
curl --request GET 'http://localhost:5000/api/auth/me' \
  --header 'Authorization: Bearer <access-token>'
```

## Refresh access token

```bash
curl --request POST 'http://localhost:5000/api/auth/refresh-token' \
  --header 'Content-Type: application/json' \
  --data '{
    "refreshToken": "<refresh-token>"
  }'
```

The old refresh token is revoked when a new pair is issued.

## Logout

```bash
curl --request POST 'http://localhost:5000/api/auth/logout' \
  --header 'Content-Type: application/json' \
  --data '{
    "refreshToken": "<refresh-token>"
  }'
```

## Request password reset

```bash
curl --request POST 'http://localhost:5000/api/auth/forgot-password' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "farmer@example.com"
  }'
```

Read the password-reset OTP from the backend console. For an unknown email, the endpoint returns the same success message without sending an OTP.

## Reset password

```bash
curl --request POST 'http://localhost:5000/api/auth/reset-password' \
  --header 'Content-Type: application/json' \
  --data '{
    "userId": "<user-id>",
    "code": "<six-digit-password-reset-otp>",
    "newPassword": "NewPassword1"
  }'
```

All existing refresh tokens are revoked after a successful password reset.

## Health check

```bash
curl --request GET 'http://localhost:5000/api/check'
```

Every protected or validated route returns JSON with `success`, `message`, and optionally `data` or `details`. Validation failures are HTTP 400; invalid credentials or tokens are HTTP 401; inactive accounts are HTTP 403.