# 핀다 가전리뷰 (gajun.pinda.kr)

Payload CMS + Next.js on Cloudflare Workers (D1, R2). Skeleton copied from book-pinda.

## Deploy

1. `git push` to `main` and wait for the Build workflow.
2. `pnpm deploy:ci` downloads the bundle and uploads it with the local wrangler login.

After changing a collection: `pnpm payload migrate:create <name>` then `NODE_ENV=production pnpm payload migrate`.

## Content

Data and writing pipeline: `C:\Users\sgk76\ego\gajun-pinda-20261103\` (harvest.mjs → data/*.json → content/*.json → scripts/products.json).
Seed: `NODE_ENV=production pnpm payload run scripts/seed.ts`.
