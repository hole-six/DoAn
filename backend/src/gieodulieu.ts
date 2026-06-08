import bcrypt from 'bcryptjs'
import { prisma } from './cauhinh/prisma.js'
import { dongBoTatCaKyNangTuJson } from './dungchung/dongboQuanHe.js'

const matKhauMau = '123456'
const emailAdmin = 'admin@ef.vn'

type KyNangSeed = { tenKyNang: string; loaiKyNang: string }

const danhSachKyNang: KyNangSeed[] = [
  // Frontend
  { tenKyNang: 'HTML5', loaiKyNang: 'frontend' },
  { tenKyNang: 'CSS3', loaiKyNang: 'frontend' },
  { tenKyNang: 'SCSS', loaiKyNang: 'frontend' },
  { tenKyNang: 'Tailwind CSS', loaiKyNang: 'frontend' },
  { tenKyNang: 'Bootstrap', loaiKyNang: 'frontend' },
  { tenKyNang: 'JavaScript', loaiKyNang: 'frontend' },
  { tenKyNang: 'TypeScript', loaiKyNang: 'frontend' },
  { tenKyNang: 'React', loaiKyNang: 'frontend' },
  { tenKyNang: 'Next.js', loaiKyNang: 'frontend' },
  { tenKyNang: 'Vue.js', loaiKyNang: 'frontend' },
  { tenKyNang: 'Nuxt.js', loaiKyNang: 'frontend' },
  { tenKyNang: 'Angular', loaiKyNang: 'frontend' },
  { tenKyNang: 'Svelte', loaiKyNang: 'frontend' },
  { tenKyNang: 'Redux', loaiKyNang: 'frontend' },
  { tenKyNang: 'Zustand', loaiKyNang: 'frontend' },
  { tenKyNang: 'React Query', loaiKyNang: 'frontend' },
  { tenKyNang: 'Vite', loaiKyNang: 'frontend' },
  { tenKyNang: 'Webpack', loaiKyNang: 'frontend' },
  { tenKyNang: 'Accessibility (a11y)', loaiKyNang: 'frontend' },
  { tenKyNang: 'Responsive Design', loaiKyNang: 'frontend' },
  { tenKyNang: 'Mobile First', loaiKyNang: 'frontend' },
  { tenKyNang: 'Micro Frontend', loaiKyNang: 'frontend' },
  { tenKyNang: 'PWA', loaiKyNang: 'frontend' },
  // Backend
  { tenKyNang: 'Node.js', loaiKyNang: 'backend' },
  { tenKyNang: 'Express.js', loaiKyNang: 'backend' },
  { tenKyNang: 'NestJS', loaiKyNang: 'backend' },
  { tenKyNang: 'Java', loaiKyNang: 'backend' },
  { tenKyNang: 'Spring Boot', loaiKyNang: 'backend' },
  { tenKyNang: 'C#', loaiKyNang: 'backend' },
  { tenKyNang: '.NET', loaiKyNang: 'backend' },
  { tenKyNang: 'PHP', loaiKyNang: 'backend' },
  { tenKyNang: 'Laravel', loaiKyNang: 'backend' },
  { tenKyNang: 'Python', loaiKyNang: 'backend' },
  { tenKyNang: 'Django', loaiKyNang: 'backend' },
  { tenKyNang: 'FastAPI', loaiKyNang: 'backend' },
  { tenKyNang: 'Go', loaiKyNang: 'backend' },
  { tenKyNang: 'Gin', loaiKyNang: 'backend' },
  { tenKyNang: 'Ruby on Rails', loaiKyNang: 'backend' },
  { tenKyNang: 'Rust', loaiKyNang: 'backend' },
  { tenKyNang: 'GraphQL', loaiKyNang: 'backend' },
  { tenKyNang: 'REST API', loaiKyNang: 'backend' },
  { tenKyNang: 'gRPC', loaiKyNang: 'backend' },
  { tenKyNang: 'Microservices', loaiKyNang: 'backend' },
  { tenKyNang: 'Monolith', loaiKyNang: 'backend' },
  { tenKyNang: 'Event-driven Architecture', loaiKyNang: 'backend' },
  { tenKyNang: 'Clean Architecture', loaiKyNang: 'backend' },
  { tenKyNang: 'Domain-Driven Design', loaiKyNang: 'backend' },
  { tenKyNang: 'Prisma', loaiKyNang: 'backend' },
  { tenKyNang: 'Sequelize', loaiKyNang: 'backend' },
  { tenKyNang: 'TypeORM', loaiKyNang: 'backend' },
  // Database
  { tenKyNang: 'PostgreSQL', loaiKyNang: 'database' },
  { tenKyNang: 'MySQL', loaiKyNang: 'database' },
  { tenKyNang: 'SQL Server', loaiKyNang: 'database' },
  { tenKyNang: 'MongoDB', loaiKyNang: 'database' },
  { tenKyNang: 'Redis', loaiKyNang: 'database' },
  { tenKyNang: 'Elasticsearch', loaiKyNang: 'database' },
  { tenKyNang: 'Cassandra', loaiKyNang: 'database' },
  { tenKyNang: 'DynamoDB', loaiKyNang: 'database' },
  { tenKyNang: 'Firebase', loaiKyNang: 'database' },
  { tenKyNang: 'Supabase', loaiKyNang: 'database' },
  { tenKyNang: 'Database Design', loaiKyNang: 'database' },
  { tenKyNang: 'Indexing', loaiKyNang: 'database' },
  { tenKyNang: 'Query Optimization', loaiKyNang: 'database' },
  // DevOps / Cloud
  { tenKyNang: 'Docker', loaiKyNang: 'devops' },
  { tenKyNang: 'Kubernetes', loaiKyNang: 'devops' },
  { tenKyNang: 'CI/CD', loaiKyNang: 'devops' },
  { tenKyNang: 'GitHub Actions', loaiKyNang: 'devops' },
  { tenKyNang: 'GitLab CI', loaiKyNang: 'devops' },
  { tenKyNang: 'Terraform', loaiKyNang: 'devops' },
  { tenKyNang: 'Ansible', loaiKyNang: 'devops' },
  { tenKyNang: 'Jenkins', loaiKyNang: 'devops' },
  { tenKyNang: 'Nginx', loaiKyNang: 'devops' },
  { tenKyNang: 'Apache', loaiKyNang: 'devops' },
  { tenKyNang: 'AWS', loaiKyNang: 'cloud' },
  { tenKyNang: 'Azure', loaiKyNang: 'cloud' },
  { tenKyNang: 'Google Cloud', loaiKyNang: 'cloud' },
  { tenKyNang: 'Cloudflare', loaiKyNang: 'cloud' },
  { tenKyNang: 'Linux', loaiKyNang: 'devops' },
  { tenKyNang: 'Shell Scripting', loaiKyNang: 'devops' },
  { tenKyNang: 'Observability', loaiKyNang: 'devops' },
  { tenKyNang: 'Monitoring', loaiKyNang: 'devops' },
  { tenKyNang: 'Logging', loaiKyNang: 'devops' },
  // QA / Testing
  { tenKyNang: 'Jest', loaiKyNang: 'quality' },
  { tenKyNang: 'Vitest', loaiKyNang: 'quality' },
  { tenKyNang: 'Playwright', loaiKyNang: 'quality' },
  { tenKyNang: 'Cypress', loaiKyNang: 'quality' },
  { tenKyNang: 'Selenium', loaiKyNang: 'quality' },
  { tenKyNang: 'Unit Testing', loaiKyNang: 'quality' },
  { tenKyNang: 'Integration Testing', loaiKyNang: 'quality' },
  { tenKyNang: 'E2E Testing', loaiKyNang: 'quality' },
  { tenKyNang: 'Performance Testing', loaiKyNang: 'quality' },
  // Mobile
  { tenKyNang: 'React Native', loaiKyNang: 'mobile' },
  { tenKyNang: 'Flutter', loaiKyNang: 'mobile' },
  { tenKyNang: 'Android', loaiKyNang: 'mobile' },
  { tenKyNang: 'iOS', loaiKyNang: 'mobile' },
  { tenKyNang: 'Kotlin', loaiKyNang: 'mobile' },
  { tenKyNang: 'Swift', loaiKyNang: 'mobile' },
  // Data / AI
  { tenKyNang: 'Python Data', loaiKyNang: 'data' },
  { tenKyNang: 'Pandas', loaiKyNang: 'data' },
  { tenKyNang: 'NumPy', loaiKyNang: 'data' },
  { tenKyNang: 'Machine Learning', loaiKyNang: 'data' },
  { tenKyNang: 'Deep Learning', loaiKyNang: 'data' },
  { tenKyNang: 'TensorFlow', loaiKyNang: 'data' },
  { tenKyNang: 'PyTorch', loaiKyNang: 'data' },
  { tenKyNang: 'LLM', loaiKyNang: 'data' },
  { tenKyNang: 'Prompt Engineering', loaiKyNang: 'data' },
  { tenKyNang: 'Data Engineering', loaiKyNang: 'data' },
  { tenKyNang: 'ETL', loaiKyNang: 'data' },
  { tenKyNang: 'BI', loaiKyNang: 'data' },
  // Product / Design / PM
  { tenKyNang: 'UI/UX', loaiKyNang: 'design' },
  { tenKyNang: 'Figma', loaiKyNang: 'design' },
  { tenKyNang: 'Design System', loaiKyNang: 'design' },
  { tenKyNang: 'Product Thinking', loaiKyNang: 'product' },
  { tenKyNang: 'Product Management', loaiKyNang: 'product' },
  { tenKyNang: 'Agile', loaiKyNang: 'management' },
  { tenKyNang: 'Scrum', loaiKyNang: 'management' },
  { tenKyNang: 'Kanban', loaiKyNang: 'management' },
  // Security / Architecture / Collaboration
  { tenKyNang: 'OAuth2', loaiKyNang: 'security' },
  { tenKyNang: 'OpenID Connect', loaiKyNang: 'security' },
  { tenKyNang: 'JWT', loaiKyNang: 'security' },
  { tenKyNang: 'Zero Trust', loaiKyNang: 'security' },
  { tenKyNang: 'System Design', loaiKyNang: 'architecture' },
  { tenKyNang: 'Scalability', loaiKyNang: 'architecture' },
  { tenKyNang: 'Observability Architecture', loaiKyNang: 'architecture' },
  { tenKyNang: 'Technical Writing', loaiKyNang: 'softskill' },
  { tenKyNang: 'Communication', loaiKyNang: 'softskill' },
  { tenKyNang: 'Teamwork', loaiKyNang: 'softskill' },
  { tenKyNang: 'Problem Solving', loaiKyNang: 'softskill' },
  { tenKyNang: 'Leadership', loaiKyNang: 'softskill' },
]

