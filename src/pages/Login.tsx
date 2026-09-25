import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Spade } from '../components/Icon'
import { useStore } from '../lib/store'

export default function Login() {
  const { login } = useStore()
  const nav = useNavigate()
  const [email, setEmail] = useState('member@spade9.mn')
  const [password, setPassword] = useState('demo')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    login(email)
    nav('/app')
  }

  return (
    <div className="auth-wrap">
      <form className="card gilded auth-card stack rise" onSubmit={submit}>
        <div className="center">
          <Link to="/" className="brand"><Spade /> SPADE9</Link>
          <p className="muted small" style={{ marginTop: 8 }}>Member Login</p>
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="pw">Password</label>
          <input id="pw" className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-solid btn-block" type="submit">Нэвтрэх</button>
        <p className="small muted center" style={{ margin: 0 }}>
          Demo build: any credentials sign in as the sample member.
        </p>
        <p className="small center" style={{ margin: 0 }}>
          Not a member? <Link to="/apply" className="gold">Apply for membership</Link>
        </p>
      </form>
    </div>
  )
}
