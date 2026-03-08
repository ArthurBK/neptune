'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80'

interface NewsletterPageContentProps {
  headline?: string | null
  subtitle?: string | null
  imageUrl: string | null
}

export function NewsletterPageContent({
  headline,
  subtitle,
  imageUrl,
}: NewsletterPageContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const introText =
    subtitle ??
    'Sign up to the Neptune newsletters for an exclusive access to great interiors and great conversations.'

  useEffect(() => {
    if (!isModalOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isModalOpen])

  return (
    <main className="relative min-h-[calc(100vh-var(--header-height))] flex flex-col">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl ?? DEFAULT_IMAGE}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content overlay */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-16 md:py-24 text-center">
        <h1 className="font-serif text-4xl md:text-6xl text-white max-w-2xl [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">
          {headline ?? 'Newsletters'}
        </h1>
        <p className="mt-6 text-base md:text-lg text-white/95 max-w-xl [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
          {introText}
        </p>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="mt-8 px-8 py-3 text-sm tracking-[0.2em] uppercase border-2 border-[var(--neptune-red)] text-[var(--neptune-red)] hover:bg-[var(--neptune-red)] hover:text-white transition-colors"
        >
          Subscribe
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setIsModalOpen(false)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsModalOpen(false)}
          role="presentation"
        >
          <dialog
            open
            className="relative w-full max-w-md bg-[#F5F5F0] p-8 md:p-12 shadow-xl border-0 m-0"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key !== 'Escape' && e.stopPropagation()}
            aria-labelledby="newsletter-modal-title"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setIsModalOpen(false)
              }}
              className="absolute top-4 right-4 text-2xl font-bold text-[#1A1A1A] hover:opacity-70 transition-opacity"
              aria-label="Close"
            >
              ×
            </button>

            <h2
              id="newsletter-modal-title"
              className="text-xl md:text-2xl font-serif text-[#1A1A1A] uppercase tracking-wide text-center"
            >
              Enter your email address
            </h2>

            {status === 'success' ? (
              <p className="mt-6 text-center text-[#1A1A1A]">
                Thank you for subscribing.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={status === 'loading'}
                  className="w-full py-3 border-b-2 border-[#1A1A1A] bg-transparent text-[#1A1A1A] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[var(--neptune-red)] disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="mt-8 w-full py-3 text-sm tracking-[0.2em] uppercase border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors disabled:opacity-60"
                >
                  {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
                </button>
              </form>
            )}

            <p className="mt-8 text-xs text-[#6B6B6B] italic text-center">
              By submitting your email, you agree to our Terms and Privacy Policy.
            </p>
          </dialog>
        </div>
      )}
    </main>
  )
}
