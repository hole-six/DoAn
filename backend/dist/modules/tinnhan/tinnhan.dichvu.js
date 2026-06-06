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
const tinnhan_mohinh_js_1 = require("./tinnhan.mohinh.js");
const thongbao_dichvu_js_1 = require("../thongbao/thongbao.dichvu.js");
const nguoidung_mohinh_js_1 = require("../nguoidung/nguoidung.mohinh.js");
const nhatuyendung_mohinh_js_1 = require("../nhatuyendung/nhatuyendung.mohinh.js");
const hosoungtuyen_mohinh_js_1 = require("../hosoungtuyen/hosoungtuyen.mohinh.js");
// ============================================
// CONVERSATION SERVICES
// ============================================
/**
 * Lấy hoặc tạo cuộc trò chuyện giữa 2 người
 */
async function layHoacTaoCuocTroChuyenModel(params) {
    const nguoiThamGiaSorted = [...params.nguoiThamGia].sort();
    const loai = params.loai || 'ung_vien_nha_tuyen_dung';
    const dieuKienTimKiem = {
        nguoiThamGia: { $all: nguoiThamGiaSorted, $size: nguoiThamGiaSorted.length },
        daLuuTru: false,
        loai,
    };
    const danhSachTrung = await tinnhan_mohinh_js_1.CuocTroChuyenModel.find(dieuKienTimKiem).sort({ ngayCapNhat: -1, ngayTao: -1 });
    let cuocTroChuyenModel = danhSachTrung[0] || null;
    if (cuocTroChuyenModel && danhSachTrung.length > 1) {
        await hopNhatCuocTroChuyenTrungLap(cuocTroChuyenModel, danhSachTrung.slice(1));
    }
    if (!cuocTroChuyenModel) {
        cuocTroChuyenModel = await tinnhan_mohinh_js_1.CuocTroChuyenModel.create({
            nguoiThamGia: nguoiThamGiaSorted,
            loai,
            maHoSoUngTuyen: params.maHoSoUngTuyen,
            maTinTuyenDung: params.maTinTuyenDung,
            maHoSoUngTuyenGanNhat: params.maHoSoUngTuyen,
            maTinTuyenDungGanNhat: params.maTinTuyenDung,
            soChuaDoc: Object.fromEntries(nguoiThamGiaSorted.map((id) => [id, 0])),
        });
    }
    await capNhatNguCanhCuocTroChuyen(cuocTroChuyenModel, params);
    await cuocTroChuyenModel.populate('nguoiThamGia', 'hoTen email vaiTro');
    return cuocTroChuyenModel;
}
async function taoTomTatNguCanh(params) {
    if (!params.maHoSoUngTuyen && !params.maTinTuyenDung)
        return undefined;
    const hoSo = params.maHoSoUngTuyen
        ? await hosoungtuyen_mohinh_js_1.HoSoUngTuyen
            .findById(params.maHoSoUngTuyen)
            .populate({ path: 'maTinTuyenDung', select: 'tieuDe maNhaTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy' } })
        : await hosoungtuyen_mohinh_js_1.HoSoUngTuyen
            .findOne({ maTinTuyenDung: params.maTinTuyenDung })
            .sort({ ngayCapNhat: -1 })
            .populate({ path: 'maTinTuyenDung', select: 'tieuDe maNhaTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy' } });
    const tin = hoSo?.maTinTuyenDung;
    return {
        tieuDeTin: tin?.tieuDe,
        tenCongTy: tin?.maNhaTuyenDung?.tenCongTy,
        maHoSoUngTuyen: params.maHoSoUngTuyen || (hoSo?._id ? String(hoSo._id) : undefined),
        maTinTuyenDung: params.maTinTuyenDung || (tin?._id ? String(tin._id) : undefined),
        capNhatLuc: new Date(),
    };
}
async function capNhatNguCanhCuocTroChuyen(cuocTroChuyenModel, params) {
    if (!params.maHoSoUngTuyen && !params.maTinTuyenDung)
        return;
    const summary = await taoTomTatNguCanh(params);
    cuocTroChuyenModel.maHoSoUngTuyen = params.maHoSoUngTuyen || cuocTroChuyenModel.maHoSoUngTuyen;
    cuocTroChuyenModel.maTinTuyenDung = params.maTinTuyenDung || cuocTroChuyenModel.maTinTuyenDung;
    cuocTroChuyenModel.maHoSoUngTuyenGanNhat = params.maHoSoUngTuyen || cuocTroChuyenModel.maHoSoUngTuyenGanNhat;
    cuocTroChuyenModel.maTinTuyenDungGanNhat = params.maTinTuyenDung || cuocTroChuyenModel.maTinTuyenDungGanNhat;
    if (summary)
        cuocTroChuyenModel.contextSummary = summary;
    await cuocTroChuyenModel.save();
}
async function hopNhatCuocTroChuyenTrungLap(cuocChinh, danhSachTrung) {
    for (const cuocTrung of danhSachTrung) {
        await tinnhan_mohinh_js_1.TinNhanModel.updateMany({ maCuocTroChuyenId: cuocTrung._id }, { $set: { maCuocTroChuyenId: cuocChinh._id } });
        for (const nguoi of cuocChinh.nguoiThamGia) {
            const maNguoi = String(nguoi);
            const hienTai = Number(cuocChinh.soChuaDoc?.get(maNguoi) || 0);
            const boSung = Number(cuocTrung.soChuaDoc?.get(maNguoi) || 0);
            cuocChinh.soChuaDoc.set(maNguoi, hienTai + boSung);
        }
        const thoiGianCuoiCungTrung = cuocTrung.tinNhanCuoiCung?.thoiGian ? new Date(cuocTrung.tinNhanCuoiCung.thoiGian).getTime() : 0;
        const thoiGianCuoiCungChinh = cuocChinh.tinNhanCuoiCung?.thoiGian ? new Date(cuocChinh.tinNhanCuoiCung.thoiGian).getTime() : 0;
        if (thoiGianCuoiCungTrung > thoiGianCuoiCungChinh) {
            cuocChinh.tinNhanCuoiCung = cuocTrung.tinNhanCuoiCung;
        }
        cuocTrung.daLuuTru = true;
        cuocTrung.thoiGianLuuTru = new Date();
        await cuocTrung.save();
    }
    await cuocChinh.save();
}
async function hopNhatCuocTroChuyenCuaNguoiDung(maNguoiDung) {
    const danhSach = await tinnhan_mohinh_js_1.CuocTroChuyenModel.find({
        nguoiThamGia: maNguoiDung,
        daLuuTru: false,
        loai: { $ne: 'nhom_cong_dong' },
    }).sort({ ngayCapNhat: -1, ngayTao: -1 });
    const groups = new Map();
    for (const item of danhSach) {
        const participants = [...(item.nguoiThamGia || [])].map((value) => String(value)).sort().join('|');
        const key = `${item.loai || 'ung_vien_nha_tuyen_dung'}:${participants}`;
        groups.set(key, [...(groups.get(key) || []), item]);
    }
    for (const items of groups.values()) {
        if (items.length > 1) {
            await hopNhatCuocTroChuyenTrungLap(items[0], items.slice(1));
        }
    }
}
async function timAdminDauTien() {
    return nguoidung_mohinh_js_1.NguoiDung.findOne({ vaiTro: 'admin', trangThai: { $ne: 'bi_khoa' } }).select('_id');
}
async function congTyDaDuyet(maNguoiDung) {
    const congTy = await nhatuyendung_mohinh_js_1.NhaTuyenDung.findOne({ maNguoiDung }).select('_id trangThaiDuyet');
    return Boolean(congTy && congTy.trangThaiDuyet === 'da_duyet');
}
async function damBaoCuocTroChuyenHoTroQuanTri(maNguoiDung, vaiTro) {
    if (vaiTro === 'admin') {
        const congTyList = await nhatuyendung_mohinh_js_1.NhaTuyenDung
            .find({ trangThaiDuyet: 'da_duyet' })
            .select('maNguoiDung')
            .limit(500);
        await Promise.all(congTyList.map((congTy) => layHoacTaoCuocTroChuyenModel({
            nguoiThamGia: [maNguoiDung, String(congTy.maNguoiDung)],
            loai: 'admin_support',
        })));
    }
    if (vaiTro === 'nha_tuyen_dung') {
        if (!await congTyDaDuyet(maNguoiDung))
            return;
        const admin = await timAdminDauTien();
        if (admin) {
            await layHoacTaoCuocTroChuyenModel({
                nguoiThamGia: [maNguoiDung, String(admin._id)],
                loai: 'admin_support',
            });
        }
    }
}
async function layDanhSachNhomCongDong() {
    const danhSach = await tinnhan_mohinh_js_1.CuocTroChuyenModel.find({
        loai: 'nhom_cong_dong',
        daLuuTru: false,
    })
        .populate('nguoiThamGia', 'hoTen email vaiTro')
        .populate('quanTriNhom', 'hoTen email')
        .sort({ ngayCapNhat: -1 });
    return danhSach.map((doc) => {
        const obj = doc.toObject();
        return {
            ...obj,
            id: String(obj._id),
            soThanhVien: obj.nguoiThamGia?.length || 0,
        };
    });
}
async function thamGiaNhomCongDong(maNhom, maNguoiDung) {
    const nhom = await tinnhan_mohinh_js_1.CuocTroChuyenModel.findById(maNhom);
    if (!nhom)
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy nhóm', 404);
    if (nhom.loai !== 'nhom_cong_dong')
        throw new loiungdung_js_1.LoiUngDung('Đây không phải nhóm cộng đồng', 400);
    const daCoMat = nhom.nguoiThamGia.some((id) => String(id) === maNguoiDung);
    if (!daCoMat) {
        nhom.nguoiThamGia.push(maNguoiDung);
        nhom.soChuaDoc.set(maNguoiDung, 0);
        await nhom.save();
        await tinnhan_mohinh_js_1.TinNhanModel.create({
            maCuocTroChuyenId: maNhom,
            nguoiGui: maNguoiDung,
            noiDung: 'đã tham gia nhóm',
            loai: 'system',
        });
    }
    return nhom;
}
/**
 * Lấy danh sách cuộc trò chuyện của user
 */
