let enabled = true

export function setHapticsEnabled(v: boolean) {
  enabled = v
}

/** Vibration API: Android Chrome supports it; iOS Safari silently ignores it. */
export function haptic(pattern: number | number[] = 12) {
  if (!enabled) return
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* unsupported */
  }
}

export const HAPTIC_CONFIRM = [18, 60, 28]
