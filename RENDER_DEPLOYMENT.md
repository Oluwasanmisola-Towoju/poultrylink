# PoultryLink — Render deployment

This repository deploys as one Render Web Service. Vite builds the React frontend into `poultrylink-frontend/dist`; Express serves that build and the API under `/api/v1`.

## Blueprint deployment
1. Push this repository to GitHub/GitLab.
2. In Render choose **New > Blueprint** and select the repository. `render.yaml` creates the web service and PostgreSQL database.
3. Supply the required secret environment values when prompted: `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_WEBHOOK_SECRET` and `CLIENT_URL`.
4. Set `CLIENT_URL` to the final Render HTTPS URL (for example `https://poultrylink.onrender.com`). Redeploy after the first URL is assigned if necessary.
5. Configure Paystack's webhook URL as `https://<your-render-host>/api/v1/payments/webhook/paystack`.

Render runs migrations and the idempotent category seed on each service start.

## Local development
Copy `.env.example` to `backend/.env` (the backend env loader reads `backend/.env`) and set `DATABASE_URL` plus JWT secrets. Run backend with `npm run dev`. In another terminal run `npm --prefix poultrylink-frontend run dev`. For split local development set `VITE_API_URL=http://localhost:5000/api/v1` in `poultrylink-frontend/.env.local`.

## Production architecture
- `/api/v1/*`: Express REST API
- `/api/check`: Render health check
- all other paths: React SPA served by Express
- PostgreSQL: Prisma 7 + Render Postgres
