const EMPLOYER_COMPANY_UPDATED_EVENT = 'itjob:employer-company-updated'
const EMPLOYER_COMPANY_UPDATED_STORAGE_KEY = 'itjob:employer-company-updated-at'

export function phatCapNhatCongTyNhaTuyenDung() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EMPLOYER_COMPANY_UPDATED_EVENT))
  try {
    window.localStorage.setItem(EMPLOYER_COMPANY_UPDATED_STORAGE_KEY, String(Date.now()))
  } catch {
    // ignore
  }
}

export function langNgheCapNhatCongTyNhaTuyenDung(handler: () => void) {
  if (typeof window === 'undefined') return () => {}
  const listener = () => handler()
  const storageListener = (event: StorageEvent) => {
    if (event.key === EMPLOYER_COMPANY_UPDATED_STORAGE_KEY) handler()
  }
  window.addEventListener(EMPLOYER_COMPANY_UPDATED_EVENT, listener)
  window.addEventListener('storage', storageListener)
  return () => {
    window.removeEventListener(EMPLOYER_COMPANY_UPDATED_EVENT, listener)
    window.removeEventListener('storage', storageListener)
  }
}
