# Backend implementation

## Verified technology

Trusttix uses the Supabase JavaScript client from its React/Vite frontend. Supabase provides the hosted authentication service and PostgreSQL-backed REST data access used by the application. There is no separate custom API server, serverless function, Edge Function, or database migration file in this repository.

The client is configured in `frontend/src/supabaseClient.js` with the public `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables. Local values belong in `frontend/.env.local`; the committed [example](../frontend/.env.example) contains placeholders only.

## Authentication

The login screen calls `supabase.auth.signInWithPassword({ email, password })`. The dashboard calls `auth.getSession()` before it loads review data and redirects unauthenticated visitors to the login route. It calls `auth.getUser()` to obtain the current user's email for a review record, and `auth.signOut()` on logout.

The code confirms email/password sign-in and session use. It does not reveal the enabled providers, user roles, JWT settings, or actual authorization/RLS rules.

## Application data accessed by the client

The following is an interface-level inventory: it lists only table names and fields referenced in `Dashboard.jsx`, not a claimed database schema.

| Table | Purpose in Trusttix | Fields used by the frontend | Operations observed |
| --- | --- | --- | --- |
| `bookings` | Review queue and booking decision state | `booking_id`, `account_id`, `amount`, `status` | `select(*)`; update `status` filtered by `booking_id` |
| `risk_scores` | Rule-based risk context for a booking | `booking_id`, `score`, `reasons` | `select(*)` |
| `anomaly_scores` | Anomaly context for a booking | `booking_id`, `anomaly_score`, `is_outlier` | `select(*)` |
| `review_actions` | Review-decision history | inserted: `booking_id`, `reviewed_by`, `decision` | `insert(...)` |

The dashboard correlates `risk_scores` and `anomaly_scores` with a booking in browser memory by matching `booking_id`. This demonstrates an application-level association; foreign keys, cardinality, constraints, indexes, and nullability have not been verified and are not asserted here.

## Data flow and CRUD

1. A reviewer signs in with Supabase Auth.
2. After a session check, the dashboard concurrently reads `bookings`, `risk_scores`, and `anomaly_scores`.
3. The browser constructs lookup maps keyed by `booking_id` and displays the review queue.
4. When a reviewer chooses Approve, Hold, or Cancel, the browser updates the matching `bookings.status` to `clean`, `flagged`, or `cancelled`.
5. The browser then inserts a `review_actions` record using the reviewer email returned by `auth.getUser()` (or the literal fallback `admin` if no email is available) and refreshes the queue.

There are no deletes in the application code. Inserts and updates are separate client calls; no transaction, stored procedure, RPC call, or compensating rollback is visible in the repository.

## Security and backend metadata status

The repository previously had no `supabase/` configuration, SQL files, or migrations. The Supabase CLI was not installed and no local project link was present during this audit, so live database metadata could not be retrieved. Consequently, this repository makes no claim about actual RLS policies, database functions, triggers, views, storage buckets, Realtime channels, API routes, or database-level relationships.

Supabase permissions must allow only the authenticated operations intended by the application. The exact policy definitions should be exported from an authorized linked project and reviewed before they are committed. The frontend uses only a public anonymous/publishable client key; service-role keys and other credentials must remain outside the browser and outside Git.
