export const revalidate = 86400

export async function generateStaticParams() {
  return []
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export default async function ArtsArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  return (
    <main>
      {/* Article: arts/{slug} */}
    </main>
  )
}
