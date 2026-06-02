"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ketnoidulieu_js_1 = require("./cauhinh/ketnoidulieu.js");
const danhgiacongty_mohinh_js_1 = require("./modules/danhgiacongty/danhgiacongty.mohinh.js");
const danhmuckynang_mohinh_js_1 = require("./modules/danhmuckynang/danhmuckynang.mohinh.js");
const hosonangluc_mohinh_js_1 = require("./modules/hosonangluc/hosonangluc.mohinh.js");
const hosoungtuyen_mohinh_js_1 = require("./modules/hosoungtuyen/hosoungtuyen.mohinh.js");
const lichphongvan_mohinh_js_1 = require("./modules/lichphongvan/lichphongvan.mohinh.js");
const nguoidung_mohinh_js_1 = require("./modules/nguoidung/nguoidung.mohinh.js");
const nhatuyendung_mohinh_js_1 = require("./modules/nhatuyendung/nhatuyendung.mohinh.js");
const thongbao_mohinh_js_1 = require("./modules/thongbao/thongbao.mohinh.js");
const tintuyendung_mohinh_js_1 = require("./modules/tintuyendung/tintuyendung.mohinh.js");
const ungvien_mohinh_js_1 = require("./modules/ungvien/ungvien.mohinh.js");
const matKhauMau = '123456';
async function gieoKyNang() {
    const duLieuMau = [
        { tenKyNang: 'React', loaiKyNang: 'frontend' },
        { tenKyNang: 'TypeScript', loaiKyNang: 'frontend' },
        { tenKyNang: 'NodeJS', loaiKyNang: 'backend' },
        { tenKyNang: 'MongoDB', loaiKyNang: 'database' },
        { tenKyNang: 'Docker', loaiKyNang: 'devops' },
        { tenKyNang: 'UI/UX', loaiKyNang: 'thiet_ke' },
        { tenKyNang: 'Python', loaiKyNang: 'backend' },
        { tenKyNang: 'Java', loaiKyNang: 'backend' },
        { tenKyNang: 'Spring Boot', loaiKyNang: 'backend' },
        { tenKyNang: 'AWS', loaiKyNang: 'devops' },
        { tenKyNang: 'Kubernetes', loaiKyNang: 'devops' },
        { tenKyNang: 'VueJS', loaiKyNang: 'frontend' },
        { tenKyNang: 'Angular', loaiKyNang: 'frontend' },
        { tenKyNang: 'Flutter', loaiKyNang: 'mobile' },
        { tenKyNang: 'React Native', loaiKyNang: 'mobile' },
        { tenKyNang: 'PostgreSQL', loaiKyNang: 'database' },
        { tenKyNang: 'Redis', loaiKyNang: 'database' },
        { tenKyNang: 'QA Automation', loaiKyNang: 'kiem_thu' },
        { tenKyNang: 'Business Analyst', loaiKyNang: 'phan_tich' },
        { tenKyNang: 'Product Management', loaiKyNang: 'quan_ly' },
        { tenKyNang: 'Next.js', loaiKyNang: 'frontend' },
        { tenKyNang: 'GraphQL', loaiKyNang: 'backend' },
        { tenKyNang: 'NestJS', loaiKyNang: 'backend' },
        { tenKyNang: 'Go', loaiKyNang: 'backend' },
        { tenKyNang: 'PHP', loaiKyNang: 'backend' },
        { tenKyNang: 'Laravel', loaiKyNang: 'backend' },
        { tenKyNang: '.NET', loaiKyNang: 'backend' },
        { tenKyNang: 'C#', loaiKyNang: 'backend' },
        { tenKyNang: 'MySQL', loaiKyNang: 'database' },
        { tenKyNang: 'SQL Server', loaiKyNang: 'database' },
        { tenKyNang: 'Elasticsearch', loaiKyNang: 'database' },
        { tenKyNang: 'Android', loaiKyNang: 'mobile' },
        { tenKyNang: 'iOS', loaiKyNang: 'mobile' },
        { tenKyNang: 'Đạta Analyst', loaiKyNang: 'du_lieu' },
        { tenKyNang: 'Machine Learning', loaiKyNang: 'du_lieu' },
    ];
    for (const muc of duLieuMau) {
        await danhmuckynang_mohinh_js_1.DanhMucKyNang.updateOne({ tenKyNang: muc.tenKyNang }, { $set: muc }, { upsert: true });
    }
    return danhmuckynang_mohinh_js_1.DanhMucKyNang.find({ tenKyNang: { $in: duLieuMau.map((muc) => muc.tenKyNang) } });
}
async function gieoNguoiDung() {
    const matKhauDaBam = await bcryptjs_1.default.hash(matKhauMau, 10);
    const taiKhoanMau = [
        {
            email: 'admin@itjob.vn',
            matKhau: matKhauDaBam,
            hoTen: 'Quan tri vien ITJob',
            soDienThoai: '0900000001',
            vaiTro: 'admin',
            trangThai: 'hoat_dong',
        },
        {
            email: 'ungvien@itjob.vn',
            matKhau: matKhauDaBam,
            hoTen: 'Nguyen Minh Chau',
            soDienThoai: '0900000002',
            vaiTro: 'ung_vien',
            trangThai: 'hoat_dong',
        },
        {
            email: 'nhatuyendung@itjob.vn',
            matKhau: matKhauDaBam,
            hoTen: 'Tran Hoang Nam',
            soDienThoai: '0900000003',
            vaiTro: 'nha_tuyen_dung',
            trangThai: 'hoat_dong',
        },
    ];
    for (const taiKhoan of taiKhoanMau) {
        await nguoidung_mohinh_js_1.NguoiDung.updateOne({ email: taiKhoan.email }, { $set: taiKhoan }, { upsert: true });
    }
    const [admin, ungVien, nhaTuyenDung] = await Promise.all([
        nguoidung_mohinh_js_1.NguoiDung.findOne({ email: 'admin@itjob.vn' }).orFail(),
        nguoidung_mohinh_js_1.NguoiDung.findOne({ email: 'ungvien@itjob.vn' }).orFail(),
        nguoidung_mohinh_js_1.NguoiDung.findOne({ email: 'nhatuyendung@itjob.vn' }).orFail(),
    ]);
    return { admin, ungVien, nhaTuyenDung };
}
async function gieoHoSoUngVien(maNguoiDung, kyNang) {
    const react = kyNang.find((muc) => muc.tenKyNang === 'React');
    const typescript = kyNang.find((muc) => muc.tenKyNang === 'TypeScript');
    const nodejs = kyNang.find((muc) => muc.tenKyNang === 'NodeJS');
    await ungvien_mohinh_js_1.UngVien.updateOne({ maNguoiDung }, {
        $set: {
            maNguoiDung,
            ngaySinh: new Date('1999-05-20'),
            gioiTinh: 'nam',
            diaChi: 'Hai Chau, Da Nang',
            tomTat: 'Frontend developer tập trung vào React, UI system và trải nghiệm người dùng cho sản phẩm tuyển dụng IT.',
            kinhNghiem: 3,
            viTriMongMuon: 'Senior Frontend Developer',
            mucLuongMongMuon: 35000000,
            kyNang: [react, typescript, nodejs].filter(Boolean).map((muc) => ({
                maKyNang: muc._id,
                mucDo: muc.tenKyNang === 'React' ? 5 : 4,
            })),
            portfolio: [
                {
                    tenDuAn: 'ITJob Candidate Workspace',
                    lienKet: 'https://portfolio.itjob.vn/candidate-workspace',
                    moTa: 'Dashboard quản lý CV, hồ sơ ứng tuyển và lịch phỏng vấn cho ứng viên IT.',
                    congNghe: ['React', 'TypeScript', 'MongoDB'],
                },
                {
                    tenDuAn: 'Salary Insight UI',
                    lienKet: 'https://portfolio.itjob.vn/salary-insight',
                    moTa: 'Giao dien phan tich luong lap trinh vien theo cap bac va ky nang.',
                    congNghe: ['React', 'Đạta Visualization'],
                },
            ],
        },
    }, { upsert: true });
}
async function gieoNhaTuyenDungVaTin(maNguoiDung, kyNang) {
    await nhatuyendung_mohinh_js_1.NhaTuyenDung.updateOne({ maNguoiDung }, {
        $set: {
            maNguoiDung,
            tenCongTy: 'TechNova Solutions',
            maSoThue: '0401234567',
            moTa: 'Cong ty san pham cong nghe tai Da Nang, xay dung nen tang SaaS cho thi truong quoc te.',
            diaChi: 'Hai Chau, Da Nang',
            website: 'https://technova.example.com',
            logo: 'https://placehold.co/160x160/0b1c30/ffffff?text=TN',
            quyMo: 180,
            nganh: 'Cong nghe thong tin',
            trangThaiDuyet: 'da_duyet',
            ngayDuyet: new Date(),
        },
    }, { upsert: true });
    const nhaTuyenDung = await nhatuyendung_mohinh_js_1.NhaTuyenDung.findOne({ maNguoiDung }).orFail();
    const react = kyNang.find((muc) => muc.tenKyNang === 'React');
    const nodejs = kyNang.find((muc) => muc.tenKyNang === 'NodeJS');
    const mongodb = kyNang.find((muc) => muc.tenKyNang === 'MongoDB');
    await tintuyendung_mohinh_js_1.TinTuyenDung.updateOne({ maNhaTuyenDung: nhaTuyenDung._id, tieuDe: 'Senior Fullstack Developer (React/NodeJS)' }, {
        $set: {
            maNhaTuyenDung: nhaTuyenDung._id,
            tieuDe: 'Senior Fullstack Developer (React/NodeJS)',
            yeuCauKinhNghiem: '3+ nam phat trien san pham web production.',
            diaChi: 'Hai Chau, Da Nang',
            luongMin: 2000,
            luongMax: 3500,
            loaiHinh: 'hybrid',
            capBac: 'senior',
            hanNop: new Date('2026-12-31'),
            soLuong: 3,
            moTa: 'Tham gia xây dựng nền tảng tuyển dụng IT, tối ưu workflow ứng tuyển và dashboard nhà tuyển dụng.',
            yeuCau: 'Thanh thao React, NodeJS, REST API, MongoDB va tu duy san pham.',
            quyenLoi: 'Luong canh tranh, review 2 lan/nam, thiet bi lam viec cao cap.',
            luotXem: 245,
            trangThai: 'dang_mo',
            ngayDang: new Date(),
            kyNang: [react, nodejs, mongodb].filter(Boolean).map((muc) => ({
                maKyNang: muc._id,
                batBuoc: muc.tenKyNang !== 'MongoDB',
            })),
        },
    }, { upsert: true });
}
async function gieoDanhGiaCongTy(maNguoiDungUngVien, maNguoiDungNhaTuyenDung) {
    const [ungVien, nhaTuyenDung] = await Promise.all([
        ungvien_mohinh_js_1.UngVien.findOne({ maNguoiDung: maNguoiDungUngVien }).orFail(),
        nhatuyendung_mohinh_js_1.NhaTuyenDung.findOne({ maNguoiDung: maNguoiDungNhaTuyenDung }).orFail(),
    ]);
    await danhgiacongty_mohinh_js_1.DanhGiaCongTy.updateOne({ maUngVien: ungVien._id, maNhaTuyenDung: nhaTuyenDung._id }, {
        $set: {
            maUngVien: ungVien._id,
            maNhaTuyenDung: nhaTuyenDung._id,
            diem: 5,
            noiDung: 'Quy trình phỏng vấn rõ ràng, nhà tuyển dụng phản hồi nhanh và chia sẻ kỹ về kỳ vọng công việc.',
            anDanh: false,
            daDuyet: true,
        },
    }, { upsert: true });
}
async function gieoNhieuCongTyVaTin(kyNang, maNguoiDungUngVien) {
    const matKhauDaBam = await bcryptjs_1.default.hash(matKhauMau, 10);
    const ungVien = await ungvien_mohinh_js_1.UngVien.findOne({ maNguoiDung: maNguoiDungUngVien }).orFail();
    const layKyNang = (ten) => kyNang.find((muc) => muc.tenKyNang === ten);
    const congTyMau = [
        {
            id: '6a144e312015c44edfb77e70',
            email: 'fpt.danang@itjob.vn',
            hoTen: 'FPT Software Da Nang HR',
            soDienThoai: '0901000001',
            tenCongTy: 'FPT Software Da Nang',
            maSoThue: '0101601092',
            diaChi: 'FPT Complex, Nam Ky Khoi Nghia, Ngu Hanh Son, Da Nang',
            website: 'https://fptsoftware.com',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/240px-FPT_logo_2010.svg.png',
            quyMo: 3500,
            nganh: 'Outsourcing, Automotive, AI, Cloud',
            moTa: 'FPT Software Da Nang la trung tam phat trien phan mem quy mo lon, cung cap dich vu chuyen doi so, automotive, cloud va AI cho khach hang toan cau.\nMoi truong lam viec co nhieu du an quoc te, lo trinh phat trien ro rang va co hoi di onsite.',
            jobs: [
                ['Senior ReactJS Developer', 'Da Nang', 45000000, 70000000, 'hybrid', 'senior', ['React', 'TypeScript', 'NodeJS']],
                ['Java Backend Engineer', 'Da Nang', 35000000, 60000000, 'toan_thoi_gian', 'middle', ['Java', 'Spring Boot', 'PostgreSQL']],
                ['DevOps Engineer AWS/Kubernetes', 'Da Nang', 50000000, 85000000, 'hybrid', 'senior', ['AWS', 'Kubernetes', 'Docker']],
                ['Fresher Frontend Developer React', 'Da Nang', 12000000, 20000000, 'toan_thoi_gian', 'fresher', ['React', 'TypeScript']],
                ['Intern Software Engineer', 'Da Nang', 5000000, 8000000, 'thuc_tap', 'intern', ['Java', 'React']],
            ],
        },
        {
            email: 'kms@itjob.vn',
            hoTen: 'KMS Technology HR',
            soDienThoai: '0901000002',
            tenCongTy: 'KMS Technology',
            maSoThue: '0311234561',
            diaChi: 'Hai Chau, Da Nang',
            website: 'https://kms-technology.com',
            logo: 'https://logo.clearbit.com/kms-technology.com',
            quyMo: 1200,
            nganh: 'Software Engineering, Product Development',
            moTa: 'KMS Technology phat trien san pham va dich vu phan mem cho thi truong My, tap trung vao engineering excellence, automation va delivery chat luong cao.',
            jobs: [
                ['QA Automation Engineer', 'Da Nang', 25000000, 45000000, 'hybrid', 'middle', ['QA Automation', 'TypeScript']],
                ['NodeJS Backend Developer', 'Da Nang', 30000000, 55000000, 'hybrid', 'middle', ['NodeJS', 'MongoDB', 'Redis']],
                ['Next.js Fullstack Engineer', 'Ho Chi Minh City', 40000000, 75000000, 'hybrid', 'senior', ['Next.js', 'React', 'GraphQL']],
                ['Đạta Analyst BI', 'Da Nang', 22000000, 40000000, 'toan_thoi_gian', 'junior', ['Đạta Analyst', 'SQL Server']],
            ],
        },
        {
            email: 'axon@itjob.vn',
            hoTen: 'Axon Active HR',
            soDienThoai: '0901000003',
            tenCongTy: 'Axon Active',
            maSoThue: '0409988771',
            diaChi: 'Thanh Khe, Da Nang',
            website: 'https://www.axonactive.com',
            logo: 'https://logo.clearbit.com/axonactive.com',
            quyMo: 700,
            nganh: 'Agile Offshore Development',
            moTa: 'Axon Active xay dung doi ngu Agile cho cac san pham tai chinh, logistics va enterprise software, voi van hoa trao quyen va hoc hoi lien tuc.',
            jobs: [
                ['Scrum Team Fullstack Developer', 'Da Nang', 35000000, 65000000, 'toan_thoi_gian', 'senior', ['React', 'Java', 'Spring Boot']],
                ['Business Analyst IT', 'Da Nang', 25000000, 45000000, 'hybrid', 'middle', ['Business Analyst', 'UI/UX']],
                ['Go Microservices Engineer', 'Remote / Da Nang', 50000000, 90000000, 'tu_xa', 'senior', ['Go', 'Kubernetes', 'PostgreSQL']],
            ],
        },
        {
            email: 'enouvo@itjob.vn',
            hoTen: 'Enouvo IT Solutions HR',
            soDienThoai: '0901000004',
            tenCongTy: 'Enouvo IT Solutions',
            maSoThue: '0407778889',
            diaChi: 'Ngu Hanh Son, Da Nang',
            website: 'https://enouvo.com',
            logo: 'https://logo.clearbit.com/enouvo.com',
            quyMo: 180,
            nganh: 'Product, Mobile, SaaS',
            moTa: 'Enouvo phat trien cac san pham web, mobile va SaaS cho startup va doanh nghiep, ket hop khong gian coworking va cong dong cong nghe tai Da Nang.',
            jobs: [
                ['Flutter Mobile Developer', 'Da Nang', 22000000, 42000000, 'hybrid', 'middle', ['Flutter', 'UI/UX']],
                ['Product Designer UI/UX', 'Da Nang', 20000000, 38000000, 'toan_thoi_gian', 'middle', ['UI/UX', 'Product Management']],
                ['React Native Mobile Developer', 'Da Nang', 28000000, 52000000, 'hybrid', 'middle', ['React Native', 'TypeScript']],
                ['iOS Developer Swift', 'Remote', 35000000, 65000000, 'tu_xa', 'senior', ['iOS']],
            ],
        },
        {
            email: 'mgm@itjob.vn',
            hoTen: 'MGM Technology Partners HR',
            soDienThoai: '0901000005',
            tenCongTy: 'MGM Technology Partners Vietnam',
            maSoThue: '0405566778',
            diaChi: 'Hai Chau, Da Nang',
            website: 'https://www.mgm-tp.com',
            logo: 'https://logo.clearbit.com/mgm-tp.com',
            quyMo: 450,
            nganh: 'Enterprise Web Application',
            moTa: 'MGM Technology Partners Vietnam phat trien cac he thong web enterprise cho khach hang Duc, tap trung vao clean code, long-term product maintenance va domain phuc tap.',
            jobs: [
                ['Angular Frontend Engineer', 'Da Nang', 30000000, 55000000, 'hybrid', 'middle', ['Angular', 'TypeScript']],
                ['Senior Java Engineer', 'Da Nang', 45000000, 80000000, 'hybrid', 'senior', ['Java', 'Spring Boot', 'PostgreSQL']],
                ['.NET Backend Developer C#', 'Da Nang', 32000000, 58000000, 'toan_thoi_gian', 'middle', ['.NET', 'C#', 'SQL Server']],
            ],
        },
        {
            email: 'vng@itjob.vn',
            hoTen: 'VNG HR',
            soDienThoai: '0901000006',
            tenCongTy: 'VNG Corporation',
            maSoThue: '0304567890',
            diaChi: 'District 7, Ho Chi Minh City',
            website: 'https://vng.com.vn',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/VNG_Corporation_logo.svg/240px-VNG_Corporation_logo.svg.png',
            quyMo: 5000,
            nganh: 'Internet, Gaming, Fintech',
            moTa: 'VNG la tap doan cong nghe internet hang dau Viet Nam, phat trien cac nen tang nguoi dung lon trong linh vuc social, payment, gaming va cloud.',
            jobs: [
                ['Senior Backend Engineer Go/NodeJS', 'Ho Chi Minh City', 60000000, 100000000, 'hybrid', 'senior', ['NodeJS', 'Redis', 'Kubernetes']],
                ['React Native Engineer', 'Ho Chi Minh City', 40000000, 75000000, 'hybrid', 'senior', ['React Native', 'TypeScript']],
                ['Machine Learning Engineer', 'Ho Chi Minh City', 55000000, 95000000, 'hybrid', 'senior', ['Python', 'Machine Learning']],
                ['Elasticsearch Platform Developer', 'Ho Chi Minh City', 45000000, 80000000, 'toan_thoi_gian', 'middle', ['Elasticsearch', 'Java']],
            ],
        },
        {
            email: 'cloudops@itjob.vn',
            hoTen: 'CloudOps Asia HR',
            soDienThoai: '0901000007',
            tenCongTy: 'CloudOps Asia',
            maSoThue: '0402223334',
            diaChi: 'Remote / Da Nang',
            website: 'https://cloudops.example.com',
            logo: 'https://placehold.co/160x160/0f766e/ffffff?text=CO',
            quyMo: 120,
            nganh: 'Cloud, DevOps, Platform Engineering',
            moTa: 'CloudOps Asia tu van va van hanh ha tang cloud cho cac cong ty SaaS trong khu vuc APAC, manh ve AWS, Kubernetes, observability va automation.',
            jobs: [
                ['Platform Engineer', 'Remote / Da Nang', 45000000, 85000000, 'tu_xa', 'senior', ['AWS', 'Kubernetes', 'Docker']],
                ['Backend Developer Python', 'Remote', 35000000, 65000000, 'tu_xa', 'middle', ['Python', 'PostgreSQL', 'Redis']],
                ['NestJS API Developer', 'Remote', 30000000, 55000000, 'tu_xa', 'middle', ['NestJS', 'NodeJS', 'GraphQL']],
            ],
        },
        {
            email: 'designstudio@itjob.vn',
            hoTen: 'DesignStudio DN HR',
            soDienThoai: '0901000008',
            tenCongTy: 'DesignStudio DN',
            maSoThue: '0403334445',
            diaChi: 'Son Tra, Da Nang',
            website: 'https://designstudio.example.com',
            logo: 'https://placehold.co/160x160/be123c/ffffff?text=DS',
            quyMo: 75,
            nganh: 'Product Design, UX Research',
            moTa: 'DesignStudio DN la studio thiet ke san pham so cho fintech, travel va e-commerce, lam viec sat voi product team de dua nghien cuu nguoi dung vao UI thuc te.',
            jobs: [
                ['Senior Product Designer', 'Da Nang', 30000000, 60000000, 'hybrid', 'senior', ['UI/UX', 'Product Management']],
                ['Frontend Developer VueJS', 'Da Nang', 25000000, 45000000, 'toan_thoi_gian', 'middle', ['VueJS', 'TypeScript']],
                ['PHP Laravel Developer', 'Da Nang', 22000000, 42000000, 'toan_thoi_gian', 'middle', ['PHP', 'Laravel', 'MySQL']],
                ['Android Developer Kotlin', 'Da Nang', 26000000, 50000000, 'hybrid', 'middle', ['Android']],
            ],
        },
    ];
    for (const [index, congTy] of congTyMau.entries()) {
        await nguoidung_mohinh_js_1.NguoiDung.updateOne({ email: congTy.email }, {
            $set: {
                email: congTy.email,
                matKhau: matKhauDaBam,
                hoTen: congTy.hoTen,
                soDienThoai: congTy.soDienThoai,
                vaiTro: 'nha_tuyen_dung',
                trangThai: 'hoat_dong',
            },
        }, { upsert: true });
        const nguoiDung = await nguoidung_mohinh_js_1.NguoiDung.findOne({ email: congTy.email }).orFail();
        const dieuKienCongTy = congTy.id ? { _id: congTy.id } : { maNguoiDung: nguoiDung._id };
        await nhatuyendung_mohinh_js_1.NhaTuyenDung.updateOne(dieuKienCongTy, {
            $set: {
                maNguoiDung: nguoiDung._id,
                tenCongTy: congTy.tenCongTy,
                maSoThue: congTy.maSoThue,
                moTa: congTy.moTa,
                diaChi: congTy.diaChi,
                website: congTy.website,
                logo: congTy.logo,
                quyMo: congTy.quyMo,
                nganh: congTy.nganh,
                trangThaiDuyet: 'da_duyet',
                ngayDuyet: new Date(),
            },
            ...(congTy.id ? { $setOnInsert: { _id: congTy.id } } : {}),
        }, { upsert: true });
        const nhaTuyenDung = await nhatuyendung_mohinh_js_1.NhaTuyenDung.findOne(dieuKienCongTy).orFail();
        for (const [jobIndex, job] of congTy.jobs.entries()) {
            const [tieuDe, diaChi, luongMin, luongMax, loaiHinh, capBac, danhSachKyNang] = job;
            await tintuyendung_mohinh_js_1.TinTuyenDung.updateOne({ maNhaTuyenDung: nhaTuyenDung._id, tieuDe }, {
                $set: {
                    maNhaTuyenDung: nhaTuyenDung._id,
                    tieuDe,
                    yeuCauKinhNghiem: capBac === 'senior' ? '4+ nam kinh nghiem voi san pham production.' : '2+ nam kinh nghiem o vi tri tuong duong.',
                    diaChi,
                    luongMin,
                    luongMax,
                    loaiHinh,
                    capBac,
                    hanNop: new Date('2026-12-31'),
                    soLuong: jobIndex + 1,
                    moTa: `Tham gia phat trien san pham va du an tai ${congTy.tenCongTy}, lam viec cung team engineering co quy trinh review code, CI/CD va trao doi truc tiep voi stakeholder.`,
                    yeuCau: `Nam vung ${danhSachKyNang.join(', ')}. Co kha nang phan tich yeu cau, viet code de bao tri va giao tiep tot trong team.`,
                    quyenLoi: 'Luong canh tranh, bao hiem day du, review dinh ky, ngan sach hoc tap va thiet bi lam viec.',
                    luotXem: 120 + index * 37 + jobIndex * 19,
                    trangThai: 'dang_mo',
                    ngayDang: new Date(Date.now() - (index + jobIndex + 1) * 24 * 60 * 60 * 1000),
                    kyNang: danhSachKyNang
                        .map((tenKyNang) => layKyNang(tenKyNang))
                        .filter(Boolean)
                        .map((muc) => ({ maKyNang: muc._id, batBuoc: true })),
                },
            }, { upsert: true });
        }
        await danhgiacongty_mohinh_js_1.DanhGiaCongTy.updateOne({ maUngVien: ungVien._id, maNhaTuyenDung: nhaTuyenDung._id }, {
            $set: {
                maUngVien: ungVien._id,
                maNhaTuyenDung: nhaTuyenDung._id,
                diem: 5 - (index % 3) * 0.5,
                noiDung: `Quy trình tuyển dụng của ${congTy.tenCongTy} rõ ràng, trao đổi kỹ về công việc và phản hồi nhanh sau phỏng vấn.`,
                anDanh: false,
                daDuyet: true,
            },
        }, { upsert: true });
    }
}
async function gieoDuLieuUngVienDayDu(maNguoiDungUngVien, maNguoiDungNhaTuyenDung) {
    const [ungVien, nhaTuyenDung] = await Promise.all([
        ungvien_mohinh_js_1.UngVien.findOne({ maNguoiDung: maNguoiDungUngVien }).orFail(),
        nhatuyendung_mohinh_js_1.NhaTuyenDung.findOne({ maNguoiDung: maNguoiDungNhaTuyenDung }).orFail(),
    ]);
    const tin = await tintuyendung_mohinh_js_1.TinTuyenDung.findOne({ maNhaTuyenDung: nhaTuyenDung._id }).orFail();
    await hosonangluc_mohinh_js_1.HoSoNangLuc.updateOne({ maUngVien: ungVien._id, tieuDe: 'CV Frontend Product Engineer' }, {
        $set: {
            maUngVien: ungVien._id,
            tieuDe: 'CV Frontend Product Engineer',
            cvChinh: true,
            congKhai: true,
            hocVan: [
                { tieuDe: 'Kỹ sư phần mềm', donVi: 'Đại học Bách khoa Đà Nẵng', thoiGian: '2017 - 2021', moTa: 'Chuyên ngành công nghệ phần mềm, tập trung vào web application.' },
            ],
            kinhNghiemLam: [
                { tieuDe: 'Frontend Developer', donVi: 'TechNova Solutions', thoiGian: '2022 - nay', moTa: 'Xây dựng dashboard SaaS bằng React, TypeScript và design system nội bộ.' },
            ],
            chungChi: [
                { tieuDe: 'AWS Cloud Practitioner', donVi: 'Amazon Web Services', thoiGian: '2024', moTa: 'Nền tảng cloud, security và deployment.' },
            ],
            duAn: [
                { tieuDe: 'Candidate Workspace', donVi: 'Portfolio', thoiGian: '2025', moTa: 'Không gian quản lý CV, ứng tuyển và lịch phỏng vấn cho ứng viên IT.' },
            ],
        },
    }, { upsert: true });
    const hoSo = await hosonangluc_mohinh_js_1.HoSoNangLuc.findOne({ maUngVien: ungVien._id, tieuDe: 'CV Frontend Product Engineer' }).orFail();
    await hosoungtuyen_mohinh_js_1.HoSoUngTuyen.updateOne({ maUngVien: ungVien._id, maTinTuyenDung: tin._id }, {
        $set: {
            maUngVien: ungVien._id,
            maTinTuyenDung: tin._id,
            maHoSoNangLuc: hoSo._id,
            thuXinViec: 'Tôi quan tâm tới vai trò này vì sản phẩm có tác động trực tiếp tới trải nghiệm tuyển dụng IT.',
            diemKhopKyNang: 88,
            trangThai: 'moi_phong_van',
            ngayNop: new Date(),
        },
    }, { upsert: true });
    const ungTuyen = await hosoungtuyen_mohinh_js_1.HoSoUngTuyen.findOne({ maUngVien: ungVien._id, maTinTuyenDung: tin._id }).orFail();
    await lichphongvan_mohinh_js_1.LichPhongVan.updateOne({ maHoSoUngTuyen: ungTuyen._id }, {
        $set: {
            maHoSoUngTuyen: ungTuyen._id,
            thoiGianBatDau: new Date('2026-06-02T09:00:00+07:00'),
            thoiGianKetThuc: new Date('2026-06-02T10:00:00+07:00'),
            diaChi: 'Google Meet',
            hinhThuc: 'online',
            linkHop: 'https://meet.google.com/itjob-demo',
            ghiChu: 'Chuẩn bị portfolio và case study gần nhất.',
            trangThai: 'da_len_lich',
            ketQua: 'cho_ket_qua',
        },
    }, { upsert: true });
    const lich = await lichphongvan_mohinh_js_1.LichPhongVan.findOne({ maHoSoUngTuyen: ungTuyen._id }).orFail();
    await thongbao_mohinh_js_1.ThongBao.updateOne({ maNguoiDung: maNguoiDungUngVien, maLichPhongVan: lich._id }, {
        $set: {
            maNguoiDung: maNguoiDungUngVien,
            loai: 'lich_phong_van',
            tieuDe: 'Bạn có lịch phỏng vấn mới',
            noiDung: 'TechNova Solutions đã mời bạn phỏng vấn Senior Fullstack Developer.',
            lienKet: '/ung-vien/lich-phong-van',
            maHoSoUngTuyen: ungTuyen._id,
            maLichPhongVan: lich._id,
            daDoc: false,
        },
    }, { upsert: true });
    const lichPhongVanBoSung = [
        {
            thoiGianBatDau: new Date('2026-06-07T14:00:00+07:00'),
            thoiGianKetThuc: new Date('2026-06-07T15:15:00+07:00'),
            diaChi: 'TechNova Solutions, 120 Nguyen Van Linh, Hai Chau, Da Nang',
            hinhThuc: 'offline',
            linkHop: '',
            ghiChu: 'Vòng phỏng vấn với Engineering Manager, mang theo CCCD để check-in tòa nhà.',
            trangThai: 'da_xac_nhan',
            ketQua: 'cho_ket_qua',
        },
        {
            thoiGianBatDau: new Date('2026-05-18T10:00:00+07:00'),
            thoiGianKetThuc: new Date('2026-05-18T11:00:00+07:00'),
            diaChi: 'Google Meet',
            hinhThuc: 'online',
            linkHop: 'https://meet.google.com/itjob-final',
            ghiChu: 'Da hoan thanh vong technical interview, dang cho thu offer.',
            trangThai: 'hoan_thanh',
            ketQua: 'dat',
        },
    ];
    for (const lichMau of lichPhongVanBoSung) {
        await lichphongvan_mohinh_js_1.LichPhongVan.updateOne({ maHoSoUngTuyen: ungTuyen._id, thoiGianBatDau: lichMau.thoiGianBatDau }, { $set: { maHoSoUngTuyen: ungTuyen._id, ...lichMau } }, { upsert: true });
        const lichBoSung = await lichphongvan_mohinh_js_1.LichPhongVan.findOne({ maHoSoUngTuyen: ungTuyen._id, thoiGianBatDau: lichMau.thoiGianBatDau }).orFail();
        await thongbao_mohinh_js_1.ThongBao.updateOne({ maNguoiDung: maNguoiDungUngVien, maLichPhongVan: lichBoSung._id }, {
            $set: {
                maNguoiDung: maNguoiDungUngVien,
                loai: 'lich_phong_van',
                tieuDe: lichMau.trangThai === 'hoan_thanh' ? 'Cập nhật kết quả phỏng vấn' : 'Bạn có lịch phỏng vấn',
                noiDung: lichMau.trangThai === 'hoan_thanh'
                    ? 'TechNova Solutions đã cập nhật kết quả phỏng vấn của bạn.'
                    : 'TechNova Solutions đã mời bạn tham gia phỏng vấn Senior Fullstack Developer.',
                lienKet: '/ung-vien/lich-phong-van',
                maHoSoUngTuyen: ungTuyen._id,
                maLichPhongVan: lichBoSung._id,
                daDoc: lichMau.trangThai === 'hoan_thanh',
            },
        }, { upsert: true });
    }
}
async function gieoDuLieuMau() {
    await (0, ketnoidulieu_js_1.ketNoiDuLieu)();
    const kyNang = await gieoKyNang();
    const nguoiDung = await gieoNguoiDung();
    await Promise.all([
        gieoHoSoUngVien(nguoiDung.ungVien._id, kyNang),
        gieoNhaTuyenDungVaTin(nguoiDung.nhaTuyenDung._id, kyNang),
    ]);
    await gieoDanhGiaCongTy(nguoiDung.ungVien._id, nguoiDung.nhaTuyenDung._id);
    await gieoNhieuCongTyVaTin(kyNang, nguoiDung.ungVien._id);
    await gieoNhaTuyenDungVaTin(nguoiDung.nhaTuyenDung._id, kyNang);
    await gieoDuLieuUngVienDayDu(nguoiDung.ungVien._id, nguoiDung.nhaTuyenDung._id);
    console.log('Da gieo du lieu mau thanh cong');
    console.log('Tai khoan mau:');
    console.log(`- Admin: admin@itjob.vn / ${matKhauMau}`);
    console.log(`- Ứng viên: ungvien@itjob.vn / ${matKhauMau}`);
    console.log(`- Nhà tuyển dụng: nhatuyendung@itjob.vn / ${matKhauMau}`);
    process.exit(0);
}
gieoDuLieuMau().catch((loi) => {
    console.error('Gieo du lieu that bai:', loi);
    process.exit(1);
});
