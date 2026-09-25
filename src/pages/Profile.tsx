import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useToast } from '../components/Toast'
import type { Member } from '../data/types'
import { haptic } from '../lib/haptics'
import { useMember, useStore } from '../lib/store'

type BoolPref = 'pushNotifications' | 'emailNotifications' | 'haptics'

const PREFS: { key: BoolPref; label: string; hint: string }[] = [
  { key: 'pushNotifications', label: 'Push notifications', hint: 'Booking confirmations, color refresh and stylist alerts' },
  { key: 'emailNotifications', label: 'Email updates', hint: 'Event invitations and monthly statements' },
  { key: 'haptics', label: 'Haptic feedback', hint: 'Vibration on navigation and confirmations (Android)' },
]

export default function Profile() {
  const member = useMember()
  const { updateMember, logout } = useStore()
  const nav = useNavigate()
  const { toast, node } = useToast()

  const setPref = <K extends keyof Member['preferences']>(k: K, v: Member['preferences'][K]) =>
    updateMember({ preferences: { ...member.preferences, [k]: v } })

  const togglePush = async () => {
    const on = !member.preferences.pushNotifications
    if (on && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
    setPref('pushNotifications', on)
  }

  return (
    <>
      <div className="page-title">
        <span className="eyebrow">Профайл</span>
        <h1>{member.firstName} {member.lastName}</h1>
        <p className="muted" style={{ margin: 0 }}>Member since {member.memberSince}</p>
      </div>

      <div className="dash-grid">
        <div className="card">
          <span className="eyebrow">Account</span>
          <div className="stack">
            <div className="field">
              <label htmlFor="p-email">Email</label>
              <input id="p-email" className="input" type="email" defaultValue={member.email} onBlur={(e) => updateMember({ email: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="p-phone">Phone</label>
              <input id="p-phone" className="input" type="tel" defaultValue={member.phone} onBlur={(e) => updateMember({ phone: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="p-drink">Your usual pour</label>
              <input id="p-drink" className="input" defaultValue={member.preferences.drink} onBlur={(e) => setPref('drink', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card">
          <span className="eyebrow">Preferences</span>
          {PREFS.map((p) => (
            <div className="pref-row" key={p.key}>
              <div>
                <div>{p.label}</div>
                <div className="small muted">{p.hint}</div>
              </div>
              <button
                className="toggle"
                role="switch"
                aria-checked={member.preferences[p.key]}
                aria-label={p.label}
                onClick={() => { haptic(8); p.key === 'pushNotifications' ? togglePush() : setPref(p.key, !member.preferences[p.key]) }}
              />
            </div>
          ))}
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <span className="eyebrow">Security</span>
          <div className="row wrap">
            <button className="btn btn-sm btn-ghost" onClick={() => toast('Password reset link sent to your email')}>Change password</button>
            <button className="btn btn-sm btn-ghost" onClick={() => toast('Two-factor setup requires the production auth service')}>Enable 2FA</button>
            <button className="btn btn-sm btn-danger" onClick={() => { logout(); nav('/') }}><Icon name="logout" size={16} /> Гарах</button>
          </div>
        </div>
      </div>
      {node}
    </>
  )
}
