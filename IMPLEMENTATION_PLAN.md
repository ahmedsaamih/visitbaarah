# Serene — Island Guest House Booking Website

Build a full-stack single-property island guest house booking website with a polished public single-page site and a functional admin panel.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | NeonDB PostgreSQL via Drizzle ORM |
| ORM | Drizzle ORM + drizzle-kit |
| Media Storage | Vercel Blob |
| Email | Plunk (REST API) |
| Public Animations | GSAP + ScrollTrigger + jQuery (CDN) |
| Admin UI | React + plain CSS (functional, no animation libs) |
| Auth | bcryptjs + HTTP-only cookie + Next.js middleware |

## IMPORTANT: Next.js 16 API Notes

- `cookies()` is **async** — must `await cookies()`
- `params` in route handlers/layouts is a **Promise** — must `await params`
- Route handlers use standard Web Request/Response APIs
- Use `import { cookies } from 'next/headers'` for cookie access
- Dynamic route context: `{ params }: { params: Promise<{ id: string }> }`

## Environment Variables Required

- `DATABASE_URL` — NeonDB connection string
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob token
- `PLUNK_API_KEY` — Plunk email API key
- `ADMIN_PASSWORD_HASH` — bcrypt hash of admin password
- `ADMIN_SESSION_SECRET` — 64-char hex for cookie signing
- `NEXT_PUBLIC_BASE_URL` — Site URL for email links

## Phase Breakdown

### Phase 1: Project Scaffolding ✅ DONE
- Next.js 16 initialized with App Router + TypeScript
- Dependencies installed: drizzle-orm, @neondatabase/serverless, bcryptjs, @vercel/blob
- Dev deps: drizzle-kit, @types/bcryptjs, @types/jquery
- Tailwind removed (using vanilla CSS)
- Config files: `.env.local`, `drizzle.config.ts`, `next.config.ts`

### Phase 2: Database Schema & Connection ✅ DONE
- `db/schema.ts` — 13 tables (roomTypes, rooms, roomAvailability, activities, tours, menuItems, services, media, bookings, bookingAddons, cancellationRequests, testimonials, settings)
- `db/index.ts` — NeonDB serverless drizzle instance

### Phase 3: Utility Libraries ✅ DONE
- `lib/auth.ts` — verifyPassword, createSession, verifySession (bcrypt + HMAC cookie)
- `lib/reference.ts` — generateReferenceId ("GH" + 6 alphanumeric)
- `lib/blob.ts` — uploadToBlob, deleteFromBlob (Vercel Blob wrapper)
- `lib/plunk.ts` — 7 transactional email templates via Plunk REST API
- `middleware.ts` — Protect /admin/* except /admin/login

### Phase 4: Auth API Routes ✅ DONE
- `app/api/admin/login/route.ts` — POST verify password, set cookie
- `app/api/admin/logout/route.ts` — POST clear cookie

### Phase 5: Core CRUD API Routes ✅ DONE
- Room Types, Rooms, Activities, Tours, Restaurant, Services, Testimonials, Gallery, Settings

### Phase 6: Media Upload API ✅ DONE
- POST multipart upload to Vercel Blob + save media record
- DELETE/PATCH for individual uploads (handled in gallery API)

### Phase 7: Availability API ✅ DONE
- Public availability check (room type + date range)
- Admin block/unblock dates

### Phase 8: Booking API ✅ DONE
- Public booking submission with validation + ref ID + email
- Booking lookup, edit, cancellation request
- Admin confirm/reject/checkin/checkout + cancellation management

### Phase 9: Guest History API ✅ DONE
- GET bookings by email

### Phase 10: Admin Panel UI ✅ DONE
- Login page, sidebar layout, dashboard with 12 tabs
- Bookings, Cancellations, Room Types, Rooms, Activities, Tours, Menu, Services, Gallery, Testimonials, Settings

### Phase 11: Public Website ✅ DONE
- High-end single page with 13 segments (SSR)
- GSAP + ScrollTrigger animations
- Booking lookup sub-page
- Color: ocean teal (#0D5C5C), gold (#C9A96E), cream (#FAF8F3)
- Fonts: Cormorant Garamond, DM Sans, Playfair Display

### Phase 12: Public JS & Dynamic Content ✅ DONE
- GSAP animations & admin-controlled Hero image

### Phase 13: Security & Recovery ✅ DONE
- OTP Admin recovery & Middleware hardening (Rate limits, CSP)

### Phase 14: Media Optimization ✅ DONE
- Automatic image compression (Sharp) with progress hints

### Phase 15: Final QA & Polish ✅ DONE
- Responsive, validation, and error handling complete

### Phase 21: Telegram Notifications & Failure Escalation 📋 PLANNED

Goal: Add free, reliable Telegram admin notifications for key booking lifecycle events, with email fallback to recovery/super-admin if Telegram delivery fails.

#### Scope
- Send Telegram notifications for:
  - Booking request received
  - Booking confirmed
  - Booking rejected
  - Cancellation request received
  - Cancellation approved
- Add settings support for Telegram destination and control flags in Admin Settings.
- Add delivery-failure escalation email to recovery/super-admin email.

#### Configuration Plan
- Required env vars:
  - `TELEGRAM_BOT_TOKEN` — Telegram bot token from BotFather
- Settings keys (DB settings table):
  - `telegram_chat_id` — target user/group chat ID
  - `telegram_notifications_enabled` — true/false
  - `telegram_failure_alert_email` — fallback destination; default to `admin_recovery_email` setting if empty

#### Service Design
- Create `lib/telegram.ts`:
  - `sendTelegramNotification(eventType, payload)`
  - Normalized templates per event
  - Non-blocking send behavior (never fail booking transaction)
  - Structured error logging
- Create failure alert helper:
  - On Telegram send failure, send detailed email via Plunk to fallback email
  - Include event type, referenceId, endpoint source, Telegram error message, timestamp

#### Integration Points (No behavior change to booking flow)
- Public booking create route -> notify "booking_request_received"
- Admin booking status route -> notify "booking_confirmed"/"booking_rejected"
- Public cancellation request route -> notify "cancellation_request_received"
- Admin cancellation resolution route -> notify "cancellation_approved"

#### Validation & Safety
- Validate chat ID format before sending
- Honor `telegram_notifications_enabled` toggle
- Do NOT apply user/admin request rate-limit rules to internal Telegram event alerts
- Keep all sends idempotent/non-critical: booking/cancellation APIs should succeed even if notification fails

#### Admin UI Plan
- In `admin/settings` add:
  - Telegram Chat ID input
  - Enable/disable switch
  - Failure alert email input
  - "Send Test Telegram" button for live verification

#### Acceptance Criteria
- For each event, Telegram message appears in configured chat with reference and status context
- If Telegram call fails, fallback alert email is sent to recovery/super-admin with failure reason/details
- Core transaction succeeds even if notification channel fails
- Toggle can disable Telegram notifications without redeploy
