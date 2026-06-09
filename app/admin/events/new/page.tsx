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

  const inputClass = "w-full px-5 py-3.5 bg-white border border-[#EDE0D6] rounded-xl text-[#3D3530] placeholder-[#C4A090] focus:outline-none focus:ring-2 focus:ring-[#C4826A]/20 focus:border-[#C4826A] transition-colors font-lato font-light"
  const labelClass = "block text-xs font-lato tracking-widest uppercase text-[#C4826A] mb-2"

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="bg-white/80 backdrop-blur border-b border-[#EDE0D6] px-8 py-5 flex items-center gap-3">
        <Link href="/admin" className="text-[#C4A090] hover:text-[#C4826A] text-sm font-lato transition-colors">
          ← Events
        </Link>
        <span className="text-[#EDE0D6]">/</span>
        <span className="text-sm text-[#3D3530] font-lato">New Event</span>
      </header>

      <main className="max-w-lg mx-auto px-6 py-14">
        <p className="text-[#C4826A] tracking-[0.2em] text-xs uppercase mb-2">Plan something beautiful</p>
        <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-[#3D3530] mb-10">New Event</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={labelClass}>Event Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Emma's Baby Shower"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Date & Time *</label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Location *</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="The Garden at Rosewood Estate"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Header Image URL</label>
            <input
              type="url"
              value={form.header_image_url}
              onChange={(e) => set('header_image_url', e.target.value)}
              placeholder="https://…"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Amazon Wishlist URL</label>
            <input
              type="url"
              value={form.amazon_wishlist_url}
              onChange={(e) => set('amazon_wishlist_url', e.target.value)}
              placeholder="https://amazon.com/hz/wishlist/…"
              className={inputClass}
            />
          </div>

          {error && <p className="text-[#C4826A] text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#C4826A] text-white rounded-full font-lato font-light tracking-widest text-sm uppercase hover:bg-[#A6614C] disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? 'Creating…' : 'Create Event'}
          </button>
        </form>
      </main>
    </div>
  )
}
