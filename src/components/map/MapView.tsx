import { useEffect } from 'react'
import { MapContainer, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import { useTranslation } from 'react-i18next'

// İstanbul merkezli açılış (Beyoğlu / Galata civarı)
export const ISTANBUL_CENTER: LatLngExpression = [41.0308, 28.979]

interface Props {
  children?: React.ReactNode
  onMapClick?: (lat: number, lng: number) => void
  /** Harita kaydıkça merkez koordinatını bildirir (rapor için "ortayı kullan"). */
  onCenterChange?: (lat: number, lng: number) => void
  /** Harita bu noktaya/sınıra uçar (rota seçilince). */
  fitBounds?: [number, number][]
  /** Bu nokta/sayaç değişince haritayı oraya uçur (canlı konum butonu). */
  flyTo?: { lat: number; lng: number; token: number } | null
  /** Tıklayınca konum seçme modu açık mı (imleç değişir). */
  placing?: boolean
}

/** Tıklama ve merkez değişimini dışarıya bildirir. */
function ClickAndCenter({
  onMapClick,
  onCenterChange,
}: {
  onMapClick?: (lat: number, lng: number) => void
  onCenterChange?: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng)
    },
    moveend(e) {
      const c = e.target.getCenter()
      onCenterChange?.(c.lat, c.lng)
    },
  })
  return null
}

function FitBounds({ bounds }: { bounds?: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [60, 60], maxZoom: 16 })
    }
  }, [bounds, map])
  return null
}

function FlyTo({ target }: { target?: { lat: number; lng: number; token: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 16), { duration: 0.8 })
  }, [target?.token]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function MapView({ children, onMapClick, onCenterChange, fitBounds, flyTo, placing }: Props) {
  const { t } = useTranslation()
  return (
    <div
      role="application"
      aria-label={t('a11y.mapRegion')}
      style={{ position: 'absolute', inset: 0, cursor: placing ? 'crosshair' : '' }}
    >
      <MapContainer
        center={ISTANBUL_CENTER}
        zoom={14}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        {/* CARTO Voyager — ücretsiz, anahtarsız, Google Maps'e yakın görünüm */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <ZoomControl position="bottomleft" />
        <ClickAndCenter onMapClick={onMapClick} onCenterChange={onCenterChange} />
        <FitBounds bounds={fitBounds} />
        <FlyTo target={flyTo} />
        {children}
      </MapContainer>
    </div>
  )
}
