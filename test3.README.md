# PoultryLink frontend — architecture & end-to-end test script

This is the frontend counterpart to `test.README.md`/`test2.README.md`. Those two test the Express API directly with curl; this one tests the same workflow through the actual Next.js app in a browser, using the pages and proxy routes described below.

## 1. Architecture

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion + TanStack Query + Zustand, styled as pixel-art shadcn/ui primitives.

**Pattern: BFF proxy.** The browser never talks to Express directly and never sees a JWT. Every client component calls this app's own `/api/*` route handlers; those route handlers call Express server-side and translate its access/refresh token pair into httpOnly cookies on this app's own origin.

```
Browser
  │  fetch("/api/orders/123/accept")      (same-origin, cookies auto-attached)
  ▼
Next.js route handler  (src/app/api/orders/[id]/accept/route.ts)
  │  authedExpressFetch("/orders/123/accept")   (reads cookie, adds Bearer header)
  ▼
Express API  (EXPRESS_API_URL, never exposed to the browser)
```

Key files:

| File | Job |
|---|---|
| `src/lib/api/config.ts` | `EXPRESS_API_URL`, cookie names/max-ages |
| `src/lib/api/server.ts` | `expressFetch` (public), `authedExpressFetch` (attaches token, auto-refreshes once on a real 401), `setAuthCookies`/`clearAuthCookies` |
| `src/lib/api/client.ts` | `apiFetch`/`apiFetchPaginated` — the only thing client components call |
| `src/store/auth-store.ts` | Zustand: `user`, `status`, `hydrate()` (calls `/api/auth/me` once on app load) |
| `src/middleware.ts` | Redirects to `/login` for `/profile`, `/orders`, `/messages`, `/admin`, `/listings/new` if there's no session cookie |

Role enforcement is real only on the Express side — every route checks role server-side regardless of what the frontend shows. The frontend's role checks (navbar links, the admin layout gate) are UX only, there to stop someone from staring at a dead end, not security boundaries.

## 2. Page map

```
/                              landing page
/register, /login, /verify-otp     auth
/marketplace                   browse listings (public)
/listings/[id]                 listing detail + place-order form (BUYER)
/orders                        buyer's order list
/orders/[id]                   shared order detail — every action lives here:
                                  accept/reject (FARMER/SUPPLIER, PENDING_ACCEPTANCE)
                                  pay (BUYER, ACCEPTED)
                                  dispatch + transporter ID (seller, PAID)
                                  cancel (BUYER, PENDING_ACCEPTANCE/ACCEPTED/AWAITING_PAYMENT)
                                  confirm-delivery (BUYER, OUT_FOR_DELIVERY/DELIVERED)
                                  dispute (either party, PAID/OUT_FOR_DELIVERY/DELIVERED)
                                  review (either party, COMPLETED)
/selling/listings               seller's listings + inline "create a farm" + "create a listing"
/selling/orders                 orders placed on the seller's listings
/delivering/deliveries          transporter dashboard (IN_TRANSIT/DELIVERED/FAILED buttons)
/payments/callback              Paystack redirect target
/mock-checkout/[reference]      mock-provider redirect target (simulate success/failed)
/admin                          dashboard stat tiles (ADMIN only)
/admin/disputes                 disputed orders, release-to-seller / refund-buyer
/admin/verification             KYC queue, filter by role + verification status
```

Each buyer/seller/transporter/admin page above now also has a navbar link once you're logged in as that role, so nothing past this point needs a typed URL.

## 3. One-time setup

**Backend** (repo root):
```bash
cp .env.example .env
```
Set `CLIENT_URL=http://localhost:3000` (the `.env.example` default of `5173` is for a Vite app — this frontend runs on 3000). Leave `PAYMENT_PROVIDER=mock` and `OTP_PROVIDER=console` for local testing — OTP codes print straight to this terminal, and the mock payment provider needs no real Paystack keys.
```bash
npm install
npm run prisma:migrate
npm run seed        # categories + 4 test accounts + a test farm/listing
npm run dev          # Express on :5000
```

**Frontend** (`frontend/`):
```bash
echo "EXPRESS_API_URL=http://localhost:5000/api/v1" > .env.local
npm install
npm run dev          # Next.js on :3000
```

Open `http://localhost:3000`.

## 4. Test accounts (from `npm run seed`)

All four share the password `Test1234!` and can log in immediately — no OTP step needed, they're pre-verified by email.

| Role | Email | Verification status |
|---|---|---|
| BUYER | `buyer@test.poultrylink.dev` | PENDING |
| FARMER | `farmer@test.poultrylink.dev` | PENDING |
| TRANSPORTER | `transporter@test.poultrylink.dev` | PENDING |
| ADMIN | `admin@test.poultrylink.dev` | VERIFIED |

