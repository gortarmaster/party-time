'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Event } from '@/lib/supabase'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then(setEvents)
      .finally(() => setLoading(false))
  }, [])

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="bg-white/80 backdrop-blur border-b border-[#EDE0D6] px-8 py-5 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-[#3D3530] tracking-wide">Party Time</h1>
        <button onClick={logout} className="text-xs text-[#C4826A] hover:text-[#A6614C] tracking-widest uppercase font-lato">
          Sign out
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[#C4826A] tracking-[0.2em] text-xs uppercase mb-1">Your</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-[#3D3530]">Events</h2>
          </div>
          <Link
            href="/admin/events/new"
            className="px-6 py-2.5 bg-[#C4826A] text-white rounded-full text-xs font-lato tracking-widest uppercase hover:bg-[#A6614C] transition-colors"
          >
            + New Event
          </Link>
        </div>

        {loading ? (
          <p className="text-[#C4A090] text-center py-20 font-[family-name:var(--font-playfair)] italic">Loading…</p>
        ) : events.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-[family-name:var(--font-playfair)] text-2xl text-[#C4A090] italic mb-2">No events yet</p>
            <p className="text-sm text-[#C4A090]">Create your first event to get started</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/admin/events/${event.id}`}
                  className="group flex items-center justify-between bg-white border border-[#EDE0D6] rounded-2xl px-7 py-5 hover:border-[#C4826A] hover:shadow-sm transition-all"
                >
                  <div>
                    <p className="font-[family-name:var(--font-playfair)] text-lg text-[#3D3530] group-hover:text-[#C4826A] transition-colors">
                      {event.name}
                    </p>
                    <p className="text-sm text-[#C4A090] mt-0.5 font-lato font-light">
                      {formatDate(event.date)} · {event.location}
                    </p>
                  </div>
                  <span className="text-[#E8C5B8] group-hover:text-[#C4826A] transition-colors text-lg">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
