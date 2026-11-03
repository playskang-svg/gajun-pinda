import { getClient, publishedWhere, SITE_URL } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = await getClient()
  const [products, pages, categories] = await Promise.all([
    payload.find({ collection: 'products', where: publishedWhere(), limit: 2000, depth: 0, pagination: false }),
    payload.find({ collection: 'pages', limit: 100, depth: 0, pagination: false }),
    payload.find({ collection: 'categories', limit: 200, depth: 0, pagination: false }),
  ])
  const urls = [
    `<url><loc>${SITE_URL}</loc></url>`,
    `<url><loc>${SITE_URL}/best</loc></url>`,
    ...categories.docs.map((c) => `<url><loc>${SITE_URL}/best/${c.slug}</loc><lastmod>${c.updatedAt}</lastmod></url>`),
    ...pages.docs.map((p) => `<url><loc>${SITE_URL}/${p.slug}</loc><lastmod>${p.updatedAt}</lastmod></url>`),
    ...products.docs.map((p) => `<url><loc>${SITE_URL}/review/${p.slug}</loc><lastmod>${p.updatedAt}</lastmod></url>`),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } })
}
