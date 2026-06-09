import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, date, end_time, location, header_image_url, amazon_wishlist_url } = body

  if (!name || !date || !location) {
    return NextResponse.json({ error: 'name, date, and location are required' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('events')
    .insert({ name, date, end_time: end_time || null, location, header_image_url: header_image_url || null, amazon_wishlist_url: amazon_wishlist_url || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
