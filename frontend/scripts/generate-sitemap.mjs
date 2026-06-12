import fs from 'fs'
import path from 'path'

const rootDir = path.resolve(import.meta.dirname, '..')
const publicDir = path.join(rootDir, 'public')
const outputPath = path.join(publicDir, 'sitemap.xml')

const siteUrl = removeTrailingSlash(process.env.VITE_PUBLIC_URL || 'https://effortit.site')
const apiUrl = removeTrailingSlash(process.env.VITE_API_URL || `${siteUrl}/api`)

function removeTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function fetchJson(endpoint) {
  const response = await fetch(`${apiUrl}${endpoint}`)
  if (!response.ok) throw new Error(`Không tải được ${endpoint}: HTTP ${response.status}`)
  const body = await response.json()
  return body?.duLieu ?? []
}

function normalizeDate(value) {
  if (!value) return new Date().toISOString()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
}

function isJobExpired(hanNop) {
  if (!hanNop) return false
  const parsed = new Date(hanNop)
  return !Number.isNaN(parsed.getTime()) && parsed.getTime() < Date.now()
}

function isPublicJobVisible(job) {
  return Boolean(job?.id)
    && job?.trangThai === 'dang_mo'
    && job?.nhaTuyenDung?.trangThaiDuyet === 'da_duyet'
    && !isJobExpired(job?.hanNop)
}

function buildUrl(pathname, priority, changefreq, lastmod) {
  return {
    loc: `${siteUrl}${pathname}`,
    priority,
    changefreq,
    lastmod: normalizeDate(lastmod),
  }
}

async function buildEntries() {
  const staticEntries = [
    buildUrl('/', '1.0', 'daily'),
    buildUrl('/viec-lam', '0.9', 'hourly'),
    buildUrl('/cong-ty', '0.8', 'daily'),
  ]

  try {
    const [jobs, companies] = await Promise.all([
      fetchJson('/tintuyendung'),
      fetchJson('/nhatuyendung'),
    ])

    const jobEntries = jobs
      .filter(item => isPublicJobVisible(item))
      .map(item => buildUrl(`/viec-lam/${item.id}`, '0.8', 'daily', item.ngayDang || item.updatedAt || item.ngayCapNhat))

    const companyEntries = companies
      .filter(item => item?.id && item?.trangThaiDuyet === 'da_duyet')
      .map(item => buildUrl(`/cong-ty/${item.id}`, '0.7', 'weekly', item.updatedAt || item.ngayCapNhat || item.ngayTao))

    return [...staticEntries, ...jobEntries, ...companyEntries]
  } catch (error) {
    console.warn(`[sitemap] Fallback về sitemap tĩnh: ${error instanceof Error ? error.message : String(error)}`)
    return staticEntries
  }
}

function toXml(entries) {
  const lines = entries.map(entry => [
    '  <url>',
    `    <loc>${xmlEscape(entry.loc)}</loc>`,
    `    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>`,
    `    <changefreq>${xmlEscape(entry.changefreq)}</changefreq>`,
    `    <priority>${xmlEscape(entry.priority)}</priority>`,
    '  </url>',
  ].join('\n'))

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...lines,
    '</urlset>',
    '',
  ].join('\n')
}

const entries = await buildEntries()
fs.mkdirSync(publicDir, { recursive: true })
fs.writeFileSync(outputPath, toXml(entries), 'utf8')
console.log(`[sitemap] Đã tạo ${entries.length} URL tại ${outputPath}`)
