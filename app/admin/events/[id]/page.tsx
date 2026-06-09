'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Event, Guest, RsvpStatus } from '@/lib/supabase'

const STATUS_LABEL: Record<RsvpStatus, string> = {
  pending: 'Pending',
  attending: 'Attending',
  not_attending: 'Not Attending',
  maybe: 'Maybe',
}

const STATUS_COLOR: Record<RsvpStatus, string> = {
  pending: 'bg-stone-100 text-stone-500',
  attending: 'bg-green-100 text-green-700',
  not_attending: 'bg-red-100 text-red-600',
  maybe: 'bg-yellow-100 text-yellow-700',
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

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [guestInput, setGuestInput] = useState('')
  const [addingGuests, setAddingGuests] = useState(false)
  const [sendingInvites, setSendingInvites] = useState(false)
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  async function loadData() {
    const [eventRes, guestsRes] = await Promise.all([
      fetch(`/api/events/${id}`),
      fetch(`/api/events/${id}/guests`),
    ])
    if (eventRes.ok) setEvent(await eventRes.json())
    if (guestsRes.ok) setGuests(await guestsRes.json())
    setLoading(false)
  }

  useEffect(() => { loadData() }, [id])

  function parseGuestInput(raw: string) {
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/[,\t]+/).map((s) => s.trim())
        return { name: parts[0] || '', phone: parts[1] || '' }
      })
      .filter((g) => g.name && g.phone)
  }

  async function addGuests() {
    const parsed = parseGuestInput(guestInput)
    if (!parsed.length) return
    setAddingGuests(true)

    const res = await fetch('/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: id, guests: parsed }),
    })

    if (res.ok) {
      setGuestInput('')
      await loadData()
      setMessage(`Added ${parsed.length} guest${parsed.length > 1 ? 's' : ''}`)
    }
    setAddingGuests(false)
  }

  async function sendInvites() {
    setSendingInvites(true)
    const res = await fetch(`/api/send-invites/${id}`, { method: 'POST' })
    const data = await res.json()
    setMessage(`Sent ${data.sent} invite${data.sent !== 1 ? 's' : ''}`)
    await loadData()
    setSendingInvites(false)
  }

  async function sendReminder(target: string) {
    setSendingReminder(target)
    const res = await fetch(`/api/reminders/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target }),
    })
    const data = await res.json()
    setMessage(`Sent ${data.sent} reminder${data.sent !== 1 ? 's' : ''}`)
    setSendingReminder(null)
  }

  const pending = guests.filter((g) => g.rsvp_status === 'pending')
  const attending = guests.filter((g) => g.rsvp_status === 'attending')
  const notAttending = guests.filter((g) => g.rsvp_status === 'not_attending')
  const maybe = guests.filter((g) => g.rsvp_status === 'maybe')
  const unsent = guests.filter((g) => !g.invite_sent_at)

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-400">Loading…</div>
  if (!event) return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-400">Event not found</div>

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-3">
        <Link href="/admin" className="text-stone-400 hover:text-stone-600 text-sm">
          ← Events
        </Link>
        <span className="text-stone-300">/</span>
        <h1 className="text-sm font-medium text-stone-900 truncate">{event.name}</h1>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        {/* Event info */}
        <section>
          {event.header_image_url && (
            <img
              src={event.header_image_url}
              alt=""
              className="w-full h-48 object-cover rounded-xl mb-5"
            />
          )}
          <h2 className="text-2xl font-semibold text-stone-900">{event.name}</h2>
          <p className="text-stone-500 mt-1">{formatDate(event.date)}</p>
          <p className="text-stone-500">{event.location}</p>
          {event.amazon_wishlist_url && (
            <a
              href={event.amazon_wishlist_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-stone-400 hover:underline mt-1 inline-block"
            >
              Amazon Wishlist ↗
            </a>
          )}
        </section>

        {/* RSVP stats */}
        <section className="grid grid-cols-4 gap-3">
          {[
            { label: 'Attending', count: attending.length, color: 'bg-green-50 text-green-700' },
            { label: 'Maybe', count: maybe.length, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Not Going', count: notAttending.length, color: 'bg-red-50 text-red-600' },
            { label: 'Pending', count: pending.length, color: 'bg-stone-100 text-stone-500' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-xs mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Actions */}
        <section className="flex flex-wrap gap-3">
          <button
            onClick={sendInvites}
            disabled={sendingInvites || unsent.length === 0}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 disabled:opacity-40"
          >
            {sendingInvites ? 'Sending…' : `Send Invites (${unsent.length} unsent)`}
          </button>
          <button
            onClick={() => sendReminder('non_responders')}
            disabled={sendingReminder !== null || pending.length === 0}
            className="px-4 py-2 bg-white border border-stone-300 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-50 disabled:opacity-40"
          >
            {sendingReminder === 'non_responders' ? 'Sending…' : `Remind Non-Responders (${pending.length})`}
          </button>
          <button
            onClick={() => sendReminder('attending')}
            disabled={sendingReminder !== null || attending.length === 0}
            className="px-4 py-2 bg-white border border-stone-300 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-50 disabled:opacity-40"
          >
            {sendingReminder === 'attending' ? 'Sending…' : `Remind Attendees (${attending.length})`}
          </button>
        </section>

        {message && (
          <p className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">{message}</p>
        )}

        {/* Add guests */}
        <section>
          <h3 className="text-lg font-semibold text-stone-900 mb-3">Add Guests</h3>
          <p className="text-xs text-stone-400 mb-2">One per line: Name, Phone Number</p>
          <textarea
            value={guestInput}
            onChange={(e) => setGuestInput(e.target.value)}
            placeholder={"John Smith, +15555550100\nJane Doe, +15555550101"}
            rows={4}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
          <button
            onClick={addGuests}
            disabled={addingGuests || !guestInput.trim()}
            className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 disabled:opacity-40"
          >
            {addingGuests ? 'Adding…' : 'Add Guests'}
          </button>
        </section>

        {/* Guest list */}
        {guests.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-stone-900 mb-3">Guests ({guests.length})</h3>
            <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
              {guests.map((g) => (
                <div key={g.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-medium text-stone-900 text-sm">{g.name}</p>
                    <p className="text-xs text-stone-400">{g.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {g.invite_sent_at && (
                      <span className="text-xs text-stone-400">Invited</span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[g.rsvp_status]}`}>
                      {STATUS_LABEL[g.rsvp_status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
