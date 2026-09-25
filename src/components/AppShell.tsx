import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useStore } from '../lib/store'
import { haptic } from '../lib/haptics'
import { fmtDate } from '../lib/format'
import { Icon, Spade, type IconName } from './Icon'
import { useScrollHide } from './useScrollHide'

const NAV: { to: string; label: string; mn: string; icon: IconName }[] = [
  { to: '/app', label: 'Home', mn: 'Нүүр', icon: 'home' },
  { to: '/app/book', label: 'Book', mn: 'Цаг', icon: 'book' },
  { to: '/app/hair', label: 'My Hair', mn: 'Миний үс', icon: 'hair' },
  { to: '/app/rewards', label: 'Rewards', mn: 'Шагнал', icon: 'rewards' },
  { to: '/app/profile', label: 'Profile', mn: 'Профайл', icon: 'profile' },
]

function Bell({ onOpen }: { onOpen: () => void }) {
  const { notifications } = useStore()
  const unread = notifications.some((n) => !n.read)
  return (
    <button className="icon-btn bell" onClick={onOpen} aria-label={`Notifications${unread ? ' (unread)' : ''}`}>
      <Icon name="bell" />
      {unread && <span className="dot" />}
    </button>
  )
}

function Notifications({ onClose }: { onClose: () => void }) {
  const { notifications } = useStore()
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="Notifications">
        <div className="spread" style={{ marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Мэдэгдэл</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        {notifications.length === 0 && <p className="muted">No notifications yet.</p>}
        {notifications.map((n) => (
          <div key={n.id} className={`notif ${n.read ? '' : 'unread'}`}>
            <div className="spread">
              <span className="eyebrow" style={{ margin: 0 }}>{n.title}</span>
              <span className="small muted">{fmtDate(n.createdAt)}</span>
            </div>
            <p style={{ margin: '6px 0 0' }}>{n.body}</p>
          </div>
        ))}
      </aside>
    </>
  )
}

export function AppShell() {
  const { hidden } = useScrollHide()
  const { markAllRead } = useStore()
  const [open, setOpen] = useState(false)
  const openDrawer = () => setOpen(true)
  const closeDrawer = () => {
    setOpen(false)
    markAllRead()
  }

  return (
    <div className="app">
      <header className={`app-header ${hidden ? 'hidden' : ''}`}>
        <div className="container spread">
          <NavLink to="/app" className="brand"><Spade /> SPADE9</NavLink>
          <nav className="nav-links" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/app'}>{n.label}</NavLink>
            ))}
          </nav>
          <Bell onOpen={openDrawer} />
        </div>
      </header>

      <div className="mobile-top">
        <NavLink to="/app" className="brand" style={{ fontSize: '1.2rem' }}><Spade size={18} /> SPADE9</NavLink>
        <Bell onOpen={openDrawer} />
      </div>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Main">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/app'} onClick={() => haptic(10)} aria-label={n.label}>
            <Icon name={n.icon} />
            <span>{n.mn}</span>
          </NavLink>
        ))}
      </nav>

      {open && <Notifications onClose={closeDrawer} />}
    </div>
  )
}
