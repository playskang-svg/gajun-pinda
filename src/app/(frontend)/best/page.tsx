import type { Metadata } from 'next'
import Link from 'next/link'

import { getCategories, getProducts, categoryPath } from '@/lib/products'
import { pageMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMeta({
  title: '가전 카테고리별 판매량 TOP3',
  description: '청소기, 공기청정기, 주방가전, 뷰티가전까지 카테고리별로 가장 많이 팔리는 모델 세 개를 비교했어요.',
  path: '/best',
})

export default async function BestIndex() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()])
  const groups = [...new Set(categories.map((c) => c.group))]
  return (
    <section className="section page-head">
      <div className="frame">
        <h1>카테고리별 판매량 TOP3</h1>
        <p className="section-lede">고르기 어려운 가전, 많이 팔린 세 개부터 비교해 보세요.</p>
        {groups.map((group) => (
          <div className="cat-group" key={group}>
            <h2>{group}</h2>
            <ul className="cat-list">
              {categories
                .filter((c) => c.group === group)
                .map((c) => {
                  const top = products.find((p) => typeof p.category === 'object' && p.category.id === c.id && p.rank === 1)
                  return (
                    <li key={c.id}>
                      <Link href={categoryPath(c)}>
                        {top ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img alt="" height={120} loading="lazy" src={top.image} width={120} />
                        ) : null}
                        <strong>{c.title}</strong>
                        <span>{top ? `1위 ${top.brand}` : '준비 중'}</span>
                      </Link>
                    </li>
                  )
                })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
