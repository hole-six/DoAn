import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, DollarSign, Clock, Bookmark, Share2, Building2, Users, Globe, Briefcase } from 'lucide-react'

const viecLamMau = {
  id: 1,
  tieuDe: 'Senior ReactJS Developer',
  congTy: 'FPT Software',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/200px-FPT_logo_2010.svg.png',
  diaDiem: 'Hải Châu, Đà Nẵng',
  luong: '$1,500 – $2,500',
  loai: 'Full-time',
  capBac: 'Senior',
  kyNang: ['ReactJS', 'TypeScript', 'Redux', 'Senior', 'Full-time'],
  moTa: `Chúng tôi đang tìm kiếm một Senior ReactJS Developer tài năng để gia nhập đội ngũ phát triển sản phẩm của FPT Software. Bạn sẽ đóng vai trò then chốt trong việc xây dựng và duy trì các ứng dụng web phức tạp, hiệu suất cao cho các khách hàng toàn cầu.`,
  yeuCau: [
    'Ít nhất 4 năm kinh nghiệm làm việc thực tế với ReactJS và JavaScript/TypeScript.',
    'Hiểu biết sâu sắc về React core principles (Virtual DOM, Component Lifecycle, Hooks, State Management).',
    'Kinh nghiệm làm việc với Redux, Context API hoặc các state management tools khác.',
    'Thành thạo HTML5, CSS3, SASS/LESS và các framework CSS (Tailwind, Material UI).',
    'Kỹ năng giao tiếp tiếng Anh tốt.',
  ],
  quyenLoi: [
    'Mức lương cạnh tranh: $1,500 – $2,500 tùy năng lực, review lương 2 lần/năm.',
    'Thưởng dự án, thưởng tháng 13 và các dịp lễ tết.',
    'Bảo hiểm sức khỏe FPT Care cao cấp cho bản thân và gia đình.',
    'Môi trường làm việc quốc tế, cơ hội onsite tại Nhật Bản, Mỹ, Châu Âu.',
    'Cung cấp thiết bị làm việc hiện đại (Macbook Pro).',
  ],
  congTyInfo: {
    nganh: 'Outsourcing & Product',
    quyMo: '10,000+ nhân viên',
    diaChi: 'FPT Complex, Nam Kỳ Khởi Nghĩa, Ngũ Hành Sơn, Đà Nẵng',
    website: 'fpt-software.com',
  },
  viecLamLienQuan: [
    { id: 2, tieuDe: 'Frontend Lead (ReactJS)', congTy: 'Axon Active', luong: 'Lên đến $3,000', diaDiem: 'Đà Nẵng' },
    { id: 3, tieuDe: 'Senior Frontend Engineer', congTy: 'Mgm Technology', luong: 'Thỏa thuận', diaDiem: 'Đà Nẵng' },
    { id: 4, tieuDe: 'React Developer (Mid/Senior)', congTy: 'Enclave', luong: '$1,000 – $2,000', diaDiem: 'Đà Nẵng' },
  ],
}

