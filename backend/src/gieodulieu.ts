import bcrypt from 'bcryptjs'
import { ketNoiDuLieu } from './cauhinh/ketnoidulieu.js'
import { DanhGiaCongTy } from './modules/danhgiacongty/danhgiacongty.mohinh.js'
import { DanhMucKyNang } from './modules/danhmuckynang/danhmuckynang.mohinh.js'
import { HoSoNangLuc } from './modules/hosonangluc/hosonangluc.mohinh.js'
import { HoSoUngTuyen } from './modules/hosoungtuyen/hosoungtuyen.mohinh.js'
import { LichPhongVan } from './modules/lichphongvan/lichphongvan.mohinh.js'
import { NguoiDung } from './modules/nguoidung/nguoidung.mohinh.js'
import { NhaTuyenDung } from './modules/nhatuyendung/nhatuyendung.mohinh.js'
import { ThongBao } from './modules/thongbao/thongbao.mohinh.js'
import { TinTuyenDung } from './modules/tintuyendung/tintuyendung.mohinh.js'
import { UngVien } from './modules/ungvien/ungvien.mohinh.js'

const matKhauMau = '123456'

type TaiLieuCoId = {
  _id: unknown
  tenKyNang?: string
}

async function gieoKyNang() {
  const duLieuMau = [
    { tenKyNang: 'React', loaiKyNang: 'frontend' },
    { tenKyNang: 'TypeScript', loaiKyNang: 'frontend' },
    { tenKyNang: 'NodeJS', loaiKyNang: 'backend' },
    { tenKyNang: 'MongoDB', loaiKyNang: 'database' },
    { tenKyNang: 'Docker', loaiKyNang: 'devops' },
    { tenKyNang: 'UI/UX', loaiKyNang: 'thiet_ke' },
  ] as const

  for (const muc of duLieuMau) {
    await (DanhMucKyNang as any).updateOne({ tenKyNang: muc.tenKyNang }, { $set: muc }, { upsert: true })
  }

  return (DanhMucKyNang as any).find({ tenKyNang: { $in: duLieuMau.map((muc) => muc.tenKyNang) } }) as Promise<TaiLieuCoId[]>
}

async function gieoNguoiDung() {
  const matKhauDaBam = await bcrypt.hash(matKhauMau, 10)
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
  ] as const

  for (const taiKhoan of taiKhoanMau) {
    await (NguoiDung as any).updateOne({ email: taiKhoan.email }, { $set: taiKhoan }, { upsert: true })
  }

  const [admin, ungVien, nhaTuyenDung] = await Promise.all([
    (NguoiDung as any).findOne({ email: 'admin@itjob.vn' }).orFail(),
    (NguoiDung as any).findOne({ email: 'ungvien@itjob.vn' }).orFail(),
    (NguoiDung as any).findOne({ email: 'nhatuyendung@itjob.vn' }).orFail(),
  ]) as Array<{ _id: unknown }>

  return { admin, ungVien, nhaTuyenDung }
}

async function gieoHoSoUngVien(maNguoiDung: unknown, kyNang: Awaited<ReturnType<typeof gieoKyNang>>) {
  const react = kyNang.find((muc) => muc.tenKyNang === 'React')
  const typescript = kyNang.find((muc) => muc.tenKyNang === 'TypeScript')
  const nodejs = kyNang.find((muc) => muc.tenKyNang === 'NodeJS')

  await (UngVien as any).updateOne(
    { maNguoiDung },
    {
      $set: {
        maNguoiDung,
        ngaySinh: new Date('1999-05-20'),
        gioiTinh: 'nam',
        diaChi: 'Hai Chau, Da Nang',
        tomTat: 'Frontend developer tap trung vao React, UI system va trai nghiem nguoi dung cho san pham tuyen dung IT.',
        kinhNghiem: 3,
        viTriMongMuon: 'Senior Frontend Developer',
        mucLuongMongMuon: 35000000,
        kyNang: [react, typescript, nodejs].filter(Boolean).map((muc) => ({
          maKyNang: muc!._id,
          mucDo: muc!.tenKyNang === 'React' ? 5 : 4,
        })),
        portfolio: [
          {
            tenDuAn: 'ITJob Candidate Workspace',
            lienKet: 'https://portfolio.itjob.vn/candidate-workspace',
            moTa: 'Dashboard quan ly CV, ho so ung tuyen va lich phong van cho ung vien IT.',
            congNghe: ['React', 'TypeScript', 'MongoDB'],
          },
          {
            tenDuAn: 'Salary Insight UI',
            lienKet: 'https://portfolio.itjob.vn/salary-insight',
            moTa: 'Giao dien phan tich luong lap trinh vien theo cap bac va ky nang.',
            congNghe: ['React', 'Data Visualization'],
          },
        ],
      },
    },
    { upsert: true },
  )
}

