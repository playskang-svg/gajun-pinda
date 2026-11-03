// Fills categories, pages, menus and products from scripts/categories.json and scripts/products.json. Safe to re-run: records are matched by slug.
// Run: NODE_ENV=production pnpm payload run scripts/seed.ts   (remote D1)
import fs from 'node:fs'

import { type CollectionSlug, getPayload } from 'payload'

import config from '../src/payload.config'
import { type Block, navigation, pages } from './seed-data'

const payload = await getPayload({ config })

/* eslint-disable @typescript-eslint/no-explicit-any */
const upsert = async (collection: CollectionSlug, where: any, data: any): Promise<any> => {
  const { docs } = await payload.find({ collection, where, limit: 1, depth: 0, draft: true })
  if (docs[0]) return payload.update({ collection, id: docs[0].id, data, depth: 0 } as any)
  return payload.create({ collection, data, depth: 0 } as any)
}

const textNode = (text: string) => ({
  type: 'text',
  version: 1,
  text,
  format: 0,
  mode: 'normal',
  style: '',
  detail: 0,
})
const element = (type: string, children: any[], extra: any = {}) => ({
  type,
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children,
  ...extra,
})

const toLexical = (blocks: Block[]) => ({
  root: element(
    'root',
    blocks.map((block) => {
      if ('h2' in block) return element('heading', [textNode(block.h2)], { tag: 'h2' })
      if ('h3' in block) return element('heading', [textNode(block.h3)], { tag: 'h3' })
      if ('quote' in block) return element('quote', [textNode(block.cite ? `${block.quote} (${block.cite})` : block.quote)])
      if ('ul' in block) {
        return element(
          'list',
          block.ul.map((item, index) => element('listitem', [textNode(item)], { value: index + 1 })),
          { listType: 'bullet', tag: 'ul', start: 1 },
        )
      }
      return element('paragraph', [textNode(block.p)], { textFormat: 0, textStyle: '' })
    }),
  ),
})

const categories = JSON.parse(fs.readFileSync('scripts/categories.json', 'utf8'))
const categoryIds: Record<string, number> = {}
for (const item of categories) {
  categoryIds[item.slug] = (await upsert('categories', { slug: { equals: item.slug } }, item)).id
}

for (const { body, ...rest } of pages) {
  await upsert('pages', { slug: { equals: rest.slug } }, { ...rest, content: toLexical(body) })
}
await payload.updateGlobal({ slug: 'navigation', data: navigation })
console.log('categories', categories.length, 'pages', pages.length)

const list = (items: string[] | undefined) => (items ?? []).map((text) => ({ text }))
const products = JSON.parse(fs.readFileSync('scripts/products.json', 'utf8'))
for (const [index, { category, pros, cons, skipIf, status, ...product }] of products.entries()) {
  await upsert(
    'products',
    { slug: { equals: product.slug } },
    { ...product, category: categoryIds[category], pros: list(pros), cons: list(cons), skipIf: list(skipIf), _status: status ?? 'published' },
  )
  console.log(index + 1, product.name)
}
process.exit(0)
