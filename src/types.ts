// GoogleWheels — ortak tip tanımları

/** Erişilebilirlik şiddeti — renk + ikon + etiket birlikte kullanılır (renk körü güvenli). */
export type Severity = 'green' | 'yellow' | 'red'

/** Kullanıcıların bildirebileceği engel/durum türleri (tezdeki ikon seti). */
export type ReportType =
  | 'roadwork' // yol çalışması / şantiye
  | 'pothole' // çukur / bozuk zemin
  | 'elevator_broken' // bozuk asansör
  | 'parked_car' // hatalı park
  | 'steep' // dik eğim
  | 'cobblestone' // parke taşı
  | 'no_ramp' // rampa yok / yüksek bordür
  | 'accessible' // tam erişilebilir (olumlu bildirim)

/** Haritada gösterilen bir engel/erişilebilirlik bildirimi. */
export interface Report {
  id: string
  type: ReportType
  severity: Severity
  lat: number
  lng: number
  title: string
  note?: string
  created_at: string // ISO tarih
  source?: 'seed' | 'user' | 'supabase'
}

/** Bir noktanın "yaşayan rota" üzerindeki erişilebilirlik durumu. */
export interface RouteSegment {
  /** Segmenti oluşturan koordinatlar [lat, lng]. */
  points: [number, number][]
  severity: Severity
  /** Segmentle ilgili kullanıcıya gösterilecek kısa açıklama. */
  label: string
}

/** Asansör/geçiş gibi doğrulanabilir bir nokta (Verification Flow). */
export interface ElevatorPoint {
  id: string
  name: string
  lat: number
  lng: number
  /** En son bildirilen durum. */
  status: 'working' | 'broken'
  /** Son doğrulamanın ISO zamanı. */
  reported_at: string
}

/** Önceden tanımlı bir demo rotası. */
export interface SeedRoute {
  id: string
  fromKey: string // i18n anahtarı
  toKey: string
  distanceMeters: number
  durationMinutes: number
  segments: RouteSegment[]
  /** Rota üstündeki doğrulanabilir asansör/geçiş noktaları. */
  elevators: ElevatorPoint[]
}
