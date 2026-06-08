const EMPLOYER_COMPANY_UPDATED_EVENT = 'itjob:employer-company-updated'

export function phatCapNhatCongTyNhaTuyenDung() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EMPLOYER_COMPANY_UPDATED_EVENT))
}

export function langNgheCapNhatCongTyNhaTuyenDung(handler: () => void) {
  if (typeof window === 'undefined') return () => {}
  const listener = () => handler()
  window.addEventListener(EMPLOYER_COMPANY_UPDATED_EVENT, listener)
  return () => window.removeEventListener(EMPLOYER_COMPANY_UPDATED_EVENT, listener)
}
