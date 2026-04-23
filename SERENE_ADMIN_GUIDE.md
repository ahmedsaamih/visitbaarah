# Serene Seaview Guest House
## Admin Operations Guide (Public Website + Admin Panel)

Version: 1.0  
Audience: Guest House Administrators and Staff  
System: Serene Seaview Website (Public + Admin)

---

## 1) Purpose of This Guide

This guide explains how to operate the website day-to-day:

- How guests use the public website
- How staff manage bookings, rooms, content, and settings in Admin
- What each Admin menu is for
- Recommended operational workflow and best practices

---

## 2) System Overview

The website has two main areas:

1. Public Website (for guests)
2. Admin Panel (for staff)

Core business flow:

1. Guest submits booking request
2. Admin reviews and confirms/rejects
3. Guest may request cancellation
4. Admin approves/rejects cancellation
5. On checkout, guest receives review link (expires in 3 days)
6. Admin approves/rejects review before public display

---

## 3) Public Website Guide

## 3.1 Main Sections Guests See

- Hero Banner (brand + welcome)
- Our Story
- Rooms & Suites
- Activities / Experiences
- Dining / Menu
- Gallery
- Guest Reviews (approved + published testimonials)
- Booking Section
- Footer (contact + navigation)

## 3.2 Booking Flow (Guest Side)

Guests can:

- Check dates and room availability
- Submit booking request with details
- Receive booking reference ID and email updates
- Check existing booking with Reference ID + Email
- Edit/cancel request where applicable

## 3.3 Review Flow (Guest Side)

After admin marks a booking as checked-out:

- Guest receives review invitation email
- Review link is tokenized and expires in 3 days
- Guest submits rating + comments
- Review remains hidden publicly until admin approval

---

## 4) Admin Panel Access

## 4.1 Login

- Open `/admin/login`
- Enter admin password
- If needed, use OTP-based recovery flow

## 4.2 Security Notes

- Keep admin password private and strong
- Keep recovery email accessible to authorized owner/admin only
- Avoid sharing admin credentials among many users

---

## 5) Admin Menu Guide

This section documents every primary Admin page.

## 5.1 Dashboard

Purpose:

- Quick snapshot of operations

What you see:

- Pending bookings
- Confirmed bookings
- Pending cancellations
- Total rooms
- Recent bookings table

When to use:

- Start of day check
- Shift handover review

## 5.2 Bookings

Purpose:

- Manage booking lifecycle

Typical actions:

- Confirm pending booking
- Reject pending booking
- Move confirmed booking to check-in
- Move checked-in booking to check-out

Important behavior:

- Confirm may auto-assign available room where needed
- Status updates trigger guest email notifications
- Checkout triggers review invitation email

Review handling in Bookings:

- For checked-out bookings, use "View Review" when guest has submitted
- Approve or reject directly from the review modal

## 5.3 Cancellations

Purpose:

- Process guest cancellation requests

Actions:

- Approve cancellation
- Reject cancellation
- Add optional response message

Recommendation:

- Always include clear response text for guest clarity

## 5.4 Availability

Purpose:

- Control room/date availability shown to guests

Actions:

- Block dates (maintenance, private use, no sale)
- Unblock dates
- Review date-wise room status

## 5.5 Room Types

Purpose:

- Manage room categories sold publicly

Actions:

- Add/edit room type name, pricing, details, amenities, capacity
- Sort display order
- Enable/disable as needed

## 5.6 Rooms

Purpose:

- Manage physical inventory

Actions:

- Add room numbers
- Map each room to a room type
- Update room operational state (available/maintenance/etc.)

## 5.7 Activities

Purpose:

- Manage activity offerings shown on public pages

Actions:

- Add/edit activity cards
- Update pricing, description, active state

## 5.8 Tours

Purpose:

- Manage tour offerings

Actions:

- Add/edit tours, prices, descriptions, durations, includes, sorting

## 5.9 Menu

Purpose:

