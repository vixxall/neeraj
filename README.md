# Personal Finance Tracker

Track transactions, budgets, savings goals, reports, and account preferences.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Start the frontend and API together:
   `npm run dev:full`
3. Open `http://localhost:3000`. The Vite development server proxies API requests to port 4000.

## Backend API

The project includes a durable Express backend. It stores data in `data/finance-db.json` (ignored by git), hashes passwords with Node `scrypt`, and uses bearer-token sessions.
Set `DATABASE_PATH` to use a different database file.
Google/passkey sign-in and password reset require external identity and email-provider integrations and are not enabled in this app.

```bash
npm run server
```

The API runs on `http://localhost:4000`. Authenticated requests use `Authorization: Bearer <token>`. Routes cover authentication, profile, transactions, budgets, savings goals, dashboard data, reports, export, demo loading, and data reset. Run both app and API with `npm run dev:full`.

For a single production service, build the frontend and start the server:

```bash
npm run build
npm start
```

Set `NODE_ENV=production`, `CLIENT_ORIGIN` to your allowed frontend origin, and optionally `PORT`. When the frontend and API use different origins, set `VITE_API_URL` before building the frontend.

## Deploy to Render

1. Push this repository to GitHub and create a Blueprint in Render from the repository.
2. Render will use [`render.yaml`](./render.yaml) to build the Vite frontend and start the Express server as one web service.
3. Open the Render service URL after its `/api/health` check passes.

The included Blueprint uses Render's free plan. Its filesystem is ephemeral: the JSON database and user accounts can be lost when the service restarts, redeploys, or spins down. Use this only for demos or testing, not real financial records. For durable production data, switch to a persistent disk or a managed database before launch.

The frontend and API share one origin, so cross-origin API access is disabled by default. If you later host the frontend on a separate domain, set `CLIENT_ORIGIN` to its exact origin(s), comma-separated; set `VITE_API_URL` to the API origin before building the frontend.