const danhSachUngVien = [
  { email: 'ungvien1@ef.vn', hoTen: 'Nguyễn Minh An', soDienThoai: '0900000001', hoTenHienThi: 'Nguyễn Minh An', chucDanh: 'Senior Frontend Engineer', viTriMongMuon: 'Frontend Developer', kinhNghiem: 6, diaChi: 'Hà Nội', tomTat: 'Dẫn dắt hệ thống frontend quy mô lớn.' },
  { email: 'ungvien2@ef.vn', hoTen: 'Trần Gia Huy', soDienThoai: '0900000002', hoTenHienThi: 'Trần Gia Huy', chucDanh: 'Backend Engineer', viTriMongMuon: 'Backend Developer', kinhNghiem: 5, diaChi: 'TP.HCM', tomTat: 'Thiết kế API, database, microservices.' },
  { email: 'ungvien3@ef.vn', hoTen: 'Lê Thảo Vy', soDienThoai: '0900000003', hoTenHienThi: 'Lê Thảo Vy', chucDanh: 'Fullstack Engineer', viTriMongMuon: 'Fullstack Developer', kinhNghiem: 7, diaChi: 'Đà Nẵng', tomTat: 'Xây dựng sản phẩm end-to-end.' },
  { email: 'ungvien4@ef.vn', hoTen: 'Phạm Quốc Bảo', soDienThoai: '0900000004', hoTenHienThi: 'Phạm Quốc Bảo', chucDanh: 'DevOps Engineer', viTriMongMuon: 'DevOps Engineer', kinhNghiem: 8, diaChi: 'Đà Nẵng', tomTat: 'CI/CD, cloud, hạ tầng tự động hóa.' },
  { email: 'ungvien5@ef.vn', hoTen: 'Hoàng Nhật Linh', soDienThoai: '0900000005', hoTenHienThi: 'Hoàng Nhật Linh', chucDanh: 'Mobile Engineer', viTriMongMuon: 'Mobile Developer', kinhNghiem: 4, diaChi: 'Hải Phòng', tomTat: 'Flutter, React Native, app đa nền tảng.' },
  { email: 'ungvien6@ef.vn', hoTen: 'Vũ Minh Khoa', soDienThoai: '0900000006', hoTenHienThi: 'Vũ Minh Khoa', chucDanh: 'Data Engineer', viTriMongMuon: 'Data Engineer', kinhNghiem: 6, diaChi: 'Hà Nội', tomTat: 'Pipeline dữ liệu, ETL, analytics.' },
  { email: 'ungvien7@ef.vn', hoTen: 'Đặng Khánh Vy', soDienThoai: '0900000007', hoTenHienThi: 'Đặng Khánh Vy', chucDanh: 'Product Designer', viTriMongMuon: 'UI/UX Designer', kinhNghiem: 5, diaChi: 'TP.HCM', tomTat: 'Thiết kế sản phẩm và design system.' },
  { email: 'ungvien8@ef.vn', hoTen: 'Bùi Đức Long', soDienThoai: '0900000008', hoTenHienThi: 'Bùi Đức Long', chucDanh: 'QA Automation Engineer', viTriMongMuon: 'QA Engineer', kinhNghiem: 4, diaChi: 'Cần Thơ', tomTat: 'Automation test, chất lượng sản phẩm.' },
] as const

