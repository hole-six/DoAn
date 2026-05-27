import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { Edit3, Plus, RefreshCw, Search, Trash2, UserCheck, X } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

type VaiTro = 'ung_vien' | 'nha_tuyen_dung' | 'admin'
type TrangThai = 'hoat_dong' | 'tam_khoa' | 'bi_khoa'

type NguoiDung = {
  id: string
  email: string
  hoTen: string
  soDienThoai?: string
  vaiTro: VaiTro
  trangThai: TrangThai
  ngayTao?: string
}

type FormNguoiDung = {
  id?: string
  email: string
  matKhau: string
  hoTen: string
  soDienThoai: string
  vaiTro: VaiTro
  trangThai: TrangThai
}

const formMacDinh: FormNguoiDung = {
  email: '',
  matKhau: '',
  hoTen: '',
  soDienThoai: '',
  vaiTro: 'ung_vien',
  trangThai: 'hoat_dong',
}

const nhanVaiTro: Record<VaiTro, string> = {
  admin: 'Quản trị viên',
  ung_vien: 'Ứng viên',
  nha_tuyen_dung: 'Nhà tuyển dụng',
}

const nhanTrangThai: Record<TrangThai, string> = {
  hoat_dong: 'Hoạt động',
  tam_khoa: 'Tạm khóa',
  bi_khoa: 'Bị khóa',
}

const mauTrangThai: Record<TrangThai, { nen: string; chu: string }> = {
  hoat_dong: { nen: '#dcfce7', chu: '#166534' },
  tam_khoa: { nen: '#fef3c7', chu: '#92400e' },
  bi_khoa: { nen: '#ffe4e6', chu: '#be123c' },
}

