export const revalidate = 3600

export default async function ContactPage() {
  return (
    <main>
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-4 md:pt-8 pb-10 md:pb-14">
        <header className="mb-6 md:mb-10 text-center font-futura">
          <h1 className="font-serif font-bold text-3xl md:text-4xl text-[#1A1A1A] uppercase tracking-wide">
            Contact
          </h1>
        </header>

        <section className="max-w-3xl mx-auto text-center space-y-2">
          <p className="text-sm md:text-[15px] text-black whitespace-pre-line font-[Helvetica,Arial,sans-serif]">
            For any inquiries, you may write to{' '}
            <a href="mailto:contact@neptune-papers.com" className="underline underline-offset-2">
              contact@neptune-papers.com
            </a>
            .
          </p>
          <p className="text-sm md:text-[15px] text-black whitespace-pre-line font-[Helvetica,Arial,sans-serif]">
            For advertising opportunities, you may write to{' '}
            <a
              href="mailto:partnerships@kapture-media.com"
              className="underline underline-offset-2"
            >
              partnerships@kapture-media.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
