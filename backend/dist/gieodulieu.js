"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_js_1 = require("./cauhinh/prisma.js");
const matKhauMau = '123456';
const emailAdmin = 'admin@ef.vn';
const danhSachKyNang = [
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
    { tenKyNang: 'Responsive Design', loaiKyNang: 'frontend' },
    { tenKyNang: 'PWA', loaiKyNang: 'frontend' },
    { tenKyNang: 'Micro Frontend', loaiKyNang: 'frontend' },
    { tenKyNang: 'Storybook', loaiKyNang: 'frontend' },
    { tenKyNang: 'WebSocket', loaiKyNang: 'frontend' },
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
    { tenKyNang: 'GraphQL', loaiKyNang: 'backend' },
    { tenKyNang: 'REST API', loaiKyNang: 'backend' },
    { tenKyNang: 'gRPC', loaiKyNang: 'backend' },
    { tenKyNang: 'Microservices', loaiKyNang: 'backend' },
    { tenKyNang: 'Event-driven Architecture', loaiKyNang: 'backend' },
    { tenKyNang: 'Clean Architecture', loaiKyNang: 'backend' },
    { tenKyNang: 'Domain-Driven Design', loaiKyNang: 'backend' },
    { tenKyNang: 'Prisma', loaiKyNang: 'backend' },
    { tenKyNang: 'Sequelize', loaiKyNang: 'backend' },
    { tenKyNang: 'TypeORM', loaiKyNang: 'backend' },
    { tenKyNang: 'Message Queue', loaiKyNang: 'backend' },
    { tenKyNang: 'RabbitMQ', loaiKyNang: 'backend' },
    { tenKyNang: 'Kafka', loaiKyNang: 'backend' },
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
    { tenKyNang: 'AWS', loaiKyNang: 'devops' },
    { tenKyNang: 'Azure', loaiKyNang: 'devops' },
    { tenKyNang: 'Google Cloud', loaiKyNang: 'devops' },
    { tenKyNang: 'Linux', loaiKyNang: 'devops' },
    { tenKyNang: 'Shell Scripting', loaiKyNang: 'devops' },
    { tenKyNang: 'Monitoring', loaiKyNang: 'devops' },
    { tenKyNang: 'Logging', loaiKyNang: 'devops' },
    // QA / Testing
    { tenKyNang: 'Jest', loaiKyNang: 'kiem_thu' },
    { tenKyNang: 'Vitest', loaiKyNang: 'kiem_thu' },
    { tenKyNang: 'Playwright', loaiKyNang: 'kiem_thu' },
    { tenKyNang: 'Cypress', loaiKyNang: 'kiem_thu' },
    { tenKyNang: 'Selenium', loaiKyNang: 'kiem_thu' },
    { tenKyNang: 'Unit Testing', loaiKyNang: 'kiem_thu' },
    { tenKyNang: 'Integration Testing', loaiKyNang: 'kiem_thu' },
    { tenKyNang: 'E2E Testing', loaiKyNang: 'kiem_thu' },
    { tenKyNang: 'Performance Testing', loaiKyNang: 'kiem_thu' },
    { tenKyNang: 'Manual Testing', loaiKyNang: 'kiem_thu' },
    // Mobile
    { tenKyNang: 'React Native', loaiKyNang: 'mobile' },
    { tenKyNang: 'Flutter', loaiKyNang: 'mobile' },
    { tenKyNang: 'Android', loaiKyNang: 'mobile' },
    { tenKyNang: 'iOS', loaiKyNang: 'mobile' },
    { tenKyNang: 'Kotlin', loaiKyNang: 'mobile' },
    { tenKyNang: 'Swift', loaiKyNang: 'mobile' },
    // Data / AI
    { tenKyNang: 'Machine Learning', loaiKyNang: 'du_lieu' },
    { tenKyNang: 'Deep Learning', loaiKyNang: 'du_lieu' },
    { tenKyNang: 'TensorFlow', loaiKyNang: 'du_lieu' },
    { tenKyNang: 'PyTorch', loaiKyNang: 'du_lieu' },
    { tenKyNang: 'LLM', loaiKyNang: 'du_lieu' },
    { tenKyNang: 'Prompt Engineering', loaiKyNang: 'du_lieu' },
    { tenKyNang: 'Data Engineering', loaiKyNang: 'du_lieu' },
    { tenKyNang: 'ETL', loaiKyNang: 'du_lieu' },
    { tenKyNang: 'Pandas', loaiKyNang: 'du_lieu' },
    { tenKyNang: 'Power BI', loaiKyNang: 'du_lieu' },
    // Design
    { tenKyNang: 'UI/UX', loaiKyNang: 'thiet_ke' },
    { tenKyNang: 'Figma', loaiKyNang: 'thiet_ke' },
    { tenKyNang: 'Design System', loaiKyNang: 'thiet_ke' },
    { tenKyNang: 'Photoshop', loaiKyNang: 'thiet_ke' },
    // Product / Management
    { tenKyNang: 'Product Management', loaiKyNang: 'quan_ly' },
    { tenKyNang: 'Agile', loaiKyNang: 'quan_ly' },
    { tenKyNang: 'Scrum', loaiKyNang: 'quan_ly' },
    { tenKyNang: 'Kanban', loaiKyNang: 'quan_ly' },
    { tenKyNang: 'Jira', loaiKyNang: 'quan_ly' },
    // Security / Architecture
    { tenKyNang: 'OAuth2', loaiKyNang: 'phan_tich' },
    { tenKyNang: 'JWT', loaiKyNang: 'phan_tich' },
    { tenKyNang: 'System Design', loaiKyNang: 'phan_tich' },
    { tenKyNang: 'Business Analysis', loaiKyNang: 'phan_tich' },
    { tenKyNang: 'Requirements Analysis', loaiKyNang: 'phan_tich' },
    // Soft skills
    { tenKyNang: 'Communication', loaiKyNang: 'ky_nang_mem' },
    { tenKyNang: 'Teamwork', loaiKyNang: 'ky_nang_mem' },
    { tenKyNang: 'Problem Solving', loaiKyNang: 'ky_nang_mem' },
    { tenKyNang: 'Leadership', loaiKyNang: 'ky_nang_mem' },
    { tenKyNang: 'English', loaiKyNang: 'ngon_ngu' },
];
const danhSachNhaTuyenDung = [
    { email: 'nhatuyendung1@ef.vn', hoTen: 'Sarah Chen', tenCongTy: 'Google', maSoThue: '0101000001', nganh: 'Search & AI', quyMo: 100000, diaChi: 'Đà Nẵng', website: 'https://google.com', moTa: 'Nền tảng tìm kiếm và AI hàng đầu thế giới. Văn phòng tại Đà Nẵng tập trung phát triển AI và cloud computing.' },
    { email: 'nhatuyendung2@ef.vn', hoTen: 'Alex Johnson', tenCongTy: 'Microsoft', maSoThue: '0101000002', nganh: 'Cloud & Productivity', quyMo: 221000, diaChi: 'Đà Nẵng', website: 'https://microsoft.com', moTa: 'Cloud, enterprise và nền tảng làm việc toàn cầu. Đội ngũ Đà Nẵng phát triển Azure và Microsoft 365.' },
    { email: 'nhatuyendung3@ef.vn', hoTen: 'Maya Patel', tenCongTy: 'Meta', maSoThue: '0101000003', nganh: 'Social & AI', quyMo: 70000, diaChi: 'TP.HCM', website: 'https://about.meta.com', moTa: 'Mạng xã hội, AI và metaverse. Đội VN phát triển tính năng AI cho Facebook và Instagram.' },
    { email: 'nhatuyendung4@ef.vn', hoTen: 'Daniel Kim', tenCongTy: 'Amazon', maSoThue: '0101000004', nganh: 'E-commerce & Cloud', quyMo: 1500000, diaChi: 'Hà Nội', website: 'https://amazon.jobs', moTa: 'Thương mại điện tử và AWS. Team Hà Nội phụ trách tối ưu logistics và cloud infrastructure.' },
    { email: 'nhatuyendung5@ef.vn', hoTen: 'Emily Davis', tenCongTy: 'Apple', maSoThue: '0101000005', nganh: 'Hardware & Ecosystem', quyMo: 161000, diaChi: 'Đà Nẵng', website: 'https://apple.com', moTa: 'Thiết bị, hệ sinh thái và trải nghiệm người dùng. Apple Đà Nẵng phát triển iOS và macOS apps.' },
    { email: 'nhatuyendung6@ef.vn', hoTen: 'Noah Brown', tenCongTy: 'NVIDIA', maSoThue: '0101000006', nganh: 'AI & Graphics', quyMo: 30000, diaChi: 'Đà Nẵng', website: 'https://nvidia.com', moTa: 'GPU, AI và điện toán hiệu năng cao. NVIDIA Đà Nẵng nghiên cứu deep learning và computer vision.' },
    { email: 'nhatuyendung7@ef.vn', hoTen: 'Sofia Garcia', tenCongTy: 'Stripe', maSoThue: '0101000007', nganh: 'Fintech', quyMo: 8000, diaChi: 'TP.HCM', website: 'https://stripe.com', moTa: 'Thanh toán và hạ tầng tài chính toàn cầu. Team TP.HCM xây dựng payment APIs cho thị trường Đông Nam Á.' },
    { email: 'nhatuyendung8@ef.vn', hoTen: 'Oliver Wilson', tenCongTy: 'OpenAI', maSoThue: '0101000008', nganh: 'AI Research', quyMo: 3000, diaChi: 'Đà Nẵng', website: 'https://openai.com', moTa: 'Nghiên cứu và sản phẩm AI tạo sinh. OpenAI Đà Nẵng phát triển LLM và fine-tuning cho thị trường châu Á.' },
    { email: 'nhatuyendung9@ef.vn', hoTen: 'Ava Thompson', tenCongTy: 'Shopify', maSoThue: '0101000009', nganh: 'E-commerce Platform', quyMo: 10000, diaChi: 'Hà Nội', website: 'https://shopify.com', moTa: 'Hạ tầng thương mại điện tử cho doanh nghiệp toàn cầu. Team Hà Nội phát triển merchant tools và analytics.' },
    { email: 'nhatuyendung10@ef.vn', hoTen: 'Ethan Martinez', tenCongTy: 'Airbnb', maSoThue: '0101000010', nganh: 'Travel Tech', quyMo: 7000, diaChi: 'Đà Nẵng', website: 'https://airbnb.com', moTa: 'Nền tảng đặt chỗ và trải nghiệm du lịch. Airbnb Đà Nẵng phát triển search và recommendation engine.' },
];
const danhSachUngVien = [
    { email: 'ungvien1@ef.vn', hoTen: 'Nguyễn Minh An', soDienThoai: '0900000001', hoTenHienThi: 'Nguyễn Minh An', chucDanh: 'Senior Frontend Engineer', viTriMongMuon: 'Frontend Developer', kinhNghiem: 6, diaChi: 'Đà Nẵng', tomTat: 'Dẫn dắt hệ thống frontend quy mô lớn với React, TypeScript và Next.js. Có kinh nghiệm mentoring và xây dựng design system.' },
    { email: 'ungvien2@ef.vn', hoTen: 'Trần Gia Huy', soDienThoai: '0900000002', hoTenHienThi: 'Trần Gia Huy', chucDanh: 'Backend Engineer', viTriMongMuon: 'Backend Developer', kinhNghiem: 5, diaChi: 'TP.HCM', tomTat: 'Thiết kế API, database optimization và microservices với Node.js và PostgreSQL. Có kinh nghiệm xử lý high traffic.' },
    { email: 'ungvien3@ef.vn', hoTen: 'Lê Thảo Vy', soDienThoai: '0900000003', hoTenHienThi: 'Lê Thảo Vy', chucDanh: 'Fullstack Engineer', viTriMongMuon: 'Fullstack Developer', kinhNghiem: 7, diaChi: 'Đà Nẵng', tomTat: 'Xây dựng sản phẩm end-to-end từ React frontend đến Node.js backend. Tech lead cho team 5 người.' },
    { email: 'ungvien4@ef.vn', hoTen: 'Phạm Quốc Bảo', soDienThoai: '0900000004', hoTenHienThi: 'Phạm Quốc Bảo', chucDanh: 'DevOps Engineer', viTriMongMuon: 'DevOps Engineer', kinhNghiem: 8, diaChi: 'Đà Nẵng', tomTat: 'CI/CD, cloud infrastructure và tự động hóa với Docker, Kubernetes, AWS. Giảm downtime 99.9%.' },
    { email: 'ungvien5@ef.vn', hoTen: 'Hoàng Nhật Linh', soDienThoai: '0900000005', hoTenHienThi: 'Hoàng Nhật Linh', chucDanh: 'Mobile Engineer', viTriMongMuon: 'Mobile Developer', kinhNghiem: 4, diaChi: 'Hà Nội', tomTat: 'Flutter và React Native cho ứng dụng đa nền tảng. Có 3 ứng dụng đạt 100k+ downloads trên App Store.' },
    { email: 'ungvien6@ef.vn', hoTen: 'Vũ Minh Khoa', soDienThoai: '0900000006', hoTenHienThi: 'Vũ Minh Khoa', chucDanh: 'Data Engineer', viTriMongMuon: 'Data Engineer', kinhNghiem: 6, diaChi: 'Hà Nội', tomTat: 'Pipeline dữ liệu, ETL và analytics với Spark, Kafka, và cloud data warehouses. Xử lý 10M+ records/day.' },
    { email: 'ungvien7@ef.vn', hoTen: 'Đặng Khánh Vy', soDienThoai: '0900000007', hoTenHienThi: 'Đặng Khánh Vy', chucDanh: 'Product Designer', viTriMongMuon: 'UI/UX Designer', kinhNghiem: 5, diaChi: 'TP.HCM', tomTat: 'Thiết kế sản phẩm và design system với Figma. Có kinh nghiệm user research và A/B testing.' },
    { email: 'ungvien8@ef.vn', hoTen: 'Bùi Đức Long', soDienThoai: '0900000008', hoTenHienThi: 'Bùi Đức Long', chucDanh: 'QA Automation Engineer', viTriMongMuon: 'QA Engineer', kinhNghiem: 4, diaChi: 'Đà Nẵng', tomTat: 'Automation test với Playwright và Cypress. Tăng test coverage từ 20% lên 85% cho sản phẩm SaaS.' },
    { email: 'ungvien9@ef.vn', hoTen: 'Lê Hoàng Nam', soDienThoai: '0900000009', hoTenHienThi: 'Lê Hoàng Nam', chucDanh: 'AI Engineer', viTriMongMuon: 'AI/ML Engineer', kinhNghiem: 3, diaChi: 'Đà Nẵng', tomTat: 'Fine-tuning LLM và xây dựng AI pipeline với Python, TensorFlow và LangChain.' },
    { email: 'ungvien10@ef.vn', hoTen: 'Nguyễn Thị Hoa', soDienThoai: '0900000010', hoTenHienThi: 'Nguyễn Thị Hoa', chucDanh: 'Business Analyst', viTriMongMuon: 'Business Analyst', kinhNghiem: 5, diaChi: 'TP.HCM', tomTat: 'Phân tích yêu cầu nghiệp vụ, viết user stories và làm cầu nối giữa business và dev team.' },
];
function layKyNang(kyNang, ten, batBuoc = true) {
    const item = kyNang.find(muc => muc.tenKyNang === ten);
    if (!item)
        return null;
    return { maKyNang: item.id, batBuoc, mucDo: batBuoc ? 4 : 3 };
}
async function taoKyNangUngVien(maUngVien, danhSach) {
    const rows = danhSach.filter(Boolean).map(item => ({
        maUngVien,
        maKyNang: item.maKyNang,
        mucDo: item.mucDo ?? null,
        soNamKinhNghiem: null,
    }));
    if (!rows.length)
        return;
    await prisma_js_1.prisma.ungVienKyNang.createMany({ data: rows, skipDuplicates: true });
}
async function taoKyNangTin(maTinTuyenDung, danhSach) {
    const rows = danhSach.filter(Boolean).map(item => ({
        maTinTuyenDung,
        maKyNang: item.maKyNang,
        batBuoc: Boolean(item.batBuoc),
        mucDo: item.mucDo ?? null,
        trongSo: item.batBuoc ? 1 : 0.5,
    }));
    if (!rows.length)
        return;
    await prisma_js_1.prisma.tinTuyenDungKyNang.createMany({ data: rows, skipDuplicates: true });
}
async function xoaDuLieuCu() {
    console.log('Đang xóa dữ liệu cũ...');
    await prisma_js_1.prisma.tinNhan.deleteMany();
    await prisma_js_1.prisma.cuocTroChuyen.deleteMany();
    await prisma_js_1.prisma.goiYViecLam.deleteMany();
    await prisma_js_1.prisma.thongBao.deleteMany();
    await prisma_js_1.prisma.lichPhongVan.deleteMany();
    await prisma_js_1.prisma.lichSuHoSoUngTuyen.deleteMany();
    await prisma_js_1.prisma.danhGiaCongTy.deleteMany();
    await prisma_js_1.prisma.hoSoUngTuyen.deleteMany();
    await prisma_js_1.prisma.hoSoNangLuc.deleteMany();
    await prisma_js_1.prisma.viecLamDaLuu.deleteMany();
    await prisma_js_1.prisma.tinTuyenDungKyNang.deleteMany();
    await prisma_js_1.prisma.tinTuyenDung.deleteMany();
    await prisma_js_1.prisma.nhaTuyenDung.deleteMany();
    await prisma_js_1.prisma.ungVienKyNang.deleteMany();
    await prisma_js_1.prisma.ungVien.deleteMany();
    await prisma_js_1.prisma.danhMucKyNang.deleteMany();
    await prisma_js_1.prisma.nguoiDung.deleteMany();
    console.log('Đã xóa xong.');
}
async function gieoKyNang() {
    await prisma_js_1.prisma.danhMucKyNang.createMany({
        data: danhSachKyNang.map(item => ({ tenKyNang: item.tenKyNang, loaiKyNang: item.loaiKyNang })),
        skipDuplicates: true,
    });
    return prisma_js_1.prisma.danhMucKyNang.findMany();
}
async function main() {
    await xoaDuLieuCu();
    const kyNang = await gieoKyNang();
    console.log(`Đã gieo ${kyNang.length} kỹ năng.`);
    const matKhau = await bcryptjs_1.default.hash(matKhauMau, 10);
    // Tạo admin
    const admin = await prisma_js_1.prisma.nguoiDung.create({
        data: { email: emailAdmin, matKhau, hoTen: 'Quản trị Effort Job', soDienThoai: '0900000000', vaiTro: 'admin', trangThai: 'hoat_dong' },
    });
    // Tạo tài khoản ứng viên
    const ungVienUsers = await Promise.all(danhSachUngVien.map((item) => prisma_js_1.prisma.nguoiDung.create({
        data: { email: item.email, matKhau, hoTen: item.hoTen, soDienThoai: item.soDienThoai, vaiTro: 'ung_vien', trangThai: 'hoat_dong' },
    })));
    // Tạo tài khoản nhà tuyển dụng
    const nhaTuyenDungUsers = await Promise.all(danhSachNhaTuyenDung.map((item, index) => prisma_js_1.prisma.nguoiDung.create({
        data: { email: item.email, matKhau, hoTen: item.hoTen, soDienThoai: `09100000${String(index + 1).padStart(2, '0')}`, vaiTro: 'nha_tuyen_dung', trangThai: 'hoat_dong' },
    })));
    // Tạo hồ sơ công ty (7 đã duyệt, 2 chờ duyệt, 1 bị từ chối)
    const trangThaiCongTy = [
        { trangThaiDuyet: 'da_duyet', ngayDuyet: new Date() },
        { trangThaiDuyet: 'da_duyet', ngayDuyet: new Date() },
        { trangThaiDuyet: 'da_duyet', ngayDuyet: new Date() },
        { trangThaiDuyet: 'da_duyet', ngayDuyet: new Date() },
        { trangThaiDuyet: 'da_duyet', ngayDuyet: new Date() },
        { trangThaiDuyet: 'da_duyet', ngayDuyet: new Date() },
        { trangThaiDuyet: 'da_duyet', ngayDuyet: new Date() },
        { trangThaiDuyet: 'cho_duyet', ngayDuyet: undefined },
        { trangThaiDuyet: 'cho_duyet', ngayDuyet: undefined },
        { trangThaiDuyet: 'tu_choi', ngayDuyet: undefined, lyDoTuChoi: 'Hồ sơ thiếu giấy phép kinh doanh và thông tin không đầy đủ.' },
    ];
    const companies = await Promise.all(danhSachNhaTuyenDung.map((item, index) => prisma_js_1.prisma.nhaTuyenDung.create({
        data: {
            maNguoiDung: nhaTuyenDungUsers[index].id,
            tenCongTy: item.tenCongTy,
            maSoThue: item.maSoThue,
            moTa: item.moTa,
            diaChi: item.diaChi,
            website: item.website,
            logo: `https://logo.clearbit.com/${item.website.replace('https://', '')}`,
            quyMo: item.quyMo,
            nganh: item.nganh,
            trangThaiDuyet: trangThaiCongTy[index].trangThaiDuyet,
            ngayDuyet: trangThaiCongTy[index].ngayDuyet,
            lyDoTuChoi: trangThaiCongTy[index].lyDoTuChoi,
        },
    })));
    console.log(`Đã tạo ${companies.length} công ty.`);
    // Tạo hồ sơ ứng viên
    const candidateProfiles = await Promise.all(danhSachUngVien.map((item, index) => prisma_js_1.prisma.ungVien.create({
        data: {
            maNguoiDung: ungVienUsers[index].id,
            ngaySinh: new Date(1993 + index, index % 12, 10 + index),
            gioiTinh: index % 2 === 0 ? 'nam' : 'nu',
            diaChi: item.diaChi,
            tomTat: item.tomTat,
            kinhNghiem: item.kinhNghiem,
            viTriMongMuon: item.viTriMongMuon,
            mucLuongMongMuon: 18000000 + index * 2000000,
        },
    })));
    // Kỹ năng cho từng ứng viên
    const kyNangMap = new Map(kyNang.map(k => [k.tenKyNang, k]));
    const getK = (ten) => kyNangMap.get(ten) ?? null;
    await taoKyNangUngVien(candidateProfiles[0].id, [layKyNang(kyNang, 'React'), layKyNang(kyNang, 'TypeScript'), layKyNang(kyNang, 'Next.js'), layKyNang(kyNang, 'Tailwind CSS', false)]);
    await taoKyNangUngVien(candidateProfiles[1].id, [layKyNang(kyNang, 'Node.js'), layKyNang(kyNang, 'PostgreSQL'), layKyNang(kyNang, 'Docker'), layKyNang(kyNang, 'REST API', false)]);
    await taoKyNangUngVien(candidateProfiles[2].id, [layKyNang(kyNang, 'React'), layKyNang(kyNang, 'Node.js'), layKyNang(kyNang, 'TypeScript'), layKyNang(kyNang, 'PostgreSQL', false)]);
    await taoKyNangUngVien(candidateProfiles[3].id, [layKyNang(kyNang, 'Docker'), layKyNang(kyNang, 'Kubernetes'), layKyNang(kyNang, 'AWS'), layKyNang(kyNang, 'CI/CD', false)]);
    await taoKyNangUngVien(candidateProfiles[4].id, [layKyNang(kyNang, 'Flutter'), layKyNang(kyNang, 'React Native'), layKyNang(kyNang, 'Kotlin', false)]);
    await taoKyNangUngVien(candidateProfiles[5].id, [layKyNang(kyNang, 'ETL'), layKyNang(kyNang, 'Kafka'), layKyNang(kyNang, 'PostgreSQL', false)]);
    await taoKyNangUngVien(candidateProfiles[6].id, [layKyNang(kyNang, 'Figma'), layKyNang(kyNang, 'UI/UX'), layKyNang(kyNang, 'Design System', false)]);
    await taoKyNangUngVien(candidateProfiles[7].id, [layKyNang(kyNang, 'Playwright'), layKyNang(kyNang, 'Cypress'), layKyNang(kyNang, 'Jest', false)]);
    await taoKyNangUngVien(candidateProfiles[8].id, [layKyNang(kyNang, 'Machine Learning'), layKyNang(kyNang, 'LLM'), layKyNang(kyNang, 'Python', false)]);
    await taoKyNangUngVien(candidateProfiles[9].id, [layKyNang(kyNang, 'Business Analysis'), layKyNang(kyNang, 'Requirements Analysis'), layKyNang(kyNang, 'Jira', false)]);
    // CV (hồ sơ năng lực) cho từng ứng viên
    const candidateCvs = await Promise.all(danhSachUngVien.map((item, index) => prisma_js_1.prisma.hoSoNangLuc.create({
        data: {
            maUngVien: candidateProfiles[index].id,
            tieuDe: `${item.hoTenHienThi} - CV chính`,
            hoTenHienThi: item.hoTenHienThi,
            chucDanh: item.chucDanh,
            soDienThoai: item.soDienThoai,
            emailLienHe: item.email,
            portfolioUrl: `https://portfolio.example.com/${item.email.split('@')[0]}`,
            tomTatKinhNghiem: [item.tomTat],
            kyNangMem: ['Giao tiếp tốt', 'Làm việc nhóm', 'Chủ động học hỏi', 'Tiếng Anh B2'],
            kyNangLapTrinh: [{ nhom: item.viTriMongMuon, kyNang: [item.viTriMongMuon] }],
            hocVan: [{ truong: 'Đại học Bách Khoa Đà Nẵng', chuyenNganh: 'Công nghệ thông tin', namTotNghiep: '2018' }],
            kinhNghiemLam: [{ congTy: 'Effort Lab', vaiTro: item.chucDanh, thoiGian: `${item.kinhNghiem} năm`, moTa: item.tomTat }],
            duAnChiTiet: [{ tenDuAn: 'Effort Platform v2', vaiTro: item.chucDanh, moTa: 'Hệ thống tuyển dụng CNTT Đà Nẵng' }],
            cvChinh: true, congKhai: true,
        },
    })));
    console.log(`Đã tạo ${candidateCvs.length} hồ sơ năng lực.`);
    // Tin tuyển dụng đa dạng cho từng công ty
    const jobTemplates = [
        { title: 'Tuyển Senior Frontend Developer', exp: '4+ năm', min: 35000000, max: 60000000, level: 'senior', type: 'hybrid', skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'], desc: 'Xây dựng giao diện sản phẩm hiệu năng cao.' },
        { title: 'Tuyển Backend Engineer (Node.js)', exp: '3+ năm', min: 30000000, max: 55000000, level: 'middle', type: 'toan_thoi_gian', skills: ['Node.js', 'PostgreSQL', 'Docker', 'REST API'], desc: 'Phát triển API và database cho hệ thống lớn.' },
        { title: 'Tuyển Fullstack Developer', exp: '3+ năm', min: 28000000, max: 50000000, level: 'middle', type: 'hybrid', skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'], desc: 'Phát triển tính năng end-to-end cho sản phẩm.' },
        { title: 'Tuyển DevOps Engineer', exp: '4+ năm', min: 40000000, max: 70000000, level: 'senior', type: 'toan_thoi_gian', skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'], desc: 'Xây dựng và vận hành hạ tầng cloud.' },
        { title: 'Tuyển Mobile Developer (Flutter)', exp: '2+ năm', min: 25000000, max: 45000000, level: 'junior', type: 'toan_thoi_gian', skills: ['Flutter', 'Kotlin', 'React Native'], desc: 'Phát triển ứng dụng mobile đa nền tảng.' },
        { title: 'Tuyển Data Engineer', exp: '3+ năm', min: 35000000, max: 60000000, level: 'middle', type: 'remote', skills: ['ETL', 'Kafka', 'PostgreSQL', 'Python'], desc: 'Xây dựng data pipeline và analytics platform.' },
        { title: 'Tuyển UI/UX Designer', exp: '3+ năm', min: 25000000, max: 45000000, level: 'middle', type: 'hybrid', skills: ['Figma', 'UI/UX', 'Design System'], desc: 'Thiết kế trải nghiệm người dùng đỉnh cao.' },
        { title: 'Tuyển QA Automation Engineer', exp: '2+ năm', min: 20000000, max: 38000000, level: 'junior', type: 'toan_thoi_gian', skills: ['Playwright', 'Cypress', 'Jest'], desc: 'Đảm bảo chất lượng sản phẩm qua automation.' },
        { title: 'Tuyển AI/ML Engineer', exp: '2+ năm', min: 35000000, max: 65000000, level: 'middle', type: 'hybrid', skills: ['Machine Learning', 'LLM', 'Python'], desc: 'Nghiên cứu và triển khai mô hình AI.' },
        { title: 'Tuyển Junior Frontend Developer', exp: '0-1 năm', min: 12000000, max: 20000000, level: 'junior', type: 'toan_thoi_gian', skills: ['React', 'JavaScript', 'HTML5', 'CSS3'], desc: 'Ứng viên fresher hoặc có ít kinh nghiệm.' },
        { title: 'Tuyển Tech Lead (Backend)', exp: '7+ năm', min: 60000000, max: 100000000, level: 'leader', type: 'toan_thoi_gian', skills: ['Microservices', 'System Design', 'Node.js', 'PostgreSQL'], desc: 'Dẫn dắt team backend 8-10 người.' },
        { title: 'Tuyển Business Analyst', exp: '3+ năm', min: 22000000, max: 40000000, level: 'middle', type: 'toan_thoi_gian', skills: ['Business Analysis', 'Requirements Analysis', 'Jira'], desc: 'Phân tích nghiệp vụ và làm cầu nối dev-business.' },
    ];
    const allJobs = [];
    for (let ci = 0; ci < companies.length; ci++) {
        const company = companies[ci];
        // Mỗi công ty tạo 3-5 tin
        const numJobs = 3 + (ci % 3);
        for (let ji = 0; ji < numJobs; ji++) {
            const template = jobTemplates[(ci * 3 + ji) % jobTemplates.length];
            const daysToDeadline = 15 + (ci * 5 + ji * 3) % 45;
            const trangThai = ci < 8 ? 'dang_mo' : 'cho_duyet';
            const job = await prisma_js_1.prisma.tinTuyenDung.create({
                data: {
                    maNhaTuyenDung: company.id,
                    tieuDe: `${template.title} - ${company.tenCongTy}`,
                    yeuCauKinhNghiem: template.exp,
                    diaChi: company.diaChi,
                    luongMin: template.min,
                    luongMax: template.max,
                    loaiHinh: template.type,
                    capBac: template.level,
                    hanNop: new Date(Date.now() + daysToDeadline * 24 * 60 * 60 * 1000),
                    soLuong: 1 + (ji % 3),
                    moTa: `${template.desc}\n\nCông ty ${company.tenCongTy}: ${company.moTa}\n\nChúng tôi cung cấp môi trường làm việc quốc tế, cơ hội học hỏi công nghệ mới nhất và thu nhập cạnh tranh top 15% thị trường.`,
                    yeuCau: template.skills.join(', ') + '. Có kinh nghiệm ' + template.exp + '. Tiếng Anh đọc tài liệu tốt.',
                    quyenLoi: 'Lương thỏa thuận theo năng lực. Thưởng theo hiệu suất. MacBook Pro. Bảo hiểm toàn diện. Remote linh hoạt. Budget học tập $500/năm. Visa và relocation support.',
                    trangThai,
                    ngayDang: trangThai === 'dang_mo' ? new Date() : undefined,
                },
            });
            await taoKyNangTin(job.id, template.skills.map((ten, si) => layKyNang(kyNang, ten, si < 2)));
            allJobs.push(job);
        }
    }
    console.log(`Đã tạo ${allJobs.length} tin tuyển dụng.`);
    const dangMoJobs = allJobs.filter(j => j.trangThai === 'dang_mo');
    // Hồ sơ ứng tuyển với đủ trạng thái
    const trangThaiUngTuyen = ['da_nop', 'da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat', 'tu_choi', 'da_rut', 'da_nop', 'da_xem', 'moi_phong_van'];
    const applications = [];
    for (let i = 0; i < Math.min(10, candidateProfiles.length); i++) {
        const jobIndex = i % dangMoJobs.length;
        const trangThai = trangThaiUngTuyen[i] ?? 'da_nop';
        const hoSo = await prisma_js_1.prisma.hoSoUngTuyen.create({
            data: {
                maUngVien: candidateProfiles[i].id,
                maTinTuyenDung: dangMoJobs[jobIndex].id,
                maHoSoNangLuc: candidateCvs[i].id,
                thuXinViec: `Kính gửi Hiring Manager,\n\nTôi là ${danhSachUngVien[i].hoTen}, có ${danhSachUngVien[i].kinhNghiem} năm kinh nghiệm trong lĩnh vực ${danhSachUngVien[i].viTriMongMuon}. Tôi rất quan tâm đến vị trí này và tin rằng mình phù hợp với yêu cầu.\n\nTrân trọng.`,
                diemKhopKyNang: 70 + (i * 7 % 25),
                trangThai,
            },
        });
        applications.push(hoSo);
        await prisma_js_1.prisma.lichSuHoSoUngTuyen.create({
            data: { maHoSoUngTuyen: hoSo.id, trangThaiMoi: 'da_nop', ghiChu: 'Ứng viên nộp hồ sơ', maNguoiDung: candidateProfiles[i].maNguoiDung },
        });
        if (trangThai !== 'da_nop') {
            await prisma_js_1.prisma.lichSuHoSoUngTuyen.create({
                data: { maHoSoUngTuyen: hoSo.id, trangThaiCu: 'da_nop', trangThaiMoi: trangThai, ghiChu: 'Cập nhật trạng thái', maNguoiDung: admin.id },
            });
        }
    }
    console.log(`Đã tạo ${applications.length} hồ sơ ứng tuyển.`);
    // Lịch phỏng vấn cho hồ sơ mời phỏng vấn
    const moiPhongVanApps = applications.filter(a => a.trangThai === 'moi_phong_van' || a.trangThai === 'dat');
    const interviews = await Promise.all(moiPhongVanApps.map((hoSo, index) => prisma_js_1.prisma.lichPhongVan.create({
        data: {
            maHoSoUngTuyen: hoSo.id,
            thoiGianBatDau: new Date(Date.now() + (index + 3) * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
            thoiGianKetThuc: new Date(Date.now() + (index + 3) * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
            diaChi: index % 2 === 0 ? 'Online via Google Meet' : 'Văn phòng tầng 12, 01 Phan Đình Phùng, Đà Nẵng',
            hinhThuc: index % 2 === 0 ? 'online' : 'offline',
            linkHop: index % 2 === 0 ? `https://meet.google.com/effort-${index + 1}xxx` : undefined,
            ghiChu: 'Buổi phỏng vấn kỹ thuật 60 phút. Chuẩn bị giới thiệu bản thân và discuss về technical background.',
            trangThai: index === 0 ? 'da_xac_nhan' : 'da_len_lich',
            ketQua: 'cho_ket_qua',
        },
    })));
    console.log(`Đã tạo ${interviews.length} lịch phỏng vấn.`);
    // Đánh giá công ty (từ ứng viên đã hoàn thành)
    const danhGias = [];
    for (let i = 0; i < Math.min(5, companies.length); i++) {
        const app = applications[i];
        if (!app)
            continue;
        const dg = await prisma_js_1.prisma.danhGiaCongTy.create({
            data: {
                maUngVien: candidateProfiles[i].id,
                maNhaTuyenDung: companies[i].id,
                maHoSoUngTuyen: app.id,
                diem: 4 + (i % 2),
                noiDung: [
                    'Môi trường làm việc quốc tế, sếp rất tâm lý. Quy trình phỏng vấn chuyên nghiệp và nhanh chóng. Strongly recommend!',
                    'Công nghệ hiện đại, team đồng nghiệp giỏi. Review code chặt nhưng rất học được. Lương xứng đáng.',
                    'Văn hóa công ty tốt, cân bằng work-life. Nhiều cơ hội học hỏi. Có thể remote 3 ngày/tuần.',
                    'Dự án thú vị và impactful. Management minh bạch về roadmap. Benefits rất tốt.',
                    'Team chuyên nghiệp, code quality cao. Ít overtime. Môi trường tiếng Anh 100%.',
                ][i],
                anDanh: i % 3 === 0,
                daDuyet: true,
            },
        });
        danhGias.push(dg);
    }
    // Việc làm đã lưu
    await prisma_js_1.prisma.viecLamDaLuu.createMany({
        data: [
            { maNguoiDung: ungVienUsers[0].id, maTinTuyenDung: dangMoJobs[1]?.id ?? dangMoJobs[0].id },
            { maNguoiDung: ungVienUsers[1].id, maTinTuyenDung: dangMoJobs[2]?.id ?? dangMoJobs[0].id },
            { maNguoiDung: ungVienUsers[2].id, maTinTuyenDung: dangMoJobs[3]?.id ?? dangMoJobs[0].id },
            { maNguoiDung: ungVienUsers[0].id, maTinTuyenDung: dangMoJobs[4]?.id ?? dangMoJobs[0].id },
            { maNguoiDung: ungVienUsers[3].id, maTinTuyenDung: dangMoJobs[0].id },
        ],
    });
    // Thông báo mẫu
    await prisma_js_1.prisma.thongBao.createMany({
        data: [
            { maNguoiDung: ungVienUsers[0].id, loai: 'lich_phong_van', tieuDe: 'Lời mời phỏng vấn từ Google', noiDung: `Google đã mời bạn phỏng vấn vị trí ${dangMoJobs[0]?.tieuDe}. Vui lòng xác nhận lịch.`, maLichPhongVan: interviews[0]?.id, maHoSoUngTuyen: applications[0]?.id, mucDoUuTien: 'cao', lienKet: '/ung-vien/lich-phong-van' },
            { maNguoiDung: ungVienUsers[1].id, loai: 'ho_so_ung_tuyen', tieuDe: 'Hồ sơ của bạn đang được xem xét', noiDung: 'Nhà tuyển dụng đã xem hồ sơ của bạn và đang xét duyệt.', maHoSoUngTuyen: applications[1]?.id, mucDoUuTien: 'trung_binh', lienKet: '/ung-vien/ung-tuyen' },
            { maNguoiDung: nhaTuyenDungUsers[0].id, loai: 'ho_so_ung_tuyen', tieuDe: 'Hồ sơ ứng tuyển mới', noiDung: `${danhSachUngVien[0].hoTen} vừa ứng tuyển vào vị trí tại công ty bạn.`, maHoSoUngTuyen: applications[0]?.id, mucDoUuTien: 'cao', lienKet: '/nha-tuyen-dung/ung-vien' },
            { maNguoiDung: admin.id, loai: 'tin_tuyen_dung', tieuDe: 'Tin tuyển dụng chờ duyệt', noiDung: 'Có tin tuyển dụng mới đang chờ kiểm duyệt.', maTinTuyenDung: allJobs.find(j => j.trangThai === 'cho_duyet')?.id, mucDoUuTien: 'trung_binh', lienKet: '/quan-tri/tin-tuyen-dung' },
            { maNguoiDung: ungVienUsers[2].id, loai: 'he_thong', tieuDe: 'Chào mừng đến Effort Job!', noiDung: 'Hồ sơ của bạn đã sẵn sàng. Hãy bắt đầu tìm kiếm việc làm phù hợp!', mucDoUuTien: 'thap', lienKet: '/viec-lam' },
        ],
    });
    // Chat và tin nhắn mẫu
    const chatApp = applications.find(a => a.trangThai === 'moi_phong_van');
    if (chatApp) {
        const cuocChat = await prisma_js_1.prisma.cuocTroChuyen.create({
            data: {
                nguoiThamGia: [ungVienUsers[0].id, nhaTuyenDungUsers[0].id],
                loai: 'ung_vien_nha_tuyen_dung',
                maHoSoUngTuyen: chatApp.id,
                maTinTuyenDung: chatApp.maTinTuyenDung,
                maHoSoUngTuyenGanNhat: chatApp.id,
                maTinTuyenDungGanNhat: chatApp.maTinTuyenDung,
                soChuaDoc: { [ungVienUsers[0].id]: 1, [nhaTuyenDungUsers[0].id]: 0 },
                tinNhanCuoiCung: { noiDung: 'Hẹn gặp bạn trong buổi phỏng vấn nhé!', nguoiGui: nhaTuyenDungUsers[0].id, thoiGian: new Date() },
            },
        });
        await prisma_js_1.prisma.tinNhan.createMany({
            data: [
                { maCuocTroChuyenId: cuocChat.id, nguoiGui: nhaTuyenDungUsers[0].id, noiDung: 'Xin chào! Cảm ơn bạn đã ứng tuyển vào vị trí của chúng tôi.', loai: 'text', daDuocDocBoi: [{ nguoiDung: ungVienUsers[0].id, thoiGian: new Date() }] },
                { maCuocTroChuyenId: cuocChat.id, nguoiGui: ungVienUsers[0].id, noiDung: 'Xin chào anh/chị! Em rất vui được liên hệ. Em đã xem qua JD và rất hứng thú với vị trí này.', loai: 'text', daDuocDocBoi: [{ nguoiDung: nhaTuyenDungUsers[0].id, thoiGian: new Date() }] },
                { maCuocTroChuyenId: cuocChat.id, nguoiGui: nhaTuyenDungUsers[0].id, noiDung: 'Hẹn gặp bạn trong buổi phỏng vấn nhé!', loai: 'text', daDuocDocBoi: [] },
            ],
        });
    }
    // Gợi ý việc làm AI
    await prisma_js_1.prisma.goiYViecLam.create({
        data: {
            maUngVien: candidateProfiles[0].id,
            maHoSoNangLuc: candidateCvs[0].id,
            trangThai: 'hoan_thanh',
            nguon: 'seed',
            ketQua: dangMoJobs.slice(0, 5).map((job, i) => ({
                maTinTuyenDung: job.id,
                diem: 95 - i * 5,
                lyDo: `Khớp ${5 - i} kỹ năng chính. Phù hợp với kinh nghiệm và mức lương mong muốn.`,
                kyNangKhop: ['React', 'TypeScript', 'Node.js'].slice(0, 3 - i % 2),
                kyNangThieu: i > 2 ? ['Kubernetes'] : [],
            })),
        },
    });
    console.log('\n✅ Gieo dữ liệu thành công!');
    console.log(`🔑 Admin: ${emailAdmin} / ${matKhauMau}`);
    console.log(`👤 Ứng viên: ungvien1@ef.vn ... ungvien10@ef.vn / ${matKhauMau}`);
    console.log(`🏢 NTD: nhatuyendung1@ef.vn ... nhatuyendung10@ef.vn / ${matKhauMau}`);
    console.log(`📊 Kỹ năng: ${kyNang.length} | Công ty: ${companies.length} | Tin: ${allJobs.length} | Ứng tuyển: ${applications.length}`);
}
main()
    .catch((error) => {
    console.error('Gieo dữ liệu thất bại:', error);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma_js_1.prisma.$disconnect();
});
