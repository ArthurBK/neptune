'use client'

import Link from 'next/link'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

const NEWSLETTER_PROMPT_SEEN_KEY = 'neptune_newsletter_prompt_seen'
const AUTO_OPEN_DELAY_MS = 1500

type NewsletterModalContextValue = {
  openModal: () => void
}

const NewsletterModalContext = createContext<NewsletterModalContextValue>({
  openModal: () => {},
})

export function useOpenNewsletterModal() {
  return useContext(NewsletterModalContext).openModal
}

function NewsletterModalInner({ children, autoOpen }: { children: ReactNode; autoOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const hasOpenedRef = useRef(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const openModal = useCallback(() => {
    hasOpenedRef.current = true
    try {
      window.sessionStorage.setItem(NEWSLETTER_PROMPT_SEEN_KEY, 'true')
    } catch {
      // The in-memory flag still prevents repeats when storage is unavailable.
    }
    setStatus((current) => current === 'loading' ? current : 'idle')
    setMessage('')
    setIsOpen(true)
  }, [])
  const closeModal = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (!autoOpen || isOpen || hasOpenedRef.current) return
    const hasSeenPrompt = () => {
      try {
        return window.sessionStorage.getItem(NEWSLETTER_PROMPT_SEEN_KEY) === 'true'
      } catch {
        return false
      }
    }
    if (hasSeenPrompt()) return
    const timer = window.setTimeout(() => {
      if (hasOpenedRef.current || hasSeenPrompt()) return
      // Do not interrupt a cart or search dialog opened during the delay.
      if (document.querySelector('[role="dialog"][aria-modal="true"], dialog[open]')) return
      openModal()
    }, AUTO_OPEN_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [autoOpen, isOpen, openModal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || status === 'loading') return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStatus('success')
        setMessage(data.message || 'Thank you for subscribing.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Unable to connect. Please try again.')
    }
  }

  useEffect(() => {
    if (!isOpen) return
    const previousFocus = document.activeElement instanceof window.HTMLElement ? document.activeElement : null
    // Focus the close button so mobile browsers do not open the keyboard automatically.
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [isOpen, closeModal])

  return (
    <NewsletterModalContext.Provider value={{ openModal }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={closeModal}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && closeModal()}
          role="presentation"
        >
          <dialog
            ref={dialogRef}
            open
            aria-modal="true"
            className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto bg-[#EBEBEB] p-8 md:p-12 shadow-xl border-0 m-0"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key !== 'Escape') e.stopPropagation()
              if (e.key !== 'Tab') return
              const controls = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]'
              ))
              const first = controls[0]
              const last = controls[controls.length - 1]
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault()
                last?.focus()
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault()
                first?.focus()
              }
            }}
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
              <p role="status" className="mt-6 text-center text-black">
                {message}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  aria-label="Email address"
                  aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={status === 'loading'}
                  className="w-full py-3 border-b-2 border-black bg-transparent text-black placeholder:text-black/70 focus:outline-none focus:border-black disabled:opacity-60"
                />
                {status === 'error' && (
                  <p id="newsletter-error" role="alert" className="mt-4 text-sm text-red-700">
                    {message}
                  </p>
                )}
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
              By submitting your email, you agree to our{' '}
              <Link
                href="/policy"
                onClick={closeModal}
                className="underline underline-offset-2 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Terms and Privacy Policy
              </Link>
              .
            </p>
          </dialog>
        </div>
      )}
    </NewsletterModalContext.Provider>
  )
}

export function NewsletterModalProvider({ children, autoOpen = false }: { children: ReactNode; autoOpen?: boolean }) {
  return <NewsletterModalInner autoOpen={autoOpen}>{children}</NewsletterModalInner>
}

