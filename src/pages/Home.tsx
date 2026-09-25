import { Link, useNavigate } from 'react-router-dom'
import { Countdown } from '../components/Countdown'
import { Icon } from '../components/Icon'
import { RadialProgress } from '../components/RadialProgress'
import { BARBERS, SERVICES } from '../data/mock'
import type { Tier } from '../data/types'
import { fmtDate, fmtPoints, fmtTime } from '../lib/format'
import { haptic } from '../lib/haptics'
import { tierFor, tierProgress } from '../lib/loyalty'
import { useMember, useStore } from '../lib/store'

const OFFERS: Record<Tier, { title: string; body: string }[]> = {
  GOLD: [
    { title: 'Birthday month', body: 'A complimentary beard ritual with any cut during your birthday month.' },
    { title: 'Priority booking', body: 'Gold members see new slots 24 hours before guests.' },
  ],
  PLATINUM: [
    { title: 'Monthly free treatment', body: 'Your сард 1 удаа scalp or hot-towel treatment is ready to redeem.' },
    { title: 'VIP-only: Tuesday mornings', body: 'Book before noon on Tuesday and receive double points.' },
    { title: 'Birthday month', body: 'A complimentary beard ritual with any cut during your birthday month.' },
  ],
  BLACK: [
    { title: 'Black Tier: Complimentary Malt Tasting this Friday', body: 'Four rare single malts with our cellar master, 19:00. Two seats per member.' },
    { title: 'Private suite', body: 'Reserve the sound-dampened suite for any appointment at no extra charge.' },
    { title: 'Premium treatment on us', body: 'Your next color gloss or hot-towel shave is complimentary.' },
  ],
}

export default function Home() {
  const member = useMember()
  const { upcoming } = useStore()
  const nav = useNavigate()
  const tier = tierFor(member.points)
  const { progress, remaining, next } = tierProgress(member.points)
  const barber = upcoming && BARBERS.find((b) => b.id === upcoming.barberId)

  return (
    <>
      <section className="greeting rise" style={{ marginBottom: 24 }}>
        <span className="eyebrow">{tier.tier} Member</span>
        <h1>Сайн байна уу, <span className="gold-text">{member.firstName}</span></h1>
      </section>

      <div className="dash-grid">
        <div className="card gilded rise">
          <span className="eyebrow">Дараагийн цаг</span>
          {upcoming && barber ? (
            <>
              <Countdown to={upcoming.start} />
              <div className="spread">
                <div>
                  <div style={{ fontSize: '1.05rem' }}>{upcoming.serviceIds.map((id) => SERVICES.find((s) => s.id === id)?.name).join(' + ')}</div>
                  <div className="small muted">{barber.name} · {fmtDate(upcoming.start)} · {fmtTime(upcoming.start)}</div>
                </div>
                <Link to={`/app/book?edit=${upcoming.id}`} className="btn btn-sm btn-ghost">Manage</Link>
              </div>
            </>
          ) : (
            <p className="muted">No upcoming appointment. Your chair is waiting.</p>
          )}
        </div>

        <div className="card gilded rise row" style={{ gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          <RadialProgress value={progress}>
            <b className="gold-text">{fmtPoints(member.points)}</b>
            <span className="small muted">points</span>
          </RadialProgress>
          <div style={{ flex: 1, minWidth: 160 }}>
            <span className="eyebrow">Tier status</span>
            <h3 style={{ marginBottom: 4 }}>{tier.tier}</h3>
            {next ? (
              <p className="small muted" style={{ margin: 0 }}>{fmtPoints(remaining)} points to <span className="gold">{next.tier}</span></p>
            ) : (
              <p className="small muted" style={{ margin: 0 }}>You hold our highest tier.</p>
            )}
            <Link to="/app/rewards" className="small gold" style={{ display: 'inline-block', marginTop: 10 }}>View VIP card →</Link>
          </div>
        </div>

        <div className="card rise" style={{ gridColumn: '1 / -1' }}>
          <span className="eyebrow">Exclusive for {tier.tier}</span>
          {OFFERS[tier.tier].map((o) => (
            <div className="offer" key={o.title}>
              <div className="perk-icon" style={{ margin: 0, flexShrink: 0 }}><Icon name="glass" /></div>
              <div>
                <div>{o.title}</div>
                <div className="small muted">{o.body}</div>
              </div>
            </div>
          ))}
        </div>

        <Link to="/app/stylist" className="card rise spread" style={{ gridColumn: '1 / -1' }}>
          <div>
            <span className="eyebrow">My Stylist</span>
            <div>{BARBERS.find((b) => b.id === member.preferredBarberId)?.name} · Rebook your usual in 5 seconds</div>
          </div>
          <Icon name="right" />
        </Link>
      </div>

      <div className="fab-wrap">
        <button className="btn btn-solid" onClick={() => { haptic(); nav('/app/book') }}>
          <Icon name="book" /> Цаг авах
        </button>
      </div>
    </>
  )
}