async function gieoNhaTuyenDungVaTin(maNguoiDung: unknown, kyNang: Awaited<ReturnType<typeof gieoKyNang>>) {
  await (NhaTuyenDung as any).updateOne(
    { maNguoiDung },
    {
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
    },
    { upsert: true },
  )

  const nhaTuyenDung = await (NhaTuyenDung as any).findOne({ maNguoiDung }).orFail() as { _id: unknown }
  const react = kyNang.find((muc) => muc.tenKyNang === 'React')
  const nodejs = kyNang.find((muc) => muc.tenKyNang === 'NodeJS')
  const mongodb = kyNang.find((muc) => muc.tenKyNang === 'MongoDB')

  await (TinTuyenDung as any).updateOne(
    { maNhaTuyenDung: nhaTuyenDung._id, tieuDe: 'Senior Fullstack Developer (React/NodeJS)' },
    {
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
        moTa: 'Tham gia xay dung nen tang tuyen dung IT, toi uu workflow ung tuyen va dashboard nha tuyen dung.',
        yeuCau: 'Thanh thao React, NodeJS, REST API, MongoDB va tu duy san pham.',
        quyenLoi: 'Luong canh tranh, review 2 lan/nam, thiet bi lam viec cao cap.',
        luotXem: 245,
        trangThai: 'dang_mo',
        ngayDang: new Date(),
        kyNang: [react, nodejs, mongodb].filter(Boolean).map((muc) => ({
          maKyNang: muc!._id,
          batBuoc: muc!.tenKyNang !== 'MongoDB',
        })),
      },
    },
    { upsert: true },
  )
}

async function gieoDanhGiaCongTy(maNguoiDungUngVien: unknown, maNguoiDungNhaTuyenDung: unknown) {
  const [ungVien, nhaTuyenDung] = await Promise.all([
    (UngVien as any).findOne({ maNguoiDung: maNguoiDungUngVien }).orFail(),
    (NhaTuyenDung as any).findOne({ maNguoiDung: maNguoiDungNhaTuyenDung }).orFail(),
  ])

  await (DanhGiaCongTy as any).updateOne(
    { maUngVien: ungVien._id, maNhaTuyenDung: nhaTuyenDung._id },
    {
      $set: {
        maUngVien: ungVien._id,
        maNhaTuyenDung: nhaTuyenDung._id,
        diem: 5,
        noiDung: 'Quy trinh phong van ro rang, nha tuyen dung phan hoi nhanh va chia se ky ve ky vong cong viec.',
        anDanh: false,
        daDuyet: false,
      },
    },
    { upsert: true },
  )
}

