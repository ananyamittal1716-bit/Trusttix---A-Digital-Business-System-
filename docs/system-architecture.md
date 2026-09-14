# System architecture

```text
User
  |
  v
React / Vite frontend
  |- Login route (/)
  |- Dashboard route (/dashboard)
  `- Supabase JavaScript client
       |
       +--> Supabase Authentication
       `--> Supabase PostgreSQL-backed data API
              |- bookings
              |- risk_scores
              |- anomaly_scores
              `- review_actions
```

The React application is hosted as a Vite frontend and uses React Router for the login and dashboard routes. The browser-side Supabase client communicates directly with Supabase Auth and the PostgreSQL-backed data API; no custom backend server is present in the repository.

The dashboard verifies a session, reads booking and score data, then writes a booking status and a review-action record when a reviewer acts. The client combines score records with bookings by `booking_id` for display. Authentication, data-access enforcement, and database storage are supplied by the hosted Supabase project; the repository does not contain verified RLS definitions or database schema files.
