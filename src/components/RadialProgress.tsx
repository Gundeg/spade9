import { useEffect, useState, type ReactNode } from 'react'

export function RadialProgress({ value, size = 168, stroke = 10, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(Math.max(0, Math.min(1, value))))
    return () => cancelAnimationFrame(id)
  }, [value])
  return (
    <div className="radial" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F1D77A" />
            <stop offset="1" stopColor="#9C7C1F" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#262626" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#rg)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - shown)} />
      </svg>
      <div className="radial-center">{children}</div>
    </div>
  )
}
