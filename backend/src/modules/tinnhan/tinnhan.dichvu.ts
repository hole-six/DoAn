import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { guiThongBaoChoNguoiDung } from '../../cauhinh/socket.js'
import { coId, jsonArray, jsonObject } from '../../dungchung/prismaHelper.js'
import { prisma } from '../../cauhinh/prisma.js'
import { taoVaGuiThongBao } from '../thongbao/thongbao.dichvu.js'

function id(value: any) {
  return String(value?._id ?? value?.id ?? value ?? '')
}

async function layNguoiDungMap(ids: string[]) {
  const unique = [...new Set(ids.map(id).filter(Boolean))]
  if (!unique.length) return new Map<string, any>()
  const rows = await prisma.nguoiDung.findMany({
    where: { id: { in: unique } },
    select: { id: true, hoTen: true, email: true, vaiTro: true, trangThai: true },
  })
  return new Map(rows.map(row => [row.id, coId(row)]))
}

async function hydrateConversation(row: any) {
  if (!row) return null
  const participantIds = jsonArray(row.nguoiThamGia).map(id) as string[]
  const adminIds = jsonArray(row.quanTriNhom).map(id) as string[]
  const senderId = id(row.tinNhanCuoiCung?.nguoiGui)
  const nguoiDungIds: string[] = [...participantIds, ...adminIds, ...(senderId ? [senderId] : [])]
  const userMap = await layNguoiDungMap(nguoiDungIds)
  const app = row.maHoSoUngTuyenGanNhat
    ? await prisma.hoSoUngTuyen.findUnique({ where: { id: row.maHoSoUngTuyenGanNhat }, select: { id: true, trangThai: true } })
    : null
  const job = row.maTinTuyenDungGanNhat
    ? await prisma.tinTuyenDung.findUnique({ where: { id: row.maTinTuyenDungGanNhat }, select: { id: true, tieuDe: true } })
    : null
  return coId({
    ...row,
    nguoiThamGia: participantIds.map(item => userMap.get(item) ?? item),
    quanTriNhom: adminIds.map(item => userMap.get(item) ?? item),
    tinNhanCuoiCung: row.tinNhanCuoiCung
      ? { ...row.tinNhanCuoiCung, nguoiGui: userMap.get(senderId) ?? row.tinNhanCuoiCung.nguoiGui }
      : row.tinNhanCuoiCung,
    maHoSoUngTuyenGanNhat: app ? coId(app) : row.maHoSoUngTuyenGanNhat,
    maTinTuyenDungGanNhat: job ? coId(job) : row.maTinTuyenDungGanNhat,
  })
}

async function hydrateConversations(rows: any[]) {
  const participantIds = rows.flatMap(row => jsonArray(row.nguoiThamGia).map(id))
  const adminIds = rows.flatMap(row => jsonArray(row.quanTriNhom).map(id))
  const senderIds = rows.map(row => id(row.tinNhanCuoiCung?.nguoiGui)).filter(Boolean)
  const appIds = rows.map(row => id(row.maHoSoUngTuyenGanNhat)).filter(Boolean)
  const jobIds = rows.map(row => id(row.maTinTuyenDungGanNhat)).filter(Boolean)

  const [userMap, apps, jobs] = await Promise.all([
    layNguoiDungMap([...participantIds, ...adminIds, ...senderIds]),
    appIds.length
      ? prisma.hoSoUngTuyen.findMany({ where: { id: { in: [...new Set(appIds)] } }, select: { id: true, trangThai: true } })
      : Promise.resolve([]),
    jobIds.length
      ? prisma.tinTuyenDung.findMany({ where: { id: { in: [...new Set(jobIds)] } }, select: { id: true, tieuDe: true } })
      : Promise.resolve([]),
  ])
  const appMap = new Map(apps.map(row => [row.id, coId(row)]))
  const jobMap = new Map(jobs.map(row => [row.id, coId(row)]))

  return rows.map(row => {
    const rowParticipantIds = jsonArray(row.nguoiThamGia).map(id)
    const rowAdminIds = jsonArray(row.quanTriNhom).map(id)
    const senderId = id(row.tinNhanCuoiCung?.nguoiGui)
    return coId({
      ...row,
      nguoiThamGia: rowParticipantIds.map(item => userMap.get(item) ?? item),
      quanTriNhom: rowAdminIds.map(item => userMap.get(item) ?? item),
      tinNhanCuoiCung: row.tinNhanCuoiCung
        ? { ...row.tinNhanCuoiCung, nguoiGui: userMap.get(senderId) ?? row.tinNhanCuoiCung.nguoiGui }
        : row.tinNhanCuoiCung,
      maHoSoUngTuyenGanNhat: appMap.get(id(row.maHoSoUngTuyenGanNhat)) ?? row.maHoSoUngTuyenGanNhat,
      maTinTuyenDungGanNhat: jobMap.get(id(row.maTinTuyenDungGanNhat)) ?? row.maTinTuyenDungGanNhat,
    })
  })
}

