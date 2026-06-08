import bcrypt from 'bcryptjs'
import { prisma } from './cauhinh/prisma.js'

const matKhauMau = '123456'
const emailAdmin = 'admin@ef.vn'
const emailUngVien = 'ungvien@ef.vn'
const emailNhaTuyenDung = 'nhatuyendung@ef.vn'

async function xoaDuLieuCu() {
  await prisma.tinNhan.deleteMany()
  await prisma.cuocTroChuyen.deleteMany()
  await prisma.goiYViecLam.deleteMany()
  await prisma.thongBao.deleteMany()
  await prisma.lichPhongVan.deleteMany()
  await prisma.lichSuHoSoUngTuyen.deleteMany()
  await prisma.danhGiaCongTy.deleteMany()
  await prisma.hoSoUngTuyen.deleteMany()
  await prisma.hoSoNangLuc.deleteMany()
  await prisma.viecLamDaLuu.deleteMany()
  await prisma.tinTuyenDung.deleteMany()
  await prisma.nhaTuyenDung.deleteMany()
  await prisma.ungVien.deleteMany()
  await prisma.danhMucKyNang.deleteMany()
  await prisma.nguoiDung.deleteMany()
}

async function gieoKyNang() {
  const tenKyNang = [
    ['React', 'frontend'],
    ['TypeScript', 'frontend'],
    ['NodeJS', 'backend'],
    ['PostgreSQL', 'database'],
    ['Prisma', 'backend'],
    ['Java', 'backend'],
    ['Spring Boot', 'backend'],
    ['Docker', 'devops'],
    ['Testing', 'quality'],
    ['UI/UX', 'design'],
  ] as const
  await prisma.danhMucKyNang.createMany({
    data: tenKyNang.map(([ten, loai]) => ({ tenKyNang: ten, loaiKyNang: loai })),
    skipDuplicates: true,
  })
  return prisma.danhMucKyNang.findMany()
}

async function gieoNguoiDung() {
  const matKhau = await bcrypt.hash(matKhauMau, 10)
  const admin = await prisma.nguoiDung.create({ data: { email: emailAdmin, matKhau, hoTen: 'Quan tri Effort Job', soDienThoai: '0900000001', vaiTro: 'admin', trangThai: 'hoat_dong' } })
  const ungVienUser = await prisma.nguoiDung.create({ data: { email: emailUngVien, matKhau, hoTen: 'Nguyen Minh Ung Vien', soDienThoai: '0900000002', vaiTro: 'ung_vien', trangThai: 'hoat_dong' } })
  const nhaTuyenDungUser = await prisma.nguoiDung.create({ data: { email: emailNhaTuyenDung, matKhau, hoTen: 'Tran Nha Tuyen Dung', soDienThoai: '0900000003', vaiTro: 'nha_tuyen_dung', trangThai: 'hoat_dong' } })
  return { admin, ungVienUser, nhaTuyenDungUser }
}

function skill(kyNang: Awaited<ReturnType<typeof gieoKyNang>>, ten: string, batBuoc = true) {
  const item = kyNang.find(muc => muc.tenKyNang === ten)
  return { maKyNang: item?.id, batBuoc, mucDo: batBuoc ? 4 : 3 }
}