async function layDanhSachCuocTroChuyenModel(maNguoiDung) {
    await hopNhatCuocTroChuyenCuaNguoiDung(maNguoiDung);
    const danhSach = await tinnhan_mohinh_js_1.CuocTroChuyenModel.find({
        nguoiThamGia: maNguoiDung,
        daLuuTru: false,
    })
        .populate('nguoiThamGia', 'hoTen email vaiTro')
        .populate('tinNhanCuoiCung.nguoiGui', 'hoTen')
        .populate('maHoSoUngTuyenGanNhat', 'trangThai')
        .populate('maTinTuyenDungGanNhat', 'tieuDe')
        .sort({ ngayCapNhat: -1 })
        .limit(50);
    return danhSach.map((doc) => {
        const obj = doc.toObject();
        return {
            ...obj,
            id: String(obj._id),
            soChuaDocCuaToi: obj.soChuaDoc?.get(maNguoiDung) || 0,
        };
    });
}
/**
 * Lấy chi tiết cuộc trò chuyện
 */
async function layCuocTroChuyenModelTheoMa(maCuocTroChuyenModel, maNguoiDung) {
    const cuocTroChuyenModel = await tinnhan_mohinh_js_1.CuocTroChuyenModel.findById(maCuocTroChuyenModel).populate('nguoiThamGia', 'hoTen email vaiTro');
    if (!cuocTroChuyenModel) {
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy cuộc trò chuyện', 404);
    }
    // Kiểm tra quyền truy cập
    const coQuyen = cuocTroChuyenModel.nguoiThamGia.some((ng) => String(ng._id) === maNguoiDung);
    if (!coQuyen) {
        throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền truy cập cuộc trò chuyện này', 403);
    }
    return cuocTroChuyenModel;
}
/**
 * Đánh dấu đã đọc tất cả tin nhắn trong cuộc trò chuyện
 */
