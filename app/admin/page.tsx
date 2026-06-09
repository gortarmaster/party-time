'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Event } from '@/lib/supabase'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
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
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-900">Party Time</h1>
        <button onClick={logout} className="text-sm text-stone-500 hover:text-stone-700">
          Sign out
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-stone-900">Events</h2>
          <Link
            href="/admin/events/new"
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800"
          >
            + New Event
          </Link>
        </div>

        {loading ? (
          <p className="text-stone-400">Loading…</p>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <p className="text-lg">No events yet.</p>
            <p className="text-sm mt-1">Create your first event to get started.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/admin/events/${event.id}`}
                  className="block bg-white border border-stone-200 rounded-xl px-6 py-4 hover:border-stone-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-900">{event.name}</p>
                      <p className="text-sm text-stone-500 mt-0.5">
                        {formatDate(event.date)} · {event.location}
                      </p>
                    </div>
                    <span className="text-stone-400">→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
