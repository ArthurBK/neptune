export const revalidate = 86400

export async function generateStaticParams() {
  return []
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export default async function FashionArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  return (
    <main>
      {/* Article: fashion/{slug} */}
    </main>
  )
}
