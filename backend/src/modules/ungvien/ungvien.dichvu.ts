import { prisma } from '../../cauhinh/prisma.js'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined } from '../../dungchung/prismaHelper.js'
import { UngVien } from './ungvien.mohinh.js'

// ─── helpers nội bộ ───────────────────────────────────────────────────────────

/** Fetch NguoiDung cho danh sách ứng viên và trả về Map<maNguoiDung, nguoiDung> */
async function layNguoiDungMap(rows: any[]) {
  const ids = [...new Set(rows.map(r => r.maNguoiDung).filter(Boolean))]
  if (!ids.length) return new Map<string, any>()
  const nguoiDungs = await prisma.nguoiDung.findMany({
    where: { id: { in: ids } },
    select: { id: true, hoTen: true, email: true, soDienThoai: true, trangThai: true },
  })
  return new Map(nguoiDungs.map(nd => [nd.id, nd]))
}

const includeKyNang = {
  kyNangLienKet: {
    include: {
      kyNang: {
        select: { id: true, tenKyNang: true, loaiKyNang: true },
      },
    },
  },
} as const

function dinhDangUngVien(row: any, nguoiDungMap: Map<string, any>) {
  const nd = nguoiDungMap.get(row.maNguoiDung)
  return {
    id: String(row.id),
    _id: String(row.id),
    maNguoiDung: String(row.maNguoiDung),
    nguoiDung: nd
      ? {
          id: String(nd.id),
          hoTen: nd.hoTen,
          email: nd.email,
          soDienThoai: nd.soDienThoai,
          trangThai: nd.trangThai,
        }
      : undefined,
    ngaySinh: row.ngaySinh,
    gioiTinh: row.gioiTinh,
    diaChi: row.diaChi,
    anhDaiDien: row.anhDaiDien,
    tomTat: row.tomTat,
    kinhNghiem: row.kinhNghiem,
    viTriMongMuon: row.viTriMongMuon,
    mucLuongMongMuon: row.mucLuongMongMuon,
    // ✅ Lấy từ bảng quan hệ UngVienKyNang
    kyNang: (row.kyNangLienKet ?? []).map((lienKet: any) => ({
      maKyNang: String(lienKet.kyNang?.id ?? lienKet.maKyNang),
      tenKyNang: lienKet.kyNang?.tenKyNang,
      loaiKyNang: lienKet.kyNang?.loaiKyNang,
      mucDo: lienKet.mucDo,
      soNamKinhNghiem: lienKet.soNamKinhNghiem,
    })),
    ngayTao: row.ngayTao,
    ngayCapNhat: row.ngayCapNhat,
  }
}

// ─── service ─────────────────────────────────────────────────────────────────

