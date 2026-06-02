"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuPortfolio = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const hosonangluc_mohinh_js_1 = require("../hosonangluc/hosonangluc.mohinh.js");
const ungvien_mohinh_js_1 = require("../ungvien/ungvien.mohinh.js");
const xacthuc_dichvu_js_1 = require("../xacthuc/xacthuc.dichvu.js");
const portfolio_mohinh_js_1 = require("./portfolio.mohinh.js");
const fontChoPhep = {
    Inter: 'Inter, Arial, sans-serif',
    System: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    Georgia: 'Georgia, "Times New Roman", serif',
    Mono: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
};
function escapeHtml(giaTri) {
    return String(giaTri ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function safeColor(giaTri, macDinh) {
    const mau = String(giaTri ?? '').trim();
    return /^#[0-9a-fA-F]{6}$/.test(mau) ? mau : macDinh;
}
function safeUrl(giaTri) {
    const url = giaTri.trim();
    if (/^(https?:|mailto:|#)/i.test(url))
        return escapeHtml(url);
    return '#';
}
function inlineMarkdown(dong) {
    let html = escapeHtml(dong);
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`);
    return html;
}
function markdownThanhHtml(markdown) {
    const dong = String(markdown ?? '').replace(/\r\n/g, '\n').split('\n');
    const html = [];
    let dangList = false;
    const dongList = (noiDung) => {
        if (!dangList) {
            html.push('<ul>');
            dangList = true;
        }
        html.push(`<li>${inlineMarkdown(noiDung)}</li>`);
    };
    const dongBinhThuong = () => {
        if (dangList) {
            html.push('</ul>');
            dangList = false;
        }
    };
    for (const raw of dong) {
        const line = raw.trim();
        if (!line) {
            dongBinhThuong();
            continue;
        }
        const heading = line.match(/^(#{1,3})\s+(.+)$/);
        if (heading) {
            dongBinhThuong();
            const cap = heading[1].length + 1;
            html.push(`<h${cap}>${inlineMarkdown(heading[2])}</h${cap}>`);
            continue;
        }
        const list = line.match(/^[-*]\s+(.+)$/);
        if (list) {
            dongList(list[1]);
            continue;
        }
        dongBinhThuong();
        html.push(`<p>${inlineMarkdown(line)}</p>`);
    }
    dongBinhThuong();
    return html.join('\n');
}
function chuanHoaPortfolio(taiLieu) {
    const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu;
    return {
        id: String(duLieu._id),
        maUngVien: String(duLieu.maUngVien?._id ?? duLieu.maUngVien),
        maHoSoNangLuc: String(duLieu.maHoSoNangLuc?._id ?? duLieu.maHoSoNangLuc),
        tieuDe: duLieu.tieuDe,
        markdown: duLieu.markdown ?? '',
        theme: duLieu.theme,
        mauChinh: duLieu.mauChinh,
        mauPhu: duLieu.mauPhu,
        font: duLieu.font,
        trangThai: duLieu.trangThai,
        ngayTao: duLieu.ngayTao,
        ngayCapNhat: duLieu.ngayCapNhat,
    };
}
async function layUngVienTuToken(authorization) {
    const nguoiDung = await (0, xacthuc_dichvu_js_1.layNguoiDungTuAccessToken)(authorization);
    if (nguoiDung.vaiTro !== 'ung_vien')
        throw new loiungdung_js_1.LoiUngDung('Chi ung vien moi duoc tao portfolio', 403);
    const ungVien = await ungvien_mohinh_js_1.UngVien
        .findOne({ maNguoiDung: nguoiDung.id })
        .populate('maNguoiDung', 'hoTen email soDienThoai')
        .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang');
    if (!ungVien)
        throw new loiungdung_js_1.LoiUngDung('Bạn cần tạo hồ sơ ứng viên trước khi tao portfolio', 422);
    return ungVien;
}
async function layHoSoThuocUngVien(maHoSoNangLuc, maUngVien) {
    const hoSo = await hosonangluc_mohinh_js_1.HoSoNangLuc.findOne({ _id: maHoSoNangLuc, maUngVien });
    if (!hoSo)
        throw new loiungdung_js_1.LoiUngDung('Ho so nang luc khong ton tai hoac khong thuoc ve ban', 404);
    return hoSo;
}
async function layPortfolioThuocUngVien(ma, maUngVien) {
    const portfolio = await portfolio_mohinh_js_1.Portfolio.findOne({ _id: ma, maUngVien });
    if (!portfolio)
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy portfolio', 404);
    return portfolio;
}
function mangThongTin(items = []) {
    return items.filter(Boolean).map(item => ({
        tieuDe: item.tieuDe,
        donVi: item.donVi,
        thoiGian: item.thoiGian,
        moTa: item.moTa,
    }));
}
function renderMuc(tieuDe, items, rong) {
    const noiDung = items.length
        ? items.map(item => `
      <article class="timeline-item">
        <div>
          <h3>${escapeHtml(item.tieuDe)}</h3>
          <p>${escapeHtml([item.donVi, item.thoiGian].filter(Boolean).join(' · '))}</p>
        </div>
        ${item.moTa ? `<div class="item-desc">${inlineMarkdown(item.moTa)}</div>` : ''}
      </article>
    `).join('')
        : `<p class="muted">${escapeHtml(rong)}</p>`;
    return `<section class="section-block"><h2>${escapeHtml(tieuDe)}</h2>${noiDung}</section>`;
}
function renderPortfolioHtml(portfolio, ungVien, hoSo) {
    const nguoiDung = ungVien.maNguoiDung ?? {};
    const ten = nguoiDung.hoTen ?? 'Ứng viên IT';
    const email = nguoiDung.email ?? '';
    const dienThoai = nguoiDung.soDienThoai ?? '';
    const viTri = ungVien.viTriMongMuon ?? hoSo.tieuDe ?? 'Software Developer';
    const tomTat = ungVien.tomTat || 'Lap trinh vien dang xay dung portfolio tu ITJob.';
    const anhDaiDien = hoSo.anhDaiDien || ungVien.anhDaiDien || '';
    const mauChinh = safeColor(portfolio.mauChinh, '#2563eb');
    const mauPhu = safeColor(portfolio.mauPhu, '#0f172a');
    const font = fontChoPhep[portfolio.font] ?? fontChoPhep.Inter;
    const theme = portfolio.theme ?? 'professional';
    const kyNang = (ungVien.kyNang ?? []).map((muc) => muc.maKyNang?.tenKyNang).filter(Boolean);
    const duAnUngVien = (ungVien.portfolio ?? []).map((item) => ({
        tieuDe: item.tenDuAn,
        donVi: item.lienKet,
        thoiGian: (item.congNghe ?? []).join(', '),
        moTa: item.moTa,
    }));
    const duAn = [...duAnUngVien, ...mangThongTin(hoSo.duAn)];
    const markdownHtml = markdownThanhHtml(portfolio.markdown ?? '');
    const classTheme = `theme-${theme}`;
    const nen = theme === 'modern'
        ? 'linear-gradient(135deg, #07111f 0%, #0f172a 48%, #111827 100%)'
        : theme === 'creative'
            ? 'linear-gradient(135deg, #fff7ed 0%, #f8fafc 45%, #eff6ff 100%)'
            : '#f8fafc';
    return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(ten)} - Portfolio</title>
  <style>
    :root { --primary: ${mauChinh}; --secondary: ${mauPhu}; --font: ${font}; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: var(--font); color: #0f172a; background: ${nen}; line-height: 1.65; }
    a { color: var(--primary); text-decoration: none; font-weight: 700; }
    .page { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 42px 0 56px; }
    .hero { display: grid; grid-template-columns: 1.35fr .65fr; gap: 28px; align-items: stretch; padding: 38px; border-radius: 28px; background: rgba(255,255,255,.92); border: 1px solid rgba(148,163,184,.28); box-shadow: 0 24px 80px rgba(15,23,42,.12); }
    .theme-modern .hero, .theme-modern .panel, .theme-modern .section-block { background: rgba(15,23,42,.78); color: #e5e7eb; border-color: rgba(148,163,184,.22); }
    .theme-modern h1, .theme-modern h2, .theme-modern h3 { color: #fff; }
    .theme-modern .muted, .theme-modern .meta, .theme-modern .item-desc { color: #cbd5e1; }
    .theme-creative .hero { border-radius: 34px 12px 34px 12px; }
    h1 { font-size: clamp(38px, 7vw, 76px); line-height: .95; margin: 0 0 18px; letter-spacing: 0; color: var(--secondary); }
    h2 { font-size: 24px; margin: 0 0 18px; color: var(--secondary); }
    h3 { margin: 0; color: #111827; font-size: 17px; }
    .eyebrow { margin: 0 0 12px; color: var(--primary); font-weight: 900; text-transform: uppercase; letter-spacing: .08em; font-size: 12px; }
    .summary { font-size: 18px; max-width: 760px; color: #475569; margin: 0; }
    .meta-card { display: grid; gap: 12px; align-content: start; padding: 22px; border-radius: 20px; background: var(--secondary); color: white; }
    .avatar { width: 118px; height: 118px; border-radius: 28px; overflow: hidden; background: rgba(255,255,255,.18); border: 3px solid rgba(255,255,255,.42); display: grid; place-items: center; font-weight: 900; font-size: 34px; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .meta-card strong { font-size: 14px; opacity: .78; }
    .meta-card span { overflow-wrap: anywhere; }
    .grid { display: grid; grid-template-columns: .82fr 1.18fr; gap: 24px; margin-top: 24px; }
    .panel, .section-block { padding: 26px; border-radius: 22px; background: rgba(255,255,255,.95); border: 1px solid rgba(148,163,184,.25); box-shadow: 0 14px 44px rgba(15,23,42,.08); }
    .stack { display: grid; gap: 24px; }
    .skills { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill { border: 1px solid rgba(37,99,235,.22); background: color-mix(in srgb, var(--primary) 10%, white); color: var(--secondary); padding: 8px 12px; border-radius: 999px; font-weight: 800; font-size: 13px; }
    .theme-modern .skill { background: rgba(37,99,235,.18); color: #dbeafe; border-color: rgba(147,197,253,.22); }
    .timeline-item { display: grid; gap: 8px; padding: 18px 0; border-top: 1px solid rgba(148,163,184,.25); }
    .timeline-item:first-of-type { border-top: 0; padding-top: 0; }
    .timeline-item p, .muted, .meta { margin: 0; color: #64748b; }
    .item-desc p, .markdown-body p { margin: 8px 0 0; }
    .markdown-body h2, .markdown-body h3, .markdown-body h4 { margin-top: 18px; margin-bottom: 8px; }
    .markdown-body ul { padding-left: 20px; }
    .footer { text-align: center; margin-top: 32px; color: #64748b; font-size: 13px; }
    @media (max-width: 820px) { .hero, .grid { grid-template-columns: 1fr; } .hero, .panel, .section-block { padding: 22px; border-radius: 18px; } .page { width: min(100% - 20px, 1120px); padding-top: 18px; } }
  </style>
</head>
<body class="${classTheme}">
  <main class="page">
    <section class="hero">
      <div>
        <p class="eyebrow">${escapeHtml(viTri)}</p>
        <h1>${escapeHtml(ten)}</h1>
        <p class="summary">${escapeHtml(tomTat)}</p>
      </div>
      <aside class="meta-card">
        <div class="avatar">${anhDaiDien ? `<img src="${escapeHtml(anhDaiDien)}" alt="${escapeHtml(ten)}">` : escapeHtml(ten.slice(0, 1).toUpperCase())}</div>
        <div><strong>Email</strong><br><span>${escapeHtml(email || 'Chua cap nhat')}</span></div>
        <div><strong>Dien thoai</strong><br><span>${escapeHtml(dienThoai || 'Chua cap nhat')}</span></div>
        <div><strong>Dia diem</strong><br><span>${escapeHtml(ungVien.diaChi || 'Viet Nam')}</span></div>
        <div><strong>Kinh nghiem</strong><br><span>${escapeHtml(ungVien.kinhNghiem ?? 0)} nam</span></div>
      </aside>
    </section>
    <div class="grid">
      <aside class="stack">
        <section class="panel">
          <h2>Skills</h2>
          <div class="skills">${kyNang.length ? kyNang.map((kn) => `<span class="skill">${escapeHtml(kn)}</span>`).join('') : '<p class="muted">Chua cap nhat ky nang.</p>'}</div>
        </section>
        ${renderMuc('Education', mangThongTin(hoSo.hocVan), 'Chua cap nhat hoc van.')}
        ${renderMuc('Certifications', mangThongTin(hoSo.chungChi), 'Chua cap nhat chung chi.')}
      </aside>
      <div class="stack">
        ${renderMuc('Experience', mangThongTin(hoSo.kinhNghiemLam), 'Chua cap nhat kinh nghiem lam viec.')}
        ${renderMuc('Projects', duAn, 'Chua cap nhat du an.')}
        <section class="section-block markdown-body">
          <h2>Markdown Story</h2>
          ${markdownHtml || '<p class="muted">Hay them markdown de ke cau chuyen nghe nghiep cua ban.</p>'}
        </section>
      </div>
    </div>
    <p class="footer">Generated by ITJob Portfolio Generator. Standalone HTML, ready to share.</p>
  </main>
</body>
</html>`;
}
exports.dichVuPortfolio = {
    async layDanhSach(authorization) {
        const ungVien = await layUngVienTuToken(authorization);
        const danhSach = await portfolio_mohinh_js_1.Portfolio.find({ maUngVien: ungVien._id }).sort({ ngayCapNhat: -1 }).limit(50);
        return danhSach.map(chuanHoaPortfolio);
    },
    async layTheoMa(authorization, ma) {
        const ungVien = await layUngVienTuToken(authorization);
        const portfolio = await layPortfolioThuocUngVien(ma, ungVien._id);
        return chuanHoaPortfolio(portfolio);
    },
    async taoMoi(authorization, duLieu) {
        const ungVien = await layUngVienTuToken(authorization);
        const hoSo = await layHoSoThuocUngVien(String(duLieu.maHoSoNangLuc), ungVien._id);
        const ketQua = await portfolio_mohinh_js_1.Portfolio.create({
            maUngVien: ungVien._id,
            maHoSoNangLuc: hoSo._id,
            tieuDe: duLieu.tieuDe || `Portfolio - ${hoSo.tieuDe}`,
            markdown: duLieu.markdown ?? '',
            theme: duLieu.theme ?? 'professional',
            mauChinh: safeColor(duLieu.mauChinh, '#2563eb'),
            mauPhu: safeColor(duLieu.mauPhu, '#0f172a'),
            font: fontChoPhep[duLieu.font ?? ''] ? duLieu.font : 'Inter',
            trangThai: 'nhap',
        });
        return chuanHoaPortfolio(ketQua);
    },
    async capNhat(authorization, ma, duLieu) {
        const ungVien = await layUngVienTuToken(authorization);
        const portfolio = await layPortfolioThuocUngVien(ma, ungVien._id);
        const patch = { ...duLieu };
        if (duLieu.maHoSoNangLuc) {
            const hoSo = await layHoSoThuocUngVien(duLieu.maHoSoNangLuc, ungVien._id);
            patch.maHoSoNangLuc = hoSo._id;
        }
        if (duLieu.mauChinh)
            patch.mauChinh = safeColor(duLieu.mauChinh, portfolio.mauChinh);
        if (duLieu.mauPhu)
            patch.mauPhu = safeColor(duLieu.mauPhu, portfolio.mauPhu);
        if (duLieu.font)
            patch.font = fontChoPhep[duLieu.font] ? duLieu.font : portfolio.font;
        const ketQua = await portfolio_mohinh_js_1.Portfolio.findByIdAndUpdate(ma, patch, { returnDocument: 'after', runValidators: true });
        return chuanHoaPortfolio(ketQua);
    },
    async preview(authorization, ma, duLieu) {
        const ungVien = await layUngVienTuToken(authorization);
        const portfolio = await layPortfolioThuocUngVien(ma, ungVien._id);
        const banXemThu = { ...portfolio.toObject(), ...duLieu };
        const hoSo = await layHoSoThuocUngVien(String(banXemThu.maHoSoNangLuc), ungVien._id);
        return renderPortfolioHtml(banXemThu, ungVien, hoSo);
    },
    async exportHtml(authorization, ma) {
        const ungVien = await layUngVienTuToken(authorization);
        const portfolio = await layPortfolioThuocUngVien(ma, ungVien._id);
        const hoSo = await layHoSoThuocUngVien(String(portfolio.maHoSoNangLuc), ungVien._id);
        const html = renderPortfolioHtml(portfolio, ungVien, hoSo);
        portfolio.htmlLanCuoi = html;
        portfolio.trangThai = 'da_tao';
        await portfolio.save();
        return html;
    },
};
