'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

type NewsletterModalContextValue = {
  openModal: () => void
}

const NewsletterModalContext = createContext<NewsletterModalContextValue>({
  openModal: () => {},
})

export function useOpenNewsletterModal() {
  return useContext(NewsletterModalContext).openModal
}

function NewsletterModalInner({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const openModal = useCallback(() => setIsOpen(true), [])
  const closeModal = useCallback(() => setIsOpen(false), [])

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

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, closeModal])

  return (
    <NewsletterModalContext.Provider value={{ openModal }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeModal}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && closeModal()}
          role="presentation"
        >
          <dialog
            open
            className="relative w-full max-w-md bg-[#EBEBEB] p-8 md:p-12 shadow-xl border-0 m-0"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key !== 'Escape' && e.stopPropagation()}
            aria-labelledby="newsletter-modal-title"
          >
            <button
              type="button"
              onClick={closeModal}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') closeModal()
              }}
              className="absolute top-4 right-4 text-2xl font-bold text-black hover:opacity-70 transition-opacity"
              aria-label="Close"
            >
              ×
            </button>

            <h2
              id="newsletter-modal-title"
              className="text-base md:text-lg font-header font-bold text-black tracking-wide text-center"
            >
              Enter your email:
            </h2>

            {status === 'success' ? (
              <p className="mt-6 text-center text-black">
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
                  className="w-full py-3 border-b-2 border-black bg-transparent text-black placeholder:text-black/70 focus:outline-none focus:border-black disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="mt-8 block mx-auto cursor-pointer bg-transparent font-header font-bold text-base tracking-[0.2em] uppercase text-black transition-colors hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
                </button>
              </form>
            )}

            <p className="mt-8 text-xs text-black/80 italic text-center">
              By submitting your email, you agree to our Terms and Privacy Policy.
            </p>
          </dialog>
        </div>
      )}
    </NewsletterModalContext.Provider>
  )
}

export function NewsletterModalProvider({ children }: { children: ReactNode }) {
  return <NewsletterModalInner>{children}</NewsletterModalInner>
}

