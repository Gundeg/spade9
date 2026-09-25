import { Fragment, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarberCard } from '../components/BarberCard'
import { Icon, Spade } from '../components/Icon'
import { Lightbox } from '../components/Lightbox'
import { MapEmbed } from '../components/MapEmbed'
import { Photo } from '../components/Photo'
import { useScrollHide } from '../components/useScrollHide'
import { BARBERS, FAQ, HOURS, LOCATION, PUBLIC_SERVICE_IDS, SERVICES } from '../data/mock'
import type { Barber } from '../data/types'

function useParallax() {
  const bg = useRef<HTMLDivElement>(null)
  const fg = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, window.innerHeight)
        if (bg.current) bg.current.style.transform = `translate3d(0, ${y * 0.35}px, 0)`
        if (fg.current) fg.current.style.transform = `translate3d(0, ${y * 0.12}px, 0) scale(${1 + y / 4000})`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
  return { bg, fg }
}

const AMENITIES = [
  {
    title: 'The Whiskey Bar',
    hue: 32,
    copy: 'Amber light pools across walnut. The first pour is a 12-year aged single malt, honeyed, with a quiet thread of peat, served neat in hand-cut crystal that is cool and heavy in the palm. Leather, oak and a trace of smoke hang in the air before your barber ever says your name.',
    points: ['12-year aged single malt selection', 'Hand-cut crystal glassware', 'Poured on arrival for every member'],
  },
  {
    title: 'The Private Lounge',
    hue: 18,
    copy: 'Behind a second door the city falls silent. Sound-dampened walls absorb every edge, and Italian leather seating gives slowly beneath you, supple and warm. It is a sanctuary kept for the few: no phones ringing, no waiting room, only the low hum of conversation and the scent of cedar and bay rum.',
    points: ['Sound-dampened acoustics', 'Italian leather seating', 'Reserved for members and their guests'],
  },
]

