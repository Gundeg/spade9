import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import type { Member } from '../data/types'
import { tierFor } from '../lib/loyalty'
import { fmtPoints } from '../lib/format'
import { haptic } from '../lib/haptics'
import { Spade } from './Icon'

/**
 * Check-in payload. In production the server issues this as a short-lived signed token
 * (e.g. JWT with a 60-second expiry, rotated on screen) so a screenshot cannot be replayed.
 * The client must never hold the signing key; this demo token is unsigned.
 */
export function checkinPayload(member: Member, windowSeconds = 60, now = Date.now()): string {
  const window = Math.floor(now / 1000 / windowSeconds)
  return `SPADE9:CHECKIN:v1:${member.id}:${window}`
}

export function VipCard({ member }: { member: Member }) {
  const [flipped, setFlipped] = useState(false)
  const [qr, setQr] = useState('')
  const [tick, setTick] = useState(0)
  const tier = tierFor(member.points).tier

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    QRCode.toDataURL(checkinPayload(member), { margin: 0, width: 300, color: { dark: '#111111', light: '#ffffff' } })
      .then(setQr)
      .catch(() => setQr(''))
  }, [member, tick])

  return (
    <div className="vip-card-wrap">
      <div
        className={`vip-card tier-${tier} ${flipped ? 'flipped' : ''}`}
        onClick={() => { haptic(); setFlipped((f) => !f) }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setFlipped((f) => !f)}
        aria-label={flipped ? 'Show card front' : 'Show check-in QR code'}
      >
        <div className="vip-face front">
          <div className="spread">
            <span className="brand" style={{ fontSize: '1.25rem' }}><Spade size={18} /> SPADE9</span>
            <span className="badge">{tier}</span>
          </div>
          <div className="vip-chip" />
          <div className="spread" style={{ alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '0.95rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{member.firstName} {member.lastName}</div>
              <div className="small muted">Member since {member.memberSince}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="vip-points gold-text">{fmtPoints(member.points)}</div>
              <div className="small muted">points</div>
            </div>
          </div>
        </div>
        <div className="vip-face back">
          <div className="qr">{qr && <img src={qr} alt="Check-in QR code" />}</div>
          <div className="small muted center">Scan at the lounge to check in or redeem.<br />Refreshes every 60s.</div>
        </div>
      </div>
      <p className="small muted center" style={{ marginTop: 14 }}>Tap card to {flipped ? 'return' : 'show check-in code'}</p>
    </div>
  )
}
