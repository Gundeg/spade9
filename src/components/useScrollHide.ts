import { useEffect, useState } from 'react'

/** Hidden while scrolling down past `threshold`, shown again on any upward scroll. */
export function useScrollHide(threshold = 120) {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    let last = window.scrollY
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        setHidden(y > threshold && y > last)
        setScrolled(y > 20)
        last = y
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return { hidden, scrolled }
}