function layHeader() {
  const token = localStorage.getItem('itjob_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export default function QuanLyNguoiDung() {
  const [danhSach, setDanhSach] = useState<NguoiDung[]>([])
  const [tuKhoa, setTuKhoa] = useState('')
  const [locVaiTro, setLocVaiTro] = useState<'tat_ca' | VaiTro>('tat_ca')
  const [locTrangThai, setLocTrangThai] = useState<'tat_ca' | TrangThai>('tat_ca')
  const [dangTai, setDangTai] = useState(false)
  const [dangLuu, setDangLuu] = useState(false)
  const [loi, setLoi] = useState('')
  const [form, setForm] = useState<FormNguoiDung | null>(null)

  const taiDuLieu = async () => {
    setDangTai(true)
    setLoi('')

    try {
      const phanHoi = await fetch(`${API_URL}/nguoidung`, { headers: layHeader() })
      const ketQua = await phanHoi.json()

      if (!phanHoi.ok) throw new Error(ketQua.thongBao ?? 'Không tải được danh sách người dùng')
      setDanhSach(ketQua.duLieu)
    } catch (err) {
      setLoi(err instanceof Error ? err.message : 'Không tải được danh sách người dùng')
    } finally {
      setDangTai(false)
    }
  }

  useEffect(() => {
    taiDuLieu()
  }, [])

  const danhSachHienThi = useMemo(() => {
    const tuKhoaChuan = tuKhoa.trim().toLowerCase()

    return danhSach.filter((nguoiDung) => {
      const khopTuKhoa =
        !tuKhoaChuan ||
        nguoiDung.email.toLowerCase().includes(tuKhoaChuan) ||
        nguoiDung.hoTen.toLowerCase().includes(tuKhoaChuan) ||
        nguoiDung.soDienThoai?.toLowerCase().includes(tuKhoaChuan)
      const khopVaiTro = locVaiTro === 'tat_ca' || nguoiDung.vaiTro === locVaiTro
      const khopTrangThai = locTrangThai === 'tat_ca' || nguoiDung.trangThai === locTrangThai

      return khopTuKhoa && khopVaiTro && khopTrangThai
    })
  }, [danhSach, locTrangThai, locVaiTro, tuKhoa])

  const moTaoMoi = () => setForm(formMacDinh)

  const moChinhSua = (nguoiDung: NguoiDung) => {
    setForm({
      id: nguoiDung.id,
      email: nguoiDung.email,
      matKhau: '',
      hoTen: nguoiDung.hoTen,
      soDienThoai: nguoiDung.soDienThoai ?? '',
      vaiTro: nguoiDung.vaiTro,
      trangThai: nguoiDung.trangThai,
    })
  }

  const luuNguoiDung = async (e: FormEvent) => {
    e.preventDefault()
    if (!form) return

    setDangLuu(true)
    setLoi('')

    const duLieuGui: Record<string, string> = {
      email: form.email,
      hoTen: form.hoTen,
      soDienThoai: form.soDienThoai,
      vaiTro: form.vaiTro,
      trangThai: form.trangThai,
    }

    if (form.matKhau) duLieuGui.matKhau = form.matKhau

    try {
      const phanHoi = await fetch(`${API_URL}/nguoidung${form.id ? `/${form.id}` : ''}`, {
        method: form.id ? 'PATCH' : 'POST',
        headers: layHeader(),
        body: JSON.stringify(duLieuGui),
      })
      const ketQua = await phanHoi.json().catch(() => ({}))

      if (!phanHoi.ok) throw new Error(ketQua.thongBao ?? 'Không lưu được người dùng')

      setForm(null)
      await taiDuLieu()
    } catch (err) {
      setLoi(err instanceof Error ? err.message : 'Không lưu được người dùng')
    } finally {
      setDangLuu(false)
    }
  }

  const xoaNguoiDung = async (nguoiDung: NguoiDung) => {
    if (!window.confirm(`Xóa tài khoản ${nguoiDung.email}?`)) return

    setLoi('')

    try {
      const phanHoi = await fetch(`${API_URL}/nguoidung/${nguoiDung.id}`, {
        method: 'DELETE',
        headers: layHeader(),
      })
      const ketQua = await phanHoi.json().catch(() => ({}))

      if (!phanHoi.ok) throw new Error(ketQua.thongBao ?? 'Không xóa được người dùng')
      await taiDuLieu()
    } catch (err) {
      setLoi(err instanceof Error ? err.message : 'Không xóa được người dùng')
    }
  }

  const thongKe = {
    tong: danhSach.length,
    admin: danhSach.filter((muc) => muc.vaiTro === 'admin').length,
    ungVien: danhSach.filter((muc) => muc.vaiTro === 'ung_vien').length,
    nhaTuyenDung: danhSach.filter((muc) => muc.vaiTro === 'nha_tuyen_dung').length,
  }

  return (
    <div>
      <div className="dashboard-topbar">
        <div>
          <h1>Quản lý người dùng</h1>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: 4 }}>
            Tạo, sửa, khóa và xóa tài khoản cho 3 vai trò trong hệ thống.
          </p>
        </div>
        <button className="primary-button" onClick={moTaoMoi}>
          <Plus size={17} /> Thêm người dùng
        </button>
      </div>

      <div className="stats-grid dashboard-stats" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {[
          ['Tổng tài khoản', thongKe.tong],
          ['Quản trị viên', thongKe.admin],
          ['Ứng viên', thongKe.ungVien],
          ['Nhà tuyển dụng', thongKe.nhaTuyenDung],
        ].map(([nhan, so]) => (
          <div key={nhan} className="stat-card" style={{ borderRadius: 8 }}>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>{nhan}</p>
            <strong style={{ fontSize: 32, marginTop: 8, display: 'block' }}>{so}</strong>
          </div>
        ))}
      </div>

      <div className="panel" style={{ borderRadius: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 190px 190px auto', gap: 12, marginBottom: 18 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #d8dde6', borderRadius: 6, padding: '0 12px', minHeight: 44 }}>
            <Search size={17} color="#64748b" />
            <input
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại"
              style={{ border: 0, outline: 0, width: '100%', background: 'transparent' }}
            />
          </label>
          <select value={locVaiTro} onChange={(e) => setLocVaiTro(e.target.value as typeof locVaiTro)} style={selectStyle}>
            <option value="tat_ca">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="ung_vien">Ứng viên</option>
            <option value="nha_tuyen_dung">Nhà tuyển dụng</option>
          </select>
          <select value={locTrangThai} onChange={(e) => setLocTrangThai(e.target.value as typeof locTrangThai)} style={selectStyle}>
            <option value="tat_ca">Tất cả trạng thái</option>
            <option value="hoat_dong">Hoạt động</option>
            <option value="tam_khoa">Tạm khóa</option>
            <option value="bi_khoa">Bị khóa</option>
          </select>
          <button className="secondary-button" onClick={taiDuLieu} disabled={dangTai}>
            <RefreshCw size={16} /> Làm mới
          </button>
        </div>

        {loi && (
          <div style={{ border: '1px solid rgba(225,29,72,0.22)', background: 'rgba(225,29,72,0.08)', color: '#be123c', borderRadius: 6, padding: 12, marginBottom: 14, fontWeight: 700 }}>
            {loi}
          </div>
        )}

        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                {['Người dùng', 'Vai trò', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map((cot) => (
                  <th key={cot} style={thStyle}>{cot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {danhSachHienThi.map((nguoiDung) => (
                <tr key={nguoiDung.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar" style={{ borderRadius: 8 }}>{nguoiDung.hoTen.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <strong>{nguoiDung.hoTen}</strong>
                        <p style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>{nguoiDung.email}</p>
                        {nguoiDung.soDienThoai && <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{nguoiDung.soDienThoai}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ ...badgeStyle, background: '#eff6ff', color: '#0058be' }}>
                      <UserCheck size={13} /> {nhanVaiTro[nguoiDung.vaiTro]}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ ...badgeStyle, background: mauTrangThai[nguoiDung.trangThai].nen, color: mauTrangThai[nguoiDung.trangThai].chu }}>
                      {nhanTrangThai[nguoiDung.trangThai]}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: '#64748b' }}>
                    {nguoiDung.ngayTao ? new Date(nguoiDung.ngayTao).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="secondary-button" style={actionButtonStyle} onClick={() => moChinhSua(nguoiDung)}>
                        <Edit3 size={15} /> Sửa
                      </button>
                      <button className="secondary-button" style={{ ...actionButtonStyle, color: '#be123c', borderColor: 'rgba(225,29,72,0.35)' }} onClick={() => xoaNguoiDung(nguoiDung)}>
                        <Trash2 size={15} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!dangTai && danhSachHienThi.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 28, textAlign: 'center', color: '#64748b' }}>
                    Không có người dùng phù hợp.
                  </td>
                </tr>
              )}
              {dangTai && (
                <tr>
                  <td colSpan={5} style={{ padding: 28, textAlign: 'center', color: '#64748b' }}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <div style={modalOverlayStyle}>
          <form onSubmit={luuNguoiDung} style={modalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h2>{form.id ? 'Sửa người dùng' : 'Thêm người dùng'}</h2>
                <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
                  {form.id ? 'Cập nhật tài khoản và quyền truy cập.' : 'Tạo tài khoản mới cho hệ thống.'}
                </p>
              </div>
              <button type="button" onClick={() => setForm(null)} style={{ background: '#f1f5f9', border: '1px solid #d8dde6', width: 38, height: 38, borderRadius: 6 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <label style={fieldStyle}>
                Họ tên
                <input required value={form.hoTen} onChange={(e) => setForm({ ...form, hoTen: e.target.value })} style={inputStyle} />
              </label>
              <label style={fieldStyle}>
                Email
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              </label>
              <label style={fieldStyle}>
                Số điện thoại
                <input value={form.soDienThoai} onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })} style={inputStyle} />
              </label>
              <label style={fieldStyle}>
                Mật khẩu {form.id ? '(để trống nếu giữ nguyên)' : ''}
                <input required={!form.id} type="password" minLength={6} value={form.matKhau} onChange={(e) => setForm({ ...form, matKhau: e.target.value })} style={inputStyle} />
              </label>
              <label style={fieldStyle}>
                Vai trò
                <select value={form.vaiTro} onChange={(e) => setForm({ ...form, vaiTro: e.target.value as VaiTro })} style={inputStyle}>
                  <option value="admin">Quản trị viên</option>
                  <option value="ung_vien">Ứng viên</option>
                  <option value="nha_tuyen_dung">Nhà tuyển dụng</option>
                </select>
              </label>
              <label style={fieldStyle}>
                Trạng thái
                <select value={form.trangThai} onChange={(e) => setForm({ ...form, trangThai: e.target.value as TrangThai })} style={inputStyle}>
                  <option value="hoat_dong">Hoạt động</option>
                  <option value="tam_khoa">Tạm khóa</option>
                  <option value="bi_khoa">Bị khóa</option>
                </select>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <button type="button" className="secondary-button" onClick={() => setForm(null)}>Hủy</button>
              <button type="submit" className="primary-button" disabled={dangLuu}>
                {dangLuu ? 'Đang lưu...' : 'Lưu người dùng'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

const selectStyle: CSSProperties = {
  border: '1px solid #d8dde6',
  borderRadius: 6,
  padding: '0 12px',
  minHeight: 44,
  background: '#ffffff',
  fontWeight: 700,
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '13px 16px',
  fontSize: 12,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const tdStyle: CSSProperties = {
  padding: '15px 16px',
  verticalAlign: 'middle',
}

const badgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: 'nowrap',
}

const actionButtonStyle: CSSProperties = {
  minHeight: 36,
  padding: '7px 10px',
  borderRadius: 6,
}

const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  background: 'rgba(15, 23, 42, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
}

const modalStyle: CSSProperties = {
  width: 'min(720px, 100%)',
  background: '#ffffff',
  borderRadius: 8,
  border: '1px solid #d8dde6',
  padding: 24,
  boxShadow: '0 24px 70px rgba(15,23,42,0.22)',
}

const fieldStyle: CSSProperties = {
  display: 'grid',
  gap: 7,
  color: '#475569',
  fontSize: 12,
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const inputStyle: CSSProperties = {
  border: '1px solid #d8dde6',
  borderRadius: 6,
  minHeight: 44,
  padding: '0 12px',
  outline: 'none',
  fontSize: 14,
  color: '#0b1c30',
  textTransform: 'none',
  letterSpacing: 0,
  fontWeight: 600,
  background: '#ffffff',
}
