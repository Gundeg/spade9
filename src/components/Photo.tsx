import { useState, type CSSProperties } from 'react'

interface Props {
  src?: string
  alt: string
  hue?: number
  label?: string
  ratio?: string
  eager?: boolean
}

/**
 * Lazy-loaded photo. Until real photography is supplied (`src`), renders a
 * toned, textured placeholder so layouts can be reviewed with the right proportions.
 */
export function Photo({ src, alt, hue = 35, label, ratio, eager }: Props) {
  const [loaded, setLoaded] = useState(false)
  const style = {
    ...(ratio ? { '--ar': ratio } : {}),
    backgroundImage: `radial-gradient(ellipse 70% 60% at 50% 30%, hsla(${hue}, 45%, 38%, 0.55), transparent 70%),
      radial-gradient(circle at 50% 42%, hsla(${hue}, 20%, 22%, 0.9) 0 18%, transparent 19%),
      radial-gradient(ellipse 34% 28% at 50% 88%, hsla(${hue}, 18%, 18%, 0.9), transparent 70%),
      repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 7px),
      linear-gradient(180deg, hsl(${hue}, 12%, 14%), hsl(${hue}, 8%, 7%))`,
  } as CSSProperties
  return (
    <div className="ph" style={style} role="img" aria-label={alt}>
      {src ? (
        <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className={loaded ? 'loaded' : ''} onLoad={() => setLoaded(true)} />
      ) : (
        label && (
          <div className="ph-art">
            <span>{label}</span>
          </div>
        )
      )}
    </div>
  )
}
