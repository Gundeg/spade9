import type { Barber } from '../data/types'
import { Photo } from './Photo'

export function BarberCard({ barber, onView }: { barber: Barber; onView: () => void }) {
  return (
    <article className="barber-card" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onView()}>
      <Photo src={barber.portfolio[0]?.src} alt={`${barber.name}, ${barber.title}`} hue={barber.portfolio[0]?.hue} />
      <div className="overlay">
        <span className="eyebrow" style={{ marginBottom: 4 }}>{barber.title}</span>
        <h3 style={{ margin: 0 }}>{barber.name}</h3>
        <div className="reveal">
          <div>
            <p className="small muted" style={{ margin: '8px 0 12px' }}>{barber.years} years · {barber.specialties.join(' · ')}</p>
            <button className="btn btn-sm btn-solid" onClick={onView}>View Work</button>
          </div>
        </div>
      </div>
    </article>
  )
}
