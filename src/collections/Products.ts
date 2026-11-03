import type { Access, CollectionConfig } from 'payload'

import { signedIn } from './access'

const publishedOnly: Access = ({ req }) => {
  if (req.user) return true
  return {
    and: [
      { _status: { equals: 'published' } },
      { publishedAt: { less_than_equal: new Date().toISOString() } },
    ],
  }
}

const list = (name: string, label: string) => ({
  name,
  label,
  type: 'array' as const,
  fields: [{ name: 'text', label: '내용', type: 'text' as const, required: true }],
})

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: '상품 리뷰', plural: '상품 리뷰' },
  admin: {
    useAsTitle: 'name',
    group: '콘텐츠',
    defaultColumns: ['name', 'category', 'rank', '_status'],
  },
  versions: { drafts: true },
  access: { read: publishedOnly, create: signedIn, update: signedIn, delete: signedIn },
  defaultSort: 'rank',
  fields: [
    { name: 'name', label: '상품 이름', type: 'text', required: true },
    {
      name: 'slug',
      label: '주소',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: '/review/<주소>' },
    },
    {
      name: 'publishedAt',
      label: '공개 시각',
      type: 'date',
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'category',
      label: '카테고리',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'rank',
      label: '판매량 순위',
      type: 'number',
      required: true,
      defaultValue: 1,
      index: true,
      admin: { position: 'sidebar', description: '카테고리 안의 쿠팡 판매량순 순위(1~3).' },
    },
    {
      name: 'verifiedAt',
      label: '가격·순위 확인일',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      type: 'row',
      fields: [
        { name: 'brand', label: '브랜드', type: 'text', required: true },
        { name: 'model', label: '모델명', type: 'text' },
      ],
    },
    { name: 'image', label: '상품 이미지 주소', type: 'text', required: true },
    { name: 'ogUrl', label: '공유 썸네일 주소', type: 'text' },
    {
      type: 'row',
      fields: [
        { name: 'listPrice', label: '정가', type: 'number' },
        { name: 'salePrice', label: '판매가', type: 'number', required: true },
        { name: 'rating', label: '평점', type: 'number' },
        { name: 'reviewCount', label: '리뷰 수', type: 'number' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'coupangUrl',
          label: '쿠팡 제휴 링크',
          type: 'text',
          admin: { description: 'psa1226(AF8819972)에서 발급한 https://link.coupang.com/a/...' },
        },
        {
          name: 'naverUrl',
          label: '네이버 제휴 링크',
          type: 'text',
          admin: { description: 'stillsk 브랜드 커넥트 링크. 비우면 버튼을 숨깁니다.' },
        },
      ],
    },
    { name: 'tagline', label: '한 줄 평', type: 'text', required: true },
    { name: 'summary', label: '핵심 한 줄 요약', type: 'textarea', required: true },
    { name: 'snsHook', label: 'SNS 후킹 문구', type: 'text' },
    list('pros', '장점'),
    list('cons', '단점'),
    {
      name: 'fitFor',
      label: '이런 분께 맞아요',
      type: 'array',
      fields: [
        { name: 'who', label: '누가', type: 'text', required: true },
        { name: 'why', label: '왜', type: 'textarea', required: true },
      ],
    },
    list('skipIf', '이런 분은 다른 모델'),
    {
      name: 'body',
      label: '본문 블록',
      type: 'json',
      admin: { description: 'h2·p·ul·table·compare·chat·big 블록 배열입니다.' },
    },
    { name: 'lossNote', label: '늦게 사면 잃는 것', type: 'textarea' },
  ],
}
