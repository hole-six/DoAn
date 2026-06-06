import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { clsx } from 'clsx'
import { Edit3, Plus, RefreshCw, Search, Trash2, UserCheck, Users, X } from 'lucide-react'
import AppIcon from '../../components/AppIcon'
import { useConfirm } from '../../components/ConfirmDialog'
import { layAccessToken } from '../../lib/auth'
import { API_URL } from '../../lib/env'
import { toast } from '../../lib/toast'
import './admin-styles.css'

const PAGE_SIZE = 6

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

const formRong: FormNguoiDung = {
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

const toneTrangThai: Record<TrangThai, string> = {
  hoat_dong: 'bg-emerald-100 text-emerald-700',
  tam_khoa: 'bg-yellow-100 text-yellow-700',
  bi_khoa: 'bg-red-100 text-red-600',
}

const pageClass = 'mx-auto flex w-full min-w-0 max-w-[1400px] flex-col gap-3 pb-4 lg:gap-4'
const panelClass = 'flex min-w-0 flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)] lg:p-5'
const primaryBtn = 'btn-primary'
const subtleBtn = 'btn-subtle'
const fieldClass = 'grid gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-600'
const inputClass = 'min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#062a4d] focus:ring-4 focus:ring-[#062a4d]/10'
const pageBtn = 'page-btn'

function layHeader() {
  const token = layAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString('vi-VN') : '-'
}

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || 'ND'
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
  const [page, setPage] = useState(1)
  const { confirm, ConfirmDialogComponent } = useConfirm()

  const taiDuLieu = async () => {
    setDangTai(true)
    setLoi('')
    try {
      const response = await fetch(`${API_URL}/nguoidung`, { headers: layHeader() })
      const data = await response.json()
      if (!response.ok) throw new Error(data.thongBao ?? 'Không tải được danh sách người dùng')
      setDanhSach(data.duLieu)
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không tải được danh sách người dùng')
    } finally {
      setDangTai(false)
    }
  }

  useEffect(() => {
    taiDuLieu()
  }, [])

  const danhSachHienThi = useMemo(() => {
    const keyword = tuKhoa.trim().toLowerCase()
    return danhSach.filter((nguoiDung) => {
      const khopTuKhoa =
        !keyword ||
        nguoiDung.email.toLowerCase().includes(keyword) ||
        nguoiDung.hoTen.toLowerCase().includes(keyword) ||
        nguoiDung.soDienThoai?.toLowerCase().includes(keyword)
      const khopVaiTro = locVaiTro === 'tat_ca' || nguoiDung.vaiTro === locVaiTro
      const khopTrangThai = locTrangThai === 'tat_ca' || nguoiDung.trangThai === locTrangThai
      return khopTuKhoa && khopVaiTro && khopTrangThai
    })
  }, [danhSach, locTrangThai, locVaiTro, tuKhoa])

  const danhSachTheoTrang = danhSachHienThi.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(danhSachHienThi.length / PAGE_SIZE))
  const start = danhSachHienThi.length ? (page - 1) * PAGE_SIZE + 1 : 0
  const end = Math.min(page * PAGE_SIZE, danhSachHienThi.length)

  useEffect(() => {
    setPage(1)
  }, [locTrangThai, locVaiTro, tuKhoa])

  const thongKe = {
    tong: danhSach.length,
    admin: danhSach.filter((item) => item.vaiTro === 'admin').length,
    ungVien: danhSach.filter((item) => item.vaiTro === 'ung_vien').length,
    nhaTuyenDung: danhSach.filter((item) => item.vaiTro === 'nha_tuyen_dung').length,
  }

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

  const luuNguoiDung = async (event: FormEvent) => {
    event.preventDefault()
    if (!form) return

    setDangLuu(true)
    setLoi('')

    const body: Record<string, string> = {
      email: form.email,
      hoTen: form.hoTen,
      soDienThoai: form.soDienThoai,
      vaiTro: form.vaiTro,
      trangThai: form.trangThai,
    }
    if (form.matKhau) body.matKhau = form.matKhau

    try {
      const response = await fetch(`${API_URL}/nguoidung${form.id ? `/${form.id}` : ''}`, {
        method: form.id ? 'PATCH' : 'POST',
        headers: layHeader(),
        body: JSON.stringify(body),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.thongBao ?? 'Không lưu được người dùng')
      toast.success(form.id ? 'Đã cập nhật người dùng.' : 'Đã tạo người dùng.')
      setForm(null)
      await taiDuLieu()
    } catch (error) {
      setLoi(error instanceof Error ? error.message : 'Không lưu được người dùng')
    } finally {
      setDangLuu(false)
    }
  }

  const xoaNguoiDung = async (nguoiDung: NguoiDung) => {
    confirm(
      'Xóa người dùng',
      `Xóa tài khoản ${nguoiDung.email}? Hành động này không thể hoàn tác.`,
      async () => {
        setLoi('')
        try {
          const response = await fetch(`${API_URL}/nguoidung/${nguoiDung.id}`, {
            method: 'DELETE',
            headers: layHeader(),
          })
          const data = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(data.thongBao ?? 'Không xóa được người dùng')
          toast.success('Đã xóa người dùng.')
          await taiDuLieu()
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Không xóa được người dùng'
          setLoi(message)
          toast.error(message)
        }
      },
      'danger',
      'Xóa',
    )
  }

  return (
    <div className={pageClass}>
      <header className="relative grid min-w-0 gap-3 overflow-visible rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(14,77,125,0.07)] sm:flex sm:items-center sm:justify-between sm:p-5">
        <span className="pointer-events-none absolute -right-14 -top-20 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative z-[1] min-w-0 grid gap-1">
          <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.1em] text-[#0e4d7d]">ITJob Admin</span>
          <h1 className="break-words text-2xl font-black leading-tight text-slate-950">Quản lý người dùng</h1>
          <p className="text-sm font-semibold leading-relaxed text-slate-500">Tạo, sửa, khóa và phân quyền tài khoản cho ứng viên, nhà tuyển dụng và quản trị viên.</p>
        </div>
        <button className={primaryBtn} onClick={() => setForm(formRong)}>
          <AppIcon icon={Plus} size={16} /> Thêm người dùng
        </button>
      </header>

      <div className="grid grid-cols-2 gap-2.5 max-[380px]:grid-cols-1 lg:grid-cols-4">
        {[
          ['Tổng tài khoản', thongKe.tong, Users],
          ['Quản trị viên', thongKe.admin, UserCheck],
          ['Ứng viên', thongKe.ungVien, Users],
          ['Nhà tuyển dụng', thongKe.nhaTuyenDung, UserCheck],
        ].map(([label, value, Icon]: any) => (
          <div key={label} className="grid min-w-0 gap-1 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_8px_24px_rgba(14,77,125,0.07)]">
            <span className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-[#0e4d7d]"><AppIcon icon={Icon} size={18} /></span>
            <span className="text-[10px] font-black uppercase leading-snug tracking-wide text-slate-500">{label}</span>
            <strong className="text-2xl font-black leading-none text-slate-950">{value}</strong>
          </div>
        ))}
      </div>

      <div className={panelClass}>
        <div className="grid gap-2.5 sm:flex sm:items-center">
          <label className="flex min-h-11 min-w-0 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 text-slate-400 focus-within:border-[#062a4d] focus-within:ring-4 focus-within:ring-[#062a4d]/10 sm:flex-1">
            <AppIcon icon={Search} size={16} />
            <input className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" value={tuKhoa} onChange={(event) => setTuKhoa(event.target.value)} placeholder="Tìm tên, email, số điện thoại..." />
          </label>
          <div className="grid gap-2.5 sm:flex sm:flex-none">
            <select className={clsx(inputClass, 'sm:w-40')} value={locVaiTro} onChange={(event) => setLocVaiTro(event.target.value as typeof locVaiTro)}>
              <option value="tat_ca">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="ung_vien">Ứng viên</option>
              <option value="nha_tuyen_dung">Nhà tuyển dụng</option>
            </select>
            <select className={clsx(inputClass, 'sm:w-44')} value={locTrangThai} onChange={(event) => setLocTrangThai(event.target.value as typeof locTrangThai)}>
              <option value="tat_ca">Tất cả trạng thái</option>
              <option value="hoat_dong">Hoạt động</option>
              <option value="tam_khoa">Tạm khóa</option>
              <option value="bi_khoa">Bị khóa</option>
            </select>
            <button className={subtleBtn} onClick={taiDuLieu} disabled={dangTai}>
              <AppIcon icon={RefreshCw} size={15} /> Làm mới
            </button>
          </div>
        </div>

        {loi && <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-extrabold text-rose-700">{loi}</div>}

        <div className="hidden max-w-full overflow-x-auto rounded-xl border border-slate-200 sm:block">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr>
                {['Người dùng', 'Vai trò', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map((head) => (
                  <th key={head} className="whitespace-nowrap bg-slate-50 px-3 py-2.5 text-[11px] font-black uppercase tracking-wide text-slate-500">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dangTai && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm font-bold text-slate-400">Đang tải dữ liệu...</td></tr>}
              {!dangTai && danhSachTheoTrang.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm font-bold text-slate-400">Không có người dùng phù hợp.</td></tr>}
              {!dangTai && danhSachTheoTrang.map((nguoiDung) => (
                <tr key={nguoiDung.id}>
                  <td className="border-t border-slate-100 px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-[#0e4d7d]/15 bg-sky-100 text-xs font-black text-[#0e4d7d]">{initials(nguoiDung.hoTen)}</div>
                      <div className="min-w-0">
                        <span className="block max-w-48 truncate text-[13px] font-black text-slate-950">{nguoiDung.hoTen}</span>
                        <span className="mt-0.5 block max-w-48 truncate text-xs font-semibold text-slate-500">{nguoiDung.email}</span>
                        {nguoiDung.soDienThoai && <span className="mt-0.5 block max-w-48 truncate text-xs font-semibold text-slate-500">{nguoiDung.soDienThoai}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="border-t border-slate-100 px-3 py-2.5"><span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-black text-[#0e4d7d]"><AppIcon icon={UserCheck} size={12} /> {nhanVaiTro[nguoiDung.vaiTro]}</span></td>
                  <td className="border-t border-slate-100 px-3 py-2.5"><span className={clsx('inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-black', toneTrangThai[nguoiDung.trangThai])}>{nhanTrangThai[nguoiDung.trangThai]}</span></td>
                  <td className="whitespace-nowrap border-t border-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-600">{formatDate(nguoiDung.ngayTao)}</td>
                  <td className="border-t border-slate-100 px-3 py-2.5">
                    <div className="flex gap-1.5">
                      <button className="btn-icon" title="Sửa" onClick={() => moChinhSua(nguoiDung)}><AppIcon icon={Edit3} size={14} /></button>
                      <button className="btn-icon danger" title="Xóa" onClick={() => xoaNguoiDung(nguoiDung)}><AppIcon icon={Trash2} size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 sm:hidden">
          {dangTai && <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-400">Đang tải dữ liệu...</div>}
          {!dangTai && danhSachTheoTrang.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm font-extrabold text-slate-500">Không có người dùng phù hợp.</div>}
          {!dangTai && danhSachTheoTrang.map((nguoiDung) => (
            <article key={nguoiDung.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_6px_18px_rgba(14,77,125,0.06)]">
              <div className="flex min-w-0 items-start gap-2.5">
                <div className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-[#0e4d7d]/15 bg-sky-100 text-xs font-black text-[#0e4d7d]">{initials(nguoiDung.hoTen)}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-black text-slate-950">{nguoiDung.hoTen}</h3>
                  <p className="truncate text-xs font-semibold text-slate-500">{nguoiDung.email}</p>
                  {nguoiDung.soDienThoai && <p className="truncate text-xs font-semibold text-slate-500">{nguoiDung.soDienThoai}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <span className="block text-[10px] font-black uppercase tracking-wide text-slate-500">Vai trò</span>
                  <strong className="mt-1 block truncate text-sm font-black text-slate-950">{nhanVaiTro[nguoiDung.vaiTro]}</strong>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <span className="block text-[10px] font-black uppercase tracking-wide text-slate-500">Ngày tạo</span>
                  <strong className="mt-1 block truncate text-sm font-black text-slate-950">{formatDate(nguoiDung.ngayTao)}</strong>
                </div>
              </div>
              <div className="grid gap-2 min-[420px]:flex min-[420px]:flex-wrap min-[420px]:items-center min-[420px]:justify-between">
                <span className={clsx('inline-flex rounded-full px-2.5 py-1 text-[11px] font-black', toneTrangThai[nguoiDung.trangThai])}>{nhanTrangThai[nguoiDung.trangThai]}</span>
                <div className="grid grid-cols-1 gap-1.5 min-[360px]:grid-cols-2">
                  <button className="btn-primary min-h-10 text-xs" onClick={() => moChinhSua(nguoiDung)}><AppIcon icon={Edit3} size={14} /> Sửa</button>
                  <button className="btn-danger min-h-10 text-xs" onClick={() => xoaNguoiDung(nguoiDung)}><AppIcon icon={Trash2} size={14} /> Xóa</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="grid w-full min-w-0 gap-2 text-sm font-extrabold text-slate-500 min-[421px]:flex min-[421px]:items-center min-[421px]:justify-between">
          <span className="whitespace-nowrap">{start}-{end} / {danhSachHienThi.length}</span>
          <div className="flex min-w-0 gap-1.5 overflow-x-auto pb-0.5 min-[421px]:justify-end">
            <button className={pageBtn} disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>{'‹'}</button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
              <button key={item} className={clsx('page-btn', item === page && 'active')} onClick={() => setPage(item)}>{item}</button>
            ))}
            <button className={pageBtn} disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>{'›'}</button>
          </div>
        </div>
      </div>

      {form && (
        <div className="fixed inset-0 z-[300] flex items-stretch justify-center bg-slate-900/50 p-0 backdrop-blur-md">
          <form className="flex h-dvh w-full max-w-none flex-col gap-3.5 overflow-y-auto rounded-none border-0 bg-white p-4 shadow-none sm:p-6" onSubmit={luuNguoiDung}>
            <div className="relative flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="break-words pr-12 text-2xl font-black leading-tight text-slate-950">{form.id ? 'Sửa người dùng' : 'Thêm người dùng'}</h2>
                <p className="mt-2 max-w-2xl break-words pr-12 text-sm font-semibold leading-relaxed text-slate-500">{form.id ? 'Cập nhật thông tin tài khoản.' : 'Tạo tài khoản mới cho hệ thống.'}</p>
              </div>
              <button type="button" className="absolute right-0 top-0 z-20 inline-flex h-10 w-10 min-h-10 min-w-10 flex-none items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-0 text-slate-500" onClick={() => setForm(null)} aria-label="Đóng">
                <AppIcon icon={X} size={16} />
              </button>
            </div>

            {loi && <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-extrabold text-rose-700">{loi}</div>}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className={fieldClass}>Họ tên
                <input className={inputClass} required value={form.hoTen} onChange={(event) => setForm({ ...form, hoTen: event.target.value })} />
              </label>
              <label className={fieldClass}>Email
                <input className={inputClass} required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
              <label className={fieldClass}>Số điện thoại
                <input className={inputClass} value={form.soDienThoai} onChange={(event) => setForm({ ...form, soDienThoai: event.target.value })} />
              </label>
              <label className={fieldClass}>Mật khẩu {form.id ? '(để trống = giữ nguyên)' : ''}
                <input className={inputClass} required={!form.id} type="password" minLength={6} value={form.matKhau} onChange={(event) => setForm({ ...form, matKhau: event.target.value })} />
              </label>
              <label className={fieldClass}>Vai trò
                <select className={inputClass} value={form.vaiTro} onChange={(event) => setForm({ ...form, vaiTro: event.target.value as VaiTro })}>
                  <option value="admin">Quản trị viên</option>
                  <option value="ung_vien">Ứng viên</option>
                  <option value="nha_tuyen_dung">Nhà tuyển dụng</option>
                </select>
              </label>
              <label className={fieldClass}>Trạng thái
                <select className={inputClass} value={form.trangThai} onChange={(event) => setForm({ ...form, trangThai: event.target.value as TrangThai })}>
                  <option value="hoat_dong">Hoạt động</option>
                  <option value="tam_khoa">Tạm khóa</option>
                  <option value="bi_khoa">Bị khóa</option>
                </select>
              </label>
            </div>

            <div className="grid gap-2 sm:flex sm:justify-end">
              <button type="button" className={subtleBtn} onClick={() => setForm(null)}>Hủy</button>
              <button type="submit" className={primaryBtn} disabled={dangLuu}>{dangLuu ? 'Đang lưu...' : 'Lưu người dùng'}</button>
            </div>
          </form>
        </div>
      )}
      <ConfirmDialogComponent />
    </div>
  )
}
