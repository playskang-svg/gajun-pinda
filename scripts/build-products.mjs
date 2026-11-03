// Merges the written drafts with the harvested numbers and links into scripts/categories.json and scripts/products.json,
// saves product images to public/products/<id>.webp and draws share cards into public/og.
// Run: node scripts/build-products.mjs   (reads C:/Users/sgk76/ego/gajun-pinda-20261103)
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const sharp = createRequire(import.meta.url)('sharp')
const SRC = 'C:/Users/sgk76/ego/gajun-pinda-20261103/'
const read = (f, fallback) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : fallback)

// Order and grouping of categories on the site.
const ORDER = [
  ['robot-vacuum', '청소'], ['cordless-vacuum', '청소'],
  ['air-purifier', '공기·계절'], ['dehumidifier', '공기·계절'], ['humidifier', '공기·계절'], ['circulator', '공기·계절'], ['heater', '공기·계절'], ['electric-blanket', '공기·계절'],
  ['air-fryer', '주방'], ['rice-cooker', '주방'], ['dishwasher', '주방'], ['food-waste', '주방'], ['coffee-machine', '주방'], ['electric-kettle', '주방'], ['blender', '주방'],
  ['clothes-dryer', '세탁·의류'], ['styler', '세탁·의류'],
  ['hair-dryer', '뷰티·욕실'], ['electric-toothbrush', '뷰티·욕실'], ['electric-shaver', '뷰티·욕실'],
]

const links = read(SRC + 'coupang-links.json', {})
// Older runs keyed links by product URL, newer ones by product id.
const coupangOf = (id) => links[id] ?? links[`https://www.coupang.com/vp/products/${id}`] ?? null
const naver = read(SRC + 'naver-links.json', {})
mkdirSync('public/products', { recursive: true })
mkdirSync('public/og', { recursive: true })

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const wrap = (text, perLine, maxLines) => {
  const lines = ['']
  for (const word of text.split(' ')) {
    const last = lines[lines.length - 1]
    if (last && last.length + word.length + 1 > perLine) lines.push(word)
    else lines[lines.length - 1] = last ? `${last} ${word}` : word
  }
  return lines.slice(0, maxLines)
}
const FONT = "'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif"

// White card, product photo on the left, the hook in large type. No site name or price, so it reads as content, not an ad.
const card = async ({ images, main, sub, out }) => {
  const layers = []
  const n = images.length
  const w = n === 1 ? 460 : 178
  for (const [i, file] of images.entries()) {
    const input = await sharp(file).resize(w, w, { fit: 'contain', background: '#ffffff' }).png().toBuffer()
    const left = n === 1 ? 50 : 24 + i * 186
    const top = n === 1 ? 85 : 226
    layers.push({ input, left, top })
  }
  const size = main.length <= 22 ? 60 : main.length <= 36 ? 52 : 44
  const lines = wrap(main, Math.floor(560 / (size * 0.95)), 4)
  const lh = size * 1.32
  const subLines = wrap(sub, 26, 2)
  const total = lines.length * lh + 30 + subLines.length * 38
  let y = (630 - total) / 2 + size
  const text = [
    ...lines.map((l) => { const t = `<text x="590" y="${y}" font-size="${size}" font-weight="800" fill="#16191d">${esc(l)}</text>`; y += lh; return t }),
    (() => { y += 12; return `<rect x="590" y="${y - 30}" width="56" height="5" fill="#2456e8"/>` })(),
    ...subLines.map((l) => { y += 38; return `<text x="590" y="${y}" font-size="27" fill="#5b6470">${esc(l)}</text>` }),
  ].join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#ffffff"/><g font-family="${FONT}">${text}</g></svg>`
  await sharp(Buffer.from(svg)).composite(layers).jpeg({ quality: 86 }).toFile(out)
}

const imageOf = async (id, url) => {
  const file = `public/products/${id}.webp`
  if (!existsSync(file) && url) {
    const res = await fetch(url.startsWith('//') ? `https:${url}` : url, { headers: { 'user-agent': 'Mozilla/5.0' } })
    if (!res.ok) throw new Error(`image ${id} ${res.status}`)
    await sharp(Buffer.from(await res.arrayBuffer())).resize(720, 720, { fit: 'contain', background: '#ffffff' }).webp({ quality: 82 }).toFile(file)
  }
  return existsSync(file) ? `/products/${id}.webp` : null
}

const categories = []
const products = []
const drafts = new Set(readdirSync(SRC + 'content').map((f) => f.replace('.json', '')))
for (const [index, [slug, group]] of ORDER.entries()) {
  if (!drafts.has(slug)) continue
  const draft = read(`${SRC}content/${slug}.json`)
  const input = read(`${SRC}input/${slug}.json`)
  categories.push({ ...draft.category, slug, group, order: index + 1, checkedAt: input.checkedAt })
  const cardImages = []
  for (const p of draft.products) {
    const data = input.top.find((t) => t.id === p.id)
    if (!data) throw new Error(`${slug}: ${p.id} is not in the input`)
    const image = await imageOf(p.id, data.image)
    if (!image) { console.log('no image, skipped', slug, p.id); continue }
    cardImages.push(`public${image}`)
    await card({ images: [`public${image}`], main: p.snsHook || p.tagline, sub: p.name, out: `public/og/${p.slug}.jpg` })
    products.push({
      ...p,
      category: slug,
      image,
      ogUrl: `/og/${p.slug}.jpg`,
      salePrice: data.price,
      listPrice: data.listPrice && data.listPrice > data.price ? data.listPrice : null,
      rating: data.rating ?? null,
      reviewCount: data.reviews,
      verifiedAt: input.checkedAt,
      coupangUrl: coupangOf(p.id),
      naverUrl: naver[p.id]?.url ?? null,
      fitFor: p.fitFor ?? [],
      status: coupangOf(p.id) || naver[p.id] ? 'published' : 'draft',
    })
  }
  if (cardImages.length) {
    await card({ images: cardImages.slice(0, 3), main: draft.category.headline || `${draft.category.title} TOP3`, sub: draft.category.lede.split(/(?<=[.요다])\s/)[0], out: `public/og/best-${slug}.jpg` })
  }
}
// Site-wide card: the rank-1 models of three different kinds of appliance.
const defaults = ['robot-vacuum', 'air-fryer', 'air-purifier'].map((slug) => products.find((p) => p.category === slug && p.rank === 1)).filter(Boolean)
if (defaults.length === 3) {
  await card({ images: defaults.map((p) => `public${p.image}`), main: '가전은 많이 팔린 세 개만 비교해도 실패가 줄어요', sub: '판매량 TOP3, 구매 후기로 본 장단점', out: 'public/og-default.jpg' })
}
writeFileSync('scripts/categories.json', JSON.stringify(categories, null, 1))
writeFileSync('scripts/products.json', JSON.stringify(products, null, 1))
console.log('categories', categories.length, 'products', products.length, 'no coupang', products.filter((p) => !p.coupangUrl).length, 'naver', products.filter((p) => p.naverUrl).length)
