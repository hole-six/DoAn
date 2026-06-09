import { HoSoUngTuyen } from '../hosoungtuyen/hosoungtuyen.mohinh.js'
import { NguoiDung } from '../nguoidung/nguoidung.mohinh.js'
import { NhaTuyenDung } from '../nhatuyendung/nhatuyendung.mohinh.js'
import { TinTuyenDung } from '../tintuyendung/tintuyendung.mohinh.js'

export type CanhBaoQuanTri = {
  id: string
  loai: 'error' | 'warning'
  tieu: string
  moTa: string
  lienKet?: string
  mucDo: number
  capNhatLuc: string
}

type SnapshotCanhBao = {
  canhBao: CanhBaoQuanTri[]
  thongKe: {
    tinQuaHanDuyet: number
    congTyQuaHanDuyet: number
    tinSapHetHan: number
    hoSoUngTuyenMoi: number
    taiKhoanBiKhoa: number
  }
  capNhatLuc: string
}

const HAI_MUOI_BON_GIO = 24 * 60 * 60 * 1000
const BAY_NGAY = 7 * HAI_MUOI_BON_GIO
const SNAPSHOT_RONG = new Date(0).toISOString()

let snapshot: SnapshotCanhBao = {
  canhBao: [],
  thongKe: { tinQuaHanDuyet: 0, congTyQuaHanDuyet: 0, tinSapHetHan: 0, hoSoUngTuyenMoi: 0, taiKhoanBiKhoa: 0 },
  capNhatLuc: SNAPSHOT_RONG,
}

let timer: NodeJS.Timeout | undefined
let dangChay = false

function taoCanhBao(params: Omit<CanhBaoQuanTri, 'capNhatLuc'>): CanhBaoQuanTri {
  return { ...params, capNhatLuc: new Date().toISOString() }
}

