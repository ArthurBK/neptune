"use client"

import { useState, type FormEvent } from "react"

type SubmitStatus = "idle" | "submitting" | "success" | "error"

const fieldClassName =
  "w-full border-0 border-b-2 border-[#E4E4E4] bg-transparent px-0 pb-3 pt-0 font-futura text-[13px] font-normal leading-none tracking-[0.08em] text-[#1A1A1A] outline-none transition placeholder:text-[#8A8A8A] focus:border-[#CFCFCF] disabled:cursor-not-allowed disabled:opacity-60"

export function ContactForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    }

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.message) {
      setStatus("error")
      setError("Please fill in your first name, last name, email address and message.")
      return
    }

    setStatus("submitting")
    setError(null)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = (await response.json().catch(() => ({}))) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? "Your message could not be sent.")
      }

      form.reset()
      setStatus("success")
    } catch (submitError) {
      setStatus("error")
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Your message could not be sent."
      )
    }
  }

  const isSubmitting = status === "submitting"

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl text-left">
      <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
        <input
          id="contact-first-name"
          name="firstName"
          type="text"
          autoComplete="given-name"
          aria-label="First name"
          placeholder="First name *"
          required
          disabled={isSubmitting}
          className={fieldClassName}
        />

        <input
          id="contact-last-name"
          name="lastName"
          type="text"
          autoComplete="family-name"
          aria-label="Last name"
          placeholder="Last name *"
          required
          disabled={isSubmitting}
          className={fieldClassName}
        />

        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          aria-label="Email"
          placeholder="Email *"
          required
          disabled={isSubmitting}
          className={fieldClassName}
        />

        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          aria-label="Phone"
          placeholder="Phone"
          disabled={isSubmitting}
          className={fieldClassName}
        />
      </div>

      <div className="mt-6">
        <label
          htmlFor="contact-subject"
          className="mb-2 block font-futura text-[13px] font-normal leading-none tracking-[0.08em] text-[#8A8A8A]"
        >
          Subject
        </label>
        <select
          id="contact-subject"
          name="subject"
          disabled={isSubmitting}
          defaultValue=""
          className="w-full border-0 border-b-2 border-[#E4E4E4] bg-transparent px-0 pb-2 font-futura text-[13px] font-normal tracking-[0.08em] text-[#1A1A1A] outline-none transition focus:border-[#CFCFCF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="" disabled>
            Choose subject
          </option>
          <option value="General enquiry">General enquiry</option>
          <option value="Editorial">Editorial</option>
          <option value="Advertising">Advertising</option>
          <option value="Contributors">Contributors</option>
        </select>
      </div>

      <div className="mt-12">
        <textarea
          id="contact-message"
          name="message"
          rows={2}
          aria-label="Message"
          placeholder="Message *"
          required
          disabled={isSubmitting}
          className={`${fieldClassName} min-h-14 resize-y leading-tight`}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 flex w-full items-center justify-center px-6 py-2.5 font-futura text-sm font-normal tracking-[0.2em] uppercase text-[#1A1A1A] transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Send"}
      </button>

      <div
        aria-live="polite"
        className="mt-3 min-h-5 text-center font-futura text-xs tracking-[0.05em] text-[#1A1A1A]"
      >
        {status === "success" ? "Thank you. Your message has been sent." : null}
        {status === "error" && error ? error : null}
      </div>
    </form>
  )
}
