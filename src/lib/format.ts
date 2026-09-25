export const money = (n: number) => `$${n % 1 === 0 ? n : n.toFixed(2)}`

export const fmtDate = (d: Date | string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }) =>
  new Date(d).toLocaleDateString('en-US', opts)

export const fmtTime = (d: Date | string) =>
  new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

export const fmtPoints = (n: number) => n.toLocaleString('en-US')
