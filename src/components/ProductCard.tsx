import Link from 'next/link'

import { BuyButtons } from '@/components/BuyButtons'
import { discountPercent, formatWon, productPath } from '@/lib/products'
import type { Product } from '@/payload-types'

export function ProductCard({ product }: { product: Product }) {
  const off = discountPercent(product)
  return (
    <li className="pcard">
      <Link className="pcard__link" href={productPath(product)}>
        <span className="pcard__rank">{product.rank}위</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={product.name} height={300} loading="lazy" src={product.image} width={300} />
        <strong className="pcard__name">{product.name}</strong>
        <span className="pcard__tag">{product.tagline}</span>
        <span className="pcard__price">
          {off ? <em>{off}%</em> : null} {formatWon(product.salePrice)}
          {product.reviewCount ? <small> · 후기 {product.reviewCount.toLocaleString('ko-KR')}개</small> : null}
        </span>
      </Link>
      <BuyButtons compact product={product} />
    </li>
  )
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="pgrid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ul>
  )
}