- Manage restaurant menu content shown in dining section/modal

Actions:

- Add/edit menu items
- Control category and availability
- Keep prices updated

## 5.10 Services

Purpose:

- Manage additional services sold or displayed

Actions:

- Add/edit service details
- Set active/inactive and sort order

## 5.11 Gallery

Purpose:

- Manage visual media

Actions:

- Upload images
- Edit alt/captions/sort order
- Remove outdated items

Note:

- Current public gallery uses GSAP auto-play carousel layout

## 5.12 Testimonials

Purpose:

- Moderate and curate guest reviews for public display

Actions:

- View submitted testimonials
- Approve (publish) or reject (hide from public)
- Mark one approved item as featured (priority on homepage)

Display logic:

- Public shows latest 15 approved + published
- Featured appears first

## 5.13 Settings

Purpose:

- Global system configuration

Main groups:

1. Homepage visuals
   - Hero image
   - About image
   - Dining image

2. Security & recovery
   - Admin recovery email (OTP-protected update)

3. Telegram notifications
   - Chat ID
   - Enable/disable toggle
   - Failure alert email
   - Send test Telegram action

4. Other global key-value settings

---

## 6) Recommended Daily Operations (SOP)

Start of day:

1. Open Dashboard and check pending counts
2. Review new Bookings and action pending items
3. Review pending Cancellations
4. Check Availability for upcoming dates

Midday:

1. Ensure room statuses are accurate (check-in/check-out updates)
2. Validate menu/services/gallery updates if promotions changed

End of day:

1. Resolve remaining pending items if possible
2. Verify critical settings unchanged
3. Review new testimonials submitted for moderation

---

## 7) Notification & Messaging Behavior

Email:

- Booking events and security OTP use transactional email
- Selected endpoints enforce request limits for abuse protection

Telegram:

- Booking/cancellation event alerts sent to configured chat
- Telegram alerts are non-blocking to core booking API flow
- If Telegram fails, fallback email alert can be sent

---

## 8) Review Moderation Policy (Suggested)

Approve if:

- Content is genuine, respectful, and relevant
- No sensitive personal data is disclosed

Reject if:

- Contains abuse/hate/spam
- Contains personal/confidential details
- Unrelated or clearly malicious content

Tip:

- Keep rejected reviews visible in admin for audit/history

---

## 9) Basic Troubleshooting

Issue: Guest says booking not visible  
Check:

- Correct reference + email combination
- Booking status and dates

Issue: Review link not working  
Check:

- Link expired (3-day window)
- Review already submitted
- Token mismatch/copy issues

Issue: Public content not updating quickly  
Check:

- Admin save success
- Cache invalidation via admin APIs
- Recheck after short delay

Issue: Telegram alerts not arriving  
Check:

- `TELEGRAM_BOT_TOKEN` in environment
- `telegram_chat_id` setting
- Notifications enabled
- Use “Send Test Telegram”

---

## 10) Environment Variables (Reference)

Required core:

- `DATABASE_URL`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `NEXT_PUBLIC_BASE_URL`
- `PLUNK_SECRET_KEY` (or supported alias)
- `PLUNK_FROM_EMAIL`

Optional / feature:

- `TELEGRAM_BOT_TOKEN`
- `ADMIN_EMAIL` (fallback alert target)

---

## 11) Change Management Recommendations

- Record major config changes in a simple admin log
- Before large updates, export key settings values
- Keep at least one backup admin aware of recovery email and deployment access

---

## 12) Quick Reference Checklist

Daily:

- [ ] Check pending bookings
- [ ] Check pending cancellations
- [ ] Update check-in/check-out statuses
- [ ] Moderate new reviews

Weekly:

- [ ] Verify homepage visuals
- [ ] Audit room types/services/pricing
- [ ] Send Telegram test notification

Monthly:

- [ ] Review admin recovery email validity
- [ ] Validate core environment configuration on deployment platform

---

End of guide.
