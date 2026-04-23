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
| Admin alerts | Telegram Bot API (outbound `sendMessage`) |
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
- `TELEGRAM_BOT_TOKEN` — Telegram bot token (outbound admin notifications)
- `PLUNK_SECRET_KEY` / `PLUNK_API_KEY` — Plunk secret API key (Bearer); `PLUNK_FROM_EMAIL` — verified sender

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

### Phase 21: Telegram Notifications & Failure Escalation ✅ IMPLEMENTED

Outbound admin alerts via Telegram Bot API (`sendMessage`), with Plunk email fallback if Telegram fails.

#### Implemented behavior
- **Env:** `TELEGRAM_BOT_TOKEN`
- **Settings (DB):** `telegram_chat_id`, `telegram_notifications_enabled`, `telegram_failure_alert_email` (fallback defaults to `admin_recovery_email` / `ADMIN_EMAIL` when unset)
- **Library:** `lib/telegram.ts` — `sendTelegramNotification(eventType, payload)`; failure sends HTML alert email via existing Plunk `sendEmail`
- **Admin UI:** Settings → Telegram section + test route `POST /api/admin/notifications/telegram/test`
- **Events wired:** booking request received; booking confirmed/rejected; cancellation request received; cancellation approved
- **Rate limits:** transactional email/user request limiter does **not** apply to Telegram sends

### Documentation changelog (since prior handoff)

- **Plunk:** Use secret key env (`PLUNK_API_KEY` / `PLUNK_SECRET_KEY` per code); `revalidateTag("homepage", "max")` for Next.js 16; optional `PLUNK_FROM_EMAIL` aliases supported in code.
- **Bookings:** Guest lookup/edit/cancel by reference + email; admin confirm may auto-assign room; availability logic accounts for blocks + bookings; transactional email routes rate-limited (15 min) with user-facing hint.
- **Admin:** Mobile nav shell (`AdminShell`); `/admin` redirect; availability calendar sizing; Telegram settings block.
- **Public:** FAB mobile nav; booking card + “View My Booking” modal; section image settings (`about_image_url`, `dining_image_url`); assorted UX fixes.
- **Reviews/Testimonial flow:** checkout-triggered review invite email with 3-day tokenized link; guest review form (`/review/[token]`); admin moderation from bookings/testimonials; approved + published reviews shown on homepage (max 15, featured-first).
