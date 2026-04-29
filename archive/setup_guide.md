# Serene Setup Guide

This guide explains how to run Serene in the current project setup, including all environment variables, what they do, and where to get them.

---

## 1) Prerequisites

- Node.js 20+ (recommended)
- npm (comes with Node)
- Access to:
  - Neon Postgres project
  - Vercel project (for deployment + Blob storage)
  - Plunk account (transactional email)
  - Telegram Bot token (optional but recommended)

---

## 2) Install and Run Locally

From project root:

```bash
npm install
npm run dev
```

App should be available at:

- [http://localhost:3000](http://localhost:3000)

Admin login route:

- `/admin/login`

---

## 3) Build / Start Commands

- Development:
  - `npm run dev`
- Production build:
  - `npm run build`
- Production run:
  - `npm run start`

> Note: `npm run build` currently runs `drizzle-kit push` first, then Next build.

---

## 4) Environment Variables

Set these in:

- Local: `.env.local`
- Deployment: Vercel Project Settings → Environment Variables

### Core variables (required)

1. `DATABASE_URL`
   - **Purpose:** Primary Postgres connection string used by Drizzle.
   - **Where to get it:** Neon project dashboard → connection details.

2. `ADMIN_PASSWORD_HASH`
   - **Purpose:** Bcrypt hash for admin login password.
   - **How to get it:** Generate a bcrypt hash from chosen admin password.

3. `ADMIN_SESSION_SECRET`
   - **Purpose:** Cookie/session signature secret.
   - **How to get it:** Generate a long random secret (recommended 64-char hex).

4. `NEXT_PUBLIC_BASE_URL`
   - **Purpose:** Public base URL used for absolute links (emails, metadata, robots/sitemap host references).
   - **How to get it:** Your deployed domain (e.g. `https://your-domain.com`).

5. `BLOB_READ_WRITE_TOKEN`
   - **Purpose:** Upload/read access for Vercel Blob media.
   - **Where to get it:** Vercel Storage → Blob → project token.

6. `PLUNK_SECRET_KEY` (or `PLUNK_API_KEY` alias)
   - **Purpose:** Sends transactional emails.
   - **Where to get it:** Plunk dashboard → API Keys.

7. `PLUNK_FROM_EMAIL`
   - **Purpose:** Verified sender email for outbound messages.
   - **Where to get it:** Plunk verified sender/domain setup.

### Feature / optional variables

8. `TELEGRAM_BOT_TOKEN` (optional, recommended)
   - **Purpose:** Sends Telegram admin notifications.
   - **Where to get it:** Create bot via BotFather in Telegram.

9. `ADMIN_EMAIL` (optional fallback)
   - **Purpose:** Fallback recipient for certain alert paths.
   - **How to set:** Owner/admin email address.

---

## 5) Runtime Settings Stored in DB (not env vars)

These are configured in Admin panel (`/admin/settings`) and saved in DB `settings` table.

### Telegram settings

- `telegram_chat_id`
- `telegram_notifications_enabled`
- `telegram_failure_alert_email`

### Homepage visuals

- `hero_image_url`
- `about_image_url`
- `dining_image_url`

### Social links

- `social_instagram_url`
- `social_facebook_url`
- `social_tiktok_url`
- `social_vk_url`

### Pricing engine settings (managed via Room Types UI)

- `room_type_rates:{roomTypeId}`
- `room_type_maldivian_discount:{roomTypeId}`

> These pricing keys are intentionally managed through Admin → Room Types, not generic Settings editing.

---

## 6) First-Time Setup Checklist

1. Set all required environment variables.
2. Run:
   - `npm install`
   - `npm run build` (applies schema push and builds app)
3. Start app (`npm run dev` or `npm run start`).
4. Login to admin and verify:
   - Settings page loads
   - Hero image and section images can be updated
   - Telegram test notification works (if token/chat configured)
5. Validate public flows:
   - Check availability
   - Submit booking
   - Booking lookup

---

## 7) Pre-Handover Cleanup (Optional but recommended)

To clear transactional test data only:

- Use:
  - `archive/db-maintenance/cleanup-test-user-data.mjs`
- Follow:
  - `archive/db-maintenance/DB_CLEANUP_INSTRUCTIONS.md`

This preserves content/media/settings while removing guest operational records.

---

## 8) Notes for Owner Handover

- Keep these secure and owner-controlled:
  - Neon access
  - Vercel project access
  - Plunk keys/domain
  - Telegram bot token/chat routing
  - Admin credentials + recovery email
- After handover, rotate secrets where appropriate and store in a password manager.
