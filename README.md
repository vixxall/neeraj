<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b3a6913f-d813-4176-ae6b-dc4de748acba

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend API

The project includes a durable Express backend. It stores data in `data/finance-db.json` (ignored by git), hashes passwords with Node `scrypt`, and uses bearer-token sessions.

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
