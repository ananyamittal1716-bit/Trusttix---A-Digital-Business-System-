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

### Backend and services

- Supabase Authentication
- Supabase Postgres tables and API
- Vercel hosting and production deployment

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

## Project Structure

```text
.
├── README.md
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

The current repository preserves its existing Supabase client configuration in `frontend/src/supabaseClient.js`. If the project configuration is changed to environment-based values, use the variable names above and keep `.env.local` out of Git.

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
| **Divyansh** | Frontend development, backend development, Supabase integration, authentication, dashboard development, UI/UX implementation, testing and deployment |
| **Ananya** | Project architecture, database design, business logic, project planning, testing, documentation and project coordination |

## Academic Project Note

Trusttix is intended for educational and portfolio evaluation purposes. Any production use should include a full security review, validated database policies, privacy controls, monitoring, backup procedures, and organizational access governance.
