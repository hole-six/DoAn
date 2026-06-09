import crypto from 'node:crypto'
import type { RequestHandler, Response } from 'express'

type CacheEntry = {
  body: unknown
  etag: string
  expiresAt: number
  statusCode: number
}

const cache = new Map<string, CacheEntry>()
const DEFAULT_TTL_MS = Number(process.env.GET_CACHE_TTL_MS ?? 30000)

function hash(value: string) {
  return crypto.createHash('sha1').update(value).digest('base64url')
}

function taoKhoaCache(yeuCau: Parameters<RequestHandler>[0]) {
  const authorization = String(yeuCau.headers.authorization ?? '')
  return `${yeuCau.method}:${yeuCau.originalUrl}:auth=${hash(authorization)}`
}

function taoEtag(body: unknown) {
  return `W/"${hash(JSON.stringify(body))}"`
}

export function xoaCacheGet() {
  cache.clear()
}

export function cacheGetNgan(ttlMs = DEFAULT_TTL_MS): RequestHandler {
  return (yeuCau, phanHoi, tiepTheo) => {
    const coXacThuc = Boolean(String(yeuCau.headers.authorization ?? '').trim())
    if (yeuCau.method !== 'GET' || ttlMs <= 0 || coXacThuc) {
      if (coXacThuc) phanHoi.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate')
      tiepTheo()
      return
    }

    const key = taoKhoaCache(yeuCau)
    const now = Date.now()
    const cached = cache.get(key)
    if (cached && cached.expiresAt > now) {
      phanHoi.setHeader('Cache-Control', `private, max-age=${Math.max(1, Math.floor(ttlMs / 1000))}`)
      phanHoi.setHeader('ETag', cached.etag)
      if (yeuCau.headers['if-none-match'] === cached.etag) {
        phanHoi.status(304).end()
        return
      }
      phanHoi.status(cached.statusCode).json(cached.body)
      return
    }

    const jsonGoc = phanHoi.json.bind(phanHoi) as Response['json']
    phanHoi.json = ((body: unknown) => {
      if (phanHoi.statusCode >= 200 && phanHoi.statusCode < 300) {
        const etag = taoEtag(body)
        cache.set(key, { body, etag, expiresAt: Date.now() + ttlMs, statusCode: phanHoi.statusCode })
        phanHoi.setHeader('Cache-Control', `private, max-age=${Math.max(1, Math.floor(ttlMs / 1000))}`)
        phanHoi.setHeader('ETag', etag)
      }
      return jsonGoc(body)
    }) as Response['json']

    tiepTheo()
  }
}

export function xoaCacheSauGhi(): RequestHandler {
  return (yeuCau, phanHoi, tiepTheo) => {
    if (yeuCau.method === 'GET') {
      tiepTheo()
      return
    }
    phanHoi.on('finish', () => {
      if (phanHoi.statusCode < 400) xoaCacheGet()
    })
    tiepTheo()
  }
}
