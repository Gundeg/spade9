import { useEffect, useState } from 'react'

export function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const ms = Math.max(0, new Date(to).getTime() - now)
  const days = Math.floor(ms / 86_400_000)
  const hours = Math.floor((ms % 86_400_000) / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  return (
    <div className="countdown" role="timer" aria-live="off" aria-label={`${days} days ${hours} hours ${minutes} minutes`}>
      <div><b>{days}</b><small>Өдөр</small></div>
      <div><b>{String(hours).padStart(2, '0')}</b><small>Цаг</small></div>
      <div><b>{String(minutes).padStart(2, '0')}</b><small>Минут</small></div>
    </div>
  )
}
