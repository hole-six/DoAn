import { LoiUngDung } from '../../dungchung/loiungdung.js'

function damBaoChuyenTrangThaiHopLe(
  nhom: string,
  hienTai: string | undefined,
  moi: string | undefined,
  choPhep: Record<string, string[]>,
) {
  if (!hienTai || !moi || hienTai === moi) return
  const danhSach = choPhep[hienTai] ?? []
  if (danhSach.includes(moi)) return
  throw new LoiUngDung(
    `Khong the chuyen trang thai ${nhom} tu "${hienTai}" sang "${moi}"`,
    409,
    'INVALID_STATE_TRANSITION',
    undefined,
    'Kiem tra luong nghiep vu va thuc hien dung thu tu trang thai',
  )
}

export function damBaoTrangThaiTinTuyenDung(vaiTro: string, hienTai?: string, moi?: string) {
  if (!hienTai || !moi || hienTai === moi) return

  if (vaiTro === 'admin') {
    damBaoChuyenTrangThaiHopLe('tin_tuyen_dung', hienTai, moi, {
      nhap: ['cho_duyet'],
      cho_duyet: ['dang_mo', 'tu_choi'],
      dang_mo: ['tam_dong', 'het_han'],
      tam_dong: ['dang_mo', 'het_han'],
      het_han: [],
      tu_choi: [],
    })
    return
  }

  if (vaiTro === 'nha_tuyen_dung') {
    damBaoChuyenTrangThaiHopLe('tin_tuyen_dung', hienTai, moi, {
      nhap: ['cho_duyet'],
      cho_duyet: ['nhap'],
      dang_mo: ['tam_dong'],
      tam_dong: ['dang_mo'],
      het_han: [],
      tu_choi: [],
    })
    return
  }

  throw new LoiUngDung('Ban khong co quyen cap nhat trang thai tin tuyen dung', 403, 'FORBIDDEN')
}

export function damBaoTrangThaiHoSoUngTuyen(vaiTro: string, hienTai?: string, moi?: string) {
  if (!hienTai || !moi || hienTai === moi) return

  if (vaiTro === 'admin' || vaiTro === 'nha_tuyen_dung') {
    damBaoChuyenTrangThaiHopLe('ho_so_ung_tuyen', hienTai, moi, {
      da_nop: ['da_xem', 'dang_xet_duyet', 'tu_choi'],
      da_xem: ['dang_xet_duyet', 'moi_phong_van', 'tu_choi'],
      dang_xet_duyet: ['moi_phong_van', 'dat', 'tu_choi'],
      moi_phong_van: ['dat', 'tu_choi'],
      dat: [],
      tu_choi: [],
      da_rut: [],
    })
    return
  }

  if (vaiTro === 'ung_vien') {
    damBaoChuyenTrangThaiHopLe('ho_so_ung_tuyen', hienTai, moi, {
      da_nop: ['da_rut'],
      da_xem: ['da_rut'],
      dang_xet_duyet: ['da_rut'],
      moi_phong_van: [],
      dat: [],
      tu_choi: [],
      da_rut: [],
    })
    return
  }

  throw new LoiUngDung('Ban khong co quyen cap nhat trang thai ho so ung tuyen', 403, 'FORBIDDEN')
}

export function damBaoTrangThaiLichPhongVan(vaiTro: string, hienTai?: string, moi?: string) {
  if (!hienTai || !moi || hienTai === moi) return

  if (vaiTro === 'admin' || vaiTro === 'nha_tuyen_dung') {
    damBaoChuyenTrangThaiHopLe('lich_phong_van', hienTai, moi, {
      da_len_lich: ['da_xac_nhan', 'da_huy'],
      da_xac_nhan: ['hoan_thanh', 'da_huy'],
      doi_lich: ['da_len_lich', 'da_huy'],
      hoan_thanh: [],
      da_huy: [],
    })
    return
  }

  if (vaiTro === 'ung_vien') {
    damBaoChuyenTrangThaiHopLe('lich_phong_van', hienTai, moi, {
      da_len_lich: ['da_xac_nhan', 'doi_lich', 'da_huy'],
      da_xac_nhan: ['doi_lich'],
      doi_lich: [],
      hoan_thanh: [],
      da_huy: [],
    })
    return
  }

  throw new LoiUngDung('Ban khong co quyen cap nhat trang thai lich phong van', 403, 'FORBIDDEN')
}
