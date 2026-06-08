type BanGhiBatKy = Record<string, any>

function chuyenThanhChuoi(value: unknown) {
  return String(value ?? '')
}

export function chuanHoaTuKhoa(value: unknown) {
  return chuyenThanhChuoi(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
}

function rutGonLienMach(value: unknown) {
  return chuanHoaTuKhoa(value).replace(/\s+/g, '')
}

export function layLimit(value: unknown, macDinh: number, toiDa: number) {
  const so = Number(value)
  if (!Number.isFinite(so) || so <= 0) return macDinh
  return Math.min(Math.floor(so), toiDa)
}

export function locVaXepHangTheoTuKhoa<T extends BanGhiBatKy>(
  danhSach: T[],
  tuKhoa: unknown,
  layChuoiTimKiem: (item: T) => string[],
) {
  const query = chuanHoaTuKhoa(tuKhoa)
  if (!query) return danhSach

  const queryCompact = rutGonLienMach(tuKhoa)

  return danhSach
    .map(item => {
      const cacChuoi = layChuoiTimKiem(item)
      let diem = -1

      for (const chuoi of cacChuoi) {
        const normalized = chuanHoaTuKhoa(chuoi)
        const compact = rutGonLienMach(chuoi)
        if (!normalized && !compact) continue

        let diemChuoi = -1
        if (compact === queryCompact) diemChuoi = 120
        else if (normalized === query) diemChuoi = 110
        else if (compact.startsWith(queryCompact)) diemChuoi = 100
        else if (normalized.startsWith(query)) diemChuoi = 95
        else if (compact.includes(queryCompact)) diemChuoi = 80
        else if (normalized.includes(query)) diemChuoi = 70
        else {
          const tu = query.split(/\s+/).filter(Boolean)
          const hopLe = tu.filter(token => normalized.includes(token) || compact.includes(token.replace(/\s+/g, ''))).length
          if (hopLe > 0) diemChuoi = 40 + hopLe * 5
        }

        diem = Math.max(diem, diemChuoi)
      }

      return { item, diem }
    })
    .filter(item => item.diem >= 0)
    .sort((a, b) => b.diem - a.diem)
    .map(item => item.item)
}