export default function ChiTietViecLam() {
  const viec = viecLamMau
  const [tab, setTab] = useState<'mo-ta' | 'cong-ty'>('mo-ta')

  return (
    <main style={{ background: '#f5f5f5', minHeight: '100vh', paddingTop: 0 }}>
      {/* Banner với gradient overlay */}
      <div style={{ position: 'relative', height: 280, overflow: 'hidden', background: 'linear-gradient(135deg, #0b1c30 0%, #1e3a5f 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
        
        {/* Logo + Title overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 20px', display: 'flex', alignItems: 'flex-end', gap: 18 }}>
            <div style={{
              width: 88, height: 88, background: '#fff',
              border: '2px solid rgba(255,255,255,0.9)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}>
              <img src={viec.logo} alt={viec.congTy} style={{ width: '80%', height: '80%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                {viec.tieuDe}
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{viec.congTy}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Meta bar + Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, padding: '14px 0 0', fontSize: 13, color: '#6b7280' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#16a34a', fontWeight: 700 }}>
              <DollarSign size={14} /> {viec.luong}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={13} /> {viec.diaDiem}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Briefcase size={13} /> {viec.loai}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={13} /> {viec.capBac}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 0, marginTop: 8 }}>
            {[
              { key: 'mo-ta', label: 'Mô tả công việc' },
              { key: 'cong-ty', label: 'Về công ty' },
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
                  fontFamily: "'Inter', system-ui, sans-serif",
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
        
        {/* Main content */}
        <div style={{ display: 'grid', gap: 16 }}>
          {tab === 'mo-ta' && (
            <>
              {/* Tags */}
              <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {viec.kyNang.map(kn => (
                    <span key={kn} style={{
                      background: '#f0f0f0',
                      borderRadius: 6,
                      padding: '6px 14px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#374151',
                    }}>{kn}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ background: '#fff', borderRadius: 8, padding: '20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button style={{
                  flex: 1,
                  minWidth: 200,
                  background: '#0058be',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}>
                  Ứng tuyển ngay
                </button>
                <button style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '12px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}>
                  <Bookmark size={16} /> Lưu
                </button>
                <button style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '12px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}>
                  <Share2 size={16} /> Chia sẻ
                </button>
              </div>

              {/* Description sections */}
              <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0b1c30' }}>📋 Mô tả công việc</h2>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }}>{viec.moTa}</p>
              </div>

              <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0b1c30' }}>✅ Yêu cầu công việc</h2>
                <ul style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, paddingLeft: 20 }}>
                  {viec.yeuCau.map((y, i) => <li key={i} style={{ marginBottom: 8 }}>{y}</li>)}
                </ul>
              </div>

              <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0b1c30' }}>🎁 Quyền lợi</h2>
                <ul style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, paddingLeft: 20 }}>
                  {viec.quyenLoi.map((q, i) => <li key={i} style={{ marginBottom: 8 }}>{q}</li>)}
                </ul>
              </div>
            </>
          )}

          {tab === 'cong-ty' && (
            <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#0b1c30' }}>Về {viec.congTy}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px', marginBottom: 24 }}>
                {[
                  { label: 'Ngành nghề', val: viec.congTyInfo.nganh },
                  { label: 'Quy mô', val: viec.congTyInfo.quyMo },
                  { label: 'Website', val: viec.congTyInfo.website },
                  { label: 'Địa chỉ', val: viec.congTyInfo.diaChi },
                ].map(item => (
                  <div key={item.label} style={{ borderBottom: '1px dashed #e5e7eb', paddingBottom: 12 }}>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{item.label}</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0b1c30' }}>{item.val}</p>
                  </div>
                ))}
              </div>
              <Link
                to={`/cong-ty/1`}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0058be',
                  textDecoration: 'none',
                }}
              >
                Xem trang công ty →
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 90 }}>
          {/* Company card */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#fff' }}>
                <img src={viec.logo} alt={viec.congTy} style={{ width: '80%', height: '80%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{viec.congTy}</h3>
                <Link to={`/cong-ty/1`} style={{ color: '#0058be', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  Xem công ty →
                </Link>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 10, fontSize: 13, color: '#6b7280' }}>
              {[
                { icon: Building2, label: viec.congTyInfo.nganh },
                { icon: Users, label: viec.congTyInfo.quyMo },
                { icon: MapPin, label: viec.congTyInfo.diaChi },
                { icon: Globe, label: viec.congTyInfo.website },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Icon size={15} style={{ marginTop: 2, flexShrink: 0, color: '#0058be' }} />
                  <span style={{ lineHeight: 1.5 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related jobs */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#0b1c30' }}>Việc làm tương tự</h3>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>Các vị trí liên quan</p>
            <div style={{ borderTop: '1px solid #f0f0f0' }}>
              {viec.viecLamLienQuan.map(v => (
                <Link
                  key={v.id}
                  to={`/viec-lam/${v.id}`}
                  style={{
                    display: 'block',
                    padding: '14px 0',
                    borderBottom: '1px solid #f0f0f0',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: '#0b1c30', lineHeight: 1.4 }}>
                    {v.tieuDe}
                  </h4>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{v.congTy}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: '#f3f4f6', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 600, color: '#374151' }}>
                      {v.diaDiem}
                    </span>
                    <span style={{ background: '#f3f4f6', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 600, color: '#16a34a' }}>
                      {v.luong}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