async function danhDauDaDocCuocTroChuyenModel(maCuocTroChuyenModel, maNguoiDung) {
    const cuocTroChuyenModel = await tinnhan_mohinh_js_1.CuocTroChuyenModel.findById(maCuocTroChuyenModel);
    if (!cuocTroChuyenModel) {
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy cuộc trò chuyện', 404);
    }
    // Reset số chưa đọc
    cuocTroChuyenModel.soChuaDoc.set(maNguoiDung, 0);
    await cuocTroChuyenModel.save();
    // Đánh dấu tất cả tin nhắn chưa đọc
    await tinnhan_mohinh_js_1.TinNhanModel.updateMany({
        maCuocTroChuyenId: maCuocTroChuyenModel,
        nguoiGui: { $ne: maNguoiDung },
        'daDuocDocBoi.nguoiDung': { $ne: maNguoiDung },
    }, {
        $push: {
            daDuocDocBoi: {
                nguoiDung: maNguoiDung,
                thoiGian: new Date(),
            },
        },
    });
    return cuocTroChuyenModel;
}
// ============================================
// MESSAGE SERVICES
// ============================================
/**
 * Gửi tin nhắn
 */
async function guiTinNhan(params) {
    // Kiểm tra quyền
    const cuocTroChuyenModel = await layCuocTroChuyenModelTheoMa(params.maCuocTroChuyenId, params.nguoiGui);
    // Tạo tin nhắn
    const tinNhan = await tinnhan_mohinh_js_1.TinNhanModel.create({
        maCuocTroChuyenId: params.maCuocTroChuyenId,
        nguoiGui: params.nguoiGui,
        noiDung: params.noiDung,
        loai: params.loai || 'text',
        tepDinhKem: params.tepDinhKem || [],
        traloiTinNhan: params.traloiTinNhan,
    });
    // Populate để trả về đầy đủ thông tin
    await tinNhan.populate('nguoiGui', 'hoTen email vaiTro');
    if (params.traloiTinNhan) {
        await tinNhan.populate('traloiTinNhan');
    }
    // Cập nhật cuộc trò chuyện
    cuocTroChuyenModel.tinNhanCuoiCung = {
        noiDung: params.noiDung,
        nguoiGui: params.nguoiGui,
        thoiGian: new Date(),
    };
    // Tăng số chưa đọc cho người khác
    for (const nguoiThamGia of cuocTroChuyenModel.nguoiThamGia) {
        const id = String(nguoiThamGia._id);
        if (id !== params.nguoiGui) {
            const current = cuocTroChuyenModel.soChuaDoc.get(id) || 0;
            cuocTroChuyenModel.soChuaDoc.set(id, current + 1);
        }
    }
    await cuocTroChuyenModel.save();
    // Gửi real-time qua Socket.IO cho người nhận
    const tinNhanObj = tinNhan.toObject();
    for (const nguoiThamGia of cuocTroChuyenModel.nguoiThamGia) {
        const id = String(nguoiThamGia._id);
        if (id !== params.nguoiGui) {
            (0, socket_js_1.guiThongBaoChoNguoiDung)(id, 'tin_nhan_moi', {
                maCuocTroChuyenId: params.maCuocTroChuyenId,
                tinNhan: {
                    ...tinNhanObj,
                    id: String(tinNhanObj._id),
                },
            });
            // Gửi notification nếu user offline
            const vaiTroNhan = nguoiThamGia.vaiTro;
            const duongDanChat = vaiTroNhan === 'admin'
                ? '/quan-tri/chat'
                : vaiTroNhan === 'ung_vien'
                    ? '/ung-vien/chat'
                    : '/nha-tuyen-dung/chat';
            await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
                maNguoiDung: id,
                loai: 'tin_nhan',
                tieuDe: `Tin nhắn mới từ ${tinNhan.nguoiGui.hoTen}`,
                noiDung: params.noiDung.substring(0, 100),
                lienKet: `${duongDanChat}?cuocTroChuyen=${params.maCuocTroChuyenId}`,
                mucDoUuTien: 'trung_binh',
                icon: '💬',
                mauSac: '#8b5cf6',
            });
        }
    }
    return {
        ...tinNhanObj,
        id: String(tinNhanObj._id),
    };
}
/**
 * Lấy danh sách tin nhắn trong cuộc trò chuyện
 */
