import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReportType, Severity } from '../../types'
import { TYPE_ICON } from '../../lib/icons'
import { SEVERITY_LINE } from '../../theme/theme'
import Elevator from '@mui/icons-material/Elevator'

const cache = new Map<string, L.DivIcon>()

/** Damla biçimli, şiddet rengine boyalı, içinde tür ikonu olan harita pini. */
export function reportDivIcon(type: ReportType, severity: Severity): L.DivIcon {
  const key = `${type}-${severity}`
  const cached = cache.get(key)
  if (cached) return cached

  const color = SEVERITY_LINE[severity]
  const Icon = TYPE_ICON[type]
  const glyph = renderToStaticMarkup(
    <Icon style={{ width: 18, height: 18, color: '#fff' }} />,
  )

  const html = `
    <div class="gw-pin" style="--pin:${color}">
      <div class="gw-pin__body">${glyph}</div>
    </div>`

  const icon = L.divIcon({
    html,
    className: 'gw-pin-wrap',
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -42],
  })
  cache.set(key, icon)
  return icon
}

/** Asansör/geçiş noktası için ayırt edilebilir mavi işaretçi. */
export function elevatorDivIcon(status: 'working' | 'broken'): L.DivIcon {
  const key = `elev-${status}`
  const cached = cache.get(key)
  if (cached) return cached

  const color = status === 'working' ? '#1a73e8' : '#c5221f'
  const glyph = renderToStaticMarkup(
    <Elevator style={{ width: 18, height: 18, color: '#fff' }} />,
  )
  const html = `
    <div class="gw-pin gw-pin--elevator" style="--pin:${color}">
      <div class="gw-pin__body">${glyph}</div>
    </div>`
  const icon = L.divIcon({
    html,
    className: 'gw-pin-wrap',
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -42],
  })
  cache.set(key, icon)
  return icon
}
