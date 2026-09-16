# WriteMate

A location-based marketplace connecting **customers** who need legitimate handwriting/documentation
work (copying notes, filling forms, diagrams, fair-copy work, project documentation where permitted)
with **writers** who provide that service, plus an **admin** panel to run the platform.

> This is **Phase 6 of 10** — see [Build Plan](#build-plan) below. Phases 1–5 set up the project,
> models, authentication, dashboards, request creation, writer matching, and quotations. Phase 6
> (this one) adds manual UPI payment tracking: the customer scans the writer's QR and submits a
> transaction ID, the writer (or an admin) verifies it, and the request moves to `PAID`. The schema
> is deliberately shaped so a real payment gateway can replace the manual step later without a
> migration. Chat/notifications and reviews are added in the phases that follow.

## What's implemented so far

**Phase 1 — Foundation**
- Express app with security middleware (helmet, CORS, rate limiting, mongo-sanitize), a global
  error handler, MongoDB/Mongoose connection, Cloudinary config, Socket.IO server bootstrap, and a
  `/api/health` endpoint.
- All 9 Mongoose models: `User`, `WriterProfile`, `Request`, `Quotation`, `Payment`,
  `Notification`, `Message`, `Review`, `Complaint` — with references, indexes (including the
  state/district/city compound indexes needed for writer matching), and validation.
- Vite + React app wired to Redux Toolkit, React Router, and a custom MUI theme with light/dark mode.
- `.env.example` for both client and server; nothing is hard-coded.

**Phase 2 — Authentication**
- `POST /api/auth/register` (customer), `POST /api/auth/login`, `GET /api/auth/me`,
  `POST /api/auth/logout` — JWT access + refresh tokens, bcrypt password hashing (12 salt rounds).
- `POST /api/writers/register` — creates a `User` (role `WRITER`) + a `WriterProfile` with
  `status: PENDING` in one Mongo transaction, including UPI QR code upload straight to Cloudinary
  via multer.
- `authenticateUser` and `authorizeRoles(...)` middleware — every protected route re-verifies the
  JWT and re-fetches the user from the DB; the frontend's claimed role is never trusted.
- Frontend: Login, Customer Registration, and Writer Registration pages (React Hook Form + Yup),
  a Redux `authSlice` that persists the access token and rehydrates the session on reload,
  role-based route guards (`ProtectedRoute`, `RoleRoute`).

**Phase 3 — Dashboards**
- `GET /api/users/dashboard-stats` — role-aware stat cards for customers and writers, computed with
  real Mongo aggregations.
- `GET /api/admin/dashboard`, `GET /api/admin/customers`, `GET /api/admin/writers` (search + status
  filter), and the writer verification workflow: `PUT /api/admin/writers/:id/approve|reject|block|
  unblock`, each triggering a notification/email.
- Frontend: a shared responsive `DashboardLayout` reused across all three roles, full sidebars with
  every item routed (built pages show real data, everything else shows a clear "coming in Phase N"
  placeholder), stat cards with skeleton loading, the admin Writer Approvals queue and Writers table.

**Phase 4 — Requests & writer matching**
- `POST /api/requests` — customer submits a request (multi-step data + optional reference files via
  Cloudinary); customer name/email/phone are never re-entered, pulled straight from the account.
- `services/writerMatchingService.js` — the exact-city → same-district → same-state priority
  matching described in the brief: it widens the search only as far as it needs to find approved,
  available writers, then notifies every match (`Notification` records now; real-time push and email
  digests land in Phase 7).
- `GET /api/requests` (role-aware buckets: `new`/`accepted`/`in_progress`/`completed`/`cancelled` for
  writers, `active`/`completed`/`cancelled`/`pending` for customers), `GET /api/requests/:id`,
  `PUT/DELETE /api/requests/:id`, `POST /api/requests/:id/cancel`,
  `GET /api/requests/matched-writers/:requestId`.
- `POST /api/requests/:id/accept` / `.../reject` — first matched writer to accept claims the
  request; it then disappears from every other matched writer's queue.
- `GET /api/writers` (search with state/district/city/price/rating/availability filters) and
  `GET /api/writers/:id` (public profile + reviews) — never expose a writer's UPI details or a
  customer's contact info before a request is claimed.
- `PUT /api/writers/profile/me` — writers can edit their own pricing, bio, availability.
- `GET /api/admin/requests` — full oversight table for admins.
- Frontend: a 4-step **New Request** wizard (MUI Stepper + React Hook Form + Yup, per-step
  validation) that defaults the location step to the customer's own city but allows overriding it;
  **Find Writers** search with live filters and writer cards; a public **writer profile** page with
  reviews; **My Requests** / **Active Work** (customer) and **New Requests** (accept/reject) /
  **Accepted Jobs** / **Cancelled** (writer) list views built on one reusable `RequestsList`
  component; a shared **request detail** page with role-aware actions (accept/reject for a matched
  writer, cancel for the owner); an **admin Requests** oversight table; and working **Profile** pages
  for both customers and writers.

**Phase 5 — Quotations & pricing**
- `POST /api/quotations` — the writer assigned to a request submits pricePerPage, pricePerDiagram,
  and any additionalCharges; the server always computes `estimatedTotal` itself from the request's
  own page/diagram counts (`pricePerPage × pages + pricePerDiagram × diagrams + additionalCharges`)
  so the arithmetic can't be spoofed from the client, while writers still set their own rates per the
  brief ("Do NOT automatically force the writer's price as the final price"). Sends the request to
  `QUOTATION_SENT` and notifies the customer.
- `GET /api/quotations/:requestId` — full quotation history for a request (owner, assigned writer,
  or admin only).
- `PUT /api/quotations/:id` — customer accepts or rejects. Accepting moves the request straight to
  `PAYMENT_PENDING` per the brief's payment flow and notifies the writer; rejecting reopens the
  request (`MATCHED`) so the writer can send a revised quote.
- Frontend: a `QuotationPanel` embedded in the shared request detail page — writers get a pricing
  form with a live-computed total preview; customers see the itemized breakdown with Accept/Reject
  buttons; both see the full quotation history with status chips.

**Phase 6 — Payments (UPI + verification)**
- `GET /api/payments/payment-info/:requestId` — returns the assigned writer's UPI ID/QR code and the
  exact amount due, and only ever to the request's own customer, and only once a quotation has been
  accepted (`request.acceptedQuotation` exists) — never before, never to anyone else.
- `POST /api/payments` — customer records the UPI transaction ID after paying; this sets the payment
  to `PENDING_VERIFICATION`, it does **not** mark anything as paid by itself. Resubmission after a
  rejected attempt reuses the same record.
- `PUT /api/payments/:id/verify` — the assigned writer or an admin confirms or disputes the
  transaction. Verifying moves the request to `PAID` and notifies the customer; disputing sends it
  back to `PENDING_VERIFICATION` territory (the customer resubmits) with a reason attached.
- `GET /api/payments` (role-aware: own payments for customers/writers, everything for admins via
  `GET /api/admin/payments`), `GET /api/payments/:id`, `GET /api/payments/request/:requestId`.
- The `Payment` model already carries `paymentMethod` as an enum and every field a real gateway
  (Razorpay/Stripe) would need, so swapping manual UPI for one later is additive, not a rewrite.
- Frontend: a `PaymentPanel` in the shared request-detail page — customers see the QR code, UPI ID,
  and amount due with a transaction-ID form; writers/admins see a Verify / Dispute control once a
  transaction ID is submitted. New **Payments** pages for customers and admins, and an **Earnings**
  page for writers (verified vs. pending totals + full payment history).

## Tech Stack

**Frontend**: React, Vite, JavaScript, Material UI, React Router, Redux Toolkit, Axios, Framer Motion,
React Hook Form, Yup

**Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Nodemailer, Socket.IO

**Storage**: Cloudinary

**Deployment targets**: Vercel (frontend), Render/Railway (backend), MongoDB Atlas (database)

## Architecture

```
User ──< Request >── Writer
          ├── Quotations
          ├── Payment
          ├── Messages
          ├── Review
          └── Complaint

Writer (User, role=WRITER) ──1:1── WriterProfile
```

Role-based access (`CUSTOMER`, `WRITER`, `ADMIN`) is enforced **server-side only** — the frontend
never decides what a user is allowed to do; it just reflects what the API returns.

## Folder Structure

```
writemate/
├── server/
│   ├── config/        # db, cloudinary, shared constants/enums
│   ├── controllers/    # (Phase 2+)
│   ├── middleware/     # errorHandler, asyncHandler, auth (Phase 2)
│   ├── models/         # all 9 Mongoose models
│   ├── routes/         # (Phase 2+)
│   ├── services/       # (Phase 4+, e.g. writer matching)
│   ├── utils/           # (seed script lands here, Phase 10)
│   ├── socket/          # (Phase 7)
│   ├── uploads/
│   ├── app.js
│   └── server.js
└── client/
    └── src/
        ├── components/  # (Phase 2+)
        ├── pages/        # (Phase 2+)
        ├── layouts/      # (Phase 3+)
        ├── features/     # (Phase 2+, Redux slices per domain)
        ├── services/     # apiClient.js
        ├── store/        # Redux store + uiSlice (theme)
        ├── hooks/
        ├── utils/
        ├── routes/       # (Phase 2+)
        ├── theme/        # tokens.js + MUI theme factory
        └── App.jsx
```

## Installation

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB for development)
- A Cloudinary account (free tier is fine)
- An email account for Nodemailer (e.g. a Gmail App Password) — only needed from Phase 7 onward

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env with your MongoDB URI, JWT secrets, Cloudinary keys, email credentials
npm run dev
```

The API starts on `http://localhost:5000`. Check `http://localhost:5000/api/health`.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The app starts on `http://localhost:5173` and proxies `/api` and `/socket.io` to the backend.

