import { WifiOff, Wifi } from 'lucide-react'
import { useEffect, useState } from 'react'

export function OfflineIndicator() {
  const [online, setOnline] = useState(navigator.onLine)
  const [hienThi, setHienThi] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      setHienThi(true)
      // Ẩn sau 3 giây
      setTimeout(() => setHienThi(false), 3000)
    }

    const handleOffline = () => {
      setOnline(false)
      setHienThi(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!hienThi) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: online ? '#10b981' : '#ef4444',
        color: 'white',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 10000,
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      {online ? <Wifi size={20} /> : <WifiOff size={20} />}
      <div style={{ fontSize: 14, fontWeight: 500 }}>
        {online ? 'Đã kết nối internet' : 'Không có kết nối internet'}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