async function hydrateMessage(row: any) {
  if (!row) return null
  const ids = [row.nguoiGui, row.traloiTinNhan].map(id).filter(Boolean)
  const userMap = await layNguoiDungMap(ids)
  const reply = row.traloiTinNhan
    ? await prisma.tinNhan.findUnique({ where: { id: row.traloiTinNhan } })
    : null
  return coId({
    ...row,
    nguoiGui: userMap.get(id(row.nguoiGui)) ?? row.nguoiGui,
    traloiTinNhan: reply ? coId(reply) : row.traloiTinNhan,
  })
}

async function taoTomTatNguCanh(params: { maHoSoUngTuyen?: string; maTinTuyenDung?: string }) {
  if (!params.maHoSoUngTuyen && !params.maTinTuyenDung) return undefined
  const hoSo = params.maHoSoUngTuyen
    ? await prisma.hoSoUngTuyen.findUnique({ where: { id: params.maHoSoUngTuyen } })
    : await prisma.hoSoUngTuyen.findFirst({ where: { maTinTuyenDung: params.maTinTuyenDung }, orderBy: { ngayCapNhat: 'desc' } })
  const tin = hoSo?.maTinTuyenDung
    ? await prisma.tinTuyenDung.findUnique({ where: { id: hoSo.maTinTuyenDung } })
    : params.maTinTuyenDung
      ? await prisma.tinTuyenDung.findUnique({ where: { id: params.maTinTuyenDung } })
      : null
  const congTy = tin?.maNhaTuyenDung ? await prisma.nhaTuyenDung.findUnique({ where: { id: tin.maNhaTuyenDung } }) : null
  return {
    tieuDeTin: tin?.tieuDe,
    tenCongTy: congTy?.tenCongTy,
    maHoSoUngTuyen: params.maHoSoUngTuyen || hoSo?.id,
    maTinTuyenDung: params.maTinTuyenDung || tin?.id,
    capNhatLuc: new Date(),
  }
}

async function capNhatNguCanhCuocTroChuyen(cuocTroChuyenModel: any, params: { maHoSoUngTuyen?: string; maTinTuyenDung?: string }) {
  if (!params.maHoSoUngTuyen && !params.maTinTuyenDung) return cuocTroChuyenModel
  const summary = await taoTomTatNguCanh(params)
  return prisma.cuocTroChuyen.update({
    where: { id: id(cuocTroChuyenModel) },
    data: {
      maHoSoUngTuyen: params.maHoSoUngTuyen || cuocTroChuyenModel.maHoSoUngTuyen,
      maTinTuyenDung: params.maTinTuyenDung || cuocTroChuyenModel.maTinTuyenDung,
      maHoSoUngTuyenGanNhat: params.maHoSoUngTuyen || cuocTroChuyenModel.maHoSoUngTuyenGanNhat,
      maTinTuyenDungGanNhat: params.maTinTuyenDung || cuocTroChuyenModel.maTinTuyenDungGanNhat,
      ...(summary ? { contextSummary: summary } : {}),
    },
  })
}

