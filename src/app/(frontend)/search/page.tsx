import type { Metadata } from 'next'

import { ProductGrid } from '@/components/ProductCard'
import { getClient, publishedWhere } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: '가전 검색', robots: { index: false, follow: true } }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const q = ((await searchParams).q ?? '').trim().slice(0, 50)
  const payload = await getClient()
  const results = q
    ? await payload.find({
        collection: 'products',
        where: {
          and: [
            ...publishedWhere().and,
            { or: [{ name: { contains: q } }, { brand: { contains: q } }, { summary: { contains: q } }] },
          ],
        },
        limit: 30,
        depth: 1,
      })
    : null
  return (
    <section className="section page-head">
      <div className="frame">
        <h1>{q ? `‘${q}’ 검색 결과` : '가전 검색'}</h1>
        {results ? <ProductGrid products={results.docs} /> : <p>찾을 상품 이름이나 브랜드를 입력해 주세요.</p>}
      </div>
    </section>
  )
}
