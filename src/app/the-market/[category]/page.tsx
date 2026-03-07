export const revalidate = 3600

export async function generateStaticParams() {
  return []
}

interface TheMarketCategoryPageProps {
  params: Promise<{ category: string }>
}

export default async function TheMarketCategoryPage({
  params,
}: TheMarketCategoryPageProps) {
  const { category } = await params
  return (
    <main>
      {/* Affiliate products: the-market/{category} */}
    </main>
  )
}
