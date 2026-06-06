export type NormalizedSkill = {
  id: string
  ten: string
  loai: string
}

function text(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

export function normalizeSkill(raw: unknown): NormalizedSkill | null {
  const item = object(raw)
  const nested = object(item.maKyNang)
  const id =
    text(nested.id) ||
    text(nested._id) ||
    text(item.maKyNang) ||
    text(item.id) ||
    text(item._id) ||
    text(item.tenKyNang)
  const ten = text(item.tenKyNang) || text(nested.tenKyNang) || text(item.ten) || id
  const loai = text(item.loaiKyNang) || text(nested.loaiKyNang) || text(item.loai) || 'khac'

  if (!id || !ten) return null
  return { id, ten, loai }
}

export function normalizeSkills(raw: unknown): NormalizedSkill[] {
  return Array.isArray(raw)
    ? raw.map(normalizeSkill).filter((skill): skill is NormalizedSkill => Boolean(skill))
    : []
}
