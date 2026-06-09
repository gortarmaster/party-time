-- Run this in the Supabase SQL editor

create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date timestamptz not null,
  location text not null,
  header_image_url text,
  amazon_wishlist_url text,
  created_at timestamptz default now()
);

create type rsvp_status as enum ('pending', 'attending', 'not_attending', 'maybe');

create table guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  phone text not null,
  invite_token uuid unique not null default gen_random_uuid(),
  rsvp_status rsvp_status not null default 'pending',
  invite_sent_at timestamptz,
  responded_at timestamptz
);

-- Index for fast RSVP token lookups
create index guests_invite_token_idx on guests(invite_token);
create index guests_event_id_idx on guests(event_id);

-- Disable RLS (service role key bypasses it, but make it explicit)
alter table events disable row level security;
alter table guests disable row level security;
