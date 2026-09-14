# Supabase backend source of truth

Trusttix uses a hosted Supabase project for authentication and PostgreSQL-backed application data. This repository contains safe integration documentation, but it does not currently contain a Supabase CLI project, migrations, or a database schema export.

## What is verified in application code

The React client reads from `bookings`, `risk_scores`, and `anomaly_scores`; it updates `bookings.status`; and it inserts review history in `review_actions`. The fields used by the UI are recorded in [the backend implementation document](../docs/backend-implementation.md).

## What is intentionally not included

No SQL schema, migrations, RLS policies, functions, triggers, credentials, service-role keys, access tokens, or production data are included. The Supabase CLI was not available in the development environment when this documentation was prepared, and the project was not linked locally, so exporting the live database metadata could not be safely verified.

## Reproducing the client configuration

Copy [`frontend/.env.example`](../frontend/.env.example) to `frontend/.env.local` and provide the public Supabase URL and anonymous/publishable browser key through your own secure configuration. `.env.local` is ignored by Git. A service-role key must never be placed in a Vite variable or browser bundle.

When an authorized maintainer has a linked Supabase CLI project, they can export only reviewed schema and migration metadata into this directory. Review every generated file before committing it and exclude credentials and data exports.
