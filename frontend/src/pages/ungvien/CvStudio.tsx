import { useEffect, useMemo, useState } from 'react'
import { Brain, FileUp, ImagePlus, LayoutTemplate, Save, Wand2 } from 'lucide-react'
import { apiCoXacThuc } from '../../lib/auth'

type CvItem = { tieuDe?: string; donVi?: string; thoiGian?: string; moTa?: string }
type CvData = {
  id?: string
  maUngVien?: string
  tieuDe: string
  hocVan: CvItem[]
  kinhNghiemLam: CvItem[]
  chungChi: CvItem[]
  duAn: CvItem[]
  cvChinh: boolean
  congKhai: boolean
  anhDaiDien?: string
  templateCv?: string
  mauChinh?: string
  mauPhu?: string
  font?: string
  markdownGoc?: string
  ghiChuAi?: string
}

type TemplateCv = {
  id: string
  ten: string
  layout: 'split' | 'hero' | 'timeline' | 'compact' | 'editorial' | 'minimal'
  mauChinh: string
  mauPhu: string
  font: string
}

const palettes = [
  ['#2563eb', '#0f172a'], ['#059669', '#10231c'], ['#dc2626', '#1f2937'], ['#7c3aed', '#18181b'],
  ['#0891b2', '#164e63'], ['#ea580c', '#111827'], ['#be123c', '#312e81'], ['#0d9488', '#134e4a'],
]
const layouts: TemplateCv['layout'][] = ['split', 'hero', 'timeline', 'compact', 'editorial', 'minimal']
const templates: TemplateCv[] = layouts.flatMap((layout, layoutIndex) => palettes.map(([mauChinh, mauPhu], index) => ({
  id: `${layout}-${index + 1}`,
  ten: `${layout[0].toUpperCase()}${layout.slice(1)} ${index + 1}`,
  layout,
  mauChinh,
  mauPhu,
  font: layoutIndex % 3 === 0 ? 'Inter' : layoutIndex % 3 === 1 ? 'System' : 'Georgia',
})))

const emptyCv: CvData = {
  tieuDe: 'CV Developer chuyen nghiep',
  hocVan: [],
  kinhNghiemLam: [],
  chungChi: [],
  duAn: [],
  cvChinh: true,
  congKhai: true,
  templateCv: templates[0].id,
  mauChinh: templates[0].mauChinh,
  mauPhu: templates[0].mauPhu,
  font: templates[0].font,
  markdownGoc: '',
}