## Environment Variables

See `server/.env.example` and `client/.env.example` for the full list. Never commit `.env` files —
they're already covered by `.gitignore`.

## Database Setup

1. Create a free MongoDB Atlas cluster.
2. Create a database user and allow-list your IP (or `0.0.0.0/0` for development).
3. Copy the connection string into `MONGODB_URI` in `server/.env`.
4. Models auto-create their collections/indexes on first write — no manual migration needed.
5. A seed script (`npm run seed`) that populates realistic demo data is added in Phase 10.

## API Overview (through Phase 6)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Register a customer account |
| POST | `/api/auth/login` | Public | Log in, returns access + refresh tokens |
| GET | `/api/auth/me` | Bearer token | Current user |
| POST | `/api/auth/logout` | Bearer token | Logout (stateless JWT) |
| POST | `/api/writers/register` | Public (multipart) | Apply as a writer; creates `PENDING` profile |
| GET | `/api/writers` | Bearer token | Search approved writers (Find Writers) |
| GET | `/api/writers/:id` | Bearer token | Public writer profile + reviews |
| GET | `/api/writers/profile/me` | Bearer token, role WRITER | The logged-in writer's own profile |
| PUT | `/api/writers/profile/me` | Bearer token, role WRITER (multipart) | Update own pricing/bio/availability |
| GET | `/api/users/profile` | Bearer token | Current user's profile |
| PUT | `/api/users/profile` | Bearer token | Update name/phone/location/avatar |
| GET | `/api/users/dashboard-stats` | Bearer token | Role-aware dashboard stat cards |
| POST | `/api/requests` | Bearer token, role CUSTOMER (multipart) | Create a request; triggers writer matching |
| GET | `/api/requests` | Bearer token | List requests visible to the caller (supports `?bucket=`) |
| GET | `/api/requests/:id` | Bearer token | Request detail (owner, matched/assigned writer, or admin) |
| PUT | `/api/requests/:id` | Bearer token, owner | Edit a pending/unclaimed request |
| DELETE | `/api/requests/:id` | Bearer token, owner | Delete a pending/unclaimed request |
| POST | `/api/requests/:id/cancel` | Bearer token, owner/admin | Cancel a request |
| GET | `/api/requests/matched-writers/:requestId` | Bearer token, owner/admin | Writers matched to a request |
| POST | `/api/requests/:id/accept` | Bearer token, role WRITER | Claim a matched request |
| POST | `/api/requests/:id/reject` | Bearer token, role WRITER | Decline a matched request |
| POST | `/api/quotations` | Bearer token, role WRITER | Assigned writer sends a price quote |
| GET | `/api/quotations/:requestId` | Bearer token | Quotation history for a request |
| PUT | `/api/quotations/:id` | Bearer token, role CUSTOMER | Accept or reject a quotation |
| GET | `/api/payments/payment-info/:requestId` | Bearer token, role CUSTOMER | Writer's UPI ID/QR + amount due |
| POST | `/api/payments` | Bearer token, role CUSTOMER | Submit a UPI transaction ID |
| GET | `/api/payments` | Bearer token | List payments visible to the caller |
| GET | `/api/payments/:id` | Bearer token | Payment detail (party or admin) |
| GET | `/api/payments/request/:requestId` | Bearer token | Payment tied to a specific request |
| PUT | `/api/payments/:id/verify` | Bearer token, writer/admin | Verify or dispute a submitted payment |
| GET | `/api/admin/payments` | Bearer token, role ADMIN | Paginated payment list, filter by status |
| GET | `/api/admin/dashboard` | Bearer token, role ADMIN | Platform-wide stats |
| GET | `/api/admin/customers` | Bearer token, role ADMIN | Paginated customer list, search by name/email |
| GET | `/api/admin/writers` | Bearer token, role ADMIN | Paginated writer list, filter by status |
| GET | `/api/admin/requests` | Bearer token, role ADMIN | Paginated request list, filter by status |
| PUT | `/api/admin/writers/:id/approve` | Bearer token, role ADMIN | Approve a pending writer |
| PUT | `/api/admin/writers/:id/reject` | Bearer token, role ADMIN | Reject with a reason |
| PUT | `/api/admin/writers/:id/block` | Bearer token, role ADMIN | Block an approved writer |
| PUT | `/api/admin/writers/:id/unblock` | Bearer token, role ADMIN | Restore a blocked writer |