export const dichVuUngVien = {
  async layDanhSach() {
    const rows = await UngVien.findMany({ orderBy: { ngayTao: 'desc' }, take: 200, include: includeKyNang })
    const nguoiDungMap = await layNguoiDungMap(rows)
    return rows.map(r => dinhDangUngVien(r, nguoiDungMap))
  },

  async layTheoMa(ma: string) {
    const row = await UngVien.findUnique({ where: { id: ma }, include: includeKyNang })
    if (!row) throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)
    const nguoiDungMap = await layNguoiDungMap([row])
    return dinhDangUngVien(row, nguoiDungMap)
  },

  async layTheoMaNguoiDung(maNguoiDung: string) {
    const row = await UngVien.findUnique({ where: { maNguoiDung }, include: includeKyNang })
    if (!row) throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)
    const nguoiDungMap = await layNguoiDungMap([row])
    return dinhDangUngVien(row, nguoiDungMap)
  },

  async damBaoHoSoTheoNguoiDung(maNguoiDung: string) {
    const hienTai = await UngVien.findUnique({ where: { maNguoiDung }, include: includeKyNang })
    const row = hienTai ?? (await UngVien.create({ data: { maNguoiDung, kinhNghiem: 0 }, include: includeKyNang }))
    const nguoiDungMap = await layNguoiDungMap([row])
    return dinhDangUngVien(row, nguoiDungMap)
  },

  async taoMoi(duLieu: unknown) {
    const payload = duLieu as Record<string, any>
    const { kyNang, ...ungVienData } = payload

    const ketQua = await UngVien.create({ data: boUndefined(ungVienData) as any })

    if (Array.isArray(kyNang) && kyNang.length > 0) {
      const kyNangData = kyNang
        .map(item => ({
          maUngVien: ketQua.id,
          maKyNang: String(item?.maKyNang?.id ?? item?.maKyNang),
          mucDo: item?.mucDo != null ? Number(item.mucDo) : null,
          soNamKinhNghiem: item?.soNamKinhNghiem != null ? Number(item.soNamKinhNghiem) : null,
        }))
        .filter(item => item.maKyNang)

      if (kyNangData.length > 0) {
        await prisma.ungVienKyNang.createMany({ data: kyNangData, skipDuplicates: true })
      }
    }

    return this.layTheoMa(String(ketQua.id))
  },

  async capNhat(ma: string, duLieu: unknown, maNguoiDungHienTai?: string) {
    const hienTai = await UngVien.findUnique({ where: { id: ma } })
    if (!hienTai) throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)

    if (maNguoiDungHienTai && String(hienTai.maNguoiDung) !== maNguoiDungHienTai) {
      throw new LoiUngDung('Bạn không có quyền cập nhật hồ sơ này', 403)
    }

    const payload = duLieu as Record<string, any>
    const { kyNang, ...ungVienData } = payload

    await UngVien.update({ where: { id: ma }, data: boUndefined(ungVienData) as any })

    if (kyNang !== undefined) {
      await prisma.ungVienKyNang.deleteMany({ where: { maUngVien: ma } })

      if (Array.isArray(kyNang) && kyNang.length > 0) {
        const kyNangData = kyNang
          .map(item => ({
            maUngVien: ma,
            maKyNang: String(item?.maKyNang?.id ?? item?.maKyNang),
            mucDo: item?.mucDo != null ? Number(item.mucDo) : null,
            soNamKinhNghiem: item?.soNamKinhNghiem != null ? Number(item.soNamKinhNghiem) : null,
          }))
          .filter(item => item.maKyNang)

        if (kyNangData.length > 0) {
          await prisma.ungVienKyNang.createMany({ data: kyNangData, skipDuplicates: true })
        }
      }
    }

    return this.layTheoMa(ma)
  },

  async xoa(ma: string, maNguoiDungHienTai?: string) {
    const hienTai = await UngVien.findUnique({ where: { id: ma } })
    if (!hienTai) throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)

    if (maNguoiDungHienTai && String(hienTai.maNguoiDung) !== maNguoiDungHienTai) {
      throw new LoiUngDung('Bạn không có quyền xóa hồ sơ này', 403)
    }

    await UngVien.delete({ where: { id: ma } })
    // Trả về bản ghi đã xóa với cấu trúc chuẩn (không có nguoiDung / kyNang vì đã xóa)
    const emptyMap = new Map<string, any>()
    return dinhDangUngVien({ ...hienTai, kyNangLienKet: [] }, emptyMap)
  },

  async layDashboard(maNguoiDung: string) {
    // 1. Lấy thông tin ứng viên
    const ungVien = await UngVien.findUnique({ where: { maNguoiDung } })
    
    // Nếu không có ungVien, trả về dữ liệu rỗng
    if (!ungVien) {
      return {
        thongKe: {
          daUngTuyen: 0,
          lichPhongVan: 0,
          viecDaLuu: 0,
          thongBaoMoi: 0
        },
        hoSoUngTuyen: [],
        lichPhongVan: [],
        hoSo: {
          doHoanThien: 20,
          luotXem: 0
        }
      }
    }

    // 2. Thống kê hồ sơ ứng tuyển
    const hoSoUngTuyen = await prisma.hoSoUngTuyen.findMany({
      where: { maUngVien: ungVien.id },
      orderBy: { ngayNop: 'desc' },
      take: 3,
      include: {
        tinTuyenDung: {
          include: {
            nhaTuyenDung: {
              select: { tenCongTy: true }
            }
          }
        },
        lichSu: {
          orderBy: { thoiGian: 'desc' },  // ✅ Sửa: ngayThayDoi -> thoiGian
          take: 1
        }
      }
    })

    const tongHoSoUngTuyen = await prisma.hoSoUngTuyen.count({
      where: { maUngVien: ungVien.id }
    })

    // 3. Lịch phỏng vấn sắp tới
    const lichPhongVan = await prisma.lichPhongVan.findMany({
      where: {
        hoSoUngTuyen: {
          maUngVien: ungVien.id
        },
        thoiGianBatDau: {
          gte: new Date()
        }
      },
      orderBy: { thoiGianBatDau: 'asc' },
      take: 2,
      include: {
        hoSoUngTuyen: {
          include: {
            tinTuyenDung: {
              include: {
                nhaTuyenDung: {
                  select: { tenCongTy: true }
                }
              }
            }
          }
        }
      }
    })

    const tongLichPhongVan = await prisma.lichPhongVan.count({
      where: {
        hoSoUngTuyen: {
          maUngVien: ungVien.id
        },
        thoiGianBatDau: {
          gte: new Date()
        }
      }
    })

    // 4. Việc làm đã lưu
    const tongViecDaLuu = await prisma.viecLamDaLuu.count({
      where: { maNguoiDung }  // ✅ Sửa: maUngVien -> maNguoiDung
    })

    // 5. Thông báo mới
    const tongThongBaoMoi = await prisma.thongBao.count({
      where: {
        maNguoiDung,
        daDoc: false
      }
    })

    // 6. Tính độ hoàn thiện hồ sơ
    let doHoanThien = 20 // Đã tạo tài khoản
    if (ungVien.anhDaiDien) doHoanThien += 10
    if (ungVien.tomTat) doHoanThien += 15
    if (ungVien.viTriMongMuon) doHoanThien += 15
    if (ungVien.diaChi) doHoanThien += 10
    if (ungVien.kinhNghiem && ungVien.kinhNghiem > 0) doHoanThien += 15
    
    const coKyNang = await prisma.ungVienKyNang.count({
      where: { maUngVien: ungVien.id }
    })
    if (coKyNang > 0) doHoanThien += 15

    // 7. Đếm số lượng CV đã tạo (thay vì lượt xem)
    const soCV = await prisma.hoSoNangLuc.count({
      where: { maUngVien: ungVien.id }
    })

    return {
      thongKe: {
        daUngTuyen: tongHoSoUngTuyen,
        lichPhongVan: tongLichPhongVan,
        viecDaLuu: tongViecDaLuu,
        thongBaoMoi: tongThongBaoMoi
      },
      hoSoUngTuyen: hoSoUngTuyen.map(hs => {
        // lichSu là array nên có thể truy cập trực tiếp
        // Lấy trạng thái mới nhất từ lịch sử hoặc dùng trangThai hiện tại
        const trangThaiMoiNhat = hs.lichSu.length > 0 
          ? hs.lichSu[0].trangThaiMoi
          : hs.trangThai
        
        return {
          id: String(hs.id),
          viTri: hs.tinTuyenDung.tieuDe || 'N/A',  // ✅ Bỏ ? vì đã include
          congTy: hs.tinTuyenDung.nhaTuyenDung.tenCongTy || 'N/A',  // ✅ Bỏ ? vì đã include
          trangThai: trangThaiMoiNhat || 'Đang xem xét',
          ngay: hs.ngayNop ? new Date(hs.ngayNop).toLocaleDateString('vi-VN') : 'N/A'
        }
      }),
      lichPhongVan: lichPhongVan.map(lv => ({
        id: String(lv.id),
        viTri: lv.hoSoUngTuyen.tinTuyenDung.tieuDe || 'N/A',  // ✅ Bỏ ? vì đã include
        congTy: lv.hoSoUngTuyen.tinTuyenDung.nhaTuyenDung.tenCongTy || 'N/A',  // ✅ Bỏ ? vì đã include
        ngay: lv.thoiGianBatDau ? new Date(lv.thoiGianBatDau).toLocaleDateString('vi-VN') : 'N/A',
        gio: lv.thoiGianBatDau ? new Date(lv.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        hinh: lv.linkHop ? 'Online (Google Meet)' : 'Tại văn phòng'
      })),
      hoSo: {
        doHoanThien,
        luotXem: soCV  // Số CV đã tạo thay vì lượt xem
      }
    }
  }
}