const danhSachNhaTuyenDung = [
  { email: 'nhatuyendung1@ef.vn', hoTen: 'Sarah Chen', tenCongTy: 'Google', maSoThue: '0101000001', nganh: 'Search & AI', quyMo: 100000, diaChi: 'Mountain View, USA', website: 'https://google.com', moTa: 'Nền tảng tìm kiếm và AI hàng đầu thế giới.' },
  { email: 'nhatuyendung2@ef.vn', hoTen: 'Alex Johnson', tenCongTy: 'Microsoft', maSoThue: '0101000002', nganh: 'Cloud & Productivity', quyMo: 221000, diaChi: 'Redmond, USA', website: 'https://microsoft.com', moTa: 'Cloud, enterprise và nền tảng làm việc.' },
  { email: 'nhatuyendung3@ef.vn', hoTen: 'Maya Patel', tenCongTy: 'Meta', maSoThue: '0101000003', nganh: 'Social & XR', quyMo: 70000, diaChi: 'Menlo Park, USA', website: 'https://about.meta.com', moTa: 'Mạng xã hội, AI và metaverse.' },
  { email: 'nhatuyendung4@ef.vn', hoTen: 'Daniel Kim', tenCongTy: 'Amazon', maSoThue: '0101000004', nganh: 'E-commerce & Cloud', quyMo: 1500000, diaChi: 'Seattle, USA', website: 'https://amazon.jobs', moTa: 'Thương mại điện tử và AWS.' },
  { email: 'nhatuyendung5@ef.vn', hoTen: 'Emily Davis', tenCongTy: 'Apple', maSoThue: '0101000005', nganh: 'Hardware & Ecosystem', quyMo: 161000, diaChi: 'Cupertino, USA', website: 'https://apple.com', moTa: 'Thiết bị, hệ sinh thái và trải nghiệm người dùng.' },
  { email: 'nhatuyendung6@ef.vn', hoTen: 'Noah Brown', tenCongTy: 'NVIDIA', maSoThue: '0101000006', nganh: 'AI & Graphics', quyMo: 30000, diaChi: 'Santa Clara, USA', website: 'https://nvidia.com', moTa: 'GPU, AI và điện toán hiệu năng cao.' },
  { email: 'nhatuyendung7@ef.vn', hoTen: 'Sofia Garcia', tenCongTy: 'Stripe', maSoThue: '0101000007', nganh: 'Fintech', quyMo: 8000, diaChi: 'San Francisco, USA', website: 'https://stripe.com', moTa: 'Thanh toán và hạ tầng tài chính.' },
  { email: 'nhatuyendung8@ef.vn', hoTen: 'Oliver Wilson', tenCongTy: 'OpenAI', maSoThue: '0101000008', nganh: 'AI Research', quyMo: 3000, diaChi: 'San Francisco, USA', website: 'https://openai.com', moTa: 'Nghiên cứu và sản phẩm AI tạo sinh.' },
  { email: 'nhatuyendung9@ef.vn', hoTen: 'Ava Thompson', tenCongTy: 'Airbnb', maSoThue: '0101000009', nganh: 'Travel Tech', quyMo: 7000, diaChi: 'San Francisco, USA', website: 'https://airbnb.com', moTa: 'Nền tảng đặt chỗ và trải nghiệm du lịch.' },
  { email: 'nhatuyendung10@ef.vn', hoTen: 'Ethan Martinez', tenCongTy: 'Shopify', maSoThue: '0101000010', nganh: 'E-commerce Platform', quyMo: 10000, diaChi: 'Ottawa, Canada', website: 'https://shopify.com', moTa: 'Hạ tầng thương mại điện tử cho doanh nghiệp.' },
] as const

