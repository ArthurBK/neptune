export const revalidate = 86400

export async function generateStaticParams() {
  return []
}

interface ContributorPageProps {
  params: Promise<{ slug: string }>
}

export default async function ContributorPage({ params }: ContributorPageProps) {
  const { slug } = await params
  return (
    <main>
      {/* Contributor: contributors/{slug} */}
    </main>
  )
}
