import type { Metadata } from 'next'

import { SITE_NAME, SITE_URL } from './payload'

const DEFAULT_IMAGE = '/og-default.jpg'
// Link previews cache images by URL, so bump this when the cards are redrawn.
const IMAGE_VERSION = 2

// Next replaces the parent's openGraph entirely, so every page has to restate these fields.
export const pageMeta = ({
  title,
  shareTitle = title,
  description,
  path,
  image = DEFAULT_IMAGE,
  article,
}: {
  title: string
  /** What a pasted link shows; the search title stays in `title`. */
  shareTitle?: string
  description: string
  path: string
  image?: string
  article?: { publishedTime: string; modifiedTime: string; section?: string }
}): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    siteName: SITE_NAME,
    locale: 'ko_KR',
    title: shareTitle,
    description,
    url: path,
    images: [{ url: `${image}?v=${IMAGE_VERSION}`, width: 1200, height: 630 }],
    ...(article ? { type: 'article', ...article } : { type: 'website' }),
  },
  twitter: { card: 'summary_large_image', title: shareTitle, description, images: [`${image}?v=${IMAGE_VERSION}`] },
})

export const publisher = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
}
