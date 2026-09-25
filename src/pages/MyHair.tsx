import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Photo } from '../components/Photo'
import { BARBERS, SERVICES } from '../data/mock'
import type { VisitPhoto } from '../data/types'
import { COLOR_REFRESH_DAYS } from '../lib/crm'
import { fmtDate } from '../lib/format'
import { useMember, useStore } from '../lib/store'

const TABS = [
  { id: 'overview', label: 'Ерөнхий' },
  { id: 'color', label: 'Өнгөний түүх' },
  { id: 'photos', label: 'Өмнөх зураг' },
  { id: 'notes', label: 'Stylist-ийн санал' },
  { id: 'visits', label: 'Visits' },
] as const

const barberName = (id: string) => BARBERS.find((b) => b.id === id)?.name ?? '—'

function Compare({ before, after }: { before: VisitPhoto; after: VisitPhoto }) {
  const [pos, setPos] = useState(50)
  return (
    <div className="compare">
      <Photo alt={before.label} hue={before.hue} src={before.src} />
      <div className="compare-top" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Photo alt={after.label} hue={after.hue} src={after.src} />
      </div>
      <div className="compare-handle" style={{ left: `${pos}%` }} />
      <span className="compare-label" style={{ left: 12 }}>After</span>
      <span className="compare-label" style={{ right: 12 }}>Before</span>
      <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(+e.target.value)} aria-label="Before/after comparison slider" />
    </div>
  )
}

export default function MyHair() {
  const member = useMember()
  const { bookings } = useStore()
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('overview')
  const h = member.hair
  const lastColor = h.chemicalLogs[0]
  const daysSince = lastColor ? Math.floor((Date.now() - new Date(lastColor.date).getTime()) / 86_400_000) : null
  const visitDates = Array.from(new Set(h.photos.map((p) => p.date)))
  const [visit, setVisit] = useState(visitDates[0])
  const pair = {
    after: h.photos.find((p) => p.date === visit && p.label.startsWith('After')),
    before: h.photos.find((p) => p.date === visit && p.label.startsWith('Before')),
  }
  const history = bookings.filter((b) => b.status === 'completed').sort((a, b) => +new Date(b.start) - +new Date(a.start))

  return (
    <>
      <div className="page-title">
        <span className="eyebrow">Миний Үсчний Тэмдэглэл</span>
        <h1>Үсний Түүх</h1>
        <p className="muted" style={{ margin: 0 }}>Everything we know about your hair, so every visit starts where the last one ended.</p>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`chip ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="dash-grid rise">
          <div className="card">
            <span className="eyebrow">Attributes</span>
            <dl className="attr-grid" style={{ margin: 0 }}>
              <div className="attr"><dt>Hair type</dt><dd>{h.hairType}</dd></div>
              <div className="attr"><dt>Density</dt><dd>{h.density}</dd></div>
              <div className="attr"><dt>Growth pattern</dt><dd>{h.growthPattern}</dd></div>
              <div className="attr"><dt>Scalp</dt><dd>{h.scalp}</dd></div>
            </dl>
            <hr className="divider" />
            <span className="eyebrow">Дуртай style</span>
            <div className="row wrap">{h.favoriteStyles.map((s) => <span key={s} className="chip active">{s}</span>)}</div>
          </div>
          <div className="card gilded">
            <span className="eyebrow">Current color</span>
            {lastColor ? (
              <>
                <div className="row">
                  <div className="swatch" style={{ background: lastColor.hex }} />
                  <div>
                    <div>{lastColor.service}</div>
                    <div className="small muted">{lastColor.formula}</div>
                  </div>
                </div>
                <p className="small" style={{ marginTop: 16 }}>
                  {daysSince} days since last color.{' '}
                  {daysSince !== null && daysSince >= COLOR_REFRESH_DAYS ? <span className="gold">Refresh recommended.</span> : <span className="muted">Refresh at {COLOR_REFRESH_DAYS} days.</span>}
                </p>
                <Link className="btn btn-sm" to={`/app/book?barber=${lastColor.barberId}`}>Book a refresh</Link>
              </>
            ) : (
              <p className="muted">No color on record.</p>
            )}
            {h.notes[0] && (
              <>
                <hr className="divider" />
                <span className="eyebrow">Дараагийн удаа юу хийх санал</span>
                <p style={{ margin: 0 }}>{h.notes[0].nextVisit}</p>
                <p className="small muted">— {barberName(h.notes[0].barberId)}</p>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'color' && (
        <div className="card rise">
          <span className="eyebrow">Өмнө нь ямар өнгө хийлгэсэн · Ямар будаг хэрэглэсэн</span>
          <div className="timeline" style={{ marginTop: 16 }}>
            {h.chemicalLogs.map((l) => (
              <div className="tl-item" key={l.date}>
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  <div className="swatch" style={{ background: l.hex }} title={l.hex} />
                  <div>
                    <div>{l.service} <span className="small muted">· {fmtDate(l.date, { year: 'numeric', month: 'short', day: 'numeric' })}</span></div>
                    <div className="small" style={{ fontFamily: 'ui-monospace, monospace' }}>{l.formula}</div>
                    <div className="small muted">{l.hex.toUpperCase()} · {barberName(l.barberId)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'photos' && (
        <div className="rise">
          <div className="row wrap" style={{ marginBottom: 16 }}>
            {visitDates.map((d) => (
              <button key={d} className={`chip ${d === visit ? 'active' : ''}`} onClick={() => setVisit(d)}>{fmtDate(d, { year: 'numeric', month: 'short', day: 'numeric' })}</button>
            ))}
          </div>
          <div style={{ maxWidth: 480 }}>
            {pair.before && pair.after ? <Compare before={pair.before} after={pair.after} /> : <p className="muted">No before/after pair for this visit.</p>}
            <p className="small muted" style={{ marginTop: 10 }}>Drag to compare. {pair.after?.label}</p>
          </div>
        </div>
      )}

      {tab === 'notes' && (
        <div className="rise stack">
          {h.notes.map((n) => (
            <div className="card" key={n.date}>
              <div className="spread">
                <span className="eyebrow" style={{ margin: 0 }}>{barberName(n.barberId)}</span>
                <span className="small muted">{fmtDate(n.date)}</span>
              </div>
              <p style={{ marginTop: 10 }}>{n.note}</p>
              <p className="small" style={{ margin: 0 }}><span className="gold">Next visit: </span>{n.nextVisit}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'visits' && (
        <div className="card rise">
          <span className="eyebrow">Completed appointments</span>
          {history.length === 0 && <p className="muted">No completed visits yet.</p>}
          {history.map((b) => (
            <div className="summary-line" key={b.id}>
              <span>{fmtDate(b.start, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              <span className="muted" style={{ textAlign: 'right' }}>{b.serviceIds.map((id) => SERVICES.find((s) => s.id === id)?.name).join(', ')} · {barberName(b.barberId)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
