'use client'

import { useEffect, useRef, useState } from 'react'

import banners from '@/lib/banners.json'

const SIZES = { wide: [680, 140], narrow: [320, 250] } as const

// Coupang dynamic banner. Empty until banners.json has an id, so nothing shows before the first one is issued.
export function CoupangBanner({ slot }: { slot?: string | null }) {
  const ids = banners as Record<string, number>
  const id = (slot ? ids[slot] : undefined) ?? ids.default
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<readonly [number, number] | null>(null)
  useEffect(() => {
    if (box.current) setSize(box.current.clientWidth >= SIZES.wide[0] ? SIZES.wide : SIZES.narrow)
  }, [])
  if (!id) return null
  return (
    <div className="coupang-banner" ref={box}>
      {size ? (
        <iframe
          height={size[1]}
          loading="lazy"
          referrerPolicy="unsafe-url"
          scrolling="no"
          src={`https://ads-partners.coupang.com/widgets.html?id=${id}&template=carousel&trackingCode=AF8819972&subId=&width=${size[0]}&height=${size[1]}&tsource=`}
          title="쿠팡 추천 상품"
          width={size[0]}
        />
      ) : null}
    </div>
  )
}
