"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.layHoacTaoCuocTroChuyenModel = layHoacTaoCuocTroChuyenModel;
exports.damBaoCuocTroChuyenHoTroQuanTri = damBaoCuocTroChuyenHoTroQuanTri;
exports.layDanhSachNhomCongDong = layDanhSachNhomCongDong;
exports.thamGiaNhomCongDong = thamGiaNhomCongDong;
exports.layDanhSachCuocTroChuyenModel = layDanhSachCuocTroChuyenModel;
exports.layCuocTroChuyenModelTheoMa = layCuocTroChuyenModelTheoMa;
exports.danhDauDaDocCuocTroChuyenModel = danhDauDaDocCuocTroChuyenModel;
exports.guiTinNhan = guiTinNhan;
exports.layDanhSachTinNhan = layDanhSachTinNhan;
exports.xoaTinNhan = xoaTinNhan;
exports.themPhanUng = themPhanUng;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const socket_js_1 = require("../../cauhinh/socket.js");
const prismaHelper_js_1 = require("../../dungchung/prismaHelper.js");
const prisma_js_1 = require("../../cauhinh/prisma.js");
const thongbao_dichvu_js_1 = require("../thongbao/thongbao.dichvu.js");
function id(value) {
    return String(value?._id ?? value?.id ?? value ?? '');
}
async function layNguoiDungMap(ids) {
    const unique = [...new Set(ids.map(id).filter(Boolean))];
    if (!unique.length)
        return new Map();
    const rows = await prisma_js_1.prisma.nguoiDung.findMany({
        where: { id: { in: unique } },
        select: { id: true, hoTen: true, email: true, vaiTro: true, trangThai: true },
    });
    return new Map(rows.map(row => [row.id, (0, prismaHelper_js_1.coId)(row)]));
}
async function hydrateConversation(row) {
    if (!row)
        return null;
    const participantIds = (0, prismaHelper_js_1.jsonArray)(row.nguoiThamGia).map(id);
    const adminIds = (0, prismaHelper_js_1.jsonArray)(row.quanTriNhom).map(id);
    const senderId = id(row.tinNhanCuoiCung?.nguoiGui);
    const nguoiDungIds = [...participantIds, ...adminIds, ...(senderId ? [senderId] : [])];
    const userMap = await layNguoiDungMap(nguoiDungIds);
    const app = row.maHoSoUngTuyenGanNhat
        ? await prisma_js_1.prisma.hoSoUngTuyen.findUnique({ where: { id: row.maHoSoUngTuyenGanNhat }, select: { id: true, trangThai: true } })
        : null;
    const job = row.maTinTuyenDungGanNhat
        ? await prisma_js_1.prisma.tinTuyenDung.findUnique({ where: { id: row.maTinTuyenDungGanNhat }, select: { id: true, tieuDe: true } })
        : null;
    return (0, prismaHelper_js_1.coId)({
        ...row,
        nguoiThamGia: participantIds.map(item => userMap.get(item) ?? item),
        quanTriNhom: adminIds.map(item => userMap.get(item) ?? item),
        tinNhanCuoiCung: row.tinNhanCuoiCung
            ? { ...row.tinNhanCuoiCung, nguoiGui: userMap.get(senderId) ?? row.tinNhanCuoiCung.nguoiGui }
            : row.tinNhanCuoiCung,
        maHoSoUngTuyenGanNhat: app ? (0, prismaHelper_js_1.coId)(app) : row.maHoSoUngTuyenGanNhat,
        maTinTuyenDungGanNhat: job ? (0, prismaHelper_js_1.coId)(job) : row.maTinTuyenDungGanNhat,
    });
}
async function hydrateConversations(rows) {
    const participantIds = rows.flatMap(row => (0, prismaHelper_js_1.jsonArray)(row.nguoiThamGia).map(id));
    const adminIds = rows.flatMap(row => (0, prismaHelper_js_1.jsonArray)(row.quanTriNhom).map(id));
    const senderIds = rows.map(row => id(row.tinNhanCuoiCung?.nguoiGui)).filter(Boolean);
    const appIds = rows.map(row => id(row.maHoSoUngTuyenGanNhat)).filter(Boolean);
    const jobIds = rows.map(row => id(row.maTinTuyenDungGanNhat)).filter(Boolean);
    const [userMap, apps, jobs] = await Promise.all([
        layNguoiDungMap([...participantIds, ...adminIds, ...senderIds]),
        appIds.length
            ? prisma_js_1.prisma.hoSoUngTuyen.findMany({ where: { id: { in: [...new Set(appIds)] } }, select: { id: true, trangThai: true } })
            : Promise.resolve([]),
        jobIds.length
            ? prisma_js_1.prisma.tinTuyenDung.findMany({ where: { id: { in: [...new Set(jobIds)] } }, select: { id: true, tieuDe: true } })
            : Promise.resolve([]),
    ]);
    const appMap = new Map(apps.map(row => [row.id, (0, prismaHelper_js_1.coId)(row)]));
    const jobMap = new Map(jobs.map(row => [row.id, (0, prismaHelper_js_1.coId)(row)]));
    return rows.map(row => {
        const rowParticipantIds = (0, prismaHelper_js_1.jsonArray)(row.nguoiThamGia).map(id);
        const rowAdminIds = (0, prismaHelper_js_1.jsonArray)(row.quanTriNhom).map(id);
        const senderId = id(row.tinNhanCuoiCung?.nguoiGui);
        return (0, prismaHelper_js_1.coId)({
            ...row,
            nguoiThamGia: rowParticipantIds.map(item => userMap.get(item) ?? item),
            quanTriNhom: rowAdminIds.map(item => userMap.get(item) ?? item),
            tinNhanCuoiCung: row.tinNhanCuoiCung
                ? { ...row.tinNhanCuoiCung, nguoiGui: userMap.get(senderId) ?? row.tinNhanCuoiCung.nguoiGui }
                : row.tinNhanCuoiCung,
            maHoSoUngTuyenGanNhat: appMap.get(id(row.maHoSoUngTuyenGanNhat)) ?? row.maHoSoUngTuyenGanNhat,
            maTinTuyenDungGanNhat: jobMap.get(id(row.maTinTuyenDungGanNhat)) ?? row.maTinTuyenDungGanNhat,
        });
    });
}
async function hydrateMessage(row) {
    if (!row)
        return null;
    const ids = [row.nguoiGui, row.traloiTinNhan].map(id).filter(Boolean);
    const userMap = await layNguoiDungMap(ids);
    const reply = row.traloiTinNhan
        ? await prisma_js_1.prisma.tinNhan.findUnique({ where: { id: row.traloiTinNhan } })
        : null;
    return (0, prismaHelper_js_1.coId)({
        ...row,
        nguoiGui: userMap.get(id(row.nguoiGui)) ?? row.nguoiGui,
        traloiTinNhan: reply ? (0, prismaHelper_js_1.coId)(reply) : row.traloiTinNhan,
    });
}
async function taoTomTatNguCanh(params) {
    if (!params.maHoSoUngTuyen && !params.maTinTuyenDung)
        return undefined;
    const hoSo = params.maHoSoUngTuyen
        ? await prisma_js_1.prisma.hoSoUngTuyen.findUnique({ where: { id: params.maHoSoUngTuyen } })
        : await prisma_js_1.prisma.hoSoUngTuyen.findFirst({ where: { maTinTuyenDung: params.maTinTuyenDung }, orderBy: { ngayCapNhat: 'desc' } });
    const tin = hoSo?.maTinTuyenDung
        ? await prisma_js_1.prisma.tinTuyenDung.findUnique({ where: { id: hoSo.maTinTuyenDung } })
        : params.maTinTuyenDung
            ? await prisma_js_1.prisma.tinTuyenDung.findUnique({ where: { id: params.maTinTuyenDung } })
            : null;
    const congTy = tin?.maNhaTuyenDung ? await prisma_js_1.prisma.nhaTuyenDung.findUnique({ where: { id: tin.maNhaTuyenDung } }) : null;
    return {
        tieuDeTin: tin?.tieuDe,
        tenCongTy: congTy?.tenCongTy,
        maHoSoUngTuyen: params.maHoSoUngTuyen || hoSo?.id,
        maTinTuyenDung: params.maTinTuyenDung || tin?.id,
        capNhatLuc: new Date(),
    };
}
async function capNhatNguCanhCuocTroChuyen(cuocTroChuyenModel, params) {
    if (!params.maHoSoUngTuyen && !params.maTinTuyenDung)
        return cuocTroChuyenModel;
    const summary = await taoTomTatNguCanh(params);
    return prisma_js_1.prisma.cuocTroChuyen.update({
        where: { id: id(cuocTroChuyenModel) },
        data: {
            maHoSoUngTuyen: params.maHoSoUngTuyen || cuocTroChuyenModel.maHoSoUngTuyen,
            maTinTuyenDung: params.maTinTuyenDung || cuocTroChuyenModel.maTinTuyenDung,
            maHoSoUngTuyenGanNhat: params.maHoSoUngTuyen || cuocTroChuyenModel.maHoSoUngTuyenGanNhat,
            maTinTuyenDungGanNhat: params.maTinTuyenDung || cuocTroChuyenModel.maTinTuyenDungGanNhat,
            ...(summary ? { contextSummary: summary } : {}),
        },
    });
}
async function hopNhatCuocTroChuyenTrungLap(cuocChinh, danhSachTrung) {
    const soChuaDocChinh = (0, prismaHelper_js_1.jsonObject)(cuocChinh.soChuaDoc);
    for (const cuocTrung of danhSachTrung) {
        await prisma_js_1.prisma.tinNhan.updateMany({ where: { maCuocTroChuyenId: cuocTrung.id }, data: { maCuocTroChuyenId: cuocChinh.id } });
        const unreadTrung = (0, prismaHelper_js_1.jsonObject)(cuocTrung.soChuaDoc);
        for (const nguoi of (0, prismaHelper_js_1.jsonArray)(cuocChinh.nguoiThamGia)) {
            const maNguoi = id(nguoi);
            soChuaDocChinh[maNguoi] = Number(soChuaDocChinh[maNguoi] || 0) + Number(unreadTrung[maNguoi] || 0);
        }
        const t1 = cuocTrung.tinNhanCuoiCung?.thoiGian ? new Date(cuocTrung.tinNhanCuoiCung.thoiGian).getTime() : 0;
        const t2 = cuocChinh.tinNhanCuoiCung?.thoiGian ? new Date(cuocChinh.tinNhanCuoiCung.thoiGian).getTime() : 0;
        if (t1 > t2)
            cuocChinh.tinNhanCuoiCung = cuocTrung.tinNhanCuoiCung;
        await prisma_js_1.prisma.cuocTroChuyen.update({ where: { id: cuocTrung.id }, data: { daLuuTru: true, thoiGianLuuTru: new Date() } });
    }
    await prisma_js_1.prisma.cuocTroChuyen.update({ where: { id: cuocChinh.id }, data: { soChuaDoc: soChuaDocChinh, tinNhanCuoiCung: cuocChinh.tinNhanCuoiCung } });
}
async function layHoacTaoCuocTroChuyenModel(params) {
    const nguoiThamGiaSorted = [...params.nguoiThamGia].map(id).sort();
    const loai = params.loai || 'ung_vien_nha_tuyen_dung';
    const danhSach = await prisma_js_1.prisma.cuocTroChuyen.findMany({
        where: { loai, daLuuTru: false, nguoiThamGia: { array_contains: nguoiThamGiaSorted } },
        orderBy: [{ ngayCapNhat: 'desc' }, { ngayTao: 'desc' }],
        take: 20,
    });
    const danhSachTrung = danhSach.filter(item => {
        const list = (0, prismaHelper_js_1.jsonArray)(item.nguoiThamGia).map(id).sort();
        return list.length === nguoiThamGiaSorted.length && list.every((value, index) => value === nguoiThamGiaSorted[index]);
    });
    let cuocTroChuyenModel = danhSachTrung[0] || null;
    if (cuocTroChuyenModel && danhSachTrung.length > 1)
        await hopNhatCuocTroChuyenTrungLap(cuocTroChuyenModel, danhSachTrung.slice(1));
    if (!cuocTroChuyenModel) {
        cuocTroChuyenModel = await prisma_js_1.prisma.cuocTroChuyen.create({
            data: {
                nguoiThamGia: nguoiThamGiaSorted,
                loai,
                maHoSoUngTuyen: params.maHoSoUngTuyen,
                maTinTuyenDung: params.maTinTuyenDung,
                maHoSoUngTuyenGanNhat: params.maHoSoUngTuyen,
                maTinTuyenDungGanNhat: params.maTinTuyenDung,
                soChuaDoc: Object.fromEntries(nguoiThamGiaSorted.map(value => [value, 0])),
            },
        });
    }
    cuocTroChuyenModel = await capNhatNguCanhCuocTroChuyen(cuocTroChuyenModel, params);
    return hydrateConversation(cuocTroChuyenModel);
}
async function hopNhatCuocTroChuyenCuaNguoiDung(maNguoiDung) {
    const danhSach = await prisma_js_1.prisma.cuocTroChuyen.findMany({
        where: { daLuuTru: false, loai: { not: 'nhom_cong_dong' }, nguoiThamGia: { array_contains: [maNguoiDung] } },
        orderBy: [{ ngayCapNhat: 'desc' }, { ngayTao: 'desc' }],
        take: 200,
    });
    const groups = new Map();
    for (const item of danhSach) {
        const participants = (0, prismaHelper_js_1.jsonArray)(item.nguoiThamGia).map(id).sort().join('|');
        const key = `${item.loai || 'ung_vien_nha_tuyen_dung'}:${participants}`;
        groups.set(key, [...(groups.get(key) || []), item]);
    }
    for (const items of groups.values())
        if (items.length > 1)
            await hopNhatCuocTroChuyenTrungLap(items[0], items.slice(1));
}
const damBaoHoTroGanNhat = new Map();
const hopNhatGanNhat = new Map();
const BAO_TRI_CHAT_TTL_MS = Number(process.env.CHAT_MAINTENANCE_TTL_MS ?? 5 * 60 * 1000);
async function timAdminDauTien() {
    return prisma_js_1.prisma.nguoiDung.findFirst({ where: { vaiTro: 'admin', trangThai: { not: 'bi_khoa' } }, select: { id: true } });
}
async function congTyDaDuyet(maNguoiDung) {
    const congTy = await prisma_js_1.prisma.nhaTuyenDung.findUnique({ where: { maNguoiDung }, select: { trangThaiDuyet: true } });
    return Boolean(congTy && congTy.trangThaiDuyet === 'da_duyet');
}
async function damBaoCuocTroChuyenHoTroQuanTri(maNguoiDung, vaiTro) {
    const cacheKey = `${maNguoiDung}:${vaiTro}`;
    const lanGanNhat = damBaoHoTroGanNhat.get(cacheKey) ?? 0;
    if (Date.now() - lanGanNhat < BAO_TRI_CHAT_TTL_MS)
        return;
    damBaoHoTroGanNhat.set(cacheKey, Date.now());
    if (vaiTro === 'admin') {
        const congTyList = await prisma_js_1.prisma.nhaTuyenDung.findMany({ where: { trangThaiDuyet: 'da_duyet' }, select: { maNguoiDung: true }, take: 500 });
        await Promise.all(congTyList.map(congTy => layHoacTaoCuocTroChuyenModel({ nguoiThamGia: [maNguoiDung, congTy.maNguoiDung], loai: 'admin_support' })));
    }
    if (vaiTro === 'nha_tuyen_dung') {
        if (!await congTyDaDuyet(maNguoiDung))
            return;
        const admin = await timAdminDauTien();
        if (admin)
            await layHoacTaoCuocTroChuyenModel({ nguoiThamGia: [maNguoiDung, admin.id], loai: 'admin_support' });
    }
}
async function layDanhSachNhomCongDong() {
    const danhSach = await prisma_js_1.prisma.cuocTroChuyen.findMany({ where: { loai: 'nhom_cong_dong', daLuuTru: false }, orderBy: { ngayCapNhat: 'desc' } });
    return Promise.all(danhSach.map(async (doc) => {
        const obj = await hydrateConversation(doc);
        return { ...obj, id: String(obj._id), soThanhVien: obj.nguoiThamGia?.length || 0 };
    }));
}
async function thamGiaNhomCongDong(maNhom, maNguoiDung) {
    const nhom = await prisma_js_1.prisma.cuocTroChuyen.findUnique({ where: { id: maNhom } });
    if (!nhom)
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy nhóm', 404);
    if (nhom.loai !== 'nhom_cong_dong')
        throw new loiungdung_js_1.LoiUngDung('Đây không phải nhóm cộng đồng', 400);
    const nguoiThamGia = (0, prismaHelper_js_1.jsonArray)(nhom.nguoiThamGia).map(id);
    const soChuaDoc = (0, prismaHelper_js_1.jsonObject)(nhom.soChuaDoc);
    if (!nguoiThamGia.includes(maNguoiDung)) {
        nguoiThamGia.push(maNguoiDung);
        soChuaDoc[maNguoiDung] = 0;
        await prisma_js_1.prisma.cuocTroChuyen.update({ where: { id: maNhom }, data: { nguoiThamGia, soChuaDoc } });
        await prisma_js_1.prisma.tinNhan.create({ data: { maCuocTroChuyenId: maNhom, nguoiGui: maNguoiDung, noiDung: 'đã tham gia nhóm', loai: 'system' } });
    }
    return hydrateConversation(await prisma_js_1.prisma.cuocTroChuyen.findUnique({ where: { id: maNhom } }));
}
async function layDanhSachCuocTroChuyenModel(maNguoiDung) {
    const lanGanNhat = hopNhatGanNhat.get(maNguoiDung) ?? 0;
    if (Date.now() - lanGanNhat >= BAO_TRI_CHAT_TTL_MS) {
        hopNhatGanNhat.set(maNguoiDung, Date.now());
        await hopNhatCuocTroChuyenCuaNguoiDung(maNguoiDung);
    }
    const danhSach = await prisma_js_1.prisma.cuocTroChuyen.findMany({
        where: { daLuuTru: false, nguoiThamGia: { array_contains: [maNguoiDung] } },
        orderBy: { ngayCapNhat: 'desc' },
        take: 50,
    });
    const hydrated = await hydrateConversations(danhSach);
    return hydrated.map(doc => {
        const obj = doc;
        return { ...obj, id: String(obj._id), soChuaDocCuaToi: Number((0, prismaHelper_js_1.jsonObject)(obj.soChuaDoc)[maNguoiDung] || 0) };
    });
}
async function layCuocTroChuyenModelTheoMa(maCuocTroChuyenModel, maNguoiDung) {
    const cuocTroChuyenModel = await prisma_js_1.prisma.cuocTroChuyen.findUnique({ where: { id: maCuocTroChuyenModel } });
    if (!cuocTroChuyenModel)
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy cuộc trò chuyện', 404);
    const coQuyen = (0, prismaHelper_js_1.jsonArray)(cuocTroChuyenModel.nguoiThamGia).some(ng => id(ng) === maNguoiDung);
    if (!coQuyen)
        throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền truy cập cuộc trò chuyện này', 403);
    return hydrateConversation(cuocTroChuyenModel);
}
async function danhDauDaDocCuocTroChuyenModel(maCuocTroChuyenModel, maNguoiDung) {
    const cuocTroChuyenModel = await prisma_js_1.prisma.cuocTroChuyen.findUnique({ where: { id: maCuocTroChuyenModel } });
    if (!cuocTroChuyenModel)
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy cuộc trò chuyện', 404);
    const soChuaDoc = (0, prismaHelper_js_1.jsonObject)(cuocTroChuyenModel.soChuaDoc);
    soChuaDoc[maNguoiDung] = 0;
    await prisma_js_1.prisma.cuocTroChuyen.update({ where: { id: maCuocTroChuyenModel }, data: { soChuaDoc } });
    const tinNhanCanDoc = await prisma_js_1.prisma.tinNhan.findMany({ where: { maCuocTroChuyenId: maCuocTroChuyenModel, nguoiGui: { not: maNguoiDung }, daXoa: false }, take: 500 });
    await Promise.all(tinNhanCanDoc.map(msg => {
        const daDuocDocBoi = (0, prismaHelper_js_1.jsonArray)(msg.daDuocDocBoi);
        if (daDuocDocBoi.some(item => id(item?.nguoiDung) === maNguoiDung))
            return Promise.resolve();
        return prisma_js_1.prisma.tinNhan.update({ where: { id: msg.id }, data: { daDuocDocBoi: [...daDuocDocBoi, { nguoiDung: maNguoiDung, thoiGian: new Date() }] } });
    }));
    return hydrateConversation(await prisma_js_1.prisma.cuocTroChuyen.findUnique({ where: { id: maCuocTroChuyenModel } }));
}
async function guiTinNhan(params) {
    const cuocTroChuyenModel = await layCuocTroChuyenModelTheoMa(params.maCuocTroChuyenId, params.nguoiGui);
    const tinNhan = await prisma_js_1.prisma.tinNhan.create({
        data: { maCuocTroChuyenId: params.maCuocTroChuyenId, nguoiGui: params.nguoiGui, noiDung: params.noiDung, loai: params.loai || 'text', tepDinhKem: params.tepDinhKem || [], traloiTinNhan: params.traloiTinNhan },
    });
    const participantIds = (0, prismaHelper_js_1.jsonArray)(cuocTroChuyenModel.nguoiThamGia).map(id);
    const soChuaDoc = (0, prismaHelper_js_1.jsonObject)(cuocTroChuyenModel.soChuaDoc);
    for (const participantId of participantIds)
        if (participantId !== params.nguoiGui)
            soChuaDoc[participantId] = Number(soChuaDoc[participantId] || 0) + 1;
    await prisma_js_1.prisma.cuocTroChuyen.update({
        where: { id: params.maCuocTroChuyenId },
        data: { tinNhanCuoiCung: { noiDung: params.noiDung, nguoiGui: params.nguoiGui, thoiGian: new Date() }, soChuaDoc },
    });
    const tinNhanObj = await hydrateMessage(tinNhan);
    for (const participant of (0, prismaHelper_js_1.jsonArray)(cuocTroChuyenModel.nguoiThamGia)) {
        const participantId = id(participant);
        if (participantId === params.nguoiGui)
            continue;
        (0, socket_js_1.guiThongBaoChoNguoiDung)(participantId, 'tin_nhan_moi', { maCuocTroChuyenId: params.maCuocTroChuyenId, tinNhan: { ...tinNhanObj, id: String(tinNhanObj._id) } });
        const vaiTroNhan = participant?.vaiTro;
        const duongDanChat = vaiTroNhan === 'admin' ? '/quan-tri/chat' : vaiTroNhan === 'ung_vien' ? '/ung-vien/chat' : '/nha-tuyen-dung/chat';
        await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({ maNguoiDung: participantId, loai: 'tin_nhan', tieuDe: `Tin nhắn mới từ ${tinNhanObj.nguoiGui?.hoTen ?? 'Người dùng'}`, noiDung: params.noiDung.substring(0, 100), lienKet: `${duongDanChat}?cuocTroChuyen=${params.maCuocTroChuyenId}`, mucDoUuTien: 'trung_binh', icon: '💬', mauSac: '#8b5cf6' });
    }
    return { ...tinNhanObj, id: String(tinNhanObj._id) };
}
async function layDanhSachTinNhan(params) {
    await layCuocTroChuyenModelTheoMa(params.maCuocTroChuyenId, params.maNguoiDung);
    const before = params.truocTinNhan ? await prisma_js_1.prisma.tinNhan.findUnique({ where: { id: params.truocTinNhan } }) : null;
    const danhSach = await prisma_js_1.prisma.tinNhan.findMany({
        where: { maCuocTroChuyenId: params.maCuocTroChuyenId, daXoa: false, ...(before ? { ngayTao: { lt: before.ngayTao } } : {}) },
        orderBy: { ngayTao: 'desc' },
        take: params.limit || 50,
    });
    const hydrated = await Promise.all(danhSach.reverse().map(hydrateMessage));
    return hydrated.map((doc) => ({ ...doc, id: String(doc._id), daToi: (0, prismaHelper_js_1.jsonArray)(doc.daDuocDocBoi).some((d) => id(d.nguoiDung) === params.maNguoiDung) }));
}
async function xoaTinNhan(maTinNhan, maNguoiDung) {
    const tinNhan = await prisma_js_1.prisma.tinNhan.findUnique({ where: { id: maTinNhan } });
    if (!tinNhan)
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy tin nhắn', 404);
    if (String(tinNhan.nguoiGui) !== maNguoiDung)
        throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền xóa tin nhắn này', 403);
    const daXoa = await prisma_js_1.prisma.tinNhan.update({ where: { id: maTinNhan }, data: { daXoa: true, noiDung: 'Tin nhắn đã bị xóa' } });
    const cuocTroChuyenModel = await prisma_js_1.prisma.cuocTroChuyen.findUnique({ where: { id: tinNhan.maCuocTroChuyenId } });
    if (cuocTroChuyenModel)
        for (const nguoiThamGia of (0, prismaHelper_js_1.jsonArray)(cuocTroChuyenModel.nguoiThamGia))
            (0, socket_js_1.guiThongBaoChoNguoiDung)(id(nguoiThamGia), 'tin_nhan_da_xoa', { maCuocTroChuyenId: tinNhan.maCuocTroChuyenId, maTinNhan });
    return (0, prismaHelper_js_1.coId)(daXoa);
}
async function themPhanUng(params) {
    const tinNhan = await prisma_js_1.prisma.tinNhan.findUnique({ where: { id: params.maTinNhan } });
    if (!tinNhan)
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy tin nhắn', 404);
    const phanUng = (0, prismaHelper_js_1.jsonArray)(tinNhan.phanUng).filter((r) => id(r.nguoiDung) !== params.maNguoiDung);
    phanUng.push({ nguoiDung: params.maNguoiDung, emoji: params.emoji });
    const updated = await prisma_js_1.prisma.tinNhan.update({ where: { id: params.maTinNhan }, data: { phanUng } });
    const cuocTroChuyenModel = await prisma_js_1.prisma.cuocTroChuyen.findUnique({ where: { id: tinNhan.maCuocTroChuyenId } });
    if (cuocTroChuyenModel)
        for (const nguoiThamGia of (0, prismaHelper_js_1.jsonArray)(cuocTroChuyenModel.nguoiThamGia))
            (0, socket_js_1.guiThongBaoChoNguoiDung)(id(nguoiThamGia), 'phan_ung_moi', { maCuocTroChuyenId: tinNhan.maCuocTroChuyenId, maTinNhan: params.maTinNhan, nguoiDung: params.maNguoiDung, emoji: params.emoji });
    return (0, prismaHelper_js_1.coId)(updated);
}
