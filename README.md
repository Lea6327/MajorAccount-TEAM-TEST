# Lea Wang — MajorAccount-TEAM-TEST

I built a minimal full-stack slice for the Purchase Team test: a **.NET 8** API that normalizes property data and (optionally) persists it, plus a **React + TypeScript** UI with an accessible edit modal. Client & server share the same validation (Volume 1–6 digits, Folio 1–5 digits). The repo includes unit/component tests and concise SQL queries.

## Run (local)

**API**

```bash
cd backend/PropertyApi
dotnet run
# Note the port (e.g., http://localhost:5124). Swagger at /swagger
```

**Frontend**

```bash
cd frontend
npm i
# package.json should contain: "proxy": "http://localhost:5124"   # match API port
npm start
```

## Endpoints

* `POST /api/property/normalize` — map-only (returns `InternalProperty`)
* `POST /api/property` — normalize + persist (returns `{ id, data }`)
* `PUT /api/property/{id}/volume-folio` — update with server-side validation
* `GET /api/property/{id}` — fetch by id

## Quick verify

```bash
# create
curl -sL -X POST http://localhost:5124/api/property -H "Content-Type: application/json" \
-d '{"provider":"VIC-DDP","requestId":"REQ-1","receivedAt":"2025-08-30T03:12:45Z","formattedAddress":"10 Example St, Carlton VIC 3053","lotPlan":{"lot":"12","plan":"PS123456"},"title":{"volume":"","folio":""}}'
# update
curl -sL -X PUT http://localhost:5124/api/property/1/volume-folio -H "Content-Type: application/json" \
-d '{"volume":"123456","folio":"12345"}'
# get
curl -sL http://localhost:5124/api/property/1
```

## Tests

```bash
# backend (from repo root)
dotnet test MajorAccountTeamTest.sln

# frontend
cd frontend && npm test -- --watchAll=false
```

## SQL

File: `sql/queries.sql`

* **Query A:** certificate counts per matter (last 30 days)
* **Query B:** matters without a **Title** certificate (last 30 days)
* **Index:** `Certificates(type, created_at, order_id)` to speed Query B join/filter

## Assumptions

* Prefer `formattedAddress`; else compose `street, suburb state postcode`
* Volume = 1–6 digits; Folio = 1–5 digits; empty → `null`
* Status: both present → `KnownVolFol`, otherwise `UnknownVolFol`
* In-memory store is sufficient for this exercise; no auth

## Approach & trade-offs

* Vertical slice (map → persist → edit) with mirrored validation
* In-memory persistence for speed; structure is swappable to DB later
* Modal focus-trap + ESC; numeric input masks
* Deferred non-essentials (auth, granular errors) to fit the timebox

## Time spent

~3 hours core build + brief polish — exact timestamps visible in Git commit history (GitHub “Commits” tab or git log).

## AI usage & verification

AI tools used

ChatGPT for drafts and ideas; final code and queries were reviewed, adjusted, and verified with automated tests and manual checks.
