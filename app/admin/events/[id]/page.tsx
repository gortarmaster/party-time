'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Event, Guest, RsvpStatus } from '@/lib/supabase'

function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    const url = `${window.location.origin}/rsvp/${token}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="text-xs text-[#C4A090] hover:text-[#C4826A] transition-colors font-lato"
      title="Copy RSVP link"
    >
      {copied ? '✓ Copied' : 'Copy link'}
    </button>
  )
}

const STATUS_LABEL: Record<RsvpStatus, string> = {
  pending: 'Pending',
  attending: 'Attending',
  not_attending: 'Not Going',
  maybe: 'Maybe',
}

const STATUS_COLOR: Record<RsvpStatus, string> = {
  pending: 'bg-[#F5F0EB] text-[#C4A090]',
  attending: 'bg-[#EAF2EA] text-[#5A8C5A]',
  not_attending: 'bg-[#FBF0EE] text-[#C4826A]',
  maybe: 'bg-[#FBF6EE] text-[#C49A4A]',
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

  if (loading) return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <p className="font-[family-name:var(--font-playfair)] text-[#C4A090] italic">Loading…</p>
    </div>
  )
  if (!event) return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <p className="text-[#C4A090]">Event not found</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="bg-white/80 backdrop-blur border-b border-[#EDE0D6] px-8 py-5 flex items-center gap-3">
        <Link href="/admin" className="text-[#C4A090] hover:text-[#C4826A] text-sm font-lato transition-colors">
          ← Events
        </Link>
        <span className="text-[#EDE0D6]">/</span>
        <span className="text-sm text-[#3D3530] font-lato truncate">{event.name}</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-12">

        {/* Event header */}
        <section>
          {event.header_image_url && (
            <img
              src={event.header_image_url}
              alt=""
              className="w-full h-52 object-cover rounded-2xl mb-6"
            />
          )}
          <p className="text-[#C4826A] tracking-[0.2em] text-xs uppercase mb-1">{event.location}</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-[#3D3530]">{event.name}</h2>
          <p className="text-[#C4A090] font-lato font-light mt-1">{formatDate(event.date)}</p>
          {event.amazon_wishlist_url && (
            <a
              href={event.amazon_wishlist_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#C4826A] hover:text-[#A6614C] tracking-widest uppercase mt-3 inline-block underline underline-offset-4"
            >
              View Wishlist →
            </a>
          )}
        </section>

        {/* RSVP stats */}
        <section className="grid grid-cols-4 gap-3">
          {[
            { label: 'Attending', count: attending.length, bg: 'bg-[#EAF2EA]', text: 'text-[#5A8C5A]' },
            { label: 'Maybe', count: maybe.length, bg: 'bg-[#FBF6EE]', text: 'text-[#C49A4A]' },
            { label: 'Not Going', count: notAttending.length, bg: 'bg-[#FBF0EE]', text: 'text-[#C4826A]' },
            { label: 'Pending', count: pending.length, bg: 'bg-[#F5F0EB]', text: 'text-[#C4A090]' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-4 text-center ${s.bg}`}>
              <p className={`text-3xl font-[family-name:var(--font-playfair)] ${s.text}`}>{s.count}</p>
              <p className={`text-xs mt-1 font-lato tracking-wide ${s.text}`}>{s.label}</p>
            </div>
          ))}
        </section>

        {/* Actions */}
        <section className="flex flex-wrap gap-3">
          <button
            onClick={sendInvites}
            disabled={sendingInvites || unsent.length === 0}
            className="px-5 py-2.5 bg-[#C4826A] text-white rounded-full text-xs font-lato tracking-widest uppercase hover:bg-[#A6614C] disabled:opacity-40 transition-colors"
          >
            {sendingInvites ? 'Sending…' : `Send Invites (${unsent.length} unsent)`}
          </button>
          <button
            onClick={() => sendReminder('non_responders')}
            disabled={sendingReminder !== null || pending.length === 0}
            className="px-5 py-2.5 bg-white border border-[#EDE0D6] text-[#6B6560] rounded-full text-xs font-lato tracking-widest uppercase hover:border-[#C4826A] hover:text-[#C4826A] disabled:opacity-40 transition-colors"
          >
            {sendingReminder === 'non_responders' ? 'Sending…' : `Nudge Non-Responders (${pending.length})`}
          </button>
          <button
            onClick={() => sendReminder('attending')}
            disabled={sendingReminder !== null || attending.length === 0}
            className="px-5 py-2.5 bg-white border border-[#EDE0D6] text-[#6B6560] rounded-full text-xs font-lato tracking-widest uppercase hover:border-[#C4826A] hover:text-[#C4826A] disabled:opacity-40 transition-colors"
          >
            {sendingReminder === 'attending' ? 'Sending…' : `Remind Attendees (${attending.length})`}
          </button>
        </section>

        {message && (
          <p className="text-sm text-[#5A8C5A] bg-[#EAF2EA] px-5 py-3 rounded-xl font-lato">{message}</p>
        )}

        {/* Add guests */}
        <section>
          <p className="text-[#C4826A] tracking-[0.2em] text-xs uppercase mb-2">Add Guests</p>
          <p className="text-xs text-[#C4A090] mb-3 font-lato">One per line — Name, Phone Number</p>
          <textarea
            value={guestInput}
            onChange={(e) => setGuestInput(e.target.value)}
            placeholder={"Sarah Johnson, +15555550100\nEmily Davis, +15555550101"}
            rows={4}
            className="w-full px-5 py-4 bg-white border border-[#EDE0D6] rounded-2xl text-[#3D3530] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C4826A]/20 focus:border-[#C4826A] transition-colors resize-none"
          />
          <button
            onClick={addGuests}
            disabled={addingGuests || !guestInput.trim()}
            className="mt-3 px-6 py-2.5 bg-[#C4826A] text-white rounded-full text-xs font-lato tracking-widest uppercase hover:bg-[#A6614C] disabled:opacity-40 transition-colors"
          >
            {addingGuests ? 'Adding…' : 'Add Guests'}
          </button>
        </section>

        {/* Guest list */}
        {guests.length > 0 && (
          <section>
            <p className="text-[#C4826A] tracking-[0.2em] text-xs uppercase mb-4">
              Guest List <span className="text-[#C4A090]">({guests.length})</span>
            </p>
            <div className="bg-white border border-[#EDE0D6] rounded-2xl divide-y divide-[#F5EFE9]">
              {guests.map((g) => (
                <div key={g.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-[family-name:var(--font-playfair)] text-[#3D3530]">{g.name}</p>
                    <p className="text-xs text-[#C4A090] font-lato mt-0.5">{g.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {g.invite_sent_at && (
                      <span className="text-xs text-[#C4A090] font-lato">Invited</span>
                    )}
                    <span className={`text-xs px-3 py-1 rounded-full font-lato ${STATUS_COLOR[g.rsvp_status]}`}>
                      {STATUS_LABEL[g.rsvp_status]}
                    </span>
                    <CopyLinkButton token={g.invite_token} />
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