function ngu(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function truyVanCoThuLai<T>(hanhDong: () => Promise<T>, macDinh: T) {
  let loiCuoi: unknown
  for (let lan = 1; lan <= 3; lan += 1) {
    try {
      return await hanhDong()
    } catch (error) {
      loiCuoi = error
      if (lan < 3) await ngu(lan * 750)
    }
  }
  console.warn('Bo qua mot truy van canh bao quan tri do database tam thoi khong san sang:', loiCuoi instanceof Error ? loiCuoi.message.split('\n')[0] : loiCuoi)
  return macDinh
}

export async function tinhCanhBaoQuanTri() {
  const bayGio = new Date()
  const mocQuaHanDuyet = new Date(Date.now() - HAI_MUOI_BON_GIO)
  const mocTinSapHetHan = new Date(Date.now() + BAY_NGAY)
  const mocMotNgay = new Date(Date.now() - HAI_MUOI_BON_GIO)

  const tinChoDuyet = await truyVanCoThuLai(() => TinTuyenDung.count({ where: { trangThai: 'cho_duyet' } }), 0)
  const tinQuaHanDuyet = await truyVanCoThuLai(() => TinTuyenDung.count({ where: { trangThai: 'cho_duyet', ngayTao: { lte: mocQuaHanDuyet } } }), snapshot.thongKe.tinQuaHanDuyet)
  const congTyChoDuyet = await truyVanCoThuLai(() => NhaTuyenDung.count({ where: { trangThaiDuyet: 'cho_duyet' } }), 0)
  const congTyQuaHanDuyet = await truyVanCoThuLai(() => NhaTuyenDung.count({ where: { trangThaiDuyet: 'cho_duyet', ngayTao: { lte: mocQuaHanDuyet } } }), snapshot.thongKe.congTyQuaHanDuyet)
  const tinSapHetHan = await truyVanCoThuLai(() => TinTuyenDung.count({ where: { trangThai: 'dang_mo', hanNop: { gte: bayGio, lte: mocTinSapHetHan } } }), snapshot.thongKe.tinSapHetHan)
  const hoSoUngTuyenMoi = await truyVanCoThuLai(() => HoSoUngTuyen.count({ where: { trangThai: { in: ['da_nop', 'dang_xet_duyet'] }, ngayNop: { gte: mocMotNgay } } }), snapshot.thongKe.hoSoUngTuyenMoi)
  const taiKhoanBiKhoa = await truyVanCoThuLai(() => NguoiDung.count({ where: { trangThai: { in: ['tam_khoa', 'bi_khoa'] } } }), snapshot.thongKe.taiKhoanBiKhoa)

  const canhBao: CanhBaoQuanTri[] = []
  if (tinQuaHanDuyet > 0) {
    canhBao.push(taoCanhBao({ id: 'tin-qua-han-duyet', loai: 'error', tieu: `${tinQuaHanDuyet} tin cho duyet qua 24 gio`, moTa: `Tong cong ${tinChoDuyet} tin dang cho duyet.`, lienKet: '/quan-tri/tin-tuyen-dung', mucDo: 100 }))
  } else if (tinChoDuyet > 0) {
    canhBao.push(taoCanhBao({ id: 'tin-cho-duyet', loai: 'warning', tieu: `${tinChoDuyet} tin đang chờ duyệt`, moTa: 'Có tin tuyển dụng mới cần kiểm tra.', lienKet: '/quan-tri/tin-tuyen-dung', mucDo: 70 }))
  }
  if (congTyQuaHanDuyet > 0) {
    canhBao.push(taoCanhBao({ id: 'cong-ty-qua-han-duyet', loai: 'error', tieu: `${congTyQuaHanDuyet} công ty chờ xác thực quá 24 giờ`, moTa: `Tổng cộng ${congTyChoDuyet} hồ sơ công ty đang chờ xác thực.`, lienKet: '/quan-tri/cong-ty', mucDo: 95 }))
  } else if (congTyChoDuyet > 0) {
    canhBao.push(taoCanhBao({ id: 'cong-ty-cho-duyet', loai: 'warning', tieu: `${congTyChoDuyet} công ty chờ xác thực`, moTa: 'Có hồ sơ nhà tuyển dụng mới cần xác minh.', lienKet: '/quan-tri/cong-ty', mucDo: 65 }))
  }
  if (tinSapHetHan > 0) canhBao.push(taoCanhBao({ id: 'tin-sap-het-han', loai: 'warning', tieu: `${tinSapHetHan} tin sap het han trong 7 ngay`, moTa: 'Nen nhac nha tuyen dung gia han hoac dong tin.', lienKet: '/quan-tri/tin-tuyen-dung', mucDo: 55 }))
  if (hoSoUngTuyenMoi > 30) canhBao.push(taoCanhBao({ id: 'ung-tuyen-tang-dot-bien', loai: 'warning', tieu: `${hoSoUngTuyenMoi} hồ sơ ứng tuyển mới trong 24 giờ`, moTa: 'Lượng ứng tuyển tăng cao.', lienKet: '/quan-tri/analytics', mucDo: 50 }))
  if (taiKhoanBiKhoa > 0) canhBao.push(taoCanhBao({ id: 'tai-khoan-bi-khoa', loai: 'warning', tieu: `${taiKhoanBiKhoa} tai khoan dang bi khoa hoac tam khoa`, moTa: 'Kiem tra danh sach tai khoan bi khoa.', lienKet: '/quan-tri/nguoi-dung', mucDo: 45 }))

  snapshot = {
    canhBao: canhBao.sort((a, b) => b.mucDo - a.mucDo),
    thongKe: { tinQuaHanDuyet, congTyQuaHanDuyet, tinSapHetHan, hoSoUngTuyenMoi, taiKhoanBiKhoa },
    capNhatLuc: new Date().toISOString(),
  }
  return snapshot
}

export async function laySnapshotCanhBaoQuanTri() {
  if (snapshot.capNhatLuc === SNAPSHOT_RONG) {
    try {
      return await tinhCanhBaoQuanTri()
    } catch {
      return snapshot
    }
  }
  return snapshot
}

export function khoiDongCronCanhBaoQuanTri() {
  if (timer) return
  const chay = async () => {
    if (dangChay) return
    dangChay = true
    try {
      await tinhCanhBaoQuanTri()
    } catch (error) {
      console.warn('Tinh canh bao quan tri tam bo qua do database chua san sang:', error instanceof Error ? error.message.split('\n')[0] : error)
    } finally {
      dangChay = false
    }
  }
  void chay()
  timer = setInterval(chay, 5 * 60 * 1000)
}
