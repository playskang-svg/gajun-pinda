import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLd } from '@/components/JsonLd'
import { ProductGrid } from '@/components/ProductCard'
import { getClient, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/payload'
import { categoryPath, getCategories, getProducts } from '@/lib/products'
import { pageMeta, publisher } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  ...pageMeta({
    title: SITE_TITLE,
    shareTitle: '가전은 많이 팔린 세 개만 비교해도 실패가 줄어요',
    description: SITE_DESCRIPTION,
    path: '/',
  }),
  title: { absolute: SITE_TITLE },
}

export default async function HomePage() {
  await getClient()
  const [categories, products] = await Promise.all([getCategories(), getProducts()])
  const byCategory = categories
    .map((c) => ({ c, items: products.filter((p) => typeof p.category === 'object' && p.category.id === c.id) }))
    .filter((row) => row.items.length)

  return (
    <>
      <JsonLd
        data={{ '@type': 'WebSite', name: SITE_NAME, alternateName: 'gajun.pinda.kr', url: SITE_URL, inLanguage: 'ko-KR', description: SITE_DESCRIPTION, publisher }}
      />
      <section className="hero">
        <div className="frame">
          <p className="eyebrow">쿠팡 판매량순 TOP3 · 구매 후기 분석</p>
          <h1>가전은 많이 팔린 세 개만 비교해도 실패가 줄어요</h1>
          <p className="hero__lede">
            카테고리마다 가장 많이 팔리는 세 모델을 골라, 구매 후기에서 되풀이되는 장점과 아쉬움, 비슷한 다른 회사 모델과의 차이를 정리했어요.
          </p>
          <nav aria-label="카테고리 바로가기" className="chips">
            {byCategory.map(({ c }) => (
              <Link href={categoryPath(c)} key={c.id}>
                {c.title}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      {byCategory.map(({ c, items }) => (
        <section className="section" id={c.slug} key={c.id}>
          <div className="frame">
            <div className="section-head">
              <h2>{c.title} TOP3</h2>
              <Link className="text-link" href={categoryPath(c)}>
                비교표 보기
              </Link>
            </div>
            <ProductGrid products={items} />
          </div>
        </section>
      ))}
    </>
  )
}
