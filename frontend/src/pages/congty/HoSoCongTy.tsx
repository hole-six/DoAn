
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin, Users, Globe,
  Briefcase, Star,
  ThumbsUp, Award,
} from 'lucide-react'

// ─── Kiểu dữ liệu bám sát ERD ────────────────────────────────────────────────

interface NhaTuyenDung {
  manhatuyendung: number
  tencongty: string
  logo: string
  banner: string
  diachi: string
  website: string
  quymo: string          // quymo từ ERD nhatuyendung
  mota: string
  nganh: string
  trangthaiduyet: number // 1 = đã duyệt
  ngaytao: string
  // Thêm UI
  quocgia: string
  thoigianlam: string
  lamviecngoagio: string
  danhGia: number
  soReview: number
  giaiThuong: { ten: string; diem: number; tyLe: number; nam: number }[]
}

interface TinTuyenDung {
  matintuyendung: number
  manhatuyendung: number
  tieude: string
  diachi: string
  luongmin: number
  luongmax: number
  loaiviec: string       // loaiviec từ ERD
  trangthai: number
  ngaydang: string
  kyNang: string[]
  hot: boolean
}

// ─── Dữ liệu mẫu bám ERD ─────────────────────────────────────────────────────

const congTyMau: NhaTuyenDung = {
  manhatuyendung: 1,
  tencongty: 'FPT Software Da Nang',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/200px-FPT_logo_2010.svg.png',
  banner: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80',
  diachi: 'FPT Complex, Nam Kỳ Khởi Nghĩa, Ngũ Hành Sơn, Đà Nẵng',
  website: 'fpt-software.com',
  quymo: '1000-4999',
  mota: `FPT Software là công ty phần mềm lớn nhất Việt Nam, cung cấp dịch vụ CNTT cho các tập đoàn lớn trên toàn cầu. Chúng tôi tự hào về văn hóa học hỏi liên tục và môi trường làm việc quốc tế, chuyên nghiệp.\n\nVới hơn 20 năm kinh nghiệm, FPT Software đã phục vụ hơn 1.000 khách hàng tại 30+ quốc gia, bao gồm các tập đoàn Fortune 500.`,
  nganh: 'Sản Phẩm Phần Mềm và Dịch Vụ Web',
  trangthaiduyet: 1,
  ngaytao: '2002-01-01',
  quocgia: 'Việt Nam',
  thoigianlam: 'Thứ 2 – Thứ 6',
  lamviecngoagio: 'Không có OT',
  danhGia: 4.5,
  soReview: 500,
  giaiThuong: [
    { ten: 'Công ty IT tốt nhất Việt Nam 2025', diem: 4.9, tyLe: 100, nam: 2025 },
    { ten: 'Công ty IT tốt nhất Việt Nam 2024', diem: 4.6, tyLe: 94, nam: 2024 },
  ],
}

const tinTuyenDungMau: TinTuyenDung[] = [
  {
    matintuyendung: 1,
    manhatuyendung: 1,
    tieude: 'Senior ReactJS Developer',
    diachi: 'TP Hồ Chí Minh',
    luongmin: 1500,
    luongmax: 2500,
    loaiviec: 'Linh hoạt',
    trangthai: 1,
    ngaydang: '2 ngày trước',
    kyNang: ['ReactJS', 'TypeScript', 'Redux'],
    hot: true,
  },
  {
    matintuyendung: 2,
    manhatuyendung: 1,
    tieude: 'Mid/Senior Fullstack Engineer (Python)',
    diachi: 'TP Hồ Chí Minh',
    luongmin: 2000,
    luongmax: 4000,
    loaiviec: 'Linh hoạt',
    trangthai: 1,
    ngaydang: '5 ngày trước',
    kyNang: ['Python', 'Fullstack', 'Microservices'],
    hot: true,
  },
  {
    matintuyendung: 3,
    manhatuyendung: 1,
    tieude: 'Sr Fullstack Engineer – DevX (TypeScript, Vue/React)',
    diachi: 'Đà Nẵng',
    luongmin: 3000,
    luongmax: 4000,
    loaiviec: 'Tại văn phòng',
    trangthai: 1,
    ngaydang: '18 ngày trước',
    kyNang: ['Fullstack', 'ReactJS', 'VueJS', 'TypeScript'],
    hot: false,
  },
]

