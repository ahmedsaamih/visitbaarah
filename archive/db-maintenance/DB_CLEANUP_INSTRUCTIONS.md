# Database Cleanup Instructions

Use this when you want to clear test **guest transactional data** before handover, without deleting website content/media/settings.

## What the script removes by default

- `booking_addons`
- `cancellation_requests`
- `bookings`
- `otps`

These are operational/test-user records.

## Optional removal

- `testimonials` (only if you pass `--include-testimonials`)

Use this only if you also want to clear review/testimonial data.

## What the script does NOT remove

- room types / rooms / activities / tours / menu / services
- gallery/media files
- settings/configuration keys
- availability blocks (unless linked through deleted booking logic elsewhere)

## Prerequisites

1. Ensure `DATABASE_URL` points to the target DB.
2. Run from project root.

## Commands

### 1) Preview only (safe)

```bash
node archive/db-maintenance/cleanup-test-user-data.mjs --dry-run
```

### 2) Execute cleanup

```bash
node archive/db-maintenance/cleanup-test-user-data.mjs --confirm
```

### 3) Execute cleanup + remove testimonials too

```bash
node archive/db-maintenance/cleanup-test-user-data.mjs --confirm --include-testimonials
```

## Suggested handover flow

1. Run `--dry-run`
2. Verify row counts are expected
3. Run `--confirm`
4. Spot-check admin pages:
   - Bookings
   - Cancellations
   - Guest history
   - Reviews (if testimonials were removed)