async function main() {
  await xoaDuLieuCu()
  const kyNang = await gieoKyNang()
  const { admin, ungVienUser, nhaTuyenDungUser } = await gieoNguoiDung()

  const ungVien = await prisma.ungVien.create({
    data: {
      maNguoiDung: ungVienUser.id,
      ngaySinh: new Date('2001-04-12'),
      gioiTinh: 'nam',
      diaChi: 'Hai Chau, Da Nang',
      tomTat: 'Frontend engineer quan tam React, TypeScript va san pham tuyen dung.',
      kinhNghiem: 2,
      viTriMongMuon: 'Frontend Developer',
      mucLuongMongMuon: 18000000,
      kyNang: [skill(kyNang, 'React'), skill(kyNang, 'TypeScript'), skill(kyNang, 'UI/UX', false)],
      portfolio: [{ ten: 'Portfolio', url: 'https://effortit.site', moTa: 'San pham demo' }],
    },
  })

  const congTy = await prisma.nhaTuyenDung.create({
    data: {
      maNguoiDung: nhaTuyenDungUser.id,
      tenCongTy: 'Effort Tech Da Nang',
      maSoThue: '0400000001',
      moTa: 'Cong ty phat trien san pham IT va nen tang tuyen dung.',
      diaChi: 'Son Tra, Da Nang',
      website: 'https://effortit.site',
      logo: '/uploads/logo-effort-tech.png',
      quyMo: 120,
      nganh: 'Cong nghe thong tin',
      trangThaiDuyet: 'da_duyet',
      ngayDuyet: new Date(),
    },
  })

  const jobs = await Promise.all([
    prisma.tinTuyenDung.create({
      data: {
        maNhaTuyenDung: congTy.id,
        tieuDe: 'Frontend React Developer',
        yeuCauKinhNghiem: '1-3 nam',
        diaChi: 'Da Nang',
        luongMin: 15000000,
        luongMax: 25000000,
        loaiHinh: 'hybrid',
        capBac: 'junior',
        hanNop: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        soLuong: 3,
        moTa: 'Xay dung giao dien web tuyen dung voi React.',
        yeuCau: 'Thanh thao React, TypeScript, REST API.',
        quyenLoi: 'Luong canh tranh, review dinh ky, hybrid.',
        trangThai: 'dang_mo',
        ngayDang: new Date(),
        kyNang: [skill(kyNang, 'React'), skill(kyNang, 'TypeScript'), skill(kyNang, 'UI/UX', false)],
      },
    }),
    prisma.tinTuyenDung.create({
      data: {
        maNhaTuyenDung: congTy.id,
        tieuDe: 'Backend NodeJS Developer',
        yeuCauKinhNghiem: '2 nam',
        diaChi: 'Da Nang',
        luongMin: 18000000,
        luongMax: 30000000,
        loaiHinh: 'toan_thoi_gian',
        capBac: 'middle',
        hanNop: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        moTa: 'Phat trien API backend voi NodeJS va PostgreSQL.',
        yeuCau: 'NodeJS, Prisma, PostgreSQL, clean API.',
        quyenLoi: 'Thiet bi lam viec, bao hiem, dao tao.',
        trangThai: 'dang_mo',
        ngayDang: new Date(),
        kyNang: [skill(kyNang, 'NodeJS'), skill(kyNang, 'PostgreSQL'), skill(kyNang, 'Prisma')],
      },
    }),
    prisma.tinTuyenDung.create({
      data: {
        maNhaTuyenDung: congTy.id,
        tieuDe: 'Java Spring Boot Intern',
        yeuCauKinhNghiem: 'Khong yeu cau',
        diaChi: 'Da Nang',
        loaiHinh: 'thuc_tap',
        capBac: 'intern',
        hanNop: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        moTa: 'Thuc tap backend Java trong team san pham.',
        yeuCau: 'Java co ban, SQL, tu duy hoc nhanh.',
        quyenLoi: 'Co mentor va co hoi len fresher.',
        trangThai: 'cho_duyet',
        kyNang: [skill(kyNang, 'Java'), skill(kyNang, 'Spring Boot'), skill(kyNang, 'PostgreSQL', false)],
      },
    }),
  ])

  const cv = await prisma.hoSoNangLuc.create({
    data: {
      maUngVien: ungVien.id,
      tieuDe: 'CV Frontend Product Engineer',
      hoTenHienThi: 'Nguyen Minh Ung Vien',
      chucDanh: 'Frontend Developer',
      soDienThoai: '0900000002',
      emailLienHe: emailUngVien,
      diaDiem: 'Da Nang',
      tomTatKinhNghiem: ['2 nam xay dung SPA voi React va TypeScript'],
      kyNangLapTrinh: ['React', 'TypeScript', 'REST API', 'Prisma'],
      kyNangMem: ['Giao tiep', 'Lam viec nhom'],
      hocVan: [{ truong: 'Dai hoc Da Nang', chuyenNganh: 'Cong nghe thong tin', thoiGian: '2019-2023' }],
      kinhNghiemLam: [{ congTy: 'Effort Lab', viTri: 'Frontend Developer', moTa: 'Xay dung dashboard viec lam' }],
      duAnChiTiet: [{ ten: 'Job Portal', congNghe: ['React', 'NodeJS', 'PostgreSQL'], moTa: 'Nen tang tuyen dung IT' }],
      loaiHoSo: 'builder',
      cvChinh: true,
      congKhai: true,
    },
  })

  const ungTuyen = await prisma.hoSoUngTuyen.create({
    data: { maUngVien: ungVien.id, maTinTuyenDung: jobs[0].id, maHoSoNangLuc: cv.id, thuXinViec: 'Toi mong muon ung tuyen vi tri Frontend.', diemKhopKyNang: 82, trangThai: 'moi_phong_van' },
  })
  await prisma.lichSuHoSoUngTuyen.createMany({
    data: [
      { maHoSoUngTuyen: ungTuyen.id, trangThaiMoi: 'da_nop', ghiChu: 'Ung vien nop ho so', maNguoiDung: ungVienUser.id },
      { maHoSoUngTuyen: ungTuyen.id, trangThaiCu: 'da_nop', trangThaiMoi: 'da_xem', ghiChu: 'Nha tuyen dung da xem', maNguoiDung: nhaTuyenDungUser.id },
      { maHoSoUngTuyen: ungTuyen.id, trangThaiCu: 'da_xem', trangThaiMoi: 'moi_phong_van', ghiChu: 'Moi phong van', maNguoiDung: nhaTuyenDungUser.id },
    ],
  })
  const lich = await prisma.lichPhongVan.create({
    data: { maHoSoUngTuyen: ungTuyen.id, thoiGianBatDau: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), thoiGianKetThuc: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), hinhThuc: 'online', linkHop: 'https://meet.google.com/demo-effort', ghiChu: 'Phong van vong 1', trangThai: 'da_len_lich', ketQua: 'cho_ket_qua' },
  })

  await prisma.danhGiaCongTy.create({
    data: { maUngVien: ungVien.id, maNhaTuyenDung: congTy.id, maHoSoUngTuyen: ungTuyen.id, diem: 5, noiDung: 'Quy trinh phong van ro rang, phan hoi nhanh.', anDanh: false, daDuyet: true },
  })
  await prisma.viecLamDaLuu.create({ data: { maNguoiDung: ungVienUser.id, maTinTuyenDung: jobs[1].id, ngayLuu: new Date() } })
  await prisma.thongBao.createMany({
    data: [
      { maNguoiDung: ungVienUser.id, loai: 'lich_phong_van', tieuDe: 'Ban duoc moi phong van', noiDung: 'Effort Tech Da Nang moi ban phong van Frontend React Developer.', maLichPhongVan: lich.id, maHoSoUngTuyen: ungTuyen.id, mucDoUuTien: 'cao' },
      { maNguoiDung: nhaTuyenDungUser.id, loai: 'ho_so_ung_tuyen', tieuDe: 'Ho so ung tuyen moi', noiDung: 'Nguyen Minh Ung Vien vua ung tuyen.', maHoSoUngTuyen: ungTuyen.id, mucDoUuTien: 'cao' },
      { maNguoiDung: admin.id, loai: 'tin_tuyen_dung', tieuDe: 'Tin tuyen dung cho duyet', noiDung: 'Java Spring Boot Intern dang cho duyet.', maTinTuyenDung: jobs[2].id, mucDoUuTien: 'trung_binh' },
    ],
  })

  const cuocTroChuyen = await prisma.cuocTroChuyen.create({
    data: {
      nguoiThamGia: [ungVienUser.id, nhaTuyenDungUser.id],
      loai: 'ung_vien_nha_tuyen_dung',
      maHoSoUngTuyen: ungTuyen.id,
      maTinTuyenDung: jobs[0].id,
      maHoSoUngTuyenGanNhat: ungTuyen.id,
      maTinTuyenDungGanNhat: jobs[0].id,
      soChuaDoc: { [ungVienUser.id]: 1, [nhaTuyenDungUser.id]: 0 },
      tinNhanCuoiCung: { noiDung: 'Hen gap ban trong buoi phong van.', nguoiGui: nhaTuyenDungUser.id, thoiGian: new Date() },
    },
  })
  await prisma.tinNhan.createMany({
    data: [
      { maCuocTroChuyenId: cuocTroChuyen.id, nguoiGui: ungVienUser.id, noiDung: 'Em chao anh chi, em da nhan lich phong van.', loai: 'text', daDuocDocBoi: [{ nguoiDung: nhaTuyenDungUser.id, thoiGian: new Date() }] },
      { maCuocTroChuyenId: cuocTroChuyen.id, nguoiGui: nhaTuyenDungUser.id, noiDung: 'Hen gap ban trong buoi phong van.', loai: 'text', daDuocDocBoi: [] },
    ],
  })
  await prisma.goiYViecLam.create({
    data: {
      maUngVien: ungVien.id,
      maHoSoNangLuc: cv.id,
      trangThai: 'hoan_thanh',
      nguon: 'seed',
      ketQua: [
        { maTinTuyenDung: jobs[0].id, diem: 92, lyDo: 'Khớp React, TypeScript và định hướng Frontend.', kyNangKhop: ['React', 'TypeScript'], kyNangThieu: [] },
        { maTinTuyenDung: jobs[1].id, diem: 68, lyDo: 'Có nền tảng TypeScript, cần bổ sung backend sâu hơn.', kyNangKhop: ['TypeScript'], kyNangThieu: ['NodeJS', 'PostgreSQL'] },
      ],
    },
  })

  console.log('Da gieo du lieu PostgreSQL/Neon thanh cong')
  console.log(`- Admin: ${emailAdmin} / ${matKhauMau}`)
  console.log(`- Ung vien: ${emailUngVien} / ${matKhauMau}`)
  console.log(`- Nha tuyen dung: ${emailNhaTuyenDung} / ${matKhauMau}`)
}

main()
  .catch((error) => {
    console.error('Gieo du lieu that bai:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
