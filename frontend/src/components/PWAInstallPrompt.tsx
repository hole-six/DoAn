import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import AppIcon from './AppIcon'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [hienThiPrompt, setHienThiPrompt] = useState(false)
  const [daAn, setDaAn] = useState(false)
  const [needRefresh, setNeedRefresh] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      if (!localStorage.getItem('pwa-install-dismissed')) setHienThiPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const xuLyCaiDat = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setHienThiPrompt(false)
  }

  const xuLyDong = () => {
    setHienThiPrompt(false)
    setDaAn(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
    window.setTimeout(() => localStorage.removeItem('pwa-install-dismissed'), 7 * 24 * 60 * 60 * 1000)
  }

  if (daAn && !hienThiPrompt && !needRefresh) return null

  return (
    <>
      {hienThiPrompt && !daAn && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          maxWidth: 400,
          width: '90%',
          zIndex: 9999,
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AppIcon icon={Download} size={24} style={{ color: 'white' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Cài đặt ứng dụng</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Truy cập nhanh hơn và sử dụng như một ứng dụng riêng.</div>
          </div>
          <button onClick={xuLyCaiDat} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            ài đặt
          </button>
          <button onClick={xuLyDong} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
            <AppIcon icon={X} size={20} style={{ color: '#9ca3af' }} />
          </button>
        </div>
      )}

      {needRefresh && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10b981',
          color: 'white',
          borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 9999,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Co phien ban moi.</div>
          <button onClick={() => window.location.reload()} style={{ background: 'white', color: '#10b981', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Cap nhat
          </button>
          <button onClick={() => setNeedRefresh(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
            <AppIcon icon={X} size={18} style={{ color: 'white' }} />
          </button>
        </div>
      )}
    </>
  )
}