function layKyNang(kyNang: Awaited<ReturnType<typeof gieoKyNang>>, ten: string, batBuoc = true) {
  const item = kyNang.find(muc => muc.tenKyNang === ten)
  return { maKyNang: item?.id, batBuoc, mucDo: batBuoc ? 4 : 3 }
}

async function xoaDuLieuCu() {
  await prisma.tinNhan.deleteMany()
  await prisma.cuocTroChuyen.deleteMany()
  await prisma.goiYViecLam.deleteMany()
  await prisma.thongBao.deleteMany()
  await prisma.danhGiaPhongVan.deleteMany()
  await prisma.lichPhongVan.deleteMany()
  await prisma.lichSuHoSoUngTuyen.deleteMany()
  await prisma.danhGiaCongTy.deleteMany()
  await prisma.hoSoUngTuyen.deleteMany()
  await prisma.hoSoNangLuc.deleteMany()
  await prisma.viecLamDaLuu.deleteMany()
  await prisma.tinTuyenDungKyNang.deleteMany()
  await prisma.tinTuyenDung.deleteMany()
  await prisma.nhaTuyenDung.deleteMany()
  await prisma.ungVienKyNang.deleteMany()
  await prisma.ungVien.deleteMany()
  await prisma.danhMucKyNang.deleteMany()
  await prisma.nguoiDung.deleteMany()
}

