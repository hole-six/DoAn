import { useEffect, useMemo, useState } from 'react'
import { Download, Eye, FileUp, Palette, Save, Sparkles } from 'lucide-react'
import { apiCoXacThuc, layAccessToken, layNguoiDung } from '../../lib/auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

type ThemePortfolio = 'professional' | 'modern' | 'creative'

type UngVien = {
  id: string
  maNguoiDung: string
}

type HoSo = {
  id: string
  maUngVien: string
  tieuDe: string
  cvChinh: boolean
}

type Portfolio = {
  id: string
  maHoSoNangLuc: string
  tieuDe: string
  markdown: string
  theme: ThemePortfolio
  mauChinh: string
  mauPhu: string
  font: string
}

const markdownMau = `# About me
I build practical web products with React, TypeScript, Node.js and clean product thinking.

## Highlights
- Strong ownership from UI to API
- Experience with authentication, dashboards and data-driven features
- Prefer simple systems that users can actually understand

## Career goal
Looking for a developer role where I can ship reliable products and keep growing with a strong engineering team.`

const themes: Array<{ value: ThemePortfolio; label: string; note: string }> = [
  { value: 'professional', label: 'Professional', note: 'Gon, sang, hop voi developer/backend/fullstack.' },
  { value: 'modern', label: 'Modern Developer', note: 'Nen toi, noi bat ky nang va san pham.' },
  { value: 'creative', label: 'Creative', note: 'Mem hon cho frontend, UI/UX, product engineer.' },
]

const fonts = ['Inter', 'System', 'Georgia', 'Mono']

function cardStyle(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    background: '#ffffff',
    border: '1px solid #dbe4f0',
    borderRadius: 8,
    boxShadow: '0 18px 48px rgba(15,23,42,0.08)',
    ...extra,
  }
}

function labelStyle(): React.CSSProperties {
  return { display: 'grid', gap: 8, fontSize: 13, fontWeight: 800, color: '#1e293b' }
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '11px 12px',
    fontSize: 14,
    outline: 'none',
    background: '#fff',
  }
}

