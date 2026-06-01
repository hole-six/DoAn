import type { KyNang } from '../../../types/recruitment'
import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

export function SkillPicker({ skills, selected, onChange }: { skills: KyNang[]; selected: string[]; onChange: (next: string[]) => void }) {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!normalizedQuery) return skills
    return skills.filter(skill => `${skill.tenKyNang} ${skill.loaiKyNang ?? ''}`.toLowerCase().includes(normalizedQuery))
  }, [normalizedQuery, skills])
  const selectedSet = new Set(selected)
  const selectedSkills = skills.filter(skill => selectedSet.has(String(skill.id ?? skill._id ?? '')))

  return (
    <div className="grid gap-2">
      <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-slate-400 focus-within:border-sky-700 focus-within:ring-4 focus-within:ring-sky-100">
        <Search size={16} />
        <input className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm kỹ năng: React, Node, Java..." />
        {query && <button type="button" className="text-slate-400 hover:text-slate-700" onClick={() => setQuery('')}><X size={16} /></button>}
      </label>

      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-sky-100 bg-sky-50 p-2">
          {selectedSkills.map(skill => {
            const skillId = String(skill.id ?? skill._id ?? '')
            return (
              <button key={skillId} type="button" className="inline-flex h-8 items-center gap-1 rounded-full border border-sky-200 bg-white px-3 text-xs font-black text-sky-800" onClick={() => onChange(selected.filter(item => item !== skillId))}>
                {skill.tenKyNang}<X size={13} />
              </button>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-500">
        <span>{selected.length} kỹ năng đã chọn</span>
        {selected.length > 0 && <Button type="button" size="sm" variant="ghost" onClick={() => onChange([])}>Bỏ chọn tất cả</Button>}
      </div>

      <div className="grid max-h-64 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(skill => {
          const skillId = String(skill.id ?? skill._id ?? '')
          const checked = selected.includes(skillId)
          return (
            <button
              key={skillId}
              type="button"
              className={`min-h-10 rounded-lg border px-3 text-left text-xs font-bold transition-colors ${checked ? 'border-sky-300 bg-sky-100 text-sky-900' : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200'}`}
              onClick={() => onChange(checked ? selected.filter(item => item !== skillId) : [...selected, skillId])}
            >
              <span className="block truncate">{skill.tenKyNang}</span>
              {skill.loaiKyNang && <span className="mt-0.5 block truncate text-[11px] text-slate-400">{skill.loaiKyNang}</span>}
            </button>
          )
        })}
        {!filtered.length && <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center text-sm font-bold text-slate-400 sm:col-span-2 lg:col-span-3">Không tìm thấy kỹ năng.</div>}
      </div>
    </div>
  )
}
