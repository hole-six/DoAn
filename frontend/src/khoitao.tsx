import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './nenchung.css'
import UngDung from './ungdung.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UngDung />
  </StrictMode>,
)