The remaining routes (`/api/reviews`, `/api/notifications`, `/api/complaints`) are built out phase by
phase — see the Build Plan.

## Screenshots

_placeholder — add screenshots here once the dashboards are built (Phase 3+)_

## Build Plan

| Phase | Scope |
|---|---|
| 1 ✅ | Project structure, DB connection, models, env config, base theme |
| 2 ✅ | Authentication: register, login, JWT, roles, protected routes |
| 3 ✅ | Customer, Writer, and Admin dashboards |
| 4 ✅ | Request creation and writer matching |
| 5 ✅ | Quotation system and pricing |
| 6 ✅ | Payment tracking (UPI + QR), transaction verification |
| 7 | Notifications, Socket.IO, chat |
| 8 | Completion flow, reviews, ratings, complaints |
| 9 | Security hardening, validation, error handling, tests |
| 10 | Seed data, final README, deployment config |

## Future Improvements

- Real payment gateway integration (Razorpay/Stripe) — the `Payment` model is already shaped for it.
- Writer availability calendars.
- In-app document preview for uploaded reference files.
- Admin analytics/reporting dashboards.

## A note on intended use

WriteMate is built for **legitimate** handwriting and documentation work — copying notes, filling
forms, drawing diagrams, fair-copy work, and permitted project documentation. It is not designed or
intended to facilitate academic dishonesty (e.g. submitting outsourced coursework as a student's own
work), and platform policies/moderation should reflect that as the admin tooling is built out.
