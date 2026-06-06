import { useCallback, useEffect, useRef, useState } from 'react'

export interface UserPosition {
  lat: number
  lng: number
  accuracy: number // metre
  heading: number | null
}

interface GeoState {
  position: UserPosition | null
  error: 'unsupported' | 'denied' | 'unavailable' | null
  tracking: boolean
}

/**
 * Cihazın canlı konumunu watchPosition ile izler.
 * start() izin ister ve canlı takibi başlatır; stop() durdurur.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ position: null, error: null, tracking: false })
  const watchId = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
    setState((s) => ({ ...s, tracking: false }))
  }, [])

  const start = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, error: 'unsupported' }))
      return
    }
    setState((s) => ({ ...s, tracking: true, error: null }))
    watchId.current = navigator.geolocation.watchPosition(
      (pos) =>
        setState({
          tracking: true,
          error: null,
          position: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: Number.isFinite(pos.coords.heading) ? pos.coords.heading : null,
          },
        }),
      (err) =>
        setState((s) => ({
          ...s,
          tracking: false,
          error: err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable',
        })),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    )
  }, [])

  // Bileşen kaldırılırken izlemeyi bırak
  useEffect(() => stop, [stop])

  return { ...state, start, stop }
}
