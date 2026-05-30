import type { SvgIconComponent } from '@mui/icons-material'
import Construction from '@mui/icons-material/Construction'
import ReportProblem from '@mui/icons-material/ReportProblem'
import Elevator from '@mui/icons-material/Elevator'
import DirectionsCar from '@mui/icons-material/DirectionsCar'
import Terrain from '@mui/icons-material/Terrain'
import Texture from '@mui/icons-material/Texture'
import Stairs from '@mui/icons-material/Stairs'
import Accessible from '@mui/icons-material/Accessible'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Warning from '@mui/icons-material/Warning'
import Cancel from '@mui/icons-material/Cancel'
import type { ReportType, Severity } from '../types'

/** Engel türü → Material ikon bileşeni. */
export const TYPE_ICON: Record<ReportType, SvgIconComponent> = {
  roadwork: Construction,
  pothole: ReportProblem,
  elevator_broken: Elevator,
  parked_car: DirectionsCar,
  steep: Terrain,
  cobblestone: Texture,
  no_ramp: Stairs,
  accessible: Accessible,
}

/** Şiddet → ikon (renk + ikon + etiket birlikte; renk tek sinyal değildir). */
export const SEVERITY_ICON: Record<Severity, SvgIconComponent> = {
  green: CheckCircle,
  yellow: Warning,
  red: Cancel,
}

/** Türlerin varsayılan şiddeti (form ön-seçimi için). */
export const TYPE_DEFAULT_SEVERITY: Record<ReportType, Severity> = {
  roadwork: 'yellow',
  pothole: 'yellow',
  elevator_broken: 'red',
  parked_car: 'yellow',
  steep: 'red',
  cobblestone: 'red',
  no_ramp: 'red',
  accessible: 'green',
}

export const ALL_TYPES: ReportType[] = [
  'roadwork',
  'pothole',
  'elevator_broken',
  'parked_car',
  'steep',
  'cobblestone',
  'no_ramp',
  'accessible',
]
