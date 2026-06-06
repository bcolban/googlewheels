import { Circle, CircleMarker } from 'react-leaflet'
import type { UserPosition } from '../../hooks/useGeolocation'

interface Props {
  position: UserPosition
}

/** Google-Maps tarzı canlı konum: doğruluk halkası + mavi nokta. */
export default function UserLocationMarker({ position }: Props) {
  const center: [number, number] = [position.lat, position.lng]
  return (
    <>
      <Circle
        center={center}
        radius={position.accuracy}
        pathOptions={{ color: '#1a73e8', weight: 1, fillColor: '#1a73e8', fillOpacity: 0.12 }}
      />
      <CircleMarker
        center={center}
        radius={8}
        pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#1a73e8', fillOpacity: 1 }}
      />
    </>
  )
}
