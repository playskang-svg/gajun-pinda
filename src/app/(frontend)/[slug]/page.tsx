import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { RichText } from '@/components/RichText'
import { getClient, SITE_DESCRIPTION } from '@/lib/payload'
import { pageMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

const getPage = cache(async (slug: string) => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}
  return pageMeta({ title: page.title, description: page.description ?? SITE_DESCRIPTION, path: `/${page.slug}` })
}

export default async function InfoPage({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()
  return (
    <section className="section page-head">
      <div className="frame frame--text">
        <h1>{page.title}</h1>
        <RichText data={page.content} />
      </div>
    </section>
  )
}
