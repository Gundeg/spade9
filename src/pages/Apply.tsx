import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Spade } from '../components/Icon'
import { useStore } from '../lib/store'

export default function Apply() {
  const { apply } = useStore()
  const [done, setDone] = useState(false)
  const [f, setF] = useState({ name: '', email: '', phone: '', referral: '' })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    apply(f)
    setDone(true)
  }

  return (
    <div className="auth-wrap">
      <div className="card gilded auth-card rise">
        <div className="center" style={{ marginBottom: 20 }}>
          <Link to="/" className="brand"><Spade /> SPADE9</Link>
          <p className="muted small" style={{ marginTop: 8 }}>Apply for Membership</p>
        </div>
        {done ? (
          <div className="center stack">
            <h2 style={{ fontSize: '1.8rem' }}>Thank you, {f.name.split(' ')[0]}.</h2>
            <p className="muted">Our concierge reviews every application personally and will contact you within 48 hours.</p>
            <Link to="/" className="btn">Back to the lounge</Link>
          </div>
        ) : (
          <form className="stack" onSubmit={submit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" className="input" required autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="aemail">Email</label>
              <input id="aemail" className="input" type="email" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" className="input" type="tel" required autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="ref">Referred by (member name or code)</label>
              <input id="ref" className="input" value={f.referral} onChange={(e) => setF({ ...f, referral: e.target.value })} />
            </div>
            <button className="btn btn-solid btn-block" type="submit">Submit Application</button>
            <p className="small muted center" style={{ margin: 0 }}>Already a member? <Link to="/login" className="gold">Log in</Link></p>
          </form>
        )}
      </div>
    </div>
  )
}
