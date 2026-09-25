import { useCallback, useEffect, useState } from 'react'

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    if (!msg) return
    const id = setTimeout(() => setMsg(null), 2600)
    return () => clearTimeout(id)
  }, [msg])
  const node = msg ? <div className="toast" role="status">{msg}</div> : null
  return { toast: useCallback((m: string) => setMsg(m), []), node }
}
