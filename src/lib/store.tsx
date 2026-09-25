import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { BARBERS, DEMO_MEMBER, SERVICES, seedBookings } from '../data/mock'
import type { AppNotification, Booking, Member } from '../data/types'
import { runMemberTriggers } from './crm'
import { setHapticsEnabled } from './haptics'

/**
 * Client-side demo store persisted to localStorage. Every mutation here maps 1:1 to
 * a server call in production (auth, bookings, notifications, profile).
 */
interface State {
  member: Member | null
  bookings: Booking[]
  notifications: AppNotification[]
  applications: { name: string; email: string; phone: string; referral: string; at: string }[]
}

interface Store extends State {
  login: (email: string) => void
  logout: () => void
  apply: (a: Omit<State['applications'][number], 'at'>) => void
  book: (b: Omit<Booking, 'id' | 'status'>) => Booking
  reschedule: (id: string, start: string) => void
  cancel: (id: string) => void
  updateMember: (patch: Partial<Member>) => void
  markAllRead: () => void
  upcoming: Booking | null
}

const KEY = 'spade9.state.v1'

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as State
  } catch {
    /* storage unavailable */
  }
  return { member: null, bookings: [], notifications: [], applications: [] }
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable */
    }
    setHapticsEnabled(state.member?.preferences.haptics ?? true)
  }, [state])

  // CRM engine: evaluated on sign-in and whenever bookings change. Server-side cron in production.
  useEffect(() => {
    if (!state.member) return
    const fresh = runMemberTriggers(state.member, BARBERS, state.bookings)
    setState((s) => {
      const known = new Set(s.notifications.map((n) => n.id))
      const add = fresh.filter((n) => !known.has(n.id))
      return add.length ? { ...s, notifications: [...add, ...s.notifications] } : s
    })
  }, [state.member?.id, state.bookings])

  const login = useCallback((email: string) => {
    setState((s) => ({
      ...s,
      member: { ...DEMO_MEMBER, email: email || DEMO_MEMBER.email },
      bookings: s.bookings.length ? s.bookings : seedBookings(),
    }))
  }, [])

  const logout = useCallback(() => setState((s) => ({ ...s, member: null })), [])

  const apply = useCallback(
    (a: Omit<State['applications'][number], 'at'>) =>
      setState((s) => ({ ...s, applications: [...s.applications, { ...a, at: new Date().toISOString() }] })),
    [],
  )

  const book = useCallback((b: Omit<Booking, 'id' | 'status'>) => {
    const booking: Booking = { ...b, id: `b-${Date.now()}`, status: 'confirmed' }
    const barber = BARBERS.find((x) => x.id === b.barberId)
    const names = b.serviceIds.map((id) => SERVICES.find((s) => s.id === id)?.name).join(' + ')
    setState((s) => ({
      ...s,
      bookings: [...s.bookings, booking],
      notifications: [
        {
          id: `n-${booking.id}`,
          kind: 'booking',
          title: 'Цаг баталгаажлаа',
          body: `${names} · ${barber?.name} · ${new Date(b.start).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...s.notifications,
      ],
    }))
    return booking
  }, [])

  const reschedule = useCallback(
    (id: string, start: string) =>
      setState((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, start } : b)) })),
    [],
  )

  const cancel = useCallback(
    (id: string) =>
      setState((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)) })),
    [],
  )

  const updateMember = useCallback(
    (patch: Partial<Member>) => setState((s) => (s.member ? { ...s, member: { ...s.member, ...patch } } : s)),
    [],
  )

  const markAllRead = useCallback(
    () => setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
    [],
  )

  const upcoming = useMemo(() => {
    const now = Date.now()
    return (
      state.bookings
        .filter((b) => b.status === 'confirmed' && new Date(b.start).getTime() > now)
        .sort((a, b) => +new Date(a.start) - +new Date(b.start))[0] ?? null
    )
  }, [state.bookings])

  const value = useMemo<Store>(
    () => ({ ...state, login, logout, apply, book, reschedule, cancel, updateMember, markAllRead, upcoming }),
    [state, login, logout, apply, book, reschedule, cancel, updateMember, markAllRead, upcoming],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside StoreProvider')
  return s
}

export function useMember(): Member {
  const { member } = useStore()
  if (!member) throw new Error('useMember requires a signed-in member')
  return member
}