async function hopNhatCuocTroChuyenTrungLap(cuocChinh: any, danhSachTrung: any[]) {
  const soChuaDocChinh = jsonObject(cuocChinh.soChuaDoc)
  for (const cuocTrung of danhSachTrung) {
    await prisma.tinNhan.updateMany({ where: { maCuocTroChuyenId: cuocTrung.id }, data: { maCuocTroChuyenId: cuocChinh.id } })
    const unreadTrung = jsonObject(cuocTrung.soChuaDoc)
    for (const nguoi of jsonArray(cuocChinh.nguoiThamGia)) {
      const maNguoi = id(nguoi)
      soChuaDocChinh[maNguoi] = Number(soChuaDocChinh[maNguoi] || 0) + Number(unreadTrung[maNguoi] || 0)
    }
    const t1 = cuocTrung.tinNhanCuoiCung?.thoiGian ? new Date(cuocTrung.tinNhanCuoiCung.thoiGian).getTime() : 0
    const t2 = cuocChinh.tinNhanCuoiCung?.thoiGian ? new Date(cuocChinh.tinNhanCuoiCung.thoiGian).getTime() : 0
    if (t1 > t2) cuocChinh.tinNhanCuoiCung = cuocTrung.tinNhanCuoiCung
    await prisma.cuocTroChuyen.update({ where: { id: cuocTrung.id }, data: { daLuuTru: true, thoiGianLuuTru: new Date() } })
  }
  await prisma.cuocTroChuyen.update({ where: { id: cuocChinh.id }, data: { soChuaDoc: soChuaDocChinh, tinNhanCuoiCung: cuocChinh.tinNhanCuoiCung } })
}

export async function layHoacTaoCuocTroChuyenModel(params: { nguoiThamGia: string[]; loai?: string; maHoSoUngTuyen?: string; maTinTuyenDung?: string }) {
  const nguoiThamGiaSorted = [...params.nguoiThamGia].map(id).sort()
  const loai = params.loai || 'ung_vien_nha_tuyen_dung'
  const danhSach = await prisma.cuocTroChuyen.findMany({
    where: { loai, daLuuTru: false, nguoiThamGia: { array_contains: nguoiThamGiaSorted } as any },
    orderBy: [{ ngayCapNhat: 'desc' }, { ngayTao: 'desc' }],
    take: 20,
  })
  const danhSachTrung = danhSach.filter(item => {
    const list = jsonArray(item.nguoiThamGia).map(id).sort()
    return list.length === nguoiThamGiaSorted.length && list.every((value, index) => value === nguoiThamGiaSorted[index])
  })
  let cuocTroChuyenModel = danhSachTrung[0] || null
  if (cuocTroChuyenModel && danhSachTrung.length > 1) await hopNhatCuocTroChuyenTrungLap(cuocTroChuyenModel, danhSachTrung.slice(1))
  if (!cuocTroChuyenModel) {
    cuocTroChuyenModel = await prisma.cuocTroChuyen.create({
      data: {
        nguoiThamGia: nguoiThamGiaSorted,
        loai,
        maHoSoUngTuyen: params.maHoSoUngTuyen,
        maTinTuyenDung: params.maTinTuyenDung,
        maHoSoUngTuyenGanNhat: params.maHoSoUngTuyen,
        maTinTuyenDungGanNhat: params.maTinTuyenDung,
        soChuaDoc: Object.fromEntries(nguoiThamGiaSorted.map(value => [value, 0])),
      },
    })
  }
  cuocTroChuyenModel = await capNhatNguCanhCuocTroChuyen(cuocTroChuyenModel, params)
  return hydrateConversation(cuocTroChuyenModel)
}

async function hopNhatCuocTroChuyenCuaNguoiDung(maNguoiDung: string) {
  const danhSach = await prisma.cuocTroChuyen.findMany({
    where: { daLuuTru: false, loai: { not: 'nhom_cong_dong' }, nguoiThamGia: { array_contains: [maNguoiDung] } as any },
    orderBy: [{ ngayCapNhat: 'desc' }, { ngayTao: 'desc' }],
    take: 200,
  })
  const groups = new Map<string, any[]>()
  for (const item of danhSach) {
    const participants = jsonArray(item.nguoiThamGia).map(id).sort().join('|')
    const key = `${item.loai || 'ung_vien_nha_tuyen_dung'}:${participants}`
    groups.set(key, [...(groups.get(key) || []), item])
  }
  for (const items of groups.values()) if (items.length > 1) await hopNhatCuocTroChuyenTrungLap(items[0], items.slice(1))
}

const damBaoHoTroGanNhat = new Map<string, number>()
const hopNhatGanNhat = new Map<string, number>()
const BAO_TRI_CHAT_TTL_MS = Number(process.env.CHAT_MAINTENANCE_TTL_MS ?? 5 * 60 * 1000)

