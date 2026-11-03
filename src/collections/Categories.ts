import type { CollectionConfig } from 'payload'

import { anyone, signedIn } from './access'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: '카테고리', plural: '카테고리' },
  admin: { useAsTitle: 'title', group: '콘텐츠', defaultColumns: ['title', 'slug', 'order'] },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  defaultSort: 'order',
  fields: [
    { name: 'title', label: '이름', type: 'text', required: true },
    {
      name: 'slug',
      label: '주소',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: '/best/<주소>' },
    },
    { name: 'group', label: '묶음', type: 'text', required: true, admin: { description: '청소, 공기, 주방, 뷰티, 계절 등' } },
    { name: 'lede', label: '소개 문장', type: 'text', required: true },
    { name: 'headline', label: '비교 글 제목', type: 'text' },
    {
      name: 'body',
      label: '비교 글 본문 블록',
      type: 'json',
      admin: { description: 'TOP3 비교 글. 상품 리뷰와 같은 블록 형식입니다.' },
    },
    { name: 'checkedAt', label: '판매량 순위 확인일', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'order', label: '순서', type: 'number', defaultValue: 100 },
  ],
}
