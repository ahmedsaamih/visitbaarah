# Visit Baarah — Project Handoff

**Site:** visitbaarah.mv  
**Purpose:** Island tourism & discovery platform for HA. Baarah, Haa Alif Atoll, Maldives.  
**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Drizzle ORM · Neon PostgreSQL · Vercel Blob · GSAP  
**Last updated:** May 2026

---

## What this is

A public-facing island guide for visitors and locals, driven by a private admin panel. The site promotes Baarah through island history, events/activities, nature attractions (tours), dining, transport, and a photo gallery. It includes a full booking subsystem inherited from the original "Serene Seaview" hotel codebase.

---

## Running locally

```bash
cd serene
cp .env.example .env.local   # fill in values (see Environment Variables below)
npm install
npm run dev                  # starts on :3000 (or next available port)
```

The build script auto-pushes the Drizzle schema before building:
```bash
npm run build   # runs: npx drizzle-kit push && next build
```

---

## Environment variables

All of these must be set in `.env.local` (local) or Vercel project settings (production).

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password. Generate with Node: `require('bcryptjs').hash('yourpassword', 10)` |
| `ADMIN_SESSION_SECRET` | Any long random string — used to HMAC-sign session cookies |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token — for image uploads from the admin panel |
| `PLUNK_API_KEY` | Plunk transactional email API key (booking confirmations, review requests) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token for admin booking notifications |
| `TELEGRAM_CHAT_ID` | Telegram chat/channel ID for those notifications |
| `NEXT_PUBLIC_BASE_URL` | Full production URL e.g. `https://visitbaarah.mv` (used for sitemaps, OG URLs) |

---

## Directory structure

```
serene/
├── app/
│   ├── page.tsx              ← Public homepage (the main editorial page)
│   ├── layout.tsx            ← Root layout (Outfit font, meta tags)
│   ├── globals.css           ← All design tokens, animations, component styles
│   ├── admin/                ← Admin panel pages (protected by middleware)
│   └── api/                  ← REST API routes (admin CRUD + public booking)
├── components/
│   ├── public/               ← Public-facing components
│   │   ├── GsapInit.tsx      ← Client component that registers all scroll animations
│   │   ├── Hero.tsx          ← Full-viewport hero with GSAP parallax
│   │   ├── Navbar.tsx        ← Fixed navbar (transparent → white on scroll)
│   │   ├── TransportSection.tsx ← "Getting Around" section
│   │   ├── ExperienceSection.tsx ← Dining + photo gallery
│   │   └── GsapCarousel.tsx  ← Swipeable carousel (used for reviews)
│   └── admin/                ← Admin shell, sidebar, media manager
├── db/
│   ├── schema.ts             ← Complete Drizzle schema
│   └── index.ts              ← Neon DB client
├── lib/
│   ├── auth.ts               ← Session creation/verification (HMAC cookies)
│   ├── blob.ts               ← Vercel Blob helpers
│   ├── plunk.ts              ← Email sending
│   └── telegram.ts           ← Telegram notification helpers
├── public/images/
│   ├── logo-visitbaarah.png  ← Logo (RGB PNG, white background — see Logo note)
│   ├── hero.png              ← Fallback hero image
│   └── favicon.ico
└── drizzle/                  ← SQL migration files
```

---

## Design system

All design tokens live in `app/globals.css` as CSS variables:

| Token | Value | Use |
|---|---|---|
| `--deep` | `#090f0a` | Darkest background (footer, hero overlay) |
| `--forest` | `#0b1f12` | Dark section backgrounds |
| `--green` | `#1a5c38` | Primary brand green |
| `--cream` | `#f5f4ef` | Light section backgrounds |
| `--gold` | `#c87820` | Accent colour (overlines, buttons, dividers) |
| `--gold-light` | `#e4a438` | Stats, prices on dark backgrounds |
| `--text-light` | `#6b8070` | Secondary body text |
| `--border` | `#cfddd5` | Dividers on light sections |

Font: **Outfit** (Google Fonts, weights 300–900), loaded in `layout.tsx`.

---

## GSAP animations

Animations are split across two places:

**`components/public/GsapInit.tsx`** — runs once at page load, sets up all ScrollTrigger-based animations:
- `.s-up` — elements that slide up on scroll into view
- `.reveal-img` — clip-path wipe (`inset(100%)` → `inset(0)`) for image panels
- `.parallax-img` — vertical yPercent scrub on scroll (used inside `.parallax-wrap` containers)
- `.line-expand` — scaleX expand on a gold horizontal rule
- `[data-count]` — counter animation from 0 to the `data-count` attribute value
- `.stagger-row > *` — staggered children reveal
- `.slide-in-left` / `.slide-in-right` — horizontal entrance animations

**`components/public/Hero.tsx`** — has its own GSAP instance for hero-specific animations (line-by-line text reveal on mount, hero parallax background, content fade on scroll).