The farmer account already owns a farm ("Test Farm") with one listing ("Test Broiler Chickens", 100 birds, min order 5) — so step 1 below is already done for you.

The buyer, farmer and transporter all sit at `PENDING` on purpose: that's the real state every account is in the moment it verifies its email (see note in section 6), and it means `/admin/verification` has something to act on the first time you open it, rather than looking empty.

Run this with at least four browser profiles (or one browser + three incognito windows) so you can be logged in as four different roles at once — buyer, farmer, transporter, admin all need to act in the same order's lifecycle.

## 5. End-to-end test script

**As BUYER** (`buyer@test.poultrylink.dev`):
1. `/marketplace` → find "Test Broiler Chickens", open `/listings/[id]`, place an order within the min/max quantity.
2. `/orders` → confirm the new order shows `PENDING_ACCEPTANCE`.

**As FARMER** (`farmer@test.poultrylink.dev`):
3. `/selling/orders` → open the order, **Accept** it. Status moves to `ACCEPTED`.

**As BUYER:**
4. Open the same order from `/orders`, click **Pay**. You're redirected to `/mock-checkout/[reference]` — click "simulate success." Status moves to `PAID`.

**As FARMER:**
5. Reopen the order (now `PAID`) — a transporter-ID field appears. Paste the transporter test account's user ID (grab it from the `users` table, or wherever `/profile` ends up exposing it) and click **Mark as dispatched**. Status moves to `OUT_FOR_DELIVERY`.

**As TRANSPORTER** (`transporter@test.poultrylink.dev`):
6. `/delivering/deliveries` → the order appears. Click through **In transit** → **Delivered**.

**As BUYER:**
7. Reopen the order — **Confirm delivery** is now available. Click it. This is the step that triggers escrow release server-side; status moves to `COMPLETED`.
8. Leave a review on the same page.

**Dispute branch** (run this on a second order instead of continuing the one above, so you still have a clean completed order to show):
9. Repeat steps 1–6 on a fresh order. Once it's `OUT_FOR_DELIVERY` or later, either party opens it and clicks **Dispute**, giving a reason.

**As ADMIN** (`admin@test.poultrylink.dev`):
10. `/admin` → dashboard tiles should show the disputed-order count ticking up.
11. `/admin/disputes` → the order appears with its dispute reason. Click **Release to seller** on one test dispute and **Refund buyer** on another, so you've exercised both outcomes. Status becomes `COMPLETED` or `CANCELLED` respectively.
12. `/admin/verification` → the buyer/farmer/transporter test accounts show up under the `PENDING` filter by default. Click **Verify** on one and **Reject** on another to confirm both actions and the badge update.

That closes every status transition `OrderStatus` defines except `REJECTED` and `CANCELLING` — run a third throwaway order to hit **Reject** (farmer, while `PENDING_ACCEPTANCE`) and **Cancel** (buyer, before payment) if you want full enum coverage.

## 6. Known gaps (not a bug — just not built yet)

- No profile page UI (`GET/PATCH /users/me` has no screen) — profile data can only be seen/changed via the API directly right now.
- No forgot/reset-password flow — `/login`'s "forgot password" link 404s.
- Messaging and notifications have no UI, even though the backend models exist.
- `/market-prices` on the landing page is static sample data, not read from `MarketPrice` records.
- `PATCH /users/:id/active` (ban/reactivate) has a working proxy route (`/api/admin/users/[id]/active`) but no button anywhere yet.

## 7. If something that worked before suddenly doesn't

A few real failure modes already hit during this build, in case they recur:

- **A page 404s even though the file "exists."** Check it's actually under `src/app/...`, not `src/components/...` — only `src/app` is routed. This happened once with `orders/[id]/page.tsx`.
- **"Module not found" for an `@images/*` import locally but not on the machine that built it.** Switch to a relative import (`../../../images/...`) — the alias has been flaky across machines before.
- **An order action throws a role error that doesn't match the action you clicked.** Open the specific route file under `src/app/api/orders/[id]/<action>/route.ts` and check the Express path it actually calls — one of these was once copy-pasted with the wrong endpoint inside.
- **Deploy works locally but fails on Vercel/Render over a missing package.** Compare `git log` between the branch you're deploying and the branch you tested locally — a dependency commit sitting on one and not the other has caused this before.
- **A verification-status filter shows nothing.** New accounts land on `PENDING` the moment they verify their email, not `UNVERIFIED` — that state only exists for the few seconds before OTP verification, and an unverified account can't log in at all. Default any "needs review" filter to `PENDING`.


pricing range
minimum order check should be reinforced 
farmers should be able to accept and assign riders on the platform 
farmers can choose between delivery persons 
background worker to make changes visible on frontend for every update