import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, type RsvpStatus } from '@/lib/supabase'

export async function GET(_: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const db = supabaseAdmin()

  const { data: guest, error: guestError } = await db
    .from('guests')
    .select('*, events(*)')
    .eq('invite_token', token)
    .single()

  if (guestError) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(guest)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const { status } = await request.json()

  const validStatuses: RsvpStatus[] = ['attending', 'not_attending', 'maybe']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('guests')
    .update({ rsvp_status: status, responded_at: new Date().toISOString() })
    .eq('invite_token', token)
    .select('*, events(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
