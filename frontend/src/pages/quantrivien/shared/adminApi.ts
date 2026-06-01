import { apiCoXacThuc } from '../../../lib/auth'

export const adminApi = {
  list: <T,>(path: string) => apiCoXacThuc(path) as Promise<T[]>,
  create: <T,>(path: string, body: unknown) => apiCoXacThuc(path, { method: 'POST', body: JSON.stringify(body) }) as Promise<T>,
  update: <T,>(path: string, body: unknown) => apiCoXacThuc(path, { method: 'PATCH', body: JSON.stringify(body) }) as Promise<T>,
  remove: (path: string) => apiCoXacThuc(path, { method: 'DELETE' }),
  action: <T,>(path: string, body?: unknown) => apiCoXacThuc(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }) as Promise<T>,
}
