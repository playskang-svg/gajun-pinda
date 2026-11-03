import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { ArticleBody, type BodyBlock, headingsOf, minutesOf } from '@/components/ArticleBody'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { BuyButtons } from '@/components/BuyButtons'
import { CoupangBanner } from '@/components/CoupangBanner'
import { JsonLd } from '@/components/JsonLd'
import { ProductGrid } from '@/components/ProductCard'
import { ShareBar } from '@/components/ShareBar'
import { absoluteUrl, getClient, publishedWhere, SITE_URL } from '@/lib/payload'
import { categoryOf, categoryPath, discountPercent, formatDate, formatWon, getProducts, productPath } from '@/lib/products'
import { pageMeta, publisher } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

const getProduct = cache(async (slug: string) => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'products',
    where: { and: [...publishedWhere().and, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
})

const shareTitleOf = (p: { name: string; snsHook?: string | null }) => (p.snsHook ? `${p.name}, ${p.snsHook}` : p.name)

const notes = (items: { id?: string | null; text: string }[] | null | undefined) =>
  items?.length
    ? { '@type': 'ItemList', itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.text })) }
    : undefined

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug)
  if (!product) return {}
  return pageMeta({
    title: `${product.name} 후기 장단점 총정리`,
    shareTitle: shareTitleOf(product),
    description: product.summary,
    path: productPath(product),
    image: product.ogUrl || undefined,
    article: { publishedTime: product.publishedAt, modifiedTime: product.updatedAt, section: categoryOf(product)?.title },
  })
}

export default async function ReviewPage({ params }: Props) {
  const product = await getProduct((await params).slug)
  if (!product) notFound()
  const category = categoryOf(product)
  const others = category ? await getProducts({ categoryId: category.id, excludeId: product.id }) : []
  const url = `${SITE_URL}${productPath(product)}`
  const body = (product.body as BodyBlock[] | null) ?? []
  const sections = headingsOf(body)
  const off = discountPercent(product)

  return (
    <article className="post">
      <JsonLd
        data={{
          '@type': 'Review',
          name: `${product.name} 리뷰`,
          reviewBody: product.summary,
          datePublished: product.publishedAt,
          dateModified: product.updatedAt,
          inLanguage: 'ko-KR',
          url,
          author: publisher,
          publisher,
          positiveNotes: notes(product.pros),
          negativeNotes: notes(product.cons),
          itemReviewed: {
            '@type': 'Product',
            name: product.name,
            brand: { '@type': 'Brand', name: product.brand },
            ...(product.model ? { model: product.model } : {}),
            image: absoluteUrl(product.image),
          },
        }}
      />
      <header className="phero">
        <div className="frame phero__inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={product.name} className="phero__img" fetchPriority="high" height={420} src={product.image} width={420} />
          <div>
            <Breadcrumbs
              items={[
                ...(category ? [{ name: `${category.title} TOP3`, path: categoryPath(category) }] : []),
                { name: product.name, path: productPath(product) },
              ]}
            />
            {category ? (
              <p className="phero__rank">
                쿠팡 {category.title} 판매량 {product.rank}위 · {formatDate(product.verifiedAt)} 기준
              </p>
            ) : null}
            <h1>{product.name}</h1>
            <p className="phero__tagline">{product.tagline}</p>
            <p className="phero__price">
              {off ? <em>{off}%</em> : null} <strong>{formatWon(product.salePrice)}</strong>{' '}
              {product.listPrice && off ? <s>{formatWon(product.listPrice)}</s> : null}
            </p>
            {product.reviewCount ? (
              <p className="phero__meta">
                {product.rating ? `평점 ${product.rating} · ` : ''}구매 후기 {product.reviewCount.toLocaleString('ko-KR')}개
              </p>
            ) : null}
            <BuyButtons product={product} />
            <small className="phero__note">가격은 수시로 바뀌어요. 결제 전에 판매 화면을 확인해 주세요.</small>
          </div>
        </div>
      </header>
      <div className="frame frame--text post__body">
        <aside className="summary">
          <strong>💡 핵심 한 줄 요약</strong>
          <p>{product.summary}</p>
        </aside>
        <div className="proscons">
          {product.pros?.length ? (
            <section className="proscons__pro">
              <strong>후기에서 반복되는 장점</strong>
              <ul>
                {product.pros.map((item) => (
                  <li key={item.id ?? item.text}>{item.text}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {product.cons?.length ? (
            <section className="proscons__con">
              <strong>후기에서 반복되는 아쉬움</strong>
              <ul>
                {product.cons.map((item) => (
                  <li key={item.id ?? item.text}>{item.text}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        {sections.length > 2 ? (
          <aside className="coverage">
            <strong>목차 · 약 {minutesOf(body)}분</strong>
            <ol>
              {sections.map((name, index) => (
                <li key={name}>
                  <a href={`#s${index + 1}`}>{name}</a>
                </li>
              ))}
            </ol>
          </aside>
        ) : null}
        <ArticleBody blocks={body} later={<CoupangBanner slot="default" />} midway={<CoupangBanner slot={category?.slug} />} />
        {product.fitFor?.length ? (
          <section className="fit">
            <h2>이런 분께 맞아요</h2>
            <ul>
              {product.fitFor.map((item) => (
                <li key={item.id ?? item.who}>
                  <strong>{item.who}</strong>
                  <p>{item.why}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {product.skipIf?.length ? (
          <section className="fit fit--skip">
            <h2>이런 분은 다른 모델이 나아요</h2>
            <ul>
              {product.skipIf.map((item) => (
                <li key={item.id ?? item.text}>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {product.lossNote ? (
          <aside className="loss-box">
            <strong>미루면 잃는 것</strong>
            <p>{product.lossNote}</p>
          </aside>
        ) : null}
        <aside className="buy-box">
          <strong className="buy-box__title">{product.name}, 지금 가격 확인하기</strong>
          <BuyButtons product={product} />
        </aside>
        <p className="disclosure">
          이 글은 쿠팡 판매량순 순위, 상품 정보, 공개된 구매 후기에서 반복되는 의견을 모아 AI의 도움을 받아 정리했어요. 운영자가 직접
          써 본 사용기가 아니며 제조사·판매처와 무관해요. <Link href="/about">작성 기준 보기</Link>
          <br />
          구매 버튼과 쿠팡 배너는 제휴 링크라서 구매가 이루어지면 일정액의 수수료를 받을 수 있어요. 가격은 그대로예요.
        </p>
        <ShareBar card text={product.summary} title={shareTitleOf(product)} url={url} />
      </div>
      {others.length ? (
        <section className="section section--tone post__related">
          <div className="frame">
            <h2>{category?.title} 판매량 TOP3 함께 보기</h2>
            <ProductGrid products={others} />
            {category ? (
              <Link className="text-link" href={categoryPath(category)}>
                {category.title} TOP3 비교표 보기
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </article>
  )
}