async function gieoKyNang() {
  await prisma.danhMucKyNang.createMany({
    data: danhSachKyNang.map(item => ({ tenKyNang: item.tenKyNang, loaiKyNang: item.loaiKyNang })),
    skipDuplicates: true,
  })
  return prisma.danhMucKyNang.findMany()
}

async function taoTaiKhoanMau() {
  const matKhau = await bcrypt.hash(matKhauMau, 10)
  const admin = await prisma.nguoiDung.create({ data: { email: emailAdmin, matKhau, hoTen: 'Quản trị Effort Job', soDienThoai: '0900000000', vaiTro: 'admin', trangThai: 'hoat_dong' } })

  const ungVienUsers = await Promise.all(
    danhSachUngVien.map((item, index) =>
      prisma.nguoiDung.create({
        data: {
          email: item.email,
          matKhau,
          hoTen: item.hoTen,
          soDienThoai: item.soDienThoai,
          vaiTro: 'ung_vien',
          trangThai: 'hoat_dong',
        },
      }),
    ),
  )

  const nhaTuyenDungUsers = await Promise.all(
    danhSachNhaTuyenDung.map((item, index) =>
      prisma.nguoiDung.create({
        data: {
          email: item.email,
          matKhau,
          hoTen: item.hoTen,
          soDienThoai: `09100000${String(index + 1).padStart(2, '0')}`,
          vaiTro: 'nha_tuyen_dung',
          trangThai: 'hoat_dong',
        },
      }),
    ),
  )

  return { admin, ungVienUsers, nhaTuyenDungUsers }
}