async function timAdminDauTien() {
  return prisma.nguoiDung.findFirst({ where: { vaiTro: 'admin', trangThai: { not: 'bi_khoa' } }, select: { id: true } })
}

async function congTyDaDuyet(maNguoiDung: string) {
  const congTy = await prisma.nhaTuyenDung.findUnique({ where: { maNguoiDung }, select: { trangThaiDuyet: true } })
  return Boolean(congTy && congTy.trangThaiDuyet === 'da_duyet')
}

export async function damBaoCuocTroChuyenHoTroQuanTri(maNguoiDung: string, vaiTro: string) {
  const cacheKey = `${maNguoiDung}:${vaiTro}`
  const lanGanNhat = damBaoHoTroGanNhat.get(cacheKey) ?? 0
  if (Date.now() - lanGanNhat < BAO_TRI_CHAT_TTL_MS) return
  damBaoHoTroGanNhat.set(cacheKey, Date.now())

  if (vaiTro === 'admin') {
    const congTyList = await prisma.nhaTuyenDung.findMany({ where: { trangThaiDuyet: 'da_duyet' }, select: { maNguoiDung: true }, take: 500 })
    await Promise.all(congTyList.map(congTy => layHoacTaoCuocTroChuyenModel({ nguoiThamGia: [maNguoiDung, congTy.maNguoiDung], loai: 'admin_support' })))
  }
  if (vaiTro === 'nha_tuyen_dung') {
    if (!await congTyDaDuyet(maNguoiDung)) return
    const admin = await timAdminDauTien()
    if (admin) await layHoacTaoCuocTroChuyenModel({ nguoiThamGia: [maNguoiDung, admin.id], loai: 'admin_support' })
  }
}

export async function layDanhSachNhomCongDong() {
  const danhSach = await prisma.cuocTroChuyen.findMany({ where: { loai: 'nhom_cong_dong', daLuuTru: false }, orderBy: { ngayCapNhat: 'desc' } })
  return Promise.all(danhSach.map(async doc => {
    const obj = await hydrateConversation(doc) as any
    return { ...obj, id: String(obj._id), soThanhVien: obj.nguoiThamGia?.length || 0 }
  }))
}

export async function thamGiaNhomCongDong(maNhom: string, maNguoiDung: string) {
  const nhom = await prisma.cuocTroChuyen.findUnique({ where: { id: maNhom } })
  if (!nhom) throw new LoiUngDung('Không tìm thấy nhóm', 404)
  if (nhom.loai !== 'nhom_cong_dong') throw new LoiUngDung('Đây không phải nhóm cộng đồng', 400)
  const nguoiThamGia = jsonArray(nhom.nguoiThamGia).map(id)
  const soChuaDoc = jsonObject(nhom.soChuaDoc)
  if (!nguoiThamGia.includes(maNguoiDung)) {
    nguoiThamGia.push(maNguoiDung)
    soChuaDoc[maNguoiDung] = 0
    await prisma.cuocTroChuyen.update({ where: { id: maNhom }, data: { nguoiThamGia, soChuaDoc } })
    await prisma.tinNhan.create({ data: { maCuocTroChuyenId: maNhom, nguoiGui: maNguoiDung, noiDung: 'đã tham gia nhóm', loai: 'system' } })
  }
  return hydrateConversation(await prisma.cuocTroChuyen.findUnique({ where: { id: maNhom } }))
}

export async function layDanhSachCuocTroChuyenModel(maNguoiDung: string) {
  const lanGanNhat = hopNhatGanNhat.get(maNguoiDung) ?? 0
  if (Date.now() - lanGanNhat >= BAO_TRI_CHAT_TTL_MS) {
    hopNhatGanNhat.set(maNguoiDung, Date.now())
    await hopNhatCuocTroChuyenCuaNguoiDung(maNguoiDung)
  }
  const danhSach = await prisma.cuocTroChuyen.findMany({
    where: { daLuuTru: false, nguoiThamGia: { array_contains: [maNguoiDung] } as any },
    orderBy: { ngayCapNhat: 'desc' },
    take: 50,
  })
  const hydrated = await hydrateConversations(danhSach)
  return hydrated.map(doc => {
    const obj = doc as any
    return { ...obj, id: String(obj._id), soChuaDocCuaToi: Number(jsonObject(obj.soChuaDoc)[maNguoiDung] || 0) }
  })
}

