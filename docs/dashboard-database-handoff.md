# Dashboard Database Handoff

## Goal

This project currently uses local JSON storage for dashboard analytics and contact attempts.

The next implementation step is to replace the local file-based persistence with a database-backed solution while preserving the current dashboard behavior:

- track site visits
- track approximate unique visitors
- store contact attempts and delivery status
- keep the dashboard UI and auth flow working

## Current Architecture

### Dashboard data source

Current storage lives in:

- `data/dashboard.json`
- `lib/dashboardStore.ts`

`lib/dashboardStore.ts` currently:

- defines the data contracts for `VisitEntry`, `ContactAttempt`, `VisitorSummary`, and `DashboardSnapshot`
- reads and writes `data/dashboard.json`
- appends visits through `recordVisit()`
- appends contact attempts through `recordContactAttempt()`
- computes dashboard metrics and visitor aggregation in `getDashboardSnapshot()`

Important detail:

- unique visitors are not stored as a separate entity today
- they are derived from `visits` by grouping on `visitorId`

### Visit tracking flow

Visit tracking is triggered from the client in `pages/_app.tsx`.

Flow:

1. The app creates or reuses a browser-side visitor identifier stored in local storage.
2. The app prevents duplicate tracking per route per session using session storage.
3. The app POSTs to `pages/api/track-visit.ts`.
4. `pages/api/track-visit.ts` calls `recordVisit()` from `lib/dashboardStore.ts`.
5. The visit is appended to `data/dashboard.json`.

Tracked fields today:

- `id`
- `visitorId`
- `path`
- `visitedAt`
- `ip`
- `userAgent`

### Contact tracking flow

The contact form UI lives in `components/Contact/index.tsx`.

Flow:

1. The client validates name, email, and message length.
2. The client POSTs to `pages/api/sendMail.js`.
3. The API validates the payload again server-side.
4. The API sends email through Zoho SMTP using `nodemailer`.
5. The API records a contact attempt through `recordContactAttempt()`.
6. The dashboard reads those attempts through `getDashboardSnapshot()`.

Tracked fields today:

- `id`
- `name`
- `email`
- `message`
- `submittedAt`
- `status` (`sent` or `failed`)
- `ip`
- `userAgent`
- `errorMessage`

Important detail:

- internal delivery errors are intentionally sanitized before being exposed in the dashboard
- the dashboard only renders a generic failure message

### Dashboard page

The dashboard UI lives in:

- `pages/dashboard.tsx`
- `styles/Dashboard.module.scss`

The page currently:

- uses `getServerSideProps`
- blocks access unless dashboard auth is valid
- loads its data with `getDashboardSnapshot()`
- displays aggregated metrics, visitor summaries, and contact attempts

### Dashboard auth

Dashboard auth lives in:

- `lib/dashboardAuth.ts`
- `pages/api/dashboard/login.ts`
- `pages/api/dashboard/logout.ts`

Auth is currently:

- password-based
- cookie-backed
- protected server-side in `pages/dashboard.tsx`

Environment variables currently involved:

- `DASHBOARD_PASSWORD`
- `DASHBOARD_SESSION_SECRET`
- `USER_EMAIL`
- `USER_PASS`

## Files Another Agent Should Read First

- `lib/dashboardStore.ts`
- `pages/_app.tsx`
- `pages/api/track-visit.ts`
- `pages/api/sendMail.js`
- `pages/dashboard.tsx`
- `lib/dashboardAuth.ts`
- `data/dashboard.json`

## Database Migration Target

The database implementation should replace file persistence only, not the current product behavior.

That means:

- keep the dashboard route and UI intact
- keep the existing auth flow intact
- keep the current API contract used by the frontend
- keep sanitized dashboard error rendering intact

## Suggested Database Model

This is the closest representation of the current local data model.

### Table: `visits`

Suggested columns:

- `id`
- `visitor_id`
- `path`
- `visited_at`
- `ip`
- `user_agent`

Suggested indexes:

- index on `visitor_id`
- index on `visited_at`
- index on `path`

### Table: `contact_attempts`

Suggested columns:

- `id`
- `name`
- `email`
- `message`
- `submitted_at`
- `status`
- `ip`
- `user_agent`
- `error_message`

Suggested indexes:

- index on `submitted_at`
- index on `status`
- index on `email`

## Recommended Migration Strategy

### Option 1: Keep aggregation in application code

This is the safest and lowest-risk path.

- replace JSON reads with database queries
- keep `getDashboardSnapshot()` as the main aggregation function
- compute unique visitors and dashboard metrics in TypeScript as it already does now

Why this is recommended:

- minimal UI changes
- lower regression risk
- easier parity with current behavior

### Option 2: Push aggregation into SQL later

This can be done after parity is achieved.

- move counts and grouped visitor summaries into SQL queries or ORM aggregations
- keep the `DashboardSnapshot` shape stable so the page does not need to change

## Recommended Refactor Boundary

The cleanest handoff is to preserve the public function names in `lib/dashboardStore.ts` and only change their internals.

Keep these functions if possible:

- `recordVisit()`
- `recordContactAttempt()`
- `getDashboardSnapshot()`

That allows these files to remain mostly unchanged:

- `pages/api/track-visit.ts`
- `pages/api/sendMail.js`
- `pages/dashboard.tsx`

## Data Compatibility Notes

Current visitor uniqueness is browser-based and approximate.

The `visitorId` is generated client-side and stored in local storage. It is not a true authenticated user identity. The database layer should keep this concept as-is unless product requirements change.

Current contact attempts store the full message body. If the future database has privacy or retention requirements, review this before production rollout.

## Environment and Operational Notes

Current email sending depends on Zoho SMTP:

- host: `smtp.zoho.eu`
- port: `465`
- secure: `true`

Current dashboard auth depends on:

- `DASHBOARD_PASSWORD`
- `DASHBOARD_SESSION_SECRET`

The future database implementation will likely also need its own environment variables, for example:

- `DATABASE_URL`

## Suggested Implementation Checklist

1. Add a database client or ORM.
2. Create `visits` and `contact_attempts` tables that mirror the current local data.
3. Refactor `lib/dashboardStore.ts` to use the database instead of `data/dashboard.json`.
4. Keep return types and function names stable so the API routes and dashboard page continue to work.
5. Confirm that visit tracking still records `visitorId`, `path`, `ip`, and `userAgent`.
6. Confirm that contact attempts still record `sent` and `failed` statuses.
7. Confirm that the dashboard metrics still match the current behavior.
8. Confirm that error details remain sanitized in the dashboard UI.
9. Optionally write a one-time migration script from `data/dashboard.json` into the database.

## Known Non-Goals For The Migration

These are not required to complete the database migration:

- changing the dashboard design
- changing the dashboard auth mechanism
- changing the frontend form UX
- changing SMTP provider
- adding user accounts
- redefining what counts as a unique visitor

## Suggested First Step For The Next Agent

Implement a database-backed version of `lib/dashboardStore.ts` with the same exported API, then verify that:

- `pages/api/track-visit.ts` still works
- `pages/api/sendMail.js` still records attempts
- `pages/dashboard.tsx` renders the same shape of data without UI changes
