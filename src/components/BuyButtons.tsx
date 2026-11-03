import type { Product } from '@/payload-types'

// Coupang (psa1226, AF8819972) and Naver Brand Connect (stillsk) links only. No affiliate code, no button.
export function BuyButtons({
  product,
  compact = false,
}: {
  product: Pick<Product, 'name' | 'coupangUrl' | 'naverUrl'>
  compact?: boolean
}) {
  const stores = [
    { name: '쿠팡', label: compact ? '쿠팡 가격' : '쿠팡에서 가격 보기', href: product.coupangUrl, cls: 'button--coupang' },
    { name: '네이버', label: compact ? '네이버 가격' : '네이버에서 가격 보기', href: product.naverUrl, cls: 'button--naver' },
  ].filter((store) => store.href)
  if (!stores.length) return <small className="buy-pending">구매 링크를 준비하고 있어요.</small>
  return (
    <div className={compact ? 'buy-buttons buy-buttons--compact' : 'buy-buttons'}>
      {stores.map((store) => (
        <a
          aria-label={`${product.name} ${store.name}에서 보기`}
          className={`button ${store.cls}`}
          href={store.href ?? undefined}
          key={store.name}
          rel="sponsored nofollow noopener"
          target="_blank"
        >
          {store.label}
        </a>
      ))}
    </div>
  )
}
