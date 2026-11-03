import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import React from 'react'

import { SiteHeader } from '@/components/SiteHeader'
import { getClient, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/payload'

import './styles.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: [
    '핀다 가전리뷰',
    '가전 추천',
    '가전 순위',
    '판매량 순위',
    '로봇청소기 추천',
    '무선청소기 추천',
    '공기청정기 추천',
    '제습기 추천',
    '에어프라이어 추천',
    '식기세척기 추천',
    '음식물처리기 추천',
    '드라이기 추천',
    '전동칫솔 추천',
    '가전 후기 장단점',
    '가전 비교',
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  // Prices must not turn into phone links on mobile browsers.
  formatDetection: { telephone: false },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  openGraph: {
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-default.jpg'] },
  alternates: {
    types: { 'application/rss+xml': '/rss.xml' },
  },
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

// Menus live in D1, which is empty during the build.
export const dynamic = 'force-dynamic'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getClient()
  const nav = await payload.findGlobal({ slug: 'navigation' })

  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': 'https://gajun.pinda.kr/#website',
                  url: 'https://gajun.pinda.kr',
                  name: '핀다 가전리뷰',
                  description: '가전 카테고리별 판매량 TOP3 비교와 구매 후기 장단점 분석',
                  inLanguage: 'ko-KR',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: 'https://gajun.pinda.kr/search?q={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'Organization',
                  '@id': 'https://gajun.pinda.kr/#organization',
                  name: '핀다 가전리뷰',
                  url: 'https://gajun.pinda.kr',
                  logo: 'https://gajun.pinda.kr/icon-512.png',
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        <a className="skip" href="#main">
          본문 바로가기
        </a>
        <p className="ad-notice">이 포스팅은 쿠팡 파트너스와 네이버 쇼핑 커넥트 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
        <SiteHeader items={nav.header ?? []} siteName={SITE_NAME} />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="frame">
            <div className="site-footer__row">
              <strong>{SITE_NAME}</strong>
              <nav aria-label="하단 메뉴" className="site-footer__nav">
                {nav.footer?.map((item) => (
                  <Link href={item.url} key={item.id ?? item.url}>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <span>© {new Date().getFullYear()} gajun.pinda.kr</span>
            </div>
            <p className="site-footer__note">
              쿠팡 판매량 순위와 공개된 구매 후기를 바탕으로 가전을 비교하는 개인 운영 정보 사이트예요. 제조사·판매처와 무관하고, 구매 버튼은 제휴 링크라서 일정액의 수수료를 받을 수 있어요. 결제 전에는 판매 화면의 최신 가격을 확인해 주세요.
            </p>
          </div>
        </footer>
        {GA_ID ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  )
}
