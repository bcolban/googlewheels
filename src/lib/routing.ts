import type { Report, RouteSegment, SeedRoute, Severity } from '../types'
import { haversine, uid } from './geo'

/** Arama sonucundan dönen yer. */
export interface Place {
  label: string
  lat: number
  lng: number
}

/**
 * OpenStreetMap Nominatim ile adres/yer arama (ücretsiz, anahtarsız).
 * Türkiye ile sınırlandırılmıştır; nazik kullanım için çağıran taraf debounce uygular.
 */
export async function geocode(query: string, lang = 'tr'): Promise<Place[]> {
  if (query.trim().length < 3) return []
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=tr' +
    `&accept-language=${encodeURIComponent(lang)}&q=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('geocode failed')
  const data = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>
  return data.map((d) => ({
    label: d.display_name,
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
  }))
}

interface OsrmRoute {
  coords: [number, number][] // [lat,lng]
  distance: number
  duration: number
}

/** OSRM public 'foot' profili ile yaya rotası (sokakları izleyen geometri). */
export async function fetchWalkingRoute(from: Place, to: Place): Promise<OsrmRoute> {
  const url =
    `https://router.project-osrm.org/route/v1/foot/${from.lng},${from.lat};${to.lng},${to.lat}` +
    '?overview=full&geometries=geojson'
  const res = await fetch(url)
  if (!res.ok) throw new Error('route failed')
  const data = await res.json()
  if (!data.routes?.length) throw new Error('no route')
  const r = data.routes[0]
  return {
    coords: (r.geometry.coordinates as [number, number][]).map((c) => [c[1], c[0]]),
    distance: r.distance,
    duration: r.duration,
  }
}

// Bir rota noktasının "engelli" sayılması için bir bildirime maksimum uzaklık (metre)
const OBSTACLE_RADIUS = 45

/**
 * Rota noktalarını yakındaki engel bildirimlerine göre renklendirir.
 * Kırmızı bildirim yakınsa kırmızı, sarı yakınsa sarı, yoksa yeşil.
 * Ardışık aynı renkli noktalar tek segmentte birleşir (sınırlar paylaşılır).
 */
export function colorByReports(coords: [number, number][], reports: Report[]): RouteSegment[] {
  const obstacles = reports.filter((r) => r.severity === 'red' || r.severity === 'yellow')

  const pointSeverity = (pt: [number, number]): Severity => {
    let worst: Severity = 'green'
    for (const o of obstacles) {
      if (haversine(pt, [o.lat, o.lng]) <= OBSTACLE_RADIUS) {
        if (o.severity === 'red') return 'red'
        worst = 'yellow'
      }
    }
    return worst
  }

  const labelKey: Record<Severity, string> = {
    green: 'severity.greenDesc',
    yellow: 'severity.yellowDesc',
    red: 'severity.redDesc',
  }

  const segments: RouteSegment[] = []
  let current: RouteSegment | null = null
  for (let i = 0; i < coords.length; i++) {
    const sev = pointSeverity(coords[i])
    if (!current || current.severity !== sev) {
      if (current) current.points.push(coords[i]) // sınırı paylaş (kesintisiz çizgi)
      current = { severity: sev, label: labelKey[sev], points: [coords[i]] }
      segments.push(current)
    } else {
      current.points.push(coords[i])
    }
  }
  return segments
}

/** Arama/seçim sonucundan, mevcut çizim altyapısıyla uyumlu bir rota nesnesi üretir. */
export function buildRoute(
  from: Place,
  to: Place,
  osrm: OsrmRoute,
  reports: Report[],
): SeedRoute {
  // Rota yakınındaki bozuk asansör bildirimlerini "asansör noktası" olarak göster
  const elevators = reports
    .filter((r) => r.type === 'elevator_broken')
    .filter((r) => osrm.coords.some((pt) => haversine(pt, [r.lat, r.lng]) <= 80))
    .map((r) => ({
      id: `rep-${r.id}`,
      name: r.title,
      lat: r.lat,
      lng: r.lng,
      status: 'broken' as const,
      reported_at: r.created_at,
    }))

  return {
    id: `route-${uid()}`,
    // i18next çeviri bulamazsa anahtarı aynen döndürür → düz etiketler de çalışır
    fromKey: shortLabel(from.label),
    toKey: shortLabel(to.label),
    distanceMeters: Math.round(osrm.distance),
    durationMinutes: Math.max(1, Math.round((osrm.distance / 1000 / 3.5) * 60)), // ~3.5 km/s tekerlekli sandalye
    segments: colorByReports(osrm.coords, reports),
    elevators,
  }
}

/** Uzun Nominatim adını kısa, okunur bir etikete indirger. */
export function shortLabel(displayName: string): string {
  return displayName.split(',').slice(0, 2).join(',').trim()
}