export async function layCuocTroChuyenModelTheoMa(maCuocTroChuyenModel: string, maNguoiDung: string) {
  const cuocTroChuyenModel = await prisma.cuocTroChuyen.findUnique({ where: { id: maCuocTroChuyenModel } })
  if (!cuocTroChuyenModel) throw new LoiUngDung('Không tìm thấy cuộc trò chuyện', 404)
  const coQuyen = jsonArray(cuocTroChuyenModel.nguoiThamGia).some(ng => id(ng) === maNguoiDung)
  if (!coQuyen) throw new LoiUngDung('Bạn không có quyền truy cập cuộc trò chuyện này', 403)
  return hydrateConversation(cuocTroChuyenModel)
}

export async function danhDauDaDocCuocTroChuyenModel(maCuocTroChuyenModel: string, maNguoiDung: string) {
  const cuocTroChuyenModel = await prisma.cuocTroChuyen.findUnique({ where: { id: maCuocTroChuyenModel } })
  if (!cuocTroChuyenModel) throw new LoiUngDung('Không tìm thấy cuộc trò chuyện', 404)
  const soChuaDoc = jsonObject(cuocTroChuyenModel.soChuaDoc)
  soChuaDoc[maNguoiDung] = 0
  await prisma.cuocTroChuyen.update({ where: { id: maCuocTroChuyenModel }, data: { soChuaDoc } })
  const tinNhanCanDoc = await prisma.tinNhan.findMany({ where: { maCuocTroChuyenId: maCuocTroChuyenModel, nguoiGui: { not: maNguoiDung }, daXoa: false }, take: 500 })
  await Promise.all(tinNhanCanDoc.map(msg => {
    const daDuocDocBoi = jsonArray(msg.daDuocDocBoi)
    if (daDuocDocBoi.some(item => id(item?.nguoiDung) === maNguoiDung)) return Promise.resolve()
    return prisma.tinNhan.update({ where: { id: msg.id }, data: { daDuocDocBoi: [...daDuocDocBoi, { nguoiDung: maNguoiDung, thoiGian: new Date() }] } })
  }))
  return hydrateConversation(await prisma.cuocTroChuyen.findUnique({ where: { id: maCuocTroChuyenModel } }))
}

export async function guiTinNhan(params: { maCuocTroChuyenId: string; nguoiGui: string; noiDung: string; loai?: string; tepDinhKem?: any[]; traloiTinNhan?: string }) {
  const cuocTroChuyenModel = await layCuocTroChuyenModelTheoMa(params.maCuocTroChuyenId, params.nguoiGui) as any
  const tinNhan = await prisma.tinNhan.create({
    data: { maCuocTroChuyenId: params.maCuocTroChuyenId, nguoiGui: params.nguoiGui, noiDung: params.noiDung, loai: params.loai || 'text', tepDinhKem: params.tepDinhKem || [], traloiTinNhan: params.traloiTinNhan },
  })
  const participantIds = jsonArray(cuocTroChuyenModel.nguoiThamGia).map(id)
  const soChuaDoc = jsonObject(cuocTroChuyenModel.soChuaDoc)
  for (const participantId of participantIds) if (participantId !== params.nguoiGui) soChuaDoc[participantId] = Number(soChuaDoc[participantId] || 0) + 1
  await prisma.cuocTroChuyen.update({
    where: { id: params.maCuocTroChuyenId },
    data: { tinNhanCuoiCung: { noiDung: params.noiDung, nguoiGui: params.nguoiGui, thoiGian: new Date() }, soChuaDoc },
  })
  const tinNhanObj = await hydrateMessage(tinNhan) as any
  for (const participant of jsonArray(cuocTroChuyenModel.nguoiThamGia)) {
    const participantId = id(participant)
    if (participantId === params.nguoiGui) continue
    guiThongBaoChoNguoiDung(participantId, 'tin_nhan_moi', { maCuocTroChuyenId: params.maCuocTroChuyenId, tinNhan: { ...tinNhanObj, id: String(tinNhanObj._id) } })
    const vaiTroNhan = participant?.vaiTro
    const duongDanChat = vaiTroNhan === 'admin' ? '/quan-tri/chat' : vaiTroNhan === 'ung_vien' ? '/ung-vien/chat' : '/nha-tuyen-dung/chat'
    await taoVaGuiThongBao({ maNguoiDung: participantId, loai: 'tin_nhan', tieuDe: `Tin nhắn mới từ ${tinNhanObj.nguoiGui?.hoTen ?? 'Người dùng'}`, noiDung: params.noiDung.substring(0, 100), lienKet: `${duongDanChat}?cuocTroChuyen=${params.maCuocTroChuyenId}`, mucDoUuTien: 'trung_binh', icon: '💬', mauSac: '#8b5cf6' })
  }
  return { ...tinNhanObj, id: String(tinNhanObj._id) }
}