const danhGiaMau = [
  { ten: 'Nguyễn Văn A', chucVu: 'Senior Developer', diem: 5, nhanXet: 'Môi trường làm việc tuyệt vời, đồng nghiệp thân thiện và chuyên nghiệp. Nhiều cơ hội học hỏi và phát triển.', ngay: '15/05/2025' },
  { ten: 'Trần Thị B', chucVu: 'QA Engineer', diem: 4, nhanXet: 'Lương cạnh tranh, phúc lợi tốt. Quy trình làm việc rõ ràng, chuyên nghiệp.', ngay: '10/05/2025' },
]

// ─── Component card việc làm (sidebar phải) ───────────────────────────────────

function CardViecLam({ tin }: { tin: TinTuyenDung }) {
  return (
    <Link
      to={`/viec-lam/${tin.matintuyendung}`}
      style={{
        display: 'block',
        padding: '16px 0',
        borderBottom: '1px solid #f0f0f0',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Đăng {tin.ngaydang}</p>
        {tin.hot && (
          <span style={{ background: '#f97316', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
            HOT
          </span>
        )}
      </div>

      <h4 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, marginBottom: 10, color: '#0b1c30' }}>
        {tin.tieude}
      </h4>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          <img src={congTyMau.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </div>
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{congTyMau.tencongty}</span>
      </div>

      <p style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', marginBottom: 8 }}>
        💵 {tin.luongmin.toLocaleString()} – {tin.luongmax.toLocaleString()} USD
      </p>

      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Briefcase size={12} /> {tin.loaiviec}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={12} /> {tin.diachi}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tin.kyNang.slice(0, 4).map(kn => (
          <span key={kn} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: '#374151' }}>
            {kn}
          </span>
        ))}
        {tin.kyNang.length > 4 && (
          <span style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: '#374151' }}>
            +{tin.kyNang.length - 4}
          </span>
        )}
      </div>
    </Link>
  )
}

// ─── Trang chính ──────────────────────────────────────────────────────────────

