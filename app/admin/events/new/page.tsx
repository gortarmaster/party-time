'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    date: '',
    location: '',
    header_image_url: '',
    amazon_wishlist_url: '',
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      const event = await res.json()
      router.push(`/admin/events/${event.id}`)
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-3">
        <Link href="/admin" className="text-stone-400 hover:text-stone-600 text-sm">
          ← Events
        </Link>
        <span className="text-stone-300">/</span>
        <h1 className="text-sm font-medium text-stone-900">New Event</h1>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold text-stone-900 mb-8">Create Event</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Event Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Aaron's Birthday Bash"
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Date & Time *</label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Location *</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="123 Main St, Brooklyn, NY"
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Header Image URL</label>
            <input
              type="url"
              value={form.header_image_url}
              onChange={(e) => set('header_image_url', e.target.value)}
              placeholder="https://…"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Amazon Wishlist URL</label>
            <input
              type="url"
              value={form.amazon_wishlist_url}
              onChange={(e) => set('amazon_wishlist_url', e.target.value)}
              placeholder="https://amazon.com/hz/wishlist/…"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create Event'}
          </button>
        </form>
      </main>
    </div>
  )
}
