# Serene Seaview - Project Handoff Documentation

This document provides a high-level technical summary of the Serene Seaview Guest House platform to ensure a seamless continuation of development.

## 🛠️ Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: Neon Postgres (Serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Custom Session middleware + OTP verification
- **Media**: Vercel Blob (Optimized via client-side Canvas)
- **Animations**: GSAP 3.12 + jQuery (for legacy-themed luxury reveals)
- **Email**: Plunk (Transactional & Security templates)
- **Admin alerts**: Telegram Bot API (outbound `sendMessage` for key booking events; failure escalates to email — see Settings)

## 💎 Critical Recent Achievements

### 1. Zero-Cost Performance Pipeline
- **Client-Side Compression**: The system now compresses and resizes images in the admin's browser *before* upload. This eliminates Vercel CPU usage costs and minimizes Blob storage consumption.
- **Edge Data Caching**: The public homepage is optimized with `unstable_cache`. Visitors receive data from the Edge, and the Neon database is only queried when the admin panel explicitly invalidates the cache via `revalidateTag("homepage")`.

### 2. Functional Hardened Integration
- **Booking Flow**: Complete "Check Availability -> Guest Info -> Create Booking" loop is live on the homepage.
- **Security Loops**: Branded OTP emails (Recovery/Change Email) are fully integrated with the Plunk system.
- **Schema Hardening**: Added 10+ performance indexes to Neon and implemented strict polymorphic media relations with cascading deletes.

### 3. Luxury Mobile Experience
- **Responsive Fluidity**: Switched all typography and spacing to a `clamp()` based fluid system.
- **GSAP Polish**: All carousels and gallery reels are touch-optimized and responsive down to 375px.

### 4. Recent product & ops updates (handoff refresh)
- **Telegram**: Outbound notifications for booking/cancellation milestones; configure in **Admin → Settings** (`telegram_chat_id`, enable flag, failure alert email). Env: `TELEGRAM_BOT_TOKEN`. On Telegram API failure, an alert email is sent to the configured fallback / recovery address.
- **Plunk**: Production uses Plunk **secret** key; `revalidateTag` uses Next.js 16 two-argument form where applicable.
- **Bookings**: Guest flows use **reference ID + email** for lookup, edit (returns to pending for re-approval), and cancellation requests; admin confirm may **auto-assign** a free room when none was set.
- **Availability**: Public and admin views account for blocks and active bookings; admin calendar UX iterated for mobile/desktop.
- **Rate limiting**: Selected routes that send **transactional email** enforce **one request per 15 minutes** per identity, with a clear retry message. **Telegram outbound alerts are not subject to that limiter.**
- **Admin UI**: Mobile-friendly shell (menu drawer); `/admin` redirects to dashboard or login.
- **Future (not built)**: Telegram **inbound** webhook for `/approve` / `/reject` commands — tracked in `TASK.md` Phase 22.

## 📍 Environment Context
Ensure the following variables are configured in Vercel:
- `DATABASE_URL`: Neon Connection string.
- `PLUNK_API_KEY` (or supported alias in code): Plunk **secret** API key for `send`.
- `PLUNK_FROM_EMAIL`: Verified sender for Plunk.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob access.
- `ADMIN_SESSION_SECRET`: Session signature.
- `NEXT_PUBLIC_BASE_URL`: Deployment domain for absolute links in emails.
- `TELEGRAM_BOT_TOKEN`: Telegram bot for outbound admin notifications (optional but recommended if using Telegram alerts).

## 🏁 Current Status
Core guest and admin flows are integrated on Vercel; continue to validate against production logs (Plunk, Telegram, booking edge cases). See `TASK.md` for open items (e.g. seed script, optional Telegram command webhook).
