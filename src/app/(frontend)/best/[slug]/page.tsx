import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { ArticleBody, type BodyBlock } from '@/components/ArticleBody'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { BuyButtons } from '@/components/BuyButtons'
import { CoupangBanner } from '@/components/CoupangBanner'
import { JsonLd } from '@/components/JsonLd'
import { ProductGrid } from '@/components/ProductCard'
import { ShareBar } from '@/components/ShareBar'
import { absoluteUrl, getClient, SITE_URL } from '@/lib/payload'
import { categoryPath, formatDate, formatWon, getProducts, productPath } from '@/lib/products'
import { pageMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

const getCategory = cache(async (slug: string) => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'categories', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return docs[0] ?? null
})

const titleOf = (c: { title: string; headline?: string | null }) => c.headline || `${c.title} 추천 TOP3 판매량 순위 비교`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory((await params).slug)
  if (!category) return {}
  return pageMeta({
    title: `${category.title} 추천 순위 TOP3 비교 (${new Date().getFullYear()})`,
    shareTitle: titleOf(category),
    description: category.lede,
    path: categoryPath(category),
    image: `/og/best-${category.slug}.jpg`,
  })
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategory((await params).slug)
  if (!category) notFound()
  const products = await getProducts({ categoryId: category.id })
  const body = (category.body as BodyBlock[] | null) ?? []
  const url = `${SITE_URL}${categoryPath(category)}`

  return (
    <article className="post">
      <JsonLd
        data={{
          '@type': 'ItemList',
          name: `${category.title} 판매량 TOP3`,
          itemListElement: products.map((p) => ({
            '@type': 'ListItem',
            position: p.rank,
            url: `${SITE_URL}${productPath(p)}`,
            name: p.name,
            image: absoluteUrl(p.image),
          })),
        }}
      />
      <header className="section page-head">
        <div className="frame">
          <Breadcrumbs items={[{ name: `${category.title} TOP3`, path: categoryPath(category) }]} />
          <h1>{titleOf(category)}</h1>
          <p className="section-lede">{category.lede}</p>
          {category.checkedAt ? <p className="phero__rank">쿠팡 판매량순 · {formatDate(category.checkedAt)} 확인</p> : null}
          <ProductGrid products={products} />
        </div>
      </header>
      {products.length ? (
        <div className="frame frame--text">
          <div className="viz-table">
            <table>
              <thead>
                <tr>
                  <th>순위</th>
                  <th>모델</th>
                  <th>가격</th>
                  <th>한 줄 평</th>
                  <th>구매</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.rank}위</td>
                    <td>
                      <Link href={productPath(p)}>{p.name}</Link>
                    </td>
                    <td>{formatWon(p.salePrice)}</td>
                    <td>{p.tagline}</td>
                    <td>
                      <BuyButtons compact product={p} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      <div className="frame frame--text post__body">
        <ArticleBody blocks={body} later={<CoupangBanner slot="default" />} midway={<CoupangBanner slot={category.slug} />} />
        <p className="disclosure">
          순위는 표시한 날 쿠팡 검색의 판매량순 정렬에서 광고 상품을 뺀 순서예요. 장단점은 공개된 구매 후기에서 반복되는 의견을 모아
          정리했고, 직접 써 본 사용기가 아니에요. 구매 버튼은 제휴 링크라서 일정액의 수수료를 받을 수 있어요.
        </p>
        <ShareBar card text={category.lede} title={titleOf(category)} url={url} />
      </div>
    </article>
  )
}