async function layDanhSachTinNhan(params) {
    // Kiểm tra quyền
    await layCuocTroChuyenModelTheoMa(params.maCuocTroChuyenId, params.maNguoiDung);
    const query = {
        maCuocTroChuyenId: params.maCuocTroChuyenId,
        daXoa: false,
    };
    // Pagination
    if (params.truocTinNhan) {
        const tinNhanTruoc = await tinnhan_mohinh_js_1.TinNhanModel.findById(params.truocTinNhan);
        if (tinNhanTruoc) {
            query.ngayTao = { $lt: tinNhanTruoc.ngayTao };
        }
    }
    const danhSach = await tinnhan_mohinh_js_1.TinNhanModel.find(query)
        .populate('nguoiGui', 'hoTen email vaiTro')
        .populate('traloiTinNhan')
        .sort({ ngayTao: -1 })
        .limit(params.limit || 50);
    return danhSach.reverse().map((doc) => {
        const obj = doc.toObject();
        return {
            ...obj,
            id: String(obj._id),
            daToi: obj.daDuocDocBoi?.some((d) => String(d.nguoiDung) === params.maNguoiDung),
        };
    });
}
/**
 * Xóa tin nhắn
 */
async function xoaTinNhan(maTinNhan, maNguoiDung) {
    const tinNhan = await tinnhan_mohinh_js_1.TinNhanModel.findById(maTinNhan);
    if (!tinNhan) {
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy tin nhắn', 404);
    }
    // Chỉ người gửi mới được xóa
    if (String(tinNhan.nguoiGui) !== maNguoiDung) {
        throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền xóa tin nhắn này', 403);
    }
    tinNhan.daXoa = true;
    tinNhan.noiDung = 'Tin nhắn đã bị xóa';
    await tinNhan.save();
    // Gửi real-time
    const cuocTroChuyenModel = await tinnhan_mohinh_js_1.CuocTroChuyenModel.findById(tinNhan.maCuocTroChuyenId);
    if (cuocTroChuyenModel) {
        for (const nguoiThamGia of cuocTroChuyenModel.nguoiThamGia) {
            (0, socket_js_1.guiThongBaoChoNguoiDung)(String(nguoiThamGia), 'tin_nhan_da_xoa', {
                maCuocTroChuyenId: String(tinNhan.maCuocTroChuyenId),
                maTinNhan,
            });
        }
    }
    return tinNhan;
}
/**
 * Thêm reaction vào tin nhắn
 */
