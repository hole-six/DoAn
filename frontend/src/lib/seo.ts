import { useEffect } from 'react'
import { PUBLIC_URL, taoUrlPublic } from './env'

export type SeoInput = {
  title: string
  description: string
  canonical?: string
  keywords?: string
  robots?: string
  image?: string
  type?: 'website' | 'article'
  schema?: Record<string, unknown> | Array<Record<string, unknown>>
}

const DEFAULT_IMAGE = taoUrlPublic('/android-chrome-512x512.png')
const DEFAULT_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

function ensureMeta(selector: string, create: () => HTMLMetaElement) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = create()
    document.head.appendChild(element)
  }
  return element
}

function setMetaByName(name: string, content: string) {
  const element = ensureMeta(`meta[name="${name}"]`, () => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', name)
    return meta
  })
  element.setAttribute('content', content)
}

function setMetaByProperty(property: string, content: string) {
  const element = ensureMeta(`meta[property="${property}"]`, () => {
    const meta = document.createElement('meta')
    meta.setAttribute('property', property)
    return meta
  })
  element.setAttribute('content', content)
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

function setJsonLd(schema?: SeoInput['schema']) {
  const id = 'effortit-jsonld'
  const current = document.getElementById(id)
  if (!schema) {
    current?.remove()
    return
  }

  const script = current ?? document.createElement('script')
  script.id = id
  script.setAttribute('type', 'application/ld+json')
  script.textContent = JSON.stringify(schema)
  if (!current) document.head.appendChild(script)
}

export function toAbsoluteUrl(pathOrUrl?: string) {
  if (!pathOrUrl) return PUBLIC_URL
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return taoUrlPublic(pathOrUrl)
}

export function applySeo(input: SeoInput) {
  const canonical = toAbsoluteUrl(input.canonical || window.location.pathname + window.location.search)
  const image = toAbsoluteUrl(input.image || DEFAULT_IMAGE)
  const robots = input.robots || DEFAULT_ROBOTS
  const title = input.title.trim()
  const description = input.description.trim()
  const type = input.type || 'website'

  document.title = title
  document.documentElement.lang = 'vi'

  setMetaByName('description', description)
  setMetaByName('robots', robots)
  if (input.keywords) setMetaByName('keywords', input.keywords)

  setCanonical(canonical)

  setMetaByProperty('og:type', type)
  setMetaByProperty('og:url', canonical)
  setMetaByProperty('og:title', title)
  setMetaByProperty('og:description', description)
  setMetaByProperty('og:image', image)
  setMetaByProperty('og:site_name', 'Effort IT')
  setMetaByProperty('og:locale', 'vi_VN')

  setMetaByName('twitter:card', 'summary_large_image')
  setMetaByName('twitter:title', title)
  setMetaByName('twitter:description', description)
  setMetaByName('twitter:image', image)

  setJsonLd(input.schema)
}

export function useSeo(input: SeoInput | null) {
  useEffect(() => {
    if (!input) return
    applySeo(input)
  }, [input])
}
