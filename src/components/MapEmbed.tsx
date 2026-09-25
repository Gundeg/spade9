import { useEffect, useRef, useState } from 'react'
import { LOCATION } from '../data/mock'

const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

const DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#141414' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8378' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b0b0b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#262626' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#2e2a20' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#4a3f1c' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
]

type GMaps = {
  maps: {
    Map: new (el: HTMLElement, o: object) => object
    Marker: new (o: object) => object
    SymbolPath: { CIRCLE: number }
  }
}

let loader: Promise<GMaps> | null = null
function loadMaps(key: string): Promise<GMaps> {
  loader ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`
    s.async = true
    s.onload = () => resolve((window as unknown as { google: GMaps }).google)
    s.onerror = reject
    document.head.appendChild(s)
  })
  return loader
}

export function MapEmbed() {
  const ref = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(!KEY)

  useEffect(() => {
    if (!KEY || !ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      loadMaps(KEY)
        .then((g) => {
          const center = { lat: LOCATION.lat, lng: LOCATION.lng }
          const map = new g.maps.Map(el, { center, zoom: 16, styles: DARK_STYLE, disableDefaultUI: true, zoomControl: true })
          new g.maps.Marker({
            position: center,
            map,
            title: 'Spade9',
            icon: { path: g.maps.SymbolPath.CIRCLE, scale: 9, fillColor: '#D4AF37', fillOpacity: 1, strokeColor: '#121212', strokeWeight: 3 },
          })
        })
        .catch(() => setFailed(true))
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const directions = `https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lng}`

  if (failed) {
    return (
      <a className="map" href={directions} target="_blank" rel="noreferrer" aria-label="Open directions in Google Maps" style={{ display: 'block' }}>
        <svg width="100%" height="100%" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="400" height="260" fill="#141414" />
          <g stroke="#262626" strokeWidth="10">
            <path d="M-10 70 L410 110" /><path d="M-10 190 L410 170" /><path d="M120 -10 L150 270" /><path d="M290 -10 L260 270" />
          </g>
          <path d="M-10 140 L410 135" stroke="#4a3f1c" strokeWidth="14" />
          <circle cx="205" cy="137" r="22" fill="rgba(212,175,55,0.15)" />
          <circle cx="205" cy="137" r="9" fill="#D4AF37" stroke="#121212" strokeWidth="3" />
        </svg>
        <span className="small" style={{ position: 'absolute', left: 14, bottom: 12, color: 'var(--gold)' }}>Get directions →</span>
      </a>
    )
  }
  return <div className="map" ref={ref} aria-label="Map showing Spade9 location" />
}
