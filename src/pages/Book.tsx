import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Photo } from '../components/Photo'
import { useToast } from '../components/Toast'
import { BARBERS, SERVICES } from '../data/mock'
import type { Booking, ServiceCategory } from '../data/types'
import { slotsForDay } from '../lib/availability'
import { fmtDate, fmtTime, money } from '../lib/format'
import { HAPTIC_CONFIRM, haptic } from '../lib/haptics'
import { priceFor, tierFor } from '../lib/loyalty'
import { pushLocal } from '../lib/push'
import { useMember, useStore } from '../lib/store'

const CATEGORIES: ServiceCategory[] = ['Hair', 'Beard', 'Color']
const STEP_TITLES = ['Мастер сонгох', 'Үйлчилгээ', 'Өдөр & цаг', 'Баталгаажуулах']
const isVipHour = (d: Date) => d.getHours() < 11 || d.getHours() >= 18

/** Remount on query change so /app/book?edit=… → /app/book starts a fresh flow. */
export default function BookRoute() {
  const { search } = useLocation()
  return <Book key={search} />
}

function Book() {
  const member = useMember()
  const { bookings, book, reschedule, cancel } = useStore()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const { toast, node: toastNode } = useToast()

  const editing = bookings.find((b) => b.id === params.get('edit') && b.status === 'confirmed') ?? null
  const [step, setStep] = useState(editing ? 3 : 0)
  const [barberId, setBarberId] = useState(editing?.barberId ?? params.get('barber') ?? member.preferredBarberId)
  const [serviceIds, setServiceIds] = useState<string[]>(editing?.serviceIds ?? member.usualServiceIds)
  const [category, setCategory] = useState<ServiceCategory>('Hair')
  const [dayOffset, setDayOffset] = useState(0)
  const [slot, setSlot] = useState<string | null>(editing?.start ?? null)
  const [privateSuite, setPrivateSuite] = useState(editing?.privateSuite ?? false)
  const [done, setDone] = useState<Booking | null>(null)
  const [rescheduling, setRescheduling] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const barber = BARBERS.find((b) => b.id === barberId)!
  const chosen = SERVICES.filter((s) => serviceIds.includes(s.id))
  const duration = chosen.reduce((a, s) => a + s.durationMin, 0)
  const listPrice = chosen.reduce((a, s) => a + s.priceFrom, 0)
  const memberPrice = priceFor(listPrice, member.points)
  const tier = tierFor(member.points).tier

  const days = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() + i)
        d.setHours(0, 0, 0, 0)
        return d
      }),
    [],
  )
  const slots = useMemo(
    () => slotsForDay(barber, days[dayOffset], duration || 30, bookings, new Date(), editing?.id),
    [barber, days, dayOffset, duration, bookings, editing?.id],
  )

  const go = (s: number) => {
    haptic(8)
    setStep(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const toggleService = (id: string) => {
    haptic(8)
    setServiceIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
    setSlot(null)
  }

  const finalize = async () => {
    if (!slot) return
    let result: Booking
    if (editing) {
      reschedule(editing.id, slot)
      result = { ...editing, start: slot }
    } else {
      result = book({ barberId, serviceIds, start: slot, durationMin: duration, privateSuite })
    }
    haptic(HAPTIC_CONFIRM)
    setDone(result)
    if (member.preferences.pushNotifications) {
      await pushLocal('Spade9 · Цаг баталгаажлаа', `${barber.name} · ${fmtDate(slot)} ${fmtTime(slot)}`)
    }
  }

  const doCancel = () => {
    if (!editing) return
    cancel(editing.id)
    haptic([30, 40, 30])
    toast('Appointment cancelled')
    setTimeout(() => nav('/app'), 900)
  }

  if (done) {
    return (
      <div className="card gilded center rise" style={{ maxWidth: 520, margin: '40px auto' }}>
        <div className="confirm-burst"><Icon name="check" size={40} /></div>
        <span className="eyebrow">{editing ? 'Rescheduled' : 'Confirmed'}</span>
        <h2 style={{ fontSize: '2rem' }}>Цаг баталгаажлаа</h2>
        <p className="muted">
          {barber.name} · {fmtDate(done.start, { weekday: 'long', month: 'long', day: 'numeric' })} · {fmtTime(done.start)}
        </p>
        <p className="small muted">A confirmation has been sent to your notifications. Your usual pour will be waiting.</p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 20 }}>
          <Link to="/app" className="btn btn-solid">Done</Link>
        </div>
      </div>
    )
  }

  // Manage existing booking: modify or cancel.
  if (editing && !rescheduling) {
    return (
      <>
        <div className="page-title"><span className="eyebrow">Manage booking</span><h1>Таны цаг</h1></div>
        <div className="card gilded stack" style={{ maxWidth: 560 }}>
          <div className="summary-line"><span className="muted">Barber</span><span>{BARBERS.find((b) => b.id === editing.barberId)?.name}</span></div>
          <div className="summary-line"><span className="muted">Services</span><span style={{ textAlign: 'right' }}>{chosen.map((s) => s.name).join(', ')}</span></div>
          <div className="summary-line"><span className="muted">When</span><span>{fmtDate(editing.start)} · {fmtTime(editing.start)}</span></div>
          <div className="row wrap">
            <button className="btn btn-solid" onClick={() => { setRescheduling(true); setSlot(null); go(2) }}>Reschedule</button>
            {confirmCancel ? (
              <>
                <span className="small muted">Cancel this appointment?</span>
                <button className="btn btn-sm btn-danger" onClick={doCancel}>Yes, cancel</button>
                <button className="btn btn-sm btn-ghost" onClick={() => setConfirmCancel(false)}>Keep it</button>
              </>
            ) : (
              <button className="btn btn-danger" onClick={() => setConfirmCancel(true)}>Cancel appointment</button>
            )}
          </div>
        </div>
        {toastNode}
      </>
    )
  }

  return (
    <>
      <div className="page-title">
        <span className="eyebrow">Step {step + 1} of 4</span>
        <h1>{STEP_TITLES[step]}</h1>
      </div>
      <div className="steps" aria-hidden="true">{[0, 1, 2, 3].map((i) => <div key={i} className={i <= step ? 'done' : ''} />)}</div>

      {step === 0 && (
        <div className="rise">
          <div className="pick-grid">
            {BARBERS.map((b) => (
              <button key={b.id} className={`pick ${b.id === barberId ? 'selected' : ''}`} onClick={() => { haptic(8); setBarberId(b.id); setSlot(null) }} aria-pressed={b.id === barberId}>
                <Photo alt={b.name} hue={b.portfolio[0]?.hue} src={b.portfolio[0]?.src} />
                <div className="pick-body">
                  <div>{b.name}{b.id === member.preferredBarberId && <span className="gold small"> ★</span>}</div>
                  <div className="small muted">{b.title}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 24 }}>
            <button className="btn btn-solid" onClick={() => go(1)}>Continue</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="rise">
          <div className="tabs">
            {CATEGORIES.map((c) => (
              <button key={c} className={`chip ${c === category ? 'active' : ''}`} onClick={() => setCategory(c)}>
                {c}{serviceIds.some((id) => SERVICES.find((s) => s.id === id)?.category === c) ? ' •' : ''}
              </button>
            ))}
          </div>
          <div className="grid">
            {SERVICES.filter((s) => s.category === category).map((s) => {
              const on = serviceIds.includes(s.id)
              return (
                <button key={s.id} className={`svc ${on ? 'selected' : ''}`} onClick={() => toggleService(s.id)} aria-pressed={on}>
                  <div>
                    <div>{s.name}</div>
                    <div className="small muted">{s.durationMin} min · from {money(s.priceFrom)}</div>
                  </div>
                  <span className="check">{on && <Icon name="check" size={14} />}</span>
                </button>
              )
            })}
          </div>
          <div className="spread" style={{ marginTop: 24 }}>
            <button className="btn btn-ghost" onClick={() => go(0)}>Back</button>
            <button className="btn btn-solid" disabled={!serviceIds.length} onClick={() => go(2)}>Continue</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rise">
          <div className="days" role="listbox" aria-label="Day">
            {days.map((d, i) => {
              const off = barber.shift.daysOff.includes(d.getDay())
              return (
                <button key={i} className={`day ${i === dayOffset ? 'active' : ''}`} disabled={off} onClick={() => { haptic(6); setDayOffset(i); setSlot(null) }} aria-selected={i === dayOffset}>
                  <small>{d.toLocaleDateString('en-US', { weekday: 'short' })}</small>
                  <b>{d.getDate()}</b>
                  <small>{d.toLocaleDateString('en-US', { month: 'short' })}</small>
                </button>
              )
            })}
          </div>
          <p className="small muted" style={{ margin: '14px 0' }}>
            {barber.name} · {duration} min · <span className="gold">gold outline</span> = VIP hours
          </p>
          {slots.length === 0 ? (
            <p className="muted">{barber.name} is not in the lounge this day.</p>
          ) : (
            <div className="slots">
              {slots.map((s) => {
                const iso = s.start.toISOString()
                return (
                  <button key={iso} className={`slot ${isVipHour(s.start) ? 'vip' : ''} ${slot === iso ? 'active' : ''}`} disabled={!s.available} onClick={() => { haptic(6); setSlot(iso) }}>
                    {fmtTime(s.start)}
                  </button>
                )
              })}
            </div>
          )}
          <div className="spread" style={{ marginTop: 24 }}>
            <button className="btn btn-ghost" onClick={() => (rescheduling ? setRescheduling(false) : go(1))}>Back</button>
            <button className="btn btn-solid" disabled={!slot} onClick={() => go(3)}>Continue</button>
          </div>
        </div>
      )}

      {step === 3 && slot && (
        <div className="card gilded rise" style={{ maxWidth: 560 }}>
          <div className="summary-line"><span className="muted">Barber</span><span>{barber.name}</span></div>
          <div className="summary-line"><span className="muted">Services</span><span style={{ textAlign: 'right' }}>{chosen.map((s) => s.name).join(', ')}</span></div>
          <div className="summary-line"><span className="muted">When</span><span>{fmtDate(slot)} · {fmtTime(slot)}</span></div>
          <div className="summary-line"><span className="muted">Duration</span><span>{duration} min</span></div>
          <div className="summary-line"><span className="muted">Menu price</span><span style={{ textDecoration: 'line-through' }} className="muted">{money(listPrice)}</span></div>
          <div className="summary-line"><span className="muted">{tier} price</span><span className="gold">{money(memberPrice)}</span></div>
          {tier === 'BLACK' && !editing && (
            <div className="pref-row">
              <span>Private suite</span>
              <button className="toggle" role="switch" aria-checked={privateSuite} onClick={() => setPrivateSuite((v) => !v)} aria-label="Private suite" />
            </div>
          )}
          <div className="spread" style={{ marginTop: 20 }}>
            <button className="btn btn-ghost" onClick={() => go(2)}>Back</button>
            <button className="btn btn-solid" onClick={finalize}>{editing ? 'Confirm new time' : 'Book now'}</button>
          </div>
        </div>
      )}
      {toastNode}
    </>
  )
}
