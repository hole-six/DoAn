import { Schema, model } from 'mongoose'

const mucThongTinSchema = new Schema(
  {
    tieuDe: String,
    donVi: String,
    thoiGian: String,
    moTa: String,
  },
  { _id: false },
)

const lienKetSchema = new Schema(
  {
    nhan: String,
    url: String,
  },
  { _id: false },
)

const kyNangSchema = new Schema(
  {
    nhom: String,
    muc: [String],
  },
  { _id: false },
)

const duAnChiTietSchema = new Schema(
  {
    tenDuAn: String,
    thoiGian: String,
    viTri: String,
    moTa: String,
    trachNhiem: [String],
    heDieuHanh: String,
    ngonNgu: String,
    framework: String,
    kyThuat: String,
    diaDiem: String,
    lienKet: [lienKetSchema],
  },
  { _id: false },
)

const hoSoNangLucSchema = new Schema(
  {
    maUngVien: { type: Schema.Types.ObjectId, ref: 'UngVien', required: true },
    tieuDe: { type: String, required: true, trim: true },
    hocVan: [mucThongTinSchema],
    kinhNghiemLam: [mucThongTinSchema],
    chungChi: [mucThongTinSchema],
    duAn: [mucThongTinSchema],
    hoTenHienThi: String,
    chucDanh: String,
    soDienThoai: String,
    emailLienHe: String,
    facebook: String,
    github: String,
    portfolioUrl: String,
    diaDiem: String,
    tomTatKinhNghiem: [String],
    kyNangMem: [String],
    kyNangLapTrinh: [kyNangSchema],
    baiVietKyThuat: [lienKetSchema],
    duAnChiTiet: [duAnChiTietSchema],
    fileCvTen: String,
    fileCvLoai: String,
    fileCvData: String,
    loaiHoSo: { type: String, enum: ['builder', 'file_upload'], default: 'builder' },
    anhDaiDien: String,
    templateCv: { type: String, default: 'classic-blue' },
    mauChinh: { type: String, default: '#2563eb' },
    mauPhu: { type: String, default: '#0f172a' },
    font: { type: String, default: 'Inter' },
    markdownGoc: String,
    ghiChuAi: String,
    cvChinh: { type: Boolean, default: false },
    congKhai: { type: Boolean, default: true },
  },
  {
    collection: 'ho_so_nang_luc',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

export const HoSoNangLuc = model('HoSoNangLuc', hoSoNangLucSchema)
