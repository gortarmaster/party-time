'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// Converts "3:00 PM" → "15:00" for Date parsing
function to24h(time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return time // already 24h or unrecognized, pass through
  let hours = parseInt(match[1])
  const minutes = match[2]
  const meridiem = match[3].toUpperCase()
  if (meridiem === 'AM' && hours === 12) hours = 0
  if (meridiem === 'PM' && hours !== 12) hours += 12
  return `${String(hours).padStart(2, '0')}:${minutes}`
}

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    header_image_url: '',
    amazon_wishlist_url: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImagePreview(URL.createObjectURL(file))
    setUploading(true)
    setError('')

    const fd = new FormData()
    fd.append('file', file)

    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()

    if (res.ok) {
      set('header_image_url', data.url)
    } else {
      setError(data.error || 'Image upload failed')
      setImagePreview(null)
    }
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (uploading) return
    setLoading(true)
    setError('')

    // Combine date + start_time into an ISO timestamp
    const date = form.start_time
      ? new Date(`${form.date}T${to24h(form.start_time)}`).toISOString()
      : new Date(form.date).toISOString()

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, date, end_time: form.end_time || null }),
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
            <label className={labelClass}>Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Time *</label>
              <input
                type="text"
                value={form.start_time}
                onChange={(e) => set('start_time', e.target.value)}
                placeholder="3:00 PM"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Time</label>
              <input
                type="text"
                value={form.end_time}
                onChange={(e) => set('end_time', e.target.value)}
                placeholder="6:00 PM"
                className={inputClass}
              />
            </div>
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

          {/* Header image upload */}
          <div>
            <label className={labelClass}>Header Image</label>
            <p className="text-xs text-[#C4A090] font-lato mb-3">
              Best at <span className="text-[#C4826A]">1600 × 600 px</span> (landscape, 8:3 ratio) —
              at least 1200 px wide. JPEG or PNG.
            </p>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Header preview"
                  className="w-full h-40 object-cover rounded-2xl"
                />
                <div className="absolute inset-0 rounded-2xl bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="px-4 py-2 bg-white text-[#3D3530] rounded-full text-xs font-lato tracking-widest uppercase"
                  >
                    {uploading ? 'Uploading…' : 'Change'}
                  </button>
                </div>
                {uploading && (
                  <div className="absolute inset-0 rounded-2xl bg-white/60 flex items-center justify-center">
                    <p className="text-xs text-[#C4826A] font-lato tracking-widest uppercase">Uploading…</p>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-[#EDE0D6] rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#C4826A] hover:bg-white transition-colors group"
              >
                <span className="text-2xl">🌸</span>
                <span className="text-xs text-[#C4A090] group-hover:text-[#C4826A] font-lato tracking-widest uppercase transition-colors">
                  Upload Photo
                </span>
              </button>
            )}
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

          {error && <p className="text-[#C4826A] text-sm font-lato">{error}</p>}

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full py-4 bg-[#C4826A] text-white rounded-full font-lato font-light tracking-widest text-sm uppercase hover:bg-[#A6614C] disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? 'Creating…' : uploading ? 'Waiting for upload…' : 'Create Event'}
          </button>
        </form>
      </main>
    </div>
  )
}
