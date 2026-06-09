# Project Brief: Personal Evite App

## Overview
A lightweight, personal event invitation and RSVP app. Single-user: one admin creates events, manages guests, sends invites via SMS, and tracks RSVPs. Guests get a unique link to respond and see the Amazon registry. No multi-tenancy, no auth system complexity — just a simple admin login and guest-facing RSVP pages.

## Tech Stack
- **Framework:** Next.js 16.2 (App Router, latest stable as of June 2026)
- **Styling:** Tailwind CSS
- **Database:** Supabase (Postgres + Realtime)
- **SMS:** Telnyx (cheapest per-message rate at ~$0.004/SMS)
- **Hosting:** Vercel
- **Auth:** Single hardcoded admin login or Supabase Auth with one user

## Core Features

### Phase 1 (MVP)
1. **Admin dashboard** — view all events, create new event
2. **Event creation** — event name, date/time, location, optional header photo, optional Amazon wishlist URL
3. **Guest management** — add guests by name + phone number (and optionally email), bulk paste or manual entry
4. **Invite sending** — generate unique UUID-based RSVP link per guest, fire SMS via Telnyx API with event name + link
5. **RSVP page** (guest-facing) — shows event details, header photo, RSVP buttons (Attending / Not Attending / Maybe), confirmation screen with Amazon wishlist link if provided
6. **Real-time RSVP dashboard** — admin sees who has responded and their status
7. **SMS reminders** — admin can trigger a reminder blast to non-responders or all attending guests

### Phase 2 (Later)
- Figma-designed template selection (2-3 visual themes)
- Email invite option alongside SMS

## Database Schema (Supabase)

### `events`
- id (uuid)
- name (text)
- date (timestamp)
- location (text)
- header_image_url (text, nullable)
- amazon_wishlist_url (text, nullable)
- created_at (timestamp)

### `guests`
- id (uuid)
- event_id (uuid, FK)
- name (text)
- phone (text)
- invite_token (uuid, unique) — this is what makes the RSVP link unique
- rsvp_status (enum: pending / attending / not_attending / maybe)
- invite_sent_at (timestamp, nullable)
- responded_at (timestamp, nullable)

## Key Routes

- `/` — redirect to `/admin`
- `/admin` — dashboard, list of events
- `/admin/events/new` — create event form
- `/admin/events/[id]` — event detail, guest list, RSVP statuses, send/remind buttons
- `/rsvp/[token]` — guest-facing RSVP page (public, no auth)

## RSVP Link Format
`https://yourdomain.com/rsvp/[invite_token]`

Each guest has a unique `invite_token` in the `guests` table. When they hit the link, look up the token, show the event, and update their `rsvp_status` on button click.

## SMS via Telnyx
Use the Telnyx Node SDK. Store `TELNYX_API_KEY` and `TELNYX_PHONE_NUMBER` in `.env.local`. Send from a single purchased Telnyx number. Message format:

> "Hey [Name]! You're invited to [Event Name] on [Date]. RSVP here: [link]"

## Environment Variables Needed
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TELNYX_API_KEY=
TELNYX_PHONE_NUMBER=
ADMIN_PASSWORD= (if using simple hardcoded auth)
```

## Design Direction
Clean, minimal Tailwind UI. No component libraries required — just utility classes. Admin side is functional and fast. Guest RSVP page should feel warm and intentional, not like a form. Header photo fills the top of the RSVP page. Event details below it. Big clear RSVP buttons. Confirmation screen shows a short thank-you message and the wishlist link as a button.

## Out of Scope (Phase 1)
- Payment processing
- Physical invites
- Multiple admin users
- Custom design templates (Phase 2)
- Email delivery (Phase 2)
