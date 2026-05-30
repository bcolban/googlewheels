import type { Severity } from '../types'
import { SEVERITY_LINE } from '../theme/theme'

/** Şiddet değerine göre harita çizgisi rengi. */
export function severityLineColor(s: Severity): string {
  return SEVERITY_LINE[s]
}

/**
 * "x dk/saat/gün önce" biçiminde, dile duyarlı göreli zaman.
 * created: ISO tarih. now: opsiyonel referans (test için).
 */
export function timeAgo(iso: string, lang: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime()
  const diffSec = Math.max(1, Math.round((now.getTime() - then) / 1000))
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ]
  for (const [unit, secs] of units) {
    if (diffSec >= secs || unit === 'second') {
      return rtf.format(-Math.floor(diffSec / secs), unit)
    }
  }
  return rtf.format(0, 'second')
}

/** İki [lat,lng] noktası arasında basit kuş uçuşu mesafe (metre, Haversine). */
export function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Bir rota segment dizisindeki tüm noktaları tek listede toplar (haritayı sığdırmak için). */
export function flattenPoints(segments: { points: [number, number][] }[]): [number, number][] {
  return segments.flatMap((s) => s.points)
}

/** Basit benzersiz kimlik (crypto varsa onu, yoksa zaman+rastgele yedek). */
export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}
