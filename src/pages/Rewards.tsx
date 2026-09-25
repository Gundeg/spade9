import { VipCard } from '../components/VipCard'
import { fmtPoints } from '../lib/format'
import { POINTS_PER_DOLLAR, TIERS, tierFor, tierProgress } from '../lib/loyalty'
import { useMember } from '../lib/store'

export default function Rewards() {
  const member = useMember()
  const current = tierFor(member.points).tier
  const { progress, remaining, next } = tierProgress(member.points)

  return (
    <>
      <div className="page-title">
        <span className="eyebrow">Дижитал Карт</span>
        <h1>Rewards</h1>
      </div>

      <VipCard member={member} />

      <div className="card gilded" style={{ maxWidth: 560, margin: '28px auto 0' }}>
        <div className="spread small">
          <span>{current}</span>
          <span className="muted">{next ? `${fmtPoints(remaining)} to ${next.tier}` : 'Highest tier'}</span>
        </div>
        <div className="bar" style={{ marginTop: 8 }}><div style={{ width: `${progress * 100}%` }} /></div>
        <p className="small muted" style={{ margin: '10px 0 0' }}>Earn {POINTS_PER_DOLLAR} point per $1 spent. Points post after each completed visit.</p>
      </div>

      <section style={{ marginTop: 36 }}>
        <h3>Tier benefits</h3>
        <div className="table-scroll">
          <table className="tier-table">
            <thead>
              <tr><th>Tier</th><th>From</th><th>Primary</th><th>Exclusive perks</th></tr>
            </thead>
            <tbody>
              {TIERS.map((t) => (
                <tr key={t.tier} className={t.tier === current ? 'current' : ''}>
                  <td><span className="badge">{t.tier}</span></td>
                  <td className="muted">{fmtPoints(t.minPoints)} pts</td>
                  <td>{Math.round(t.discount * 100)}% Discount</td>
                  <td className="muted">{t.benefits.slice(1).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
