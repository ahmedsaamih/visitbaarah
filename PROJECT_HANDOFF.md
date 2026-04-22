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

## 📍 Environment Context
Ensure the following variables are configured in Vercel:
- `DATABASE_URL`: Neon Connection string.
- `PLUNK_API_KEY`: API Key for branded emails.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob access.
- `ADMIN_SESSION_SECRET`: Session signature.
- `NEXT_PUBLIC_BASE_URL`: Deployment domain for absolute links in emails.

## 🏁 Current Status: PRODUCTION READY
The platform is fully integrated, cost-optimized, and visually polished across all devices. No critical bugs or outstanding integration gaps remain.