export default function Landing() {
  const { hidden, scrolled } = useScrollHide()
  const { bg, fg } = useParallax()
  const [gallery, setGallery] = useState<Barber | null>(null)
  const services = PUBLIC_SERVICE_IDS.map((id) => SERVICES.find((s) => s.id === id)!)

  return (
    <>
      <header className={`site-header ${scrolled ? 'solid' : ''} ${hidden ? 'hidden' : ''}`}>
        <div className="container spread">
          <Link to="/" className="brand"><Spade /> SPADE9</Link>
          <nav className="nav-links" aria-label="Sections">
            <a href="#experience">Experience</a>
            <a href="#services">Services</a>
            <a href="#barbers">Barbers</a>
            <a href="#membership">Membership</a>
            <a href="#visit">Visit</a>
          </nav>
          <Link to="/login" className="btn btn-sm">Member Login</Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-layer hero-bg" ref={bg} />
        <div className="hero-layer hero-spade" ref={fg} aria-hidden="true">
          <Spade size={600} />
        </div>
        <div className="container">
          <div className="hero-content rise">
            <span className="eyebrow">VIP Barber Lounge · Ulaanbaatar</span>
            <h1>
              Grooming,<br />
              <span className="gold-text">by invitation.</span>
            </h1>
            <p>A members' lounge for the discerning gentleman. Master barbers, a single-malt bar and a private archive of every cut you've ever trusted us with.</p>
            <div className="hero-cta">
              <Link to="/login" className="btn">Member Login</Link>
              <Link to="/apply" className="btn btn-solid">Apply for Membership</Link>
            </div>
          </div>
        </div>
        <span className="scroll-cue">Scroll</span>
      </section>

      <section className="section" id="experience">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The Spade9 Experience</span>
            <h2>Not a barbershop.<br />A sanctuary.</h2>
            <p className="muted">Every visit begins before the chair: the weight of the glass, the grain of the leather, the hush of the room.</p>
          </div>
          <div className="amenities">
            {AMENITIES.map((a) => (
              <article className="amenity" key={a.title}>
                <Photo alt={a.title} hue={a.hue} label={a.title} ratio="16 / 10" />
                <div className="amenity-body">
                  <h3>{a.title}</h3>
                  <p className="muted">{a.copy}</p>
                  <ul>{a.points.map((p) => <li key={p}>{p}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt" id="services">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The Menu</span>
            <h2>Services</h2>
            <p className="muted">Starting prices. Members receive tier pricing from 5% to 15% below the menu.</p>
          </div>
          <div className="menu-list">
            {services.map((s) => (
              <div className="menu-item" key={s.id}>
                <h3>{s.name}</h3>
                <span className="price">${s.priceFrom}+</span>
                <p>{s.description} · {s.durationMin} min</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="barbers">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The Artisans</span>
            <h2>Master Barbers</h2>
            <p className="muted">Hover a portrait to see their work.</p>
          </div>
          <div className="barber-grid">
            {BARBERS.map((b) => <BarberCard key={b.id} barber={b} onView={() => setGallery(b)} />)}
          </div>
        </div>
      </section>

      <section className="section alt" id="membership">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The Club</span>
            <h2>From customer to <span className="gold-text">Member.</span></h2>
            <p className="muted">Membership is reviewed by application. Once approved, the lounge follows you in your pocket.</p>
          </div>
          <div className="membership-grid">
            {[
              { icon: 'card' as const, t: 'Digital VIP Card', d: 'An animated member card with a rotating QR for check-in and point redemption. No wallet, no front desk.' },
              { icon: 'spark' as const, t: 'Gold → Platinum → Black', d: 'Earn points with every visit. Unlock 5–15% pricing, free treatments, private appointments and event invitations.' },
              { icon: 'archive' as const, t: 'My Hair Profile', d: 'Your color formulas, before and after photos and stylist notes, kept in a permanent archive so any barber can pick up where the last one left off.' },
            ].map((p) => (
              <div className="card gilded" key={p.t}>
                <div className="perk-icon"><Icon name={p.icon} /></div>
                <h3>{p.t}</h3>
                <p className="muted" style={{ margin: 0 }}>{p.d}</p>
              </div>
            ))}
          </div>
          <div className="center" style={{ marginTop: 40 }}>
            <Link to="/apply" className="btn btn-solid">Apply for Membership</Link>
          </div>
        </div>
      </section>

      <footer className="footer" id="visit">
        <div className="container">
          <div className="footer-grid">
            <div>
              <span className="eyebrow">Questions</span>
              <h2 style={{ fontSize: '2rem' }}>FAQ</h2>
              <div className="faq">
                {FAQ.map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
            <div className="stack">
              <MapEmbed />
              <div>
                <span className="eyebrow">Visit</span>
                <p style={{ margin: 0 }}>{LOCATION.address}</p>
                <p className="muted small">
                  <a href={`tel:${LOCATION.phone.replace(/\s/g, '')}`}>{LOCATION.phone}</a> · <a href={`mailto:${LOCATION.email}`}>{LOCATION.email}</a>
                </p>
              </div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div>
                  <span className="eyebrow">Standard hours</span>
                  <dl className="hours">{HOURS.standard.map((h) => <Fragment key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></Fragment>)}</dl>
                </div>
                <div>
                  <span className="eyebrow">VIP sessions</span>
                  <dl className="hours">{HOURS.vip.map((h) => <Fragment key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></Fragment>)}</dl>
                </div>
              </div>
            </div>
          </div>
          <hr className="divider" />
          <div className="spread small muted">
            <span>© {new Date().getFullYear()} Spade9 VIP Barber Lounge</span>
            <span className="brand" style={{ fontSize: '1rem' }}><Spade size={14} /> SPADE9</span>
          </div>
        </div>
      </footer>

      {gallery && <Lightbox title={gallery.name} items={gallery.portfolio} onClose={() => setGallery(null)} />}
    </>
  )
}
