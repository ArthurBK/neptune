export const revalidate = 3600

export default async function PolicyPage() {
  return (
    <main>
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-4 md:pt-8 pb-10 md:pb-14">
        <header className="mb-6 md:mb-10 text-center font-futura">
          <h1 className="font-serif font-bold text-3xl md:text-4xl text-[#1A1A1A] uppercase tracking-wide">
            Policy
          </h1>
        </header>

        <section className="max-w-3xl mx-auto text-left space-y-6">
          <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
            <strong>Effective date:</strong> March 24, 2026
          </p>

          <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
            Neptune Papers (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy. This Policy explains
            what information we collect, how we use it, and the choices available to you when you
            use our website.
          </p>

          <div className="space-y-2">
            <h2 className="font-futura font-medium text-[13px] tracking-widest uppercase text-black">
              Information We Collect
            </h2>
            <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
              We may collect information you provide directly (such as your email address when you
              subscribe to newsletters or contact us), and limited technical data collected
              automatically (such as browser type, pages visited, and approximate location based on
              IP address).
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-futura font-medium text-[13px] tracking-widest uppercase text-black">
              How We Use Information
            </h2>
            <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
              We use information to operate and improve the site, send newsletters you request,
              respond to inquiries, understand audience engagement, and protect the security of our
              services.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-futura font-medium text-[13px] tracking-widest uppercase text-black">
              Sharing And Disclosure
            </h2>
            <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
              We do not sell your personal information. We may share limited data with trusted
              service providers that help us run the website (for example, hosting, analytics, and
              email delivery), or when required by law.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-futura font-medium text-[13px] tracking-widest uppercase text-black">
              Data Retention
            </h2>
            <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
              We retain personal information only as long as necessary for the purposes described in
              this Policy, unless a longer retention period is required by law.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-futura font-medium text-[13px] tracking-widest uppercase text-black">
              Your Rights
            </h2>
            <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
              Depending on your location, you may have rights to request access, correction,
              deletion, or restriction of your personal information, and to object to certain
              processing activities.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-futura font-medium text-[13px] tracking-widest uppercase text-black">
              Contact
            </h2>
            <p className="text-sm md:text-[15px] text-black leading-relaxed font-[Helvetica,Arial,sans-serif]">
              For any privacy or policy-related questions, contact{' '}
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
