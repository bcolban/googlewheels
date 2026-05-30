import type { Report } from '../types'
import { seedReports } from '../data/seedReports'
import { isSupabaseConfigured, supabase } from './supabase'
import { uid } from './geo'

const LS_REPORTS = 'gw_reports_v1'
const LS_ELEVATORS = 'gw_elevators_v1'

/** Veri kaynağının durumu — UI rozetini sürer. */
export type DataMode = 'live' | 'offline'

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* kota dolu olabilir — sessizce yok say */
  }
}

/**
 * Tüm bildirimleri getirir. Supabase yapılandırılmış ve erişilebilirse oradan;
 * aksi halde tohum (seed) + localStorage birleşiminden döner.
 * Dönen ikinci değer hangi modun kullanıldığını belirtir.
 */
export async function fetchReports(): Promise<{ reports: Report[]; mode: DataMode }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      const live = (data ?? []) as Report[]
      // Tohum verisini de göster ki harita demo'da hiç boş kalmasın.
      return { reports: [...live.map((r) => ({ ...r, source: 'supabase' as const })), ...seedReports], mode: 'live' }
    } catch {
      // ağ/uyku hatası → offline fallback
    }
  }
  const local = readLocal<Report[]>(LS_REPORTS, [])
  return { reports: [...local, ...seedReports], mode: isSupabaseConfigured ? 'offline' : 'offline' }
}

/** Yeni bir bildirim ekler ve eklenen kaydı döner. */
export async function addReport(
  input: Omit<Report, 'id' | 'created_at' | 'source'>,
): Promise<Report> {
  const record: Report = {
    ...input,
    id: uid(),
    created_at: new Date().toISOString(),
    source: 'user',
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          type: record.type,
          severity: record.severity,
          lat: record.lat,
          lng: record.lng,
          title: record.title,
          note: record.note ?? null,
        })
        .select()
        .single()
      if (error) throw error
      return { ...(data as Report), source: 'supabase' }
    } catch {
      // fallback: localStorage
    }
  }

  const local = readLocal<Report[]>(LS_REPORTS, [])
  writeLocal(LS_REPORTS, [record, ...local])
  return record
}

/** Asansör durumu (yerel katman — demo doğrulama akışı). */
export interface ElevatorStatus {
  status: 'working' | 'broken'
  reported_at: string
}

export function getElevatorStatus(id: string): ElevatorStatus | null {
  const map = readLocal<Record<string, ElevatorStatus>>(LS_ELEVATORS, {})
  return map[id] ?? null
}

export async function setElevatorStatus(
  id: string,
  status: 'working' | 'broken',
): Promise<ElevatorStatus> {
  const record: ElevatorStatus = { status, reported_at: new Date().toISOString() }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('elevator_status').insert({ location_id: id, status })
    } catch {
      /* sessiz fallback */
    }
  }

  const map = readLocal<Record<string, ElevatorStatus>>(LS_ELEVATORS, {})
  map[id] = record
  writeLocal(LS_ELEVATORS, map)
  return record
}
