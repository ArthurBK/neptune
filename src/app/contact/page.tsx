import { ContactForm } from '@/components/contact/ContactForm'

export const revalidate = 3600

export default async function ContactPage() {
  return (
    <main>
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-4 md:pt-8 pb-10 md:pb-14">
        <header className="mb-6 md:mb-10 text-center font-futura">
          <h1 className="font-futura font-normal text-xl md:text-2xl text-[#1A1A1A] uppercase tracking-wide">
            Contact
          </h1>
        </header>

        <section className="mx-auto max-w-3xl">
          <ContactForm />
        </section>
      </div>
    </main>
  )
}
