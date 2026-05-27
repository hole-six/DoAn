import { Link } from 'react-router-dom'

interface Props { ten: string }

export default function TrangDangXayDung({ ten }: Props) {
  return (
    <main className="app-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <p className="eyebrow">Sắp ra mắt</p>
        <h1 style={{ fontSize: 42, marginTop: 8 }}>{ten}</h1>
        <p style={{ color: 'var(--on-surface-variant)', marginTop: 12 }}>Trang này đang được xây dựng.</p>
        <Link to="/" className="primary-button" style={{ marginTop: 24, display: 'inline-flex' }}>
          Về trang chủ
        </Link>
      </div>
    </main>
  )
}