function parseMarkdown(markdown: string) {
  const groups: Record<string, string[]> = {}
  let current = 'tomTat'
  markdown.split(/\r?\n/).forEach(line => {
    const heading = line.match(/^#{1,3}\s+(.+)/)
    if (heading) {
      current = heading[1].toLowerCase()
      groups[current] = groups[current] ?? []
      return
    }
    if (line.trim()) groups[current] = [...(groups[current] ?? []), line.replace(/^[-*]\s+/, '').trim()]
  })
  const toItems = (keys: string[]) => Object.entries(groups)
    .filter(([name]) => keys.some(k => name.includes(k)))
    .flatMap(([, lines]) => lines)
    .map(line => ({ tieuDe: line, donVi: '', thoiGian: '', moTa: '' }))
  return {
    tomTat: (groups.tomtat ?? groups['about me'] ?? groups.summary ?? []).join(' '),
    kinhNghiemLam: toItems(['experience', 'kinh nghiệm', 'work']),
    duAn: toItems(['project', 'dự án']),
    hocVan: toItems(['education', 'học vấn']),
    chungChi: toItems(['cert', 'chứng chỉ']),
  }
}

function fieldStyle(): React.CSSProperties {
  return { width: '100%', border: '1px solid #d6e0ee', borderRadius: 8, padding: '10px 12px', fontSize: 14 }
}

function sectionTitle(label: string) {
  return <h3 style={{ margin: '10px 0 8px', fontSize: 15, color: '#0f172a' }}>{label}</h3>
}

function itemText(items: CvItem[]) {
  return items.length ? items : [{ tieuDe: 'Chua cap nhat', donVi: '', thoiGian: '', moTa: '' }]
}

function updateList(list: CvItem[], index: number, patch: Partial<CvItem>) {
  return list.map((item, i) => i === index ? { ...item, ...patch } : item)
}

export default function CvStudio({ data, onReload }: { data: any; onReload: () => Promise<void> }) {
  const [cv, setCv] = useState<CvData>(emptyCv)
  const [profile, setProfile] = useState<any>({})
  const [thongBao, setThongBao] = useState('')
  const selectedTemplate = useMemo(() => templates.find(item => item.id === cv.templateCv) ?? templates[0], [cv.templateCv])

  useEffect(() => {
    if (data.ungVien) setProfile({ ...data.ungVien })
    const main = data.hoSo?.find((item: any) => item.cvChinh) ?? data.hoSo?.[0]
    if (main) setCv({ ...emptyCv, ...main })
  }, [data.ungVien?.id, data.hoSo?.length])

  function chonTemplate(template: TemplateCv) {
    setCv({ ...cv, templateCv: template.id, mauChinh: template.mauChinh, mauPhu: template.mauPhu, font: template.font })
  }

  function docAnh(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const anhDaiDien = String(reader.result ?? '')
      setCv({ ...cv, anhDaiDien })
      setProfile({ ...profile, anhDaiDien })
    }
    reader.readAsDataURL(file)
  }

  function docFile(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const markdown = String(reader.result ?? '')
      const parsed = parseMarkdown(markdown)
      setCv({
        ...cv,
        markdownGoc: markdown,
        kinhNghiemLam: parsed.kinhNghiemLam.length ? parsed.kinhNghiemLam : cv.kinhNghiemLam,
        duAn: parsed.duAn.length ? parsed.duAn : cv.duAn,
        hocVan: parsed.hocVan.length ? parsed.hocVan : cv.hocVan,
        chungChi: parsed.chungChi.length ? parsed.chungChi : cv.chungChi,
      })
      if (parsed.tomTat) setProfile({ ...profile, tomTat: parsed.tomTat })
    }
    reader.readAsText(file, 'utf-8')
  }

  function goiYAi() {
    const viTri = profile.viTriMongMuon || 'Frontend Developer'
    setProfile({
      ...profile,
      tomTat: `Ung vien ${viTri} co tu duy san pham, nam vung quy trinh xay dung web app hien dai, uu tien trai nghiem nguoi dung, chat luong code va kha nang phoi hop voi backend/nhan su san pham.`,
    })
    setCv({
      ...cv,
      ghiChuAi: 'Da goi y tom tat va cau truc CV theo huong tuyen dung IT. Ban co the chinh sua truc tiep truoc khi luu.',
      duAn: cv.duAn.length ? cv.duAn : [
        { tieuDe: 'ITJob Recruitment Platform', donVi: 'Personal/School Project', thoiGian: '2025', moTa: 'Xay dung he thong tuyen dung IT voi dashboard ung vien, nha tuyen dung, quan tri vien, tim kiem viec lam va ung tuyen nhanh.' },
      ],
    })
  }

  async function luuStudio() {
    if (!data.ungVien?.id) return
    await apiCoXacThuc(`/ungvien/${data.ungVien.id}`, { method: 'PATCH', body: JSON.stringify({ ...profile, maNguoiDung: data.ungVien.maNguoiDung }) })
    const payload = { ...cv, maUngVien: data.ungVien.id }
    await apiCoXacThuc(`/hosonangluc${cv.id ? `/${cv.id}` : ''}`, { method: cv.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
    setThongBao('Da luu CV Studio va dong bo vao ho so nang luc.')
    await onReload()
  }

  function renderEditor(label: string, key: 'kinhNghiemLam' | 'duAn' | 'hocVan' | 'chungChi') {
    const list = cv[key] ?? []
    return <div style={{ display: 'grid', gap: 8 }}>
      {sectionTitle(label)}
      {list.map((item, index) => <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <input style={fieldStyle()} placeholder="Tieu de" value={item.tieuDe ?? ''} onChange={e => setCv({ ...cv, [key]: updateList(list, index, { tieuDe: e.target.value }) })} />
        <input style={fieldStyle()} placeholder="Don vi / cong ty" value={item.donVi ?? ''} onChange={e => setCv({ ...cv, [key]: updateList(list, index, { donVi: e.target.value }) })} />
        <input style={fieldStyle()} placeholder="Thoi gian" value={item.thoiGian ?? ''} onChange={e => setCv({ ...cv, [key]: updateList(list, index, { thoiGian: e.target.value }) })} />
        <input style={fieldStyle()} placeholder="Mo ta ngan" value={item.moTa ?? ''} onChange={e => setCv({ ...cv, [key]: updateList(list, index, { moTa: e.target.value }) })} />
      </div>)}
      <button type="button" className="uv-secondary" onClick={() => setCv({ ...cv, [key]: [...list, { tieuDe: '', donVi: '', thoiGian: '', moTa: '' }] })}>Them {label.toLowerCase()}</button>
    </div>
  }

  return (
    <section className="uv-panel" style={{ display: 'grid', gap: 18, border: '1px solid #bfdbfe' }}>
      <div className="uv-panel-head">
        <div>
          <h2>CV Studio hoanh trang</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Chon trong {templates.length} mau sinh san, upload anh/file, preview va chinh sua truc tiep.</p>
        </div>
        <button className="primary-button" onClick={luuStudio}><Save size={16} /> Luu Studio</button>
      </div>
      {thongBao && <div className="uv-error" style={{ background: '#ecfdf5', color: '#166534' }}>{thongBao}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 420px) 1fr', gap: 18, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label className="uv-secondary" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ImagePlus size={16} /> Upload anh
              <input hidden type="file" accept="image/*" onChange={e => docAnh(e.target.files?.[0])} />
            </label>
            <label className="uv-secondary" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <FileUp size={16} /> Upload file
              <input hidden type="file" accept=".md,.txt,.json,text/*" onChange={e => docFile(e.target.files?.[0])} />
            </label>
          </div>
          <button type="button" className="uv-secondary" onClick={goiYAi} style={{ justifyContent: 'center' }}>
            <Brain size={16} /> Goi y noi dung kieu AI
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input style={fieldStyle()} value={cv.tieuDe} onChange={e => setCv({ ...cv, tieuDe: e.target.value })} placeholder="Tieu de CV" />
            <input style={fieldStyle()} value={profile.viTriMongMuon ?? ''} onChange={e => setProfile({ ...profile, viTriMongMuon: e.target.value })} placeholder="Vi tri mong muon" />
          </div>
          <textarea style={{ ...fieldStyle(), minHeight: 92 }} value={profile.tomTat ?? ''} onChange={e => setProfile({ ...profile, tomTat: e.target.value })} placeholder="Tom tat ban than" />

          <div>
            <h3 style={{ margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}><LayoutTemplate size={17} /> Thu vien template</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxHeight: 280, overflow: 'auto' }}>
              {templates.map(template => <button key={template.id} type="button" onClick={() => chonTemplate(template)} title={template.ten} style={{
                height: 72,
                border: cv.templateCv === template.id ? '2px solid #2563eb' : '1px solid #dbe4f0',
                borderRadius: 8,
                background: '#fff',
                padding: 6,
                display: 'grid',
                gap: 4,
                cursor: 'pointer',
              }}>
                <span style={{ height: 18, borderRadius: 4, background: template.mauChinh }} />
                <span style={{ height: 24, borderRadius: 4, background: template.layout === 'split' ? `linear-gradient(90deg, ${template.mauPhu} 0 34%, #f8fafc 34%)` : template.layout === 'hero' ? `linear-gradient(135deg, ${template.mauChinh}, ${template.mauPhu})` : '#f8fafc' }} />
                <small style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{template.ten}</small>
              </button>)}
            </div>
          </div>

          {renderEditor('Kinh nghiem', 'kinhNghiemLam')}
          {renderEditor('Du an', 'duAn')}
          {renderEditor('Hoc van', 'hocVan')}
          {renderEditor('Chung chi', 'chungChi')}
        </div>

        <div style={{ position: 'sticky', top: 14 }}>
          <div style={{ background: '#eef4ff', border: '1px solid #dbeafe', borderRadius: 8, padding: 10, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wand2 size={16} color="#2563eb" />
            <strong>Preview: {selectedTemplate.ten}</strong>
          </div>
          <div style={{
            minHeight: 760,
            background: '#fff',
            border: '1px solid #dbe4f0',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 28px 80px rgba(15,23,42,.16)',
            fontFamily: selectedTemplate.font === 'Georgia' ? 'Georgia, serif' : selectedTemplate.font === 'System' ? 'system-ui, sans-serif' : 'Inter, Arial, sans-serif',
          }}>
            <div style={{
              display: selectedTemplate.layout === 'split' ? 'grid' : 'block',
              gridTemplateColumns: selectedTemplate.layout === 'split' ? '230px 1fr' : undefined,
              minHeight: 760,
            }}>
              <aside style={{
                background: selectedTemplate.layout === 'split' ? selectedTemplate.mauPhu : selectedTemplate.layout === 'hero' ? `linear-gradient(135deg, ${selectedTemplate.mauChinh}, ${selectedTemplate.mauPhu})` : '#f8fafc',
                color: selectedTemplate.layout === 'split' || selectedTemplate.layout === 'hero' ? '#fff' : '#0f172a',
                padding: 28,
              }}>
                <div style={{ width: 116, height: 116, borderRadius: selectedTemplate.layout === 'editorial' ? 8 : 999, overflow: 'hidden', background: '#dbeafe', marginBottom: 18, border: '4px solid rgba(255,255,255,.45)' }}>
                  {cv.anhDaiDien || profile.anhDaiDien ? <img src={cv.anhDaiDien || profile.anhDaiDien} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', fontWeight: 900 }}>IMG</div>}
                </div>
                <h1 style={{ margin: 0, fontSize: selectedTemplate.layout === 'compact' ? 28 : 38, lineHeight: 1.02 }}>{data.current?.hoTen ?? 'Ung vien IT'}</h1>
                <p style={{ fontWeight: 800, color: selectedTemplate.layout === 'split' || selectedTemplate.layout === 'hero' ? '#dbeafe' : selectedTemplate.mauChinh }}>{profile.viTriMongMuon || 'Software Developer'}</p>
                <p style={{ fontSize: 13 }}>{data.current?.email}</p>
                <p style={{ fontSize: 13 }}>{data.current?.soDienThoai}</p>
              </aside>
              <main style={{ padding: selectedTemplate.layout === 'compact' ? 24 : 34 }}>
                <h2 style={{ marginTop: 0, color: selectedTemplate.mauPhu }}>Profile</h2>
                <p style={{ color: '#475569' }}>{profile.tomTat || 'Hay viet tom tat nghe nghiep de nha tuyen dung hieu nhanh gia tri cua ban.'}</p>
                <h2 style={{ color: selectedTemplate.mauPhu }}>Experience</h2>
                {itemText(cv.kinhNghiemLam).map((item, index) => <div key={index} style={{ borderLeft: selectedTemplate.layout === 'timeline' ? `3px solid ${selectedTemplate.mauChinh}` : 0, paddingLeft: selectedTemplate.layout === 'timeline' ? 14 : 0, marginBottom: 14 }}>
                  <strong>{item.tieuDe}</strong><p style={{ margin: '2px 0', color: selectedTemplate.mauChinh }}>{[item.donVi, item.thoiGian].filter(Boolean).join(' · ')}</p><p style={{ margin: 0, color: '#64748b' }}>{item.moTa}</p>
                </div>)}
                <h2 style={{ color: selectedTemplate.mauPhu }}>Projects</h2>
                {itemText(cv.duAn).map((item, index) => <div key={index} style={{ marginBottom: 12 }}><strong>{item.tieuDe}</strong><p style={{ margin: 0, color: '#64748b' }}>{item.moTa || item.donVi}</p></div>)}
                <h2 style={{ color: selectedTemplate.mauPhu }}>Education & Certificates</h2>
                {[...itemText(cv.hocVan), ...cv.chungChi].map((item, index) => <p key={index} style={{ margin: '6px 0' }}><strong>{item.tieuDe}</strong> <span style={{ color: '#64748b' }}>{item.donVi} {item.thoiGian}</span></p>)}
              </main>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
