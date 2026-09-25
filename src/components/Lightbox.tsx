import { useEffect, useMemo, useState } from 'react'
import type { PortfolioItem } from '../data/types'
import { Icon } from './Icon'
import { Photo } from './Photo'

interface Props {
  title: string
  items: PortfolioItem[]
  onClose: () => void
}

export function Lightbox({ title, items, onClose }: Props) {
  const tags = useMemo(() => ['All', ...Array.from(new Set(items.flatMap((i) => i.tags)))], [items])
  const [tag, setTag] = useState('All')
  const [idx, setIdx] = useState(0)
  const filtered = tag === 'All' ? items : items.filter((i) => i.tags.includes(tag))
  const current = filtered[Math.min(idx, filtered.length - 1)]

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % filtered.length)
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + filtered.length) % filtered.length)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [filtered.length, onClose])

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title} portfolio`}>
      <div className="lightbox-top">
        <div>
          <span className="eyebrow" style={{ margin: 0 }}>Portfolio</span>
          <h3 style={{ margin: 0 }}>{title}</h3>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close gallery">
          <Icon name="close" />
        </button>
        <div className="row wrap" style={{ width: '100%' }}>
          {tags.map((t) => (
            <button key={t} className={`chip ${t === tag ? 'active' : ''}`} onClick={() => { setTag(t); setIdx(0) }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="lightbox-stage" style={{ position: 'relative' }}>
        {current && (
          <div key={current.id} className="rise" style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
            <Photo src={current.src} alt={current.title} hue={current.hue} label={current.title} eager />
            <div className="small muted">{current.title} · {current.tags.join(', ')}</div>
          </div>
        )}
        {filtered.length > 1 && (
          <>
            <button className="icon-btn lb-nav" style={{ left: 16 }} aria-label="Previous" onClick={() => setIdx((i) => (i - 1 + filtered.length) % filtered.length)}>
              <Icon name="left" />
            </button>
            <button className="icon-btn lb-nav" style={{ right: 16 }} aria-label="Next" onClick={() => setIdx((i) => (i + 1) % filtered.length)}>
              <Icon name="right" />
            </button>
          </>
        )}
      </div>
      <div className="lightbox-strip">
        {filtered.map((it, i) => (
          <button key={it.id} className={it === current ? 'active' : ''} onClick={() => setIdx(i)} aria-label={it.title}>
            <Photo src={it.src} alt={it.title} hue={it.hue} />
          </button>
        ))}
      </div>
    </div>
  )
}
