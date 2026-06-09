import { createClient } from '@supabase/supabase-js'

export type RsvpStatus = 'pending' | 'attending' | 'not_attending' | 'maybe'

export interface Event {
  id: string
  name: string
  date: string
  location: string
  header_image_url: string | null
  amazon_wishlist_url: string | null
  created_at: string
}

export interface Guest {
  id: string
  event_id: string
  name: string
  phone: string
  invite_token: string
  rsvp_status: RsvpStatus
  invite_sent_at: string | null
  responded_at: string | null
}

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  return url
}

function getAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return key
}

function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  return key
}

export function supabaseClient() {
  return createClient(getSupabaseUrl(), getAnonKey())
}

export function supabaseAdmin() {
  return createClient(getSupabaseUrl(), getServiceRoleKey())
}