async function gieoDuLieuUngVienDayDu(maNguoiDungUngVien: unknown, maNguoiDungNhaTuyenDung: unknown) {
  const [ungVien, nhaTuyenDung] = await Promise.all([
    (UngVien as any).findOne({ maNguoiDung: maNguoiDungUngVien }).orFail(),
    (NhaTuyenDung as any).findOne({ maNguoiDung: maNguoiDungNhaTuyenDung }).orFail(),
  ])
  const tin = await (TinTuyenDung as any).findOne({ maNhaTuyenDung: nhaTuyenDung._id }).orFail()

  await (HoSoNangLuc as any).updateOne(
    { maUngVien: ungVien._id, tieuDe: 'CV Frontend Product Engineer' },
    {
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
    },
    { upsert: true },
  )

  const hoSo = await (HoSoNangLuc as any).findOne({ maUngVien: ungVien._id, tieuDe: 'CV Frontend Product Engineer' }).orFail()
  await (HoSoUngTuyen as any).updateOne(
    { maUngVien: ungVien._id, maTinTuyenDung: tin._id },
    {
      $set: {
        maUngVien: ungVien._id,
        maTinTuyenDung: tin._id,
        maHoSoNangLuc: hoSo._id,
        thuXinViec: 'Tôi quan tâm tới vai trò này vì sản phẩm có tác động trực tiếp tới trải nghiệm tuyển dụng IT.',
        diemKhopKyNang: 88,
        trangThai: 'moi_phong_van',
        ngayNop: new Date(),
      },
    },
    { upsert: true },
  )
  const ungTuyen = await (HoSoUngTuyen as any).findOne({ maUngVien: ungVien._id, maTinTuyenDung: tin._id }).orFail()

  await (LichPhongVan as any).updateOne(
    { maHoSoUngTuyen: ungTuyen._id },
    {
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
    },
    { upsert: true },
  )
  const lich = await (LichPhongVan as any).findOne({ maHoSoUngTuyen: ungTuyen._id }).orFail()

  await (ThongBao as any).updateOne(
    { maNguoiDung: maNguoiDungUngVien, maLichPhongVan: lich._id },
    {
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
    },
    { upsert: true },
  )

  const lichPhongVanBoSung = [
    {
      thoiGianBatDau: new Date('2026-06-07T14:00:00+07:00'),
      thoiGianKetThuc: new Date('2026-06-07T15:15:00+07:00'),
      diaChi: 'TechNova Solutions, 120 Nguyen Van Linh, Hai Chau, Da Nang',
      hinhThuc: 'offline',
      linkHop: '',
      ghiChu: 'Vong phong van voi Engineering Manager, mang theo CCCD de check-in toa nha.',
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
  ]

  for (const lichMau of lichPhongVanBoSung) {
    await (LichPhongVan as any).updateOne(
      { maHoSoUngTuyen: ungTuyen._id, thoiGianBatDau: lichMau.thoiGianBatDau },
      { $set: { maHoSoUngTuyen: ungTuyen._id, ...lichMau } },
      { upsert: true },
    )
    const lichBoSung = await (LichPhongVan as any).findOne({ maHoSoUngTuyen: ungTuyen._id, thoiGianBatDau: lichMau.thoiGianBatDau }).orFail()
    await (ThongBao as any).updateOne(
      { maNguoiDung: maNguoiDungUngVien, maLichPhongVan: lichBoSung._id },
      {
        $set: {
          maNguoiDung: maNguoiDungUngVien,
          loai: 'lich_phong_van',
          tieuDe: lichMau.trangThai === 'hoan_thanh' ? 'Cap nhat ket qua phong van' : 'Ban co lich phong van',
          noiDung: lichMau.trangThai === 'hoan_thanh'
            ? 'TechNova Solutions da cap nhat ket qua phong van cua ban.'
            : 'TechNova Solutions da moi ban tham gia phong van Senior Fullstack Developer.',
          lienKet: '/ung-vien/lich-phong-van',
          maHoSoUngTuyen: ungTuyen._id,
          maLichPhongVan: lichBoSung._id,
          daDoc: lichMau.trangThai === 'hoan_thanh',
        },
      },
      { upsert: true },
    )
  }
}

async function gieoDuLieuMau() {
  await ketNoiDuLieu()

  const kyNang = await gieoKyNang()
  const nguoiDung = await gieoNguoiDung()

  await Promise.all([
    gieoHoSoUngVien(nguoiDung.ungVien._id, kyNang),
    gieoNhaTuyenDungVaTin(nguoiDung.nhaTuyenDung._id, kyNang),
  ])
  await gieoDanhGiaCongTy(nguoiDung.ungVien._id, nguoiDung.nhaTuyenDung._id)
  await gieoDuLieuUngVienDayDu(nguoiDung.ungVien._id, nguoiDung.nhaTuyenDung._id)

  console.log('Da gieo du lieu mau thanh cong')
  console.log('Tai khoan mau:')
  console.log(`- Admin: admin@itjob.vn / ${matKhauMau}`)
  console.log(`- Ung vien: ungvien@itjob.vn / ${matKhauMau}`)
  console.log(`- Nha tuyen dung: nhatuyendung@itjob.vn / ${matKhauMau}`)
  process.exit(0)
}

gieoDuLieuMau().catch((loi) => {
  console.error('Gieo du lieu that bai:', loi)
  process.exit(1)
})