export async function layDanhSachTinNhan(params: { maCuocTroChuyenId: string; maNguoiDung: string; limit?: number; truocTinNhan?: string }) {
  await layCuocTroChuyenModelTheoMa(params.maCuocTroChuyenId, params.maNguoiDung)
  const before = params.truocTinNhan ? await prisma.tinNhan.findUnique({ where: { id: params.truocTinNhan } }) : null
  const danhSach = await prisma.tinNhan.findMany({
    where: { maCuocTroChuyenId: params.maCuocTroChuyenId, daXoa: false, ...(before ? { ngayTao: { lt: before.ngayTao } } : {}) },
    orderBy: { ngayTao: 'desc' },
    take: params.limit || 50,
  })
  const hydrated = await Promise.all(danhSach.reverse().map(hydrateMessage))
  return hydrated.map((doc: any) => ({ ...doc, id: String(doc._id), daToi: jsonArray(doc.daDuocDocBoi).some((d: any) => id(d.nguoiDung) === params.maNguoiDung) }))
}

export async function xoaTinNhan(maTinNhan: string, maNguoiDung: string) {
  const tinNhan = await prisma.tinNhan.findUnique({ where: { id: maTinNhan } })
  if (!tinNhan) throw new LoiUngDung('Không tìm thấy tin nhắn', 404)
  if (String(tinNhan.nguoiGui) !== maNguoiDung) throw new LoiUngDung('Bạn không có quyền xóa tin nhắn này', 403)
  const daXoa = await prisma.tinNhan.update({ where: { id: maTinNhan }, data: { daXoa: true, noiDung: 'Tin nhắn đã bị xóa' } })
  const cuocTroChuyenModel = await prisma.cuocTroChuyen.findUnique({ where: { id: tinNhan.maCuocTroChuyenId } })
  if (cuocTroChuyenModel) for (const nguoiThamGia of jsonArray(cuocTroChuyenModel.nguoiThamGia)) guiThongBaoChoNguoiDung(id(nguoiThamGia), 'tin_nhan_da_xoa', { maCuocTroChuyenId: tinNhan.maCuocTroChuyenId, maTinNhan })
  return coId(daXoa)
}

export async function themPhanUng(params: { maTinNhan: string; maNguoiDung: string; emoji: string }) {
  const tinNhan = await prisma.tinNhan.findUnique({ where: { id: params.maTinNhan } })
  if (!tinNhan) throw new LoiUngDung('Không tìm thấy tin nhắn', 404)
  const phanUng = jsonArray(tinNhan.phanUng).filter((r: any) => id(r.nguoiDung) !== params.maNguoiDung)
  phanUng.push({ nguoiDung: params.maNguoiDung, emoji: params.emoji })
  const updated = await prisma.tinNhan.update({ where: { id: params.maTinNhan }, data: { phanUng } })
  const cuocTroChuyenModel = await prisma.cuocTroChuyen.findUnique({ where: { id: tinNhan.maCuocTroChuyenId } })
  if (cuocTroChuyenModel) for (const nguoiThamGia of jsonArray(cuocTroChuyenModel.nguoiThamGia)) guiThongBaoChoNguoiDung(id(nguoiThamGia), 'phan_ung_moi', { maCuocTroChuyenId: tinNhan.maCuocTroChuyenId, maTinNhan: params.maTinNhan, nguoiDung: params.maNguoiDung, emoji: params.emoji })
  return coId(updated)
}
