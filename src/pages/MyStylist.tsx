import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Lightbox } from '../components/Lightbox'
import { Photo } from '../components/Photo'
import { BARBERS, SERVICES } from '../data/mock'
import type { Booking } from '../data/types'
import { nextAvailable } from '../lib/availability'
import { fmtDate, fmtTime } from '../lib/format'
import { HAPTIC_CONFIRM, haptic } from '../lib/haptics'
import { pushLocal } from '../lib/push'
import { useMember, useStore } from '../lib/store'

export default function MyStylist() {
  const member = useMember()
  const { bookings, book, updateMember } = useStore()
  const [gallery, setGallery] = useState(false)
  const [booked, setBooked] = useState<Booking | null>(null)
  const barber = BARBERS.find((b) => b.id === member.preferredBarberId) ?? BARBERS[0]
  const usual = SERVICES.filter((s) => member.usualServiceIds.includes(s.id))
  const duration = usual.reduce((a, s) => a + s.durationMin, 0)
  const next = useMemo(() => nextAvailable(barber, duration, bookings), [barber, duration, bookings])

  // "Rebook My Usual": one tap, next available slot, usual services. Skips the 4-step flow.
  const rebook = async () => {
    if (!next) return
    const b = book({ barberId: barber.id, serviceIds: member.usualServiceIds, start: next.toISOString(), durationMin: duration })
    haptic(HAPTIC_CONFIRM)
    setBooked(b)
    if (member.preferences.pushNotifications) await pushLocal('Spade9 · Цаг баталгаажлаа', `${barber.name} · ${fmtDate(next)} ${fmtTime(next)}`)
  }

  return (
    <>
      <div className="page-title">
        <span className="eyebrow">My Stylist</span>
        <h1>{barber.name}</h1>
        <p className="muted" style={{ margin: 0 }}>{barber.title} · {barber.years} years · {barber.specialties.join(' · ')}</p>
      </div>

      <div className="dash-grid">
        <div className="card gilded">
          <span className="eyebrow">Next available</span>
          {next ? (
            <h3 style={{ margin: '0 0 4px' }}>{fmtDate(next, { weekday: 'long', month: 'short', day: 'numeric' })} · {fmtTime(next)}</h3>
          ) : (
            <p className="muted">Fully booked for the next three weeks.</p>
          )}
          <p className="small muted">Your usual: {usual.map((s) => s.name).join(' + ')} ({duration} min)</p>
          {booked ? (
            <div className="row" style={{ color: 'var(--ok)' }}><Icon name="check" /> Booked for {fmtDate(booked.start)} · {fmtTime(booked.start)}</div>
          ) : (
            <div className="row wrap">
              <button className="btn btn-solid" onClick={rebook} disabled={!next}><Icon name="repeat" /> Rebook My Usual</button>
              <Link to={`/app/book?barber=${barber.id}`} className="btn btn-ghost">Choose another time</Link>
            </div>
          )}
        </div>
        <div className="card">
          <span className="eyebrow">About</span>
          <p className="muted">{barber.bio}</p>
          <div className="field">
            <label htmlFor="pref">Preferred stylist</label>
            <select id="pref" className="input" value={member.preferredBarberId} onChange={(e) => { setBooked(null); updateMember({ preferredBarberId: e.target.value }) }}>
              {BARBERS.map((b) => <option key={b.id} value={b.id}>{b.name} — {b.title}</option>)}
            </select>
          </div>
        </div>
      </div>

      <section style={{ marginTop: 32 }}>
        <div className="spread" style={{ marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Portfolio</h3>
          <button className="btn btn-sm btn-ghost" onClick={() => setGallery(true)}>Full screen</button>
        </div>
        <div className="carousel">
          {barber.portfolio.map((p) => (
            <button key={p.id} onClick={() => setGallery(true)} style={{ padding: 0, border: 0, background: 'none', cursor: 'pointer' }} aria-label={p.title}>
              <Photo src={p.src} alt={p.title} hue={p.hue} label={p.title} />
            </button>
          ))}
        </div>
      </section>

      {gallery && <Lightbox title={barber.name} items={barber.portfolio} onClose={() => setGallery(false)} />}
    </>
  )
}
