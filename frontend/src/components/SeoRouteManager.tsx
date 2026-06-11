import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { applySeo } from '../lib/seo'

type RouteSeo = {
  match: (pathname: string) => boolean
  title: string
  description: string
  canonical?: string
  keywords?: string
  robots?: string
  schema?: Record<string, unknown> | Array<Record<string, unknown>>
}

const defaultSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Effort IT',
    url: 'https://effortit.site',
    logo: 'https://effortit.site/android-chrome-512x512.png',
    sameAs: [
      'https://effortit.site',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Effort IT',
    url: 'https://effortit.site',
    inLanguage: 'vi-VN',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://effortit.site/viec-lam?tuKhoa={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
]

const routeSeoConfig: RouteSeo[] = [
  {
    match: pathname => pathname === '/',
    title: 'Effort IT - Tuyển dụng IT Đà Nẵng, tìm việc lập trình viên',
    description: 'Effort IT là nền tảng tuyển dụng IT tại Đà Nẵng, giúp ứng viên tìm việc công nghệ và kết nối trực tiếp với nhà tuyển dụng uy tín.',
    canonical: '/',
    keywords: 'việc làm IT Đà Nẵng, tuyển dụng IT Đà Nẵng, tìm việc lập trình viên, tuyển dụng React Node PHP Đà Nẵng',
    schema: defaultSchema,
  },
  {
    match: pathname => pathname === '/viec-lam',
    title: 'Việc làm IT Đà Nẵng mới nhất - Effort IT',
    description: 'Khám phá việc làm IT Đà Nẵng mới nhất trên Effort IT: ReactJS, NodeJS, Java, QA, DevOps, Data và nhiều vị trí công nghệ khác.',
    canonical: '/viec-lam',
    keywords: 'việc làm IT Đà Nẵng, việc làm ReactJS Đà Nẵng, việc làm NodeJS Đà Nẵng, tuyển dụng lập trình viên',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Việc làm IT Đà Nẵng mới nhất',
      url: 'https://effortit.site/viec-lam',
      inLanguage: 'vi-VN',
    },
  },
  {
    match: pathname => /^\/viec-lam\/[^/]+$/.test(pathname),
    title: 'Chi tiết việc làm IT - Effort IT',
    description: 'Xem chi tiết việc làm IT trên Effort IT, bao gồm mô tả công việc, kỹ năng yêu cầu, mức lương và thông tin công ty tuyển dụng.',
  },
  {
    match: pathname => pathname === '/cong-ty',
    title: 'Công ty công nghệ đang tuyển dụng - Effort IT',
    description: 'Xem danh sách công ty công nghệ đang tuyển dụng trên Effort IT, tìm hiểu quy mô, lĩnh vực, địa điểm và cơ hội việc làm IT phù hợp.',
    canonical: '/cong-ty',
    keywords: 'công ty IT Đà Nẵng, doanh nghiệp công nghệ tuyển dụng, công ty phần mềm Đà Nẵng',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Danh sách công ty công nghệ',
      url: 'https://effortit.site/cong-ty',
      inLanguage: 'vi-VN',
    },
  },
  {
    match: pathname => /^\/cong-ty\/[^/]+$/.test(pathname),
    title: 'Hồ sơ công ty công nghệ - Effort IT',
    description: 'Xem hồ sơ công ty công nghệ trên Effort IT, bao gồm giới thiệu doanh nghiệp, địa điểm, đánh giá và các vị trí đang tuyển.',
  },
  {
    match: pathname => pathname === '/dang-nhap' || pathname === '/dang-ky' || pathname === '/quen-mat-khau' || pathname === '/dat-lai-mat-khau',
    title: 'Tài khoản Effort IT',
    description: 'Đăng nhập hoặc tạo tài khoản Effort IT để tìm việc, quản lý hồ sơ và kết nối với nhà tuyển dụng công nghệ.',
    robots: 'noindex, nofollow',
  },
  {
    match: pathname => pathname.startsWith('/ung-vien') || pathname.startsWith('/nha-tuyen-dung') || pathname.startsWith('/quan-tri'),
    title: 'Khu vực nội bộ - Effort IT',
    description: 'Trang nội bộ của hệ thống Effort IT.',
    robots: 'noindex, nofollow',
  },
  {
    match: pathname => pathname.startsWith('/blog') || pathname === '/luong' || pathname === '/gioi-thieu' || pathname === '/lien-he' || pathname === '/dieu-khoan' || pathname === '/bao-mat',
    title: 'Effort IT',
    description: 'Nền tảng tuyển dụng IT Effort IT.',
    robots: 'noindex, nofollow',
  },
]

export default function SeoRouteManager() {
  const location = useLocation()

  useEffect(() => {
    const matched = routeSeoConfig.find(item => item.match(location.pathname))
    if (!matched) {
      applySeo({
        title: 'Effort IT - Tuyển dụng IT Đà Nẵng',
        description: 'Effort IT là nền tảng tuyển dụng IT tại Đà Nẵng, kết nối ứng viên công nghệ với nhà tuyển dụng phù hợp.',
        canonical: location.pathname + location.search,
      })
      return
    }

    applySeo({
      title: matched.title,
      description: matched.description,
      canonical: matched.canonical || location.pathname + location.search,
      keywords: matched.keywords,
      robots: matched.robots,
      schema: matched.schema,
    })
  }, [location.pathname, location.search])

  return null
}
