import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { event_id, guests } = body

  if (!event_id || !Array.isArray(guests) || guests.length === 0) {
    return NextResponse.json({ error: 'event_id and guests array are required' }, { status: 400 })
  }

  const rows = guests.map((g: { name: string; phone: string }) => ({
    event_id,
    name: g.name.trim(),
    phone: g.phone.trim(),
    invite_token: randomUUID(),
    rsvp_status: 'pending',
  }))

  const db = supabaseAdmin()
  const { data, error } = await db.from('guests').insert(rows).select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
