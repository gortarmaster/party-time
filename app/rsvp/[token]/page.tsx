'use client'

import { use, useEffect, useState } from 'react'
import type { RsvpStatus } from '@/lib/supabase'

interface RsvpData {
  id: string
  name: string
  rsvp_status: RsvpStatus
  events: {
    name: string
    date: string
    location: string
    header_image_url: string | null
    amazon_wishlist_url: string | null
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function RsvpPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [data, setData] = useState<RsvpData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<RsvpStatus | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/rsvp/${token}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then((d) => {
        if (d) {
          setData(d)
          if (d.rsvp_status !== 'pending') setConfirmed(d.rsvp_status)
        }
      })
      .finally(() => setLoading(false))
  }, [token])

  async function rsvp(status: RsvpStatus) {
    setSubmitting(true)
    const res = await fetch(`/api/rsvp/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setData(updated)
      setConfirmed(status)
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <p className="font-[family-name:var(--font-playfair)] text-[#C4A090] italic">One moment…</p>
      </div>
    )
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-[family-name:var(--font-playfair)] text-2xl text-[#C4A090] italic mb-2">Invite not found</p>
          <p className="text-sm text-[#C4A090] font-lato font-light">This link may be invalid or expired.</p>
        </div>
      </div>
    )
  }

  const event = data.events

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header image */}
      {event.header_image_url ? (
        <div className="w-full h-64 sm:h-80 overflow-hidden">
          <img src={event.header_image_url} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-32 bg-gradient-to-b from-[#EDE0D6] to-[#FAF7F2]" />
      )}

      <div className="max-w-md mx-auto px-6 py-10">
        {confirmed ? (
          <div className="text-center py-6">
            <p className="text-5xl mb-6">
              {confirmed === 'attending' ? '🌸' : confirmed === 'maybe' ? '🌿' : '💌'}
            </p>
            <p className="text-[#C4826A] tracking-[0.2em] text-xs uppercase mb-2 font-lato">
              {confirmed === 'attending' ? "You're on the list" : confirmed === 'maybe' ? 'We hope to see you' : 'We understand'}
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#3D3530] mb-4">
              {confirmed === 'attending'
                ? "See you there!"
                : confirmed === 'maybe'
                ? "Fingers crossed!"
                : "Thank you for letting us know"}
            </h1>
            <p className="text-[#C4A090] font-lato font-light mb-1">{event.name}</p>
            <p className="text-[#C4A090] font-lato font-light text-sm">{formatDate(event.date)}</p>
            <p className="text-[#C4A090] font-lato font-light text-sm mb-8">{event.location}</p>

            {event.amazon_wishlist_url && confirmed === 'attending' && (
              <a
                href={event.amazon_wishlist_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3.5 bg-[#C4826A] text-white rounded-full font-lato font-light tracking-widest text-sm uppercase hover:bg-[#A6614C] transition-colors"
              >
                View the Wishlist 🎁
              </a>
            )}

            <button
              onClick={() => setConfirmed(null)}
              className="block mx-auto mt-6 text-xs text-[#C4A090] hover:text-[#C4826A] tracking-widest uppercase underline underline-offset-4 transition-colors"
            >
              Change my response
            </button>
          </div>
        ) : (
          <div>
            <p className="text-[#C4826A] tracking-[0.2em] text-xs uppercase mb-2 font-lato">You're invited</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-[#3D3530] mb-3 leading-tight">
              {event.name}
            </h1>
            <p className="text-[#6B6560] font-lato font-light mb-1">{formatDate(event.date)}</p>
            <p className="text-[#C4A090] font-lato font-light text-sm mb-10">{event.location}</p>

            <p className="font-[family-name:var(--font-playfair)] text-lg text-[#3D3530] mb-8 italic">
              Will you be joining us, {data.name}?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => rsvp('attending')}
                disabled={submitting}
                className="w-full py-4 bg-[#C4826A] text-white rounded-full font-lato font-light tracking-widest text-sm uppercase hover:bg-[#A6614C] disabled:opacity-50 transition-colors"
              >
                Joyfully Accepts
              </button>
              <button
                onClick={() => rsvp('maybe')}
                disabled={submitting}
                className="w-full py-4 bg-white border border-[#EDE0D6] text-[#6B6560] rounded-full font-lato font-light tracking-widest text-sm uppercase hover:border-[#C4826A] hover:text-[#C4826A] disabled:opacity-50 transition-colors"
              >
                Maybe
              </button>
              <button
                onClick={() => rsvp('not_attending')}
                disabled={submitting}
                className="w-full py-4 text-[#C4A090] rounded-full font-lato font-light tracking-widest text-sm uppercase hover:text-[#C4826A] disabled:opacity-50 transition-colors"
              >
                Regretfully Declines
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
