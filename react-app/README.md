# SmartSplit

SmartSplit is a demo application for household utility bills, bill splitting, and simulated payments. It provides role-based member/admin views, in-session workflows, and a multilingual voice assistant. It is not a production payment or utility-provider service.

## Features

- Household member dashboard with total bill, share, pending amounts, and predictions
- Role-based access: Household Member, Household Admin, Platform Admin
- Utility bill listing and detail pages
- Mock bill sync service for electricity, water, and internet
- Equal, percentage, and custom percentage split calculator
- Simulated payment processing (no funds are moved)
- Session-only auto-pay settings (no payment execution)
- Dispute submission/status workflow and notification center
- Loyalty points and cashback history
- Reports and admin analytics
- Authenticated, user/household-scoped Socket.IO updates

## Tech stack

- Frontend: React, Vite, React Router, Axios, Recharts
- Backend: Node.js, Express.js, JWT, bcryptjs, Socket.IO
- Data layer: in-memory mock data; changes are lost when the backend restarts

## Architecture

- Frontend uses `src/services`, `src/context`, `src/pages`, `src/layouts`, and `src/components`
- Backend uses `backend/src/controllers`, `backend/src/routes`, `backend/src/middleware`, `backend/src/services`, and `backend/src/data`
- The app uses a demo-first architecture with mock external providers and simulated events

## Demo credentials

- Member: `member@smartsplit.com` / `password123`
- Household Admin: `admin@smartsplit.com` / `password123`
- Platform Admin: `platform@smartsplit.com` / `password123`

## Quick start

1. Install root dependencies
   - `npm install`
2. Install backend dependencies
   - `cd backend && npm install`
3. Start the backend
   - `cd backend && npm start`
4. Start the frontend
   - `npm run dev:frontend`
5. Open the local URL printed by Vite (usually `http://localhost:5173`)

## Run both together

- `npm run dev`

## Environment variables

Root frontend `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Backend `.env` file:

```env
PORT=5000
JWT_SECRET=replace-with-a-random-secret-of-at-least-32-characters
CLIENT_ORIGIN=http://localhost:5173
```

In development, a short or missing `JWT_SECRET` is replaced by a random, process-local secret; tokens become invalid after a backend restart. The backend intentionally refuses to start when `NODE_ENV=production` because it uses seeded users and in-memory demo data. Do not deploy it as a production service.

## Project structure

```text
src/
  components/
  context/
  layouts/
  pages/
  services/
App.jsx
App.css
main.jsx

backend/
  src/
    controllers/
    data/
    middleware/
    routes/
    utils/
    server.js
```

## Primary routes

- `/login`
- `/register`
- `/dashboard`
- `/bills`
- `/payments`
- `/usage`
- `/predictions`
- `/disputes`
- `/notifications`
- `/loyalty`
- `/household`
- `/members`
- `/utilities`
- `/splits`
- `/reports`
- `/admin`

## Demo notes

This app is intentionally built in demo mode. Utility sync and payment processing are simulated; auto-pay settings, disputes, notifications, loyalty, and other mutations are held in memory and reset on restart. Forecasting uses a simple arithmetic estimate, not machine learning. Public registration creates only a household-member account; users create a household after signing in. Platform-administrator privileges are reserved for seeded demo accounts.

## Validation

- `npm run lint`
- `npm test` (backend controller/security checks using Node's built-in test runner)

## Future improvements

- Replace mock database with PostgreSQL and Prisma
- Add real payment integration and utility provider APIs
- Add advanced reporting and analytics
- Expand dispute workflows and role-specific permissions
- Add stronger validation and test coverage
