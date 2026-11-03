import config from '@payload-config'
import { getPayload } from 'payload'

export const getClient = () => getPayload({ config })

export const SITE_URL = 'https://gajun.pinda.kr'
export const SITE_NAME = '핀다 가전리뷰'
export const SITE_TITLE = `${SITE_NAME} — 가전 판매량 TOP3 비교 · 구매 후기 장단점 분석`
export const SITE_DESCRIPTION =
  '로봇청소기, 공기청정기, 에어프라이어처럼 많이 팔리는 가전을 카테고리별 판매량 TOP3로 골라, 구매 후기에서 반복되는 장단점과 비슷한 다른 회사 모델과의 차이를 정리합니다.'

export const publishedWhere = () => ({
  and: [
    { _status: { equals: 'published' as const } },
    { publishedAt: { less_than_equal: new Date().toISOString() } },
  ],
})

export const absoluteUrl = (url: string): string => (url.startsWith('http') ? url : `${SITE_URL}${url}`)
