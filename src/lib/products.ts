import { getClient, publishedWhere } from '@/lib/payload'
import type { Category, Product } from '@/payload-types'

export const productPath = (product: Pick<Product, 'slug'>) => `/review/${product.slug}`
export const categoryPath = (category: Pick<Category, 'slug'>) => `/best/${category.slug}`

export const formatWon = (value: number) => `${value.toLocaleString('ko-KR')}원`

export const formatDate = (value: string | null | undefined): string => {
  if (!value) return ''
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value))
}

export const discountPercent = (p: Pick<Product, 'listPrice' | 'salePrice'>) =>
  p.listPrice && p.listPrice > p.salePrice ? Math.round(((p.listPrice - p.salePrice) / p.listPrice) * 100) : 0

export const categoryOf = (product: Product): Category | null =>
  typeof product.category === 'object' ? product.category : null

export const getProducts = async ({ categoryId, limit = 300, excludeId }: { categoryId?: number; limit?: number; excludeId?: number } = {}) => {
  const payload = await getClient()
  const and: Record<string, unknown>[] = [...publishedWhere().and]
  if (categoryId) and.push({ category: { equals: categoryId } })
  if (excludeId) and.push({ id: { not_equals: excludeId } })
  const { docs } = await payload.find({
    collection: 'products',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: { and } as any,
    limit,
    depth: 1,
    sort: 'rank',
    pagination: false,
  })
  return docs
}

export const getCategories = async () => {
  const payload = await getClient()
  return (await payload.find({ collection: 'categories', limit: 100, depth: 0, sort: 'order', pagination: false })).docs
}