async function main() {
  await xoaDuLieuCu()
  const kyNang = await gieoKyNang()
  const { admin, ungVienUsers, nhaTuyenDungUsers } = await taoTaiKhoanMau()

  const companies = await Promise.all(
    danhSachNhaTuyenDung.map((item, index) =>
      prisma.nhaTuyenDung.create({
        data: {
          maNguoiDung: nhaTuyenDungUsers[index].id,
          tenCongTy: item.tenCongTy,
          maSoThue: item.maSoThue,
          moTa: item.moTa,
          diaChi: item.diaChi,
          website: item.website,
          logo: `/uploads/logo-${item.tenCongTy.toLowerCase().replace(/\s+/g, '-')}.png`,
          quyMo: item.quyMo,
          nganh: item.nganh,
          trangThaiDuyet: 'da_duyet',
          ngayDuyet: new Date(),
        },
      }),
    ),
  )

  const candidateProfiles = await Promise.all(
    danhSachUngVien.map((item, index) =>
      prisma.ungVien.create({
        data: {
          maNguoiDung: ungVienUsers[index].id,
          ngaySinh: new Date(1995 + index, index % 12, 10 + index),
          gioiTinh: index % 2 === 0 ? 'nam' : 'nu',
          diaChi: index % 2 === 0 ? 'Hà Nội' : 'TP. Hồ Chí Minh',
          tomTat: item.tomTat,
          kinhNghiem: item.kinhNghiem,
          viTriMongMuon: item.viTriMongMuon,
          mucLuongMongMuon: 20000000 + index * 1500000,
          kyNang: [
            layKyNang(kyNang, index % 2 === 0 ? 'React' : 'Node.js'),
            layKyNang(kyNang, index % 2 === 0 ? 'TypeScript' : 'PostgreSQL'),
            layKyNang(kyNang, index % 3 === 0 ? 'Docker' : 'UI/UX', false),
          ],
          portfolio: [
            { ten: `${item.chucDanh} Portfolio`, url: 'https://effortit.site', moTa: 'Bộ sản phẩm demo tự seed.' },
          ],
        },
      }),
    ),
  )

  const jobTemplates = [
    {
      suffix: 'Senior Frontend Engineer',
      title: 'Senior Frontend Engineer',
      exp: '5+ năm',
      min: 40000000,
      max: 70000000,
      level: 'senior',
      type: 'hybrid',
      skills: ['React', 'TypeScript', 'Next.js', 'System Design', 'Testing'],
      desc: 'Xây dựng trải nghiệm sản phẩm tầm thế giới.',
    },
    {
      suffix: 'Staff Backend Engineer',
      title: 'Staff Backend Engineer',
      exp: '6+ năm',
      min: 50000000,
      max: 90000000,
      level: 'senior',
      type: 'toan_thoi_gian',
      skills: ['Node.js', 'PostgreSQL', 'Microservices', 'Docker', 'Kubernetes'],
      desc: 'Thiết kế hệ thống backend quy mô lớn.',
    },
  ] as const

  const jobs = []
  for (const [index, company] of companies.entries()) {
    for (const template of jobTemplates) {
      jobs.push(await prisma.tinTuyenDung.create({
        data: {
          maNhaTuyenDung: company.id,
          tieuDe: `${company.tenCongTy} ${template.title}`,
          yeuCauKinhNghiem: template.exp,
          diaChi: company.diaChi,
          luongMin: template.min,
          luongMax: template.max,
          loaiHinh: template.type,
          capBac: template.level,
          hanNop: new Date(Date.now() + (20 + index) * 24 * 60 * 60 * 1000),
          soLuong: 2,
          moTa: `${template.desc} Tại ${company.tenCongTy}.`,
          yeuCau: template.skills.join(', '),
          quyenLoi: 'Lương tốt, môi trường đỉnh cao, cơ hội làm việc với sản phẩm toàn cầu.',
          trangThai: index < 8 ? 'dang_mo' : 'cho_duyet',
          ngayDang: new Date(),
          kyNang: template.skills.map((ten, skillIndex) => layKyNang(kyNang, ten, skillIndex < 3)),
        },
      }))
    }
  }
  await dongBoTatCaKyNangTuJson()

  const specialJob = jobs[0]
  const specialCv = candidateProfiles[0]

  const applications = []
  for (let i = 0; i < 8; i++) {
    const candidate = candidateProfiles[i]
    const job = jobs[i]
    const cv = i % 2 === 0 ? specialCv : candidateProfiles[(i + 1) % candidateProfiles.length]
    const hoSo = await prisma.hoSoUngTuyen.create({
      data: {
        maUngVien: candidate.id,
        maTinTuyenDung: job.id,
        maHoSoNangLuc: cv.id,
        thuXinViec: `Tôi mong muốn gia nhập vị trí ${job.tieuDe}.`,
        diemKhopKyNang: 80 + (i % 5),
        trangThai: i % 3 === 0 ? 'moi_phong_van' : i % 3 === 1 ? 'dang_xet_duyet' : 'da_xem',
      },
    })
    applications.push(hoSo)
    await prisma.lichSuHoSoUngTuyen.createMany({
      data: [
        { maHoSoUngTuyen: hoSo.id, trangThaiMoi: 'da_nop', ghiChu: 'Ứng viên nộp hồ sơ', maNguoiDung: candidate.maNguoiDung },
        { maHoSoUngTuyen: hoSo.id, trangThaiCu: 'da_nop', trangThaiMoi: hoSo.trangThai, ghiChu: 'Tạo dữ liệu mẫu', maNguoiDung: admin.id },
      ],
    })
  }

  const interviews = await Promise.all(
    applications.slice(0, 5).map((hoSo, index) =>
      prisma.lichPhongVan.create({
        data: {
          maHoSoUngTuyen: hoSo.id,
          thoiGianBatDau: new Date(Date.now() + (index + 2) * 24 * 60 * 60 * 1000),
          thoiGianKetThuc: new Date(Date.now() + (index + 2) * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
          diaChi: index % 2 === 0 ? 'Online' : 'Văn phòng công ty',
          hinhThuc: index % 2 === 0 ? 'online' : 'offline',
          linkHop: index % 2 === 0 ? `https://meet.google.com/effort-${index + 1}` : undefined,
          ghiChu: 'Lịch phỏng vấn mẫu từ seed.',
          trangThai: index % 2 === 0 ? 'da_len_lich' : 'da_xac_nhan',
          ketQua: 'cho_ket_qua',
        },
      }),
    ),
  )

  await prisma.danhGiaCongTy.createMany({
    data: applications.slice(0, 5).map((hoSo, index) => ({
      maUngVien: candidateProfiles[index].id,
      maNhaTuyenDung: companies[index].id,
      maHoSoUngTuyen: hoSo.id,
      diem: 5 - (index % 2),
      noiDung: 'Môi trường tốt, quy trình rõ ràng, công nghệ hiện đại.',
      anDanh: index % 2 === 0,
      daDuyet: true,
    })),
  })

  await prisma.viecLamDaLuu.createMany({
    data: [
      { maNguoiDung: ungVienUsers[0].id, maTinTuyenDung: jobs[1].id, ngayLuu: new Date() },
      { maNguoiDung: ungVienUsers[1].id, maTinTuyenDung: jobs[2].id, ngayLuu: new Date() },
      { maNguoiDung: ungVienUsers[2].id, maTinTuyenDung: jobs[3].id, ngayLuu: new Date() },
    ],
  })

  await prisma.thongBao.createMany({
    data: [
      { maNguoiDung: ungVienUsers[0].id, loai: 'lich_phong_van', tieuDe: 'Bạn được mời phỏng vấn', noiDung: 'Google mời bạn phỏng vấn vị trí Senior Frontend Engineer.', maLichPhongVan: interviews[0].id, maHoSoUngTuyen: applications[0].id, mucDoUuTien: 'cao' },
      { maNguoiDung: nhaTuyenDungUsers[0].id, loai: 'ho_so_ung_tuyen', tieuDe: 'Hồ sơ ứng tuyển mới', noiDung: 'Ứng viên 1 vừa ứng tuyển vào Google.', maHoSoUngTuyen: applications[0].id, mucDoUuTien: 'cao' },
      { maNguoiDung: admin.id, loai: 'tin_tuyen_dung', tieuDe: 'Tin tuyển dụng chờ duyệt', noiDung: 'Một số tin từ seed đang chờ kiểm tra.', maTinTuyenDung: jobs[jobs.length - 1].id, mucDoUuTien: 'trung_binh' },
    ],
  })

  const chat = await prisma.cuocTroChuyen.create({
    data: {
      nguoiThamGia: [ungVienUsers[0].id, nhaTuyenDungUsers[0].id],
      loai: 'ung_vien_nha_tuyen_dung',
      maHoSoUngTuyen: applications[0].id,
      maTinTuyenDung: specialJob.id,
      maHoSoUngTuyenGanNhat: applications[0].id,
      maTinTuyenDungGanNhat: specialJob.id,
      soChuaDoc: { [ungVienUsers[0].id]: 1, [nhaTuyenDungUsers[0].id]: 0 },
      tinNhanCuoiCung: { noiDung: 'Hẹn gặp bạn trong buổi phỏng vấn.', nguoiGui: nhaTuyenDungUsers[0].id, thoiGian: new Date() },
    },
  })

  await prisma.tinNhan.createMany({
    data: [
      { maCuocTroChuyenId: chat.id, nguoiGui: ungVienUsers[0].id, noiDung: 'Em chào anh/chị, em đã nhận lịch phỏng vấn.', loai: 'text', daDuocDocBoi: [{ nguoiDung: nhaTuyenDungUsers[0].id, thoiGian: new Date() }] },
      { maCuocTroChuyenId: chat.id, nguoiGui: nhaTuyenDungUsers[0].id, noiDung: 'Hẹn gặp bạn trong buổi phỏng vấn.', loai: 'text', daDuocDocBoi: [] },
    ],
  })

  await prisma.goiYViecLam.create({
    data: {
      maUngVien: ungVienUsers[0].id,
      maHoSoNangLuc: specialCv.id,
      trangThai: 'hoan_thanh',
      nguon: 'seed',
      ketQua: [
        { maTinTuyenDung: jobs[0].id, diem: 96, lyDo: 'Khớp cực mạnh với React, TypeScript, Product UI.', kyNangKhop: ['React', 'TypeScript', 'UI/UX'], kyNangThieu: [] },
        { maTinTuyenDung: jobs[1].id, diem: 88, lyDo: 'Có nền tảng fullstack tốt, cần tối ưu backend sâu hơn.', kyNangKhop: ['TypeScript', 'REST API'], kyNangThieu: ['Microservices', 'Kubernetes'] },
      ],
    },
  })

  console.log('Đã gieo dữ liệu mẫu thành công.')
  console.log(`- Quản trị viên: ${emailAdmin} / ${matKhauMau}`)
  console.log(`- Ứng viên mẫu: ungvien1@ef.vn ... ungvien8@ef.vn / ${matKhauMau}`)
  console.log(`- Nhà tuyển dụng mẫu: nhatuyendung1@ef.vn ... nhatuyendung10@ef.vn / ${matKhauMau}`)
  console.log(`- Kỹ năng seed: ${danhSachKyNang.length}`)
}

main()
  .catch((error) => {
    console.error('Gieo dữ liệu thất bại:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
