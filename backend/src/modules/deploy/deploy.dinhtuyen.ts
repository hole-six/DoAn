import { Router } from 'express'
import { prisma } from '../../cauhinh/prisma.js'

export const dinhTuyenDeploy = Router()

const SITE = 'https://effortit.site'

// Sitemap động — Google bot gọi /api/sitemap.xml hoặc qua redirect ở Nginx
dinhTuyenDeploy.get('/sitemap.xml', async (_req, res) => {
  try {
    const [tinList, congTyList] = await Promise.all([
      prisma.tinTuyenDung.findMany({
        where: { trangThai: 'dang_mo' },
        select: { id: true, ngayCapNhat: true },
        orderBy: { ngayCapNhat: 'desc' },
        take: 1000,
      }),
      prisma.nhaTuyenDung.findMany({
        where: { trangThaiDuyet: 'da_duyet' },
        select: { id: true, ngayCapNhat: true },
        orderBy: { ngayCapNhat: 'desc' },
        take: 500,
      }),
    ])

    const trangCoDinh = [
      { url: `${SITE}/`, priority: '1.0', changefreq: 'daily' },
      { url: `${SITE}/viec-lam`, priority: '0.9', changefreq: 'hourly' },
      { url: `${SITE}/cong-ty`, priority: '0.8', changefreq: 'daily' },
      { url: `${SITE}/dang-nhap`, priority: '0.5', changefreq: 'monthly' },
      { url: `${SITE}/dang-ky`, priority: '0.5', changefreq: 'monthly' },
    ]

    const urlEntries = [
      ...trangCoDinh.map(
        ({ url, priority, changefreq }) => `
  <url>
    <loc>${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
      ),
      ...tinList.map(
        (tin) => `
  <url>
    <loc>${SITE}/viec-lam/${tin.id}</loc>
    <lastmod>${tin.ngayCapNhat.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
      ),
      ...congTyList.map(
        (cty) => `
  <url>
    <loc>${SITE}/cong-ty/${cty.id}</loc>
    <lastmod>${cty.ngayCapNhat.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`,
      ),
    ]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries.join('')}
</urlset>`

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600') // cache 1 tiếng
    res.send(xml)
  } catch {
    res.status(500).send('Lỗi tạo sitemap')
  }
})
