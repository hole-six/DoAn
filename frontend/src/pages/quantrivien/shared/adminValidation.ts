export type Errors = Record<string, string>

export function required(value: unknown, label: string) {
  return value === undefined || value === null || String(value).trim() === '' ? `${label} là bắt buộc` : ''
}

export function minLen(value: string, min: number, label: string) {
  return value.trim().length < min ? `${label} tối thiểu ${min} ký tự` : ''
}

export function collectErrors(entries: Array<[string, string]>) {
  return entries.reduce<Errors>((acc, [key, value]) => {
    if (value) acc[key] = value
    return acc
  }, {})
}
