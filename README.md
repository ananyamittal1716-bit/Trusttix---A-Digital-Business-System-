# Trusttix — A Digital Business System

Trusttix is a web-based fraud-operations console for reviewing booking activity, evaluating risk signals, and recording decisions in a secure, centralized workspace.

**Live website:** [frontend-sooty-one-73.vercel.app](https://frontend-sooty-one-73.vercel.app/)
**GitHub repository:** [ananyamittal1716-bit/Trusttix---A-Digital-Business-System-](https://github.com/ananyamittal1716-bit/Trusttix---A-Digital-Business-System-)

## Project Overview

Digital booking and ticketing systems must process large volumes of transactions while identifying suspicious activity quickly. Trusttix provides an operations-focused interface where authorized reviewers can:

- Sign in through Supabase Authentication.
- Inspect booking, account, risk-score, and anomaly-score information.
- Filter bookings by review status.
- Approve, hold, or cancel a booking.
- Record review decisions for traceability.

The project was developed as a practical digital business system demonstrating how a modern frontend, managed authentication, and cloud data services can work together.

## Problem Statement

Manual fraud review is slow, inconsistent, and difficult to audit when booking information is distributed across multiple tools. Review teams need a single view of transaction signals and a reliable way to record decisions without exposing operational data unnecessarily.

## Proposed Solution

Trusttix combines a React dashboard with Supabase services. The application authenticates users, retrieves booking intelligence from structured tables, presents the most relevant signals in a review queue, and writes reviewer actions back to the database. Clear status filters, score indicators, and action controls help teams prioritize work and respond consistently.

## Key Features

- Supabase email/password authentication.
- Protected dashboard route with session validation.
- Booking review queue with:
  - Booking and account identifiers.
  - Transaction amount.
  - Current review status.
  - Rule-based risk score.
  - Anomaly score and outlier indicator.
  - Risk reasons.
- Status filters for all, pending, clean, flagged, and cancelled bookings.
- Approve, hold, and cancel review actions.
- Review-action audit records with the reviewing user.
- Loading, empty, and error states.
- Responsive desktop and mobile layouts.
- Accessible form labels, alerts, focus states, and semantic regions.
- Production deployment on Vercel with SPA route rewrites.

## Technology Stack

### Frontend

- React 19
- JavaScript and JSX
- Vite
- React Router
- CSS with responsive media queries

### Backend Technology

- Supabase Authentication
- Supabase PostgreSQL-backed data API
- Vercel hosting and production deployment

No separate custom API server, serverless function, or Edge Function is present in this repository.

## Database

The code reads `bookings`, `risk_scores`, and `anomaly_scores`; updates `bookings.status`; and inserts review records into `review_actions`. The browser combines booking and score records by `booking_id` for display.

The exact database schema, keys, RLS policies, functions, and triggers have not been exported from the hosted project and are not claimed here. See [backend implementation](docs/backend-implementation.md) for the verified code-level interface.

## Authentication

Trusttix uses Supabase email/password authentication. The dashboard checks for an active session before loading data, uses the current user's email when recording a review, and signs out through Supabase Auth.

### Development tools

- npm
- Oxlint
- Git and GitHub

## System Architecture and Working Overview

```text
User
  │
  ▼
React + Vite frontend
  │
  ├── React Router
  │     ├── /          Login
  │     └── /dashboard Protected review console
  │
  └── Supabase JavaScript client
        ├── Supabase Auth
        ├── bookings
        ├── risk_scores
        ├── anomaly_scores
        └── review_actions
```

1. The user opens the login page and submits their credentials.
2. Supabase Authentication validates the session.
3. The protected dashboard checks the active session before loading data.
4. The frontend requests bookings and associated risk/anomaly records from Supabase.
5. Reviewers filter the queue and choose an action.
6. Trusttix updates the booking status and inserts a review-action record.
7. The queue refreshes so the latest decision is visible.

## Supabase Integration

Trusttix uses the Supabase JavaScript client to communicate with the project backend.

The frontend uses Supabase for:

- `auth.signInWithPassword()` for authentication.
- `auth.getSession()` for protected-route checks.
- `auth.getUser()` for identifying the reviewer.
- `auth.signOut()` for logout.
- `bookings` for booking records and status updates.
- `risk_scores` for rule-based risk information.
- `anomaly_scores` for anomaly and outlier information.
- `review_actions` for decision history.

Use Row Level Security policies and least-privilege database access in the Supabase project. Never place a Supabase service-role key in frontend code.

For the complete, evidence-based backend inventory and known limitations, see [docs/backend-implementation.md](docs/backend-implementation.md). The [supabase directory](supabase/README.md) documents the safe path for adding reviewed database metadata when the project can be linked with the Supabase CLI.

## Project Structure

```text
.
├── README.md
├── docs/
│   ├── backend-implementation.md
│   └── system-architecture.md
├── supabase/
│   └── README.md
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── App.jsx
    │   ├── Dashboard.jsx
    │   ├── Login.jsx
    │   ├── index.css
    │   ├── main.jsx
    │   └── supabaseClient.js
    ├── index.html
    ├── .env.example
    ├── package.json
    ├── package-lock.json
    ├── vercel.json
    └── vite.config.js
```

## Installation and Local Setup

### Prerequisites

- Node.js 18 or later
- npm
- A Supabase project with the required authentication and tables

### Install dependencies

From the repository root:

```bash
cd frontend
npm install
```

For a reproducible clean install in CI:

```bash
npm ci
```

### Environment variables

Do not commit `.env` files, passwords, private keys, or service-role credentials.

For a production-ready configuration, define the following variables in a local `.env.local` file or in the Vercel project settings:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Only the public Supabase URL and publishable/anonymous client key belong in a browser application. The service-role key must remain server-side and must never be exposed to users.

`frontend/src/supabaseClient.js` reads these variables at build time. Copy `frontend/.env.example` to `frontend/.env.local` for local development, and configure the same public values in Vercel for production. Keep `.env.local` out of Git.

## Running the Frontend

Start the Vite development server from `frontend/`:

```bash
npm run dev
```

Open the URL printed by Vite, usually:

```text
http://localhost:5173/
```

Run the production build locally:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## Production Deployment

Trusttix is deployed on Vercel from the `frontend/` directory.

| Setting | Value |
| --- | --- |
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Hosting | Vercel |

The project includes `frontend/vercel.json` so client-side routes such as `/dashboard` continue to work when opened or refreshed directly.

## Future Scope

- Add role-based access control for reviewers, supervisors, and administrators.
- Add server-side policies and stronger audit reporting.
- Add pagination, search, sorting, and date-range filters to the review queue.
- Add configurable risk thresholds and explainable score breakdowns.
- Add real-time updates using Supabase Realtime.
- Add dashboard analytics for review volume, decision trends, and false positives.
- Add automated tests for authentication, route protection, and review actions.
- Add CI checks and preview deployments for pull requests.
- Add monitoring, structured error reporting, and operational alerting.

### Contributors

| Contributor | Responsibilities |
|---|---|
| **Divyansh — Full-Stack Developer** | Frontend/application development; backend integration; Supabase integration; UI/UX; testing; deployment |
| **Ananya — Full-Stack Developer** | Backend/data development; database architecture; authentication; system architecture; testing; documentation |