**Important:** GSAP is loaded via npm (`import gsap from "gsap"`). There are no CDN script tags. The package version is 3.12.5.

---

## Homepage sections

The homepage (`app/page.tsx`) is a server component. It fetches all data in a single `Promise.all` call, cached for 1 hour with the `homepage` tag (invalidate with `revalidateTag("homepage")`).

| Section | Shows when | Data source |
|---|---|---|
| Hero | Always | `settings.hero_image_url` |
| Stats bar | Always | Hardcoded (Haa Alif, Agriculture, HAQ airport) |
| 01 Discover | Always | Hardcoded text + `settings.about_image_url` |
| 02 Explore | `tours.length > 0` | `tours` table |
| 03 Events | `activities.length > 0` | `activities` table |
| Where to Stay | `roomTypes.length > 0` | `room_types` table |
| 04 Getting Around | Always | `services` table (optional; shows CTA card if empty) |
| Dining | `menuItems.length > 0` | `menu_items` table |
| Gallery | `gallery.length > 0` | `media` table where `entity_type = 'gallery'` |
| Reviews | `testimonials.length > 0` | `testimonials` (published + approved only) |
| Plan Your Visit CTA | Always | Static |
| Footer | Always | `settings.social_*_url` |

---

## Database schema (key tables)

| Table | Purpose |
|---|---|
| `tours` | Nature attractions / explore cards (island tours, snorkelling spots, etc.) |
| `activities` | Events — shown as full-bleed alternating strips |
| `services` | Transport options (buggy hire, taxi, boat trips) |
| `menu_items` | Restaurant/dining menu |
| `media` | All uploaded images. `entity_type = 'gallery'` for the gallery section |
| `settings` | Key-value store for site config (hero image, about image, social URLs, etc.) |
| `room_types` + `rooms` | Accommodation (originally hotel, now guesthouses) |
| `bookings` | Guest bookings with reference IDs |
| `testimonials` | Reviews — tied to bookings but can be standalone |

---

## Admin panel

Access at `/admin/login`. Session expires after 24 hours.

**Seeding the first admin account:**  
There is no sign-up flow. Set `ADMIN_PASSWORD_HASH` to a bcrypt hash of your chosen password. Generate it:
```js
node -e "const b=require('bcryptjs'); b.hash('yourpassword',10).then(console.log)"
```

**Key admin pages:**

| URL | What it manages |
|---|---|
| `/admin/settings` | Hero image, about image, dining image, social links |
| `/admin/tours` | Explore section cards |
| `/admin/activities` | Events strips |
| `/admin/services` | Transport pricing cards |
| `/admin/menu` | Dining menu items |
| `/admin/gallery` | Photo gallery (upload to Vercel Blob) |
| `/admin/room-types` | Accommodation listings |
| `/admin/testimonials` | Approve/feature/publish reviews |

---

## Logo note

`public/images/logo-visitbaarah.png` is an **RGB PNG without alpha transparency** — it has a white/opaque background. Because of this:

- The **hero** uses a CSS text wordmark ("Visit Baarah") instead of the image, which looks sharp on dark backgrounds.
- The **navbar** shows the text wordmark when transparent (over the hero) and switches to the logo image once scrolled (white background context).

To fix this properly, export the logo as a PNG with a transparent background (RGBA, alpha channel) from the original design file. Drop the new file at `public/images/logo-visitbaarah.png` and remove the conditional rendering in `Navbar.tsx` — the `brightness(0) invert(1)` filter approach will then work correctly.

---

## Deployment (Vercel)

1. Push to GitHub.
2. Import the repo in Vercel — framework auto-detects as Next.js.
3. Set all environment variables listed above in the Vercel project settings.
4. The build command is `npx drizzle-kit push && next build` (already in `package.json`).
5. Domain: point `visitbaarah.mv` DNS to Vercel.

---

## What's done

- Full public homepage with GSAP scroll animations, parallax, editorial dark/light section alternation
- Admin panel with CRUD for all content types
- Vercel Blob image upload in admin
- Booking flow (room availability check, booking creation, email confirmation)
- Review/testimonial workflow (token-based review link sent post-stay)
- Telegram notifications for new bookings
- OTP-based admin password reset via email
- SEO: sitemap, robots.txt, Open Graph meta, canonical URLs

## What's next / known gaps

- **Logo transparency** — replace logo PNG with a transparent-background version (see Logo note above)
- **No DB content yet** — the Explore, Events, Stay, Dining, Gallery, Reviews sections are all hidden until data is added via the admin panel
- **Booking system reuse** — the booking flow still reflects guesthouse stay logic inherited from the original codebase; review if it fits the Visit Baarah use case or should be repurposed/removed
- **Favicon** — currently uses the original Serene favicon; replace `public/images/favicon.ico` with a Visit Baarah icon
- **OG image** — no `opengraph-image` is set; add one for social sharing previews
