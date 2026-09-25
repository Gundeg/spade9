/**
 * Local notification for the booking confirmation. Real push (app closed) needs a
 * service worker + Web Push/FCM on the server; this only covers the in-session case.
 */
export async function pushLocal(title: string, body: string): Promise<boolean> {
  if (typeof Notification === 'undefined') return false
  try {
    if (Notification.permission === 'default') await Notification.requestPermission()
    if (Notification.permission !== 'granted') return false
    new Notification(title, { body, icon: '/favicon.svg' })
    return true
  } catch {
    return false
  }
}
