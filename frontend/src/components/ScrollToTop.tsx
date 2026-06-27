import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop Component
 * Automatically scrolls to top of page when route changes
 * 
 * Usage: Place inside <BrowserRouter> in App component
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