async function taiFileHtml(id: string) {
  const token = layAccessToken()
  const res = await fetch(`${API_URL}/portfolio/${id}/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(await res.text() || 'Không tải được index.html')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'index.html'
  a.click()
  URL.revokeObjectURL(url)
}

export default function PortfolioGeneratorPage() {
  const nguoiDung = layNguoiDung()
  const [ungVien, setUngVien] = useState<UngVien | null>(null)
  const [hoSo, setHoSo] = useState<HoSo[]>([])
  const [portfolioId, setPortfolioId] = useState('')
  const [danhSachPortfolio, setDanhSachPortfolio] = useState<Portfolio[]>([])
  const [tieuDe, setTieuDe] = useState('Portfolio IT')
  const [maHoSoNangLuc, setMaHoSoNangLuc] = useState('')
  const [markdown, setMarkdown] = useState(markdownMau)
  const [theme, setTheme] = useState<ThemePortfolio>('professional')
  const [mauChinh, setMauChinh] = useState('#2563eb')
  const [mauPhu, setMauPhu] = useState('#0f172a')
  const [font, setFont] = useState('Inter')
  const [previewHtml, setPreviewHtml] = useState('')
  const [dangXuLy, setDangXuLy] = useState(false)
  const [thongBao, setThongBao] = useState('')

  const hoSoChinh = useMemo(() => hoSo.find(item => item.cvChinh) ?? hoSo[0], [hoSo])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [dsUngVien, dsHoSo] = await Promise.all([
          apiCoXacThuc('/ungvien'),
          apiCoXacThuc('/hosonangluc'),
        ])
        if (!active) return
        const uv = (dsUngVien as UngVien[]).find(item => item.maNguoiDung === nguoiDung?.id) ?? null
        const cvs = uv ? (dsHoSo as HoSo[]).filter(item => item.maUngVien === uv.id) : []
        const portfolios = uv ? await apiCoXacThuc('/portfolio').catch(() => []) as Portfolio[] : []
        if (!active) return
        setUngVien(uv)
        setHoSo(cvs)
        setDanhSachPortfolio(portfolios)
        const cvChinh = cvs.find(item => item.cvChinh) ?? cvs[0]
        if (cvChinh) {
          setMaHoSoNangLuc(cvChinh.id)
          setTieuDe(`Portfolio - ${cvChinh.tieuDe}`)
        }
        if (portfolios[0]) napPortfolio(portfolios[0])
      } catch (error) {
        setThongBao(error instanceof Error ? error.message : 'Không tải được dữ liệu portfolio')
      }
    }
    load()
    return () => { active = false }
  }, [nguoiDung?.id])

  function napPortfolio(portfolio: Portfolio) {
    setPortfolioId(portfolio.id)
    setTieuDe(portfolio.tieuDe)
    setMaHoSoNangLuc(portfolio.maHoSoNangLuc)
    setMarkdown(portfolio.markdown || markdownMau)
    setTheme(portfolio.theme)
    setMauChinh(portfolio.mauChinh)
    setMauPhu(portfolio.mauPhu)
    setFont(portfolio.font)
  }

  function payload() {
    return { maHoSoNangLuc, tieuDe, markdown, theme, mauChinh, mauPhu, font }
  }

  async function luuPortfolio() {
    if (!maHoSoNangLuc) {
      setThongBao('Bạn cần tạo hoặc chọn CV chính trước khi tạo portfolio.')
      return ''
    }
    setDangXuLy(true)
    setThongBao('')
    try {
      const duLieu = portfolioId
        ? await apiCoXacThuc(`/portfolio/${portfolioId}`, { method: 'PATCH', body: JSON.stringify(payload()) })
        : await apiCoXacThuc('/portfolio', { method: 'POST', body: JSON.stringify(payload()) })
      const portfolio = duLieu as Portfolio
      setPortfolioId(portfolio.id)
      setDanhSachPortfolio(prev => [portfolio, ...prev.filter(item => item.id !== portfolio.id)])
      setThongBao('Đã lưu portfolio.')
      return portfolio.id
    } catch (error) {
      setThongBao(error instanceof Error ? error.message : 'Lưu portfolio thất bại')
      return ''
    } finally {
      setDangXuLy(false)
    }
  }

  async function xemTruoc() {
    const id = portfolioId || await luuPortfolio()
    if (!id) return
    setDangXuLy(true)
    setThongBao('')
    try {
      const duLieu = await apiCoXacThuc(`/portfolio/${id}/preview`, {
        method: 'POST',
        body: JSON.stringify(payload()),
      }) as { html: string }
      setPreviewHtml(duLieu.html)
      setThongBao('Preview đã cập nhật.')
    } catch (error) {
      setThongBao(error instanceof Error ? error.message : 'Preview thất bại')
    } finally {
      setDangXuLy(false)
    }
  }

  async function taiIndexHtml() {
    const id = portfolioId || await luuPortfolio()
    if (!id) return
    setDangXuLy(true)
    setThongBao('')
    try {
      await taiFileHtml(id)
      setThongBao('Đã xuất file index.html.')
    } catch (error) {
      setThongBao(error instanceof Error ? error.message : 'Xuất file thất bại')
    } finally {
      setDangXuLy(false)
    }
  }

  function docFileMd(file?: File) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.md')) {
      setThongBao('Chỉ nhận file .md')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setMarkdown(String(reader.result ?? ''))
    reader.readAsText(file, 'utf-8')
  }

  if (!ungVien) {
    return (
      <div style={cardStyle({ padding: 28 })}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Portfolio HTML</h1>
        <p style={{ color: '#64748b' }}>Bạn cần tạo hồ sơ ứng viên trước khi dùng chức năng này.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <p className="eyebrow" style={{ margin: 0, color: '#2563eb' }}>Portfolio Generator</p>
          <h1 style={{ margin: '4px 0 6px', fontSize: 32, letterSpacing: 0 }}>Tạo index.html từ Markdown + CV chính</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Upload hoặc paste Markdown, chọn theme/màu, preview realtime và xuất file HTML standalone.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="ghost-button" onClick={luuPortfolio} disabled={dangXuLy}>
            <Save size={17} /> Lưu
          </button>
          <button className="ghost-button" onClick={xemTruoc} disabled={dangXuLy}>
            <Eye size={17} /> Preview
          </button>
          <button className="primary-button" onClick={taiIndexHtml} disabled={dangXuLy}>
            <Download size={17} /> Tải index.html
          </button>
        </div>
      </div>

      {thongBao && <div style={cardStyle({ padding: '12px 14px', color: '#334155', fontWeight: 700 })}>{thongBao}</div>}

      {!hoSoChinh ? (
        <div style={cardStyle({ padding: 24 })}>
          <h2 style={{ marginTop: 0 }}>Chưa có CV chính</h2>
          <p style={{ color: '#64748b' }}>Hãy tạo hồ sơ năng lực/CV chính trước. Portfolio sẽ lấy tên, kỹ năng, kinh nghiệm, dự án và học vấn từ CV đó để output đầy đủ.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 520px) minmax(360px, 1fr)', gap: 18, alignItems: 'start' }}>
          <section style={cardStyle({ padding: 18, display: 'grid', gap: 14 })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={20} color="#2563eb" />
              <h2 style={{ margin: 0, fontSize: 20 }}>Nội dung và giao diện</h2>
            </div>

            {danhSachPortfolio.length > 0 && (
              <label style={labelStyle()}>
                Portfolio đã lưu
                <select style={inputStyle()} value={portfolioId} onChange={e => {
                  const portfolio = danhSachPortfolio.find(item => item.id === e.target.value)
                  if (portfolio) napPortfolio(portfolio)
                }}>
                  {danhSachPortfolio.map(item => <option key={item.id} value={item.id}>{item.tieuDe}</option>)}
                </select>
              </label>
            )}

            <label style={labelStyle()}>
              Tiêu đề
              <input style={inputStyle()} value={tieuDe} onChange={e => setTieuDe(e.target.value)} />
            </label>

            <label style={labelStyle()}>
              CV nguồn
              <select style={inputStyle()} value={maHoSoNangLuc} onChange={e => setMaHoSoNangLuc(e.target.value)}>
                {hoSo.map(item => <option key={item.id} value={item.id}>{item.tieuDe}{item.cvChinh ? ' - CV chính' : ''}</option>)}
              </select>
            </label>

            <label style={labelStyle()}>
              Upload Markdown
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="file" accept=".md,text/markdown" onChange={e => docFileMd(e.target.files?.[0])} style={{ ...inputStyle(), padding: 9 }} />
                <FileUp size={20} color="#475569" />
              </span>
            </label>

            <label style={labelStyle()}>
              Markdown
              <textarea
                value={markdown}
                onChange={e => setMarkdown(e.target.value)}
                rows={16}
                style={{ ...inputStyle(), resize: 'vertical', fontFamily: 'Consolas, monospace', lineHeight: 1.55 }}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={labelStyle()}>
                Theme
                <select style={inputStyle()} value={theme} onChange={e => setTheme(e.target.value as ThemePortfolio)}>
                  {themes.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label style={labelStyle()}>
                Font
                <select style={inputStyle()} value={font} onChange={e => setFont(e.target.value)}>
                  {fonts.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={labelStyle()}>
                Màu chính
                <input type="color" value={mauChinh} onChange={e => setMauChinh(e.target.value)} style={{ ...inputStyle(), height: 46, padding: 6 }} />
              </label>
              <label style={labelStyle()}>
                Màu phụ
                <input type="color" value={mauPhu} onChange={e => setMauPhu(e.target.value)} style={{ ...inputStyle(), height: 46, padding: 6 }} />
              </label>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              {themes.map(item => (
                <button
                  key={item.value}
                  onClick={() => setTheme(item.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    textAlign: 'left',
                    border: item.value === theme ? '2px solid #2563eb' : '1px solid #dbe4f0',
                    background: '#fff',
                    borderRadius: 8,
                    padding: 12,
                    cursor: 'pointer',
                  }}
                >
                  <Palette size={18} color={item.value === theme ? '#2563eb' : '#64748b'} />
                  <span><strong>{item.label}</strong><br /><small style={{ color: '#64748b' }}>{item.note}</small></span>
                </button>
              ))}
            </div>
          </section>

          <section style={cardStyle({ padding: 12, position: 'sticky', top: 16 })}>
            <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px' }}>
              <strong>Preview index.html</strong>
              <button className="ghost-button" onClick={xemTruoc} disabled={dangXuLy} style={{ padding: '8px 12px' }}>
                <Eye size={16} /> Cập nhật
              </button>
            </div>
            <iframe
              title="Portfolio preview"
              srcDoc={previewHtml || '<!doctype html><html><body style="font-family:Arial,sans-serif;padding:32px;color:#475569"><h2>Chưa có preview</h2><p>Bấm Preview để tạo bản xem trước từ Markdown và CV chính.</p></body></html>'}
              style={{ width: '100%', height: 'calc(100vh - 210px)', minHeight: 620, border: '1px solid #dbe4f0', borderRadius: 8, background: '#fff' }}
            />
          </section>
        </div>
      )}
    </div>
  )
}
