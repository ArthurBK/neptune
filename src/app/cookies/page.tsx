export const revalidate = 3600

export default async function CookiesPage() {
  return (
    <main>
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-4 md:pt-8 pb-10 md:pb-14">
        <header className="mb-6 md:mb-10 text-center font-futura">
          <h1 className="font-futura font-normal text-xl md:text-2xl text-[#1A1A1A] uppercase tracking-wide">
            Cookies
          </h1>
        </header>

        <section className="max-w-3xl mx-auto text-left space-y-6">
          <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
            <strong>Effective date:</strong> March 24, 2026
          </p>

          <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
            This Cookies Policy explains how Neptune Papers (&quot;we&quot;, &quot;our&quot;, or
            &quot;us&quot;) uses cookies and similar technologies when you visit our website.
          </p>

          <div className="space-y-2">
            <h2 className="font-futura font-medium text-[13px] tracking-widest uppercase text-black">
              What Are Cookies
            </h2>
            <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
              Cookies are small text files placed on your device that help websites function,
              remember preferences, and understand how visitors use content.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-futura font-medium text-[13px] tracking-widest uppercase text-black">
              Types Of Cookies We Use
            </h2>
            <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
              We may use essential cookies (required for site functionality), analytics cookies (to
              understand traffic and improve performance), and preference cookies (to remember your
              settings where applicable).
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-futura font-medium text-[13px] tracking-widest uppercase text-black">
              How We Use Cookies
            </h2>
            <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
              Cookies help us keep the site secure, provide core features, measure engagement, and
              improve editorial and user experience decisions.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-futura font-medium text-[13px] tracking-widest uppercase text-black">
              Third-Party Cookies
            </h2>
            <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
              Some cookies may be set by trusted third-party services we use for analytics,
              embedded content, or website operations. These providers are responsible for their own
              cookie and privacy practices.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-futura font-medium text-[13px] tracking-widest uppercase text-black">
              Managing Cookies
            </h2>
            <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
              You can control and delete cookies through your browser settings. Please note that
              disabling certain cookies may affect how parts of the website function.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-futura font-medium text-[13px] tracking-widest uppercase text-black">
              Contact
            </h2>
            <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
              For any cookie-related questions, contact{' '}
              <a href="mailto:contact@neptune-papers.com" className="underline underline-offset-2">
                contact@neptune-papers.com
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
