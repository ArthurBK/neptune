'use client'

import { useState } from 'react'

export function NewsletterSection() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    setStatus('loading')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
        }),
      })
      if (res.ok) {
        setStatus('success')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      id="newsletter"
      className="sticky top-0 z-[100] h-[calc(100vh-var(--header-height))] min-h-[480px] snap-start overflow-y-auto bg-[#E8E6E3]"
    >
      <div className="max-w-[680px] mx-auto px-6 md:px-12 py-20 md:py-28 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] mb-8">
          Neptune
        </h2>
        <p className="font-serif text-lg md:text-xl text-[#333] leading-relaxed mb-12">
          Twice a year. Because good things shouldn&apos;t be rushed, and the world
          already has enough publications that come out monthly and say nothing.
        </p>
        <p className="font-serif text-lg md:text-xl text-[#333] leading-relaxed mb-12">
          Neptune is a magazine about art, design, architecture and culture — which
          sounds, we admit, exactly like every other magazine about art, design,
          architecture and culture. The difference is this: we actually believe in
          what we&apos;re doing.
        </p>
        <p className="font-serif text-lg md:text-xl text-[#333] leading-relaxed mb-12">
          Each issue is a portrait of people who have chosen to live with intention.
          Not the obvious ones. Not the ones with the most photogenic cement kitchen.
          The ones with something worth saying, who have usually been too busy saying
          it to worry about whether anyone was listening. People stubbornly attached
          to tradition without nostalgia, to nature without sentimentality, to
          identity without performance.
        </p>
        <p className="font-serif text-lg md:text-xl text-[#333] leading-relaxed mb-16">
          Neptune does not tell you how to live. It has more respect for you than
          that.
        </p>

        <p className="font-serif text-base md:text-lg text-[#333] italic mb-10">
          Subscribe to Newsletter
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-8">
          <input
            type="text"
            name="firstName"
            placeholder="Name"
            required
            className="w-full max-w-[300px] bg-transparent border-0 border-b border-[#333] py-3 text-center font-serif text-[#333] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#1A1A1A]"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last name"
            required
            className="w-full max-w-[300px] bg-transparent border-0 border-b border-[#333] py-3 text-center font-serif text-[#333] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#1A1A1A]"
          />
          <input
            type="email"
            name="email"
            placeholder="Your mail"
            required
            className="w-full max-w-[300px] bg-transparent border-0 border-b border-[#333] py-3 text-center font-serif text-[#333] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#1A1A1A]"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="font-serif text-[#333] hover:text-[#1A1A1A] hover:underline underline-offset-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {status === 'loading' ? 'Sending...' : 'Send'}
          </button>
        </form>

        {status === 'success' && (
          <p className="mt-6 font-serif text-[#333] text-sm">
            Thank you for subscribing.
          </p>
        )}
        {status === 'error' && (
          <p className="mt-6 font-serif text-red-600 text-sm">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </section>
  )
}