async function themPhanUng(params) {
    const tinNhan = await tinnhan_mohinh_js_1.TinNhanModel.findById(params.maTinNhan);
    if (!tinNhan) {
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy tin nhắn', 404);
    }
    // Xóa reaction cũ của user này (nếu có)
    tinNhan.phanUng = tinNhan.phanUng.filter((r) => String(r.nguoiDung) !== params.maNguoiDung);
    // Thêm reaction mới
    tinNhan.phanUng.push({
        nguoiDung: params.maNguoiDung,
        emoji: params.emoji,
    });
    await tinNhan.save();
    // Gửi real-time
    const cuocTroChuyenModel = await tinnhan_mohinh_js_1.CuocTroChuyenModel.findById(tinNhan.maCuocTroChuyenId);
    if (cuocTroChuyenModel) {
        for (const nguoiThamGia of cuocTroChuyenModel.nguoiThamGia) {
            (0, socket_js_1.guiThongBaoChoNguoiDung)(String(nguoiThamGia), 'phan_ung_moi', {
                maCuocTroChuyenId: String(tinNhan.maCuocTroChuyenId),
                maTinNhan: params.maTinNhan,
                nguoiDung: params.maNguoiDung,
                emoji: params.emoji,
            });
        }
    }
    return tinNhan;
}
