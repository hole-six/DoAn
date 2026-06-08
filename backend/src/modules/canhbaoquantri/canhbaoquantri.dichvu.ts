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

let snapshot: SnapshotCanhBao = {
  canhBao: [],
  thongKe: { tinQuaHanDuyet: 0, congTyQuaHanDuyet: 0, tinSapHetHan: 0, hoSoUngTuyenMoi: 0, taiKhoanBiKhoa: 0 },
  capNhatLuc: new Date(0).toISOString(),
}

let timer: NodeJS.Timeout | undefined
let dangChay = false

function taoCanhBao(params: Omit<CanhBaoQuanTri, 'capNhatLuc'>): CanhBaoQuanTri {
  return { ...params, capNhatLuc: new Date().toISOString() }
}

export async function tinhCanhBaoQuanTri() {
  const bayGio = new Date()
  const mocQuaHanDuyet = new Date(Date.now() - HAI_MUOI_BON_GIO)
  const mocTinSapHetHan = new Date(Date.now() + BAY_NGAY)
  const mocMotNgay = new Date(Date.now() - HAI_MUOI_BON_GIO)

  const [
    tinChoDuyet,
    tinQuaHanDuyet,
    congTyChoDuyet,
    congTyQuaHanDuyet,
    tinSapHetHan,
    hoSoUngTuyenMoi,
    taiKhoanBiKhoa,
  ] = await Promise.all([
    TinTuyenDung.count({ where: { trangThai: 'cho_duyet' } }),
    TinTuyenDung.count({ where: { trangThai: 'cho_duyet', ngayTao: { lte: mocQuaHanDuyet } } }),
    NhaTuyenDung.count({ where: { trangThaiDuyet: 'cho_duyet' } }),
    NhaTuyenDung.count({ where: { trangThaiDuyet: 'cho_duyet', ngayTao: { lte: mocQuaHanDuyet } } }),
    TinTuyenDung.count({ where: { trangThai: 'dang_mo', hanNop: { gte: bayGio, lte: mocTinSapHetHan } } }),
    HoSoUngTuyen.count({ where: { trangThai: { in: ['da_nop', 'dang_xet_duyet'] }, ngayNop: { gte: mocMotNgay } } }),
    NguoiDung.count({ where: { trangThai: { in: ['tam_khoa', 'bi_khoa'] } } }),
  ])

  const canhBao: CanhBaoQuanTri[] = []
  if (tinQuaHanDuyet > 0) {
    canhBao.push(taoCanhBao({ id: 'tin-qua-han-duyet', loai: 'error', tieu: `${tinQuaHanDuyet} tin cho duyet qua 24 gio`, moTa: `Tong cong ${tinChoDuyet} tin dang cho duyet.`, lienKet: '/quan-tri/tin-tuyen-dung', mucDo: 100 }))
  } else if (tinChoDuyet > 0) {
    canhBao.push(taoCanhBao({ id: 'tin-cho-duyet', loai: 'warning', tieu: `${tinChoDuyet} tin dang cho duyet`, moTa: 'Co tin tuyen dung moi can kiem tra.', lienKet: '/quan-tri/tin-tuyen-dung', mucDo: 70 }))
  }
  if (congTyQuaHanDuyet > 0) {
    canhBao.push(taoCanhBao({ id: 'cong-ty-qua-han-duyet', loai: 'error', tieu: `${congTyQuaHanDuyet} cong ty cho xac thuc qua 24 gio`, moTa: `Tong cong ${congTyChoDuyet} ho so cong ty dang cho xac thuc.`, lienKet: '/quan-tri/cong-ty', mucDo: 95 }))
  } else if (congTyChoDuyet > 0) {
    canhBao.push(taoCanhBao({ id: 'cong-ty-cho-duyet', loai: 'warning', tieu: `${congTyChoDuyet} cong ty cho xac thuc`, moTa: 'Co ho so nha tuyen dung moi can xac minh.', lienKet: '/quan-tri/cong-ty', mucDo: 65 }))
  }
  if (tinSapHetHan > 0) canhBao.push(taoCanhBao({ id: 'tin-sap-het-han', loai: 'warning', tieu: `${tinSapHetHan} tin sap het han trong 7 ngay`, moTa: 'Nen nhac nha tuyen dung gia han hoac dong tin.', lienKet: '/quan-tri/tin-tuyen-dung', mucDo: 55 }))
  if (hoSoUngTuyenMoi > 30) canhBao.push(taoCanhBao({ id: 'ung-tuyen-tang-dot-bien', loai: 'warning', tieu: `${hoSoUngTuyenMoi} ho so ung tuyen moi trong 24 gio`, moTa: 'Luong ung tuyen tang cao.', lienKet: '/quan-tri/analytics', mucDo: 50 }))
  if (taiKhoanBiKhoa > 0) canhBao.push(taoCanhBao({ id: 'tai-khoan-bi-khoa', loai: 'warning', tieu: `${taiKhoanBiKhoa} tai khoan dang bi khoa hoac tam khoa`, moTa: 'Kiem tra danh sach tai khoan bi khoa.', lienKet: '/quan-tri/nguoi-dung', mucDo: 45 }))

  snapshot = {
    canhBao: canhBao.sort((a, b) => b.mucDo - a.mucDo),
    thongKe: { tinQuaHanDuyet, congTyQuaHanDuyet, tinSapHetHan, hoSoUngTuyenMoi, taiKhoanBiKhoa },
    capNhatLuc: new Date().toISOString(),
  }
  return snapshot
}

export async function laySnapshotCanhBaoQuanTri() {
  if (snapshot.capNhatLuc === new Date(0).toISOString()) return tinhCanhBaoQuanTri()
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
      console.error('Tinh canh bao quan tri that bai:', error)
    } finally {
      dangChay = false
    }
  }
  void chay()
  timer = setInterval(chay, 5 * 60 * 1000)
}
