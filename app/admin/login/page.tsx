'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Incorrect password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-[#C4826A] tracking-[0.2em] text-xs uppercase font-lato mb-3">Welcome back</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-[#3D3530] mb-10">Party Time</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3.5 bg-white border border-[#E8C5B8] rounded-full text-[#3D3530] placeholder-[#C4A090] focus:outline-none focus:ring-2 focus:ring-[#C4826A]/30 text-center tracking-widest"
            required
          />
          {error && <p className="text-[#C4826A] text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#C4826A] text-white rounded-full font-lato font-light tracking-widest text-sm uppercase hover:bg-[#A6614C] disabled:opacity-50 transition-colors"
          >
            {loading ? 'One moment…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
