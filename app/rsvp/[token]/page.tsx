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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400">Loading…</p>
      </div>
    )
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-2xl">🤔</p>
          <p className="text-stone-600 mt-2">This invite link doesn't seem right.</p>
        </div>
      </div>
    )
  }

  const event = data.events

  return (
    <div className="min-h-screen bg-stone-50">
      {event.header_image_url && (
        <div className="w-full h-56 sm:h-72 overflow-hidden">
          <img src={event.header_image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-lg mx-auto px-6 py-10">
        {confirmed ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-4">
              {confirmed === 'attending' ? '🎉' : confirmed === 'maybe' ? '🤷' : '💌'}
            </p>
            <h1 className="text-2xl font-semibold text-stone-900 mb-2">
              {confirmed === 'attending'
                ? "You're in!"
                : confirmed === 'maybe'
                ? 'Got it — maybe!'
                : "Thanks for letting us know"}
            </h1>
            <p className="text-stone-500 mb-1">
              {confirmed === 'attending'
                ? `We can't wait to see you at ${event.name}.`
                : confirmed === 'maybe'
                ? `We hope you can make it to ${event.name}.`
                : `Sorry you can't make it to ${event.name}.`}
            </p>
            <p className="text-stone-400 text-sm mb-8">
              {formatDate(event.date)} · {event.location}
            </p>

            {event.amazon_wishlist_url && confirmed === 'attending' && (
              <a
                href={event.amazon_wishlist_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800"
              >
                View Wishlist 🎁
              </a>
            )}

            <button
              onClick={() => setConfirmed(null)}
              className="block mx-auto mt-4 text-sm text-stone-400 hover:text-stone-600 underline"
            >
              Change my response
            </button>
          </div>
        ) : (
          <div>
            <p className="text-stone-400 text-sm font-medium mb-1 uppercase tracking-wide">You're invited</p>
            <h1 className="text-3xl font-semibold text-stone-900 mb-2">{event.name}</h1>
            <p className="text-stone-600 mb-1">{formatDate(event.date)}</p>
            <p className="text-stone-500 mb-8">{event.location}</p>

            <p className="text-stone-700 mb-5">Hey {data.name}, will you be joining us?</p>

            <div className="space-y-3">
              <button
                onClick={() => rsvp('attending')}
                disabled={submitting}
                className="w-full py-4 bg-stone-900 text-white rounded-2xl text-lg font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors"
              >
                Yes, I'll be there 🎉
              </button>
              <button
                onClick={() => rsvp('maybe')}
                disabled={submitting}
                className="w-full py-4 bg-white border border-stone-300 text-stone-700 rounded-2xl text-lg font-medium hover:bg-stone-50 disabled:opacity-50 transition-colors"
              >
                Maybe
              </button>
              <button
                onClick={() => rsvp('not_attending')}
                disabled={submitting}
                className="w-full py-4 text-stone-400 rounded-2xl text-base font-medium hover:text-stone-600 transition-colors"
              >
                Can't make it
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