export default function HoSoCongTy() {
  const cty = congTyMau
  const [tab, setTab] = useState<'gioi-thieu' | 'danh-gia' | 'bai-viet'>('gioi-thieu')

  const quyMoHienThi = cty.quymo === '1000-4999' ? '1,000 – 4,999 nhân viên' : cty.quymo

  return (
    <main style={{ background: '#f5f5f5', minHeight: '100vh', paddingTop: 0 }}>
      {/* Banner + logo + tên nằm trên ảnh */}
      <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <img src={cty.banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Gradient tối dần từ giữa xuống để text đọc được */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.6) 100%)' }} />

        {/* Logo + tên — overlay trên ảnh, căn dưới trái */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 20px', display: 'flex', alignItems: 'flex-end', gap: 18 }}>
            {/* Logo */}
            <div style={{
              width: 88, height: 88, background: '#fff',
              border: '2px solid rgba(255,255,255,0.9)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}>
              <img src={cty.logo} alt={cty.tencongty} style={{ width: '80%', height: '80%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>

            {/* Tên công ty trên ảnh */}
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 0, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                {cty.tencongty}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Thanh thông tin meta + tabs — nằm dưới ảnh */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {/* Meta row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, padding: '14px 0 0', fontSize: 13, color: '#6b7280' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Globe size={13} /> {cty.website}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Users size={13} /> {quyMoHienThi}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={13} /> {cty.diachi}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f59e0b', fontWeight: 700 }}>
              <Star size={13} fill="#f59e0b" /> {cty.danhGia} ({cty.soReview} đánh giá)
            </span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginTop: 8 }}>
            {[
              { key: 'gioi-thieu', label: 'Giới thiệu' },
              { key: 'danh-gia', label: `Đánh giá  ${cty.soReview}` },
              { key: 'bai-viet', label: 'Bài viết  1' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                style={{
                  padding: '12px 20px', border: 'none', background: 'transparent',
                  cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  color: tab === t.key ? '#e11d48' : '#6b7280',
                  borderBottom: tab === t.key ? '2px solid #e11d48' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 48px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

        {/* ── Cột trái ── */}
        <div style={{ display: 'grid', gap: 16 }}>

          {tab === 'gioi-thieu' && (
            <>
              {/* Thông tin chung */}
              <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#0b1c30' }}>Thông tin chung</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
                  {[
                    { label: 'Mô hình công ty', val: 'Sản phẩm' },
                    { label: 'Lĩnh vực công ty', val: cty.nganh },
                    { label: 'Quy mô công ty', val: quyMoHienThi },
                    { label: 'Quốc gia', val: cty.quocgia },
                    { label: 'Thời gian làm việc', val: cty.thoigianlam },
                    { label: 'Làm việc ngoài giờ', val: cty.lamviecngoagio },
                  ].map(item => (
                    <div key={item.label} style={{ borderBottom: '1px dashed #e5e7eb', paddingBottom: 12 }}>
                      <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{item.label}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#0b1c30' }}>{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Giải thưởng */}
              {cty.giaiThuong.length > 0 && (
                <div style={{ background: '#fff', borderRadius: 8, padding: 24, border: '1px solid #fed7aa' }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#f97316' }}>
                    <Award size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                    Giải thưởng
                  </h2>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {cty.giaiThuong.map((gt, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < cty.giaiThuong.length - 1 ? '1px solid #fef3c7' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, background: '#fef3c7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={20} style={{ color: '#f97316' }} />
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#0b1c30' }}>{gt.ten}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>
                            <Star size={14} fill="#f59e0b" /> {gt.diem}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 700, color: '#16a34a' }}>
                            <ThumbsUp size={14} /> {gt.tyLe}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12, lineHeight: 1.6 }}>
                    Giải thưởng "Công ty IT tốt nhất Việt Nam" của ITviec vinh danh các công ty IT có môi trường làm việc hàng đầu tại Việt Nam, do chính các nhân viên đánh giá.
                  </p>
                </div>
              )}

              {/* Giới thiệu công ty */}
              <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0b1c30' }}>Giới thiệu công ty</h2>
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }}>
                  {cty.mota.split('\n').map((p, i) => p.trim() && <p key={i} style={{ marginBottom: 12 }}>{p}</p>)}
                </div>
              </div>

              {/* Bản đồ */}
              <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0b1c30' }}>
                  <MapPin size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: '#e11d48' }} />
                  Địa chỉ
                </h2>
                <p style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>{cty.diachi}</p>
                {/* Google Maps embed */}
                <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #ebebeb' }}>
                  <iframe
                    title="Bản đồ"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(cty.diachi)}&output=embed`}
                    width="100%"
                    height="280"
                    style={{ border: 'none', display: 'block' }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </>
          )}

          {tab === 'danh-gia' && (
            <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 20, background: '#f9fafb', borderRadius: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 48, fontWeight: 800, color: '#0b1c30', lineHeight: 1 }}>{cty.danhGia}</p>
                  <div style={{ display: 'flex', gap: 2, justifyContent: 'center', margin: '6px 0' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} style={{ color: i < Math.floor(cty.danhGia) ? '#f59e0b' : '#e5e7eb', fill: i < Math.floor(cty.danhGia) ? '#f59e0b' : 'none' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>{cty.soReview} đánh giá</p>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                {danhGiaMau.map((dg, i) => (
                  <div key={i} style={{ padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--secondary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>
                          {dg.ten.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700 }}>{dg.ten}</p>
                          <p style={{ fontSize: 12, color: '#9ca3af' }}>{dg.chucVu}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={13} style={{ color: j < dg.diem ? '#f59e0b' : '#e5e7eb', fill: j < dg.diem ? '#f59e0b' : 'none' }} />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{dg.nhanXet}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>{dg.ngay}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'bai-viet' && (
            <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>Chưa có bài viết nào.</p>
            </div>
          )}
        </div>

        {/* ── Cột phải: Việc làm đang tuyển ── */}
        <div style={{ position: 'sticky', top: 90 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0b1c30', marginBottom: 4 }}>
              {tinTuyenDungMau.length} việc làm đang tuyển dụng
            </h3>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>tại {cty.tencongty}</p>
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 12 }}>
              {tinTuyenDungMau.map(tin => (
                <CardViecLam key={tin.matintuyendung} tin={tin} />
              ))}
            </div>
            <Link
              to="/viec-lam"
              style={{ display: 'block', textAlign: 'center', marginTop: 16, padding: '10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontWeight: 700, color: 'var(--secondary)', textDecoration: 'none' }}
            >
              Xem tất cả việc làm →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
