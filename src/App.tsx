import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { Fab, Snackbar, Alert, Box, Typography, Tooltip } from '@mui/material'
import AddLocationAlt from '@mui/icons-material/AddLocationAlt'
import MyLocation from '@mui/icons-material/MyLocation'
import { useTranslation } from 'react-i18next'

import { buildTheme } from './theme/theme'
import MapView, { ISTANBUL_CENTER } from './components/map/MapView'
import LivingRoute from './components/map/LivingRoute'
import ReportMarkers from './components/map/ReportMarkers'
import ElevatorMarkers from './components/map/ElevatorMarkers'
import UserLocationMarker from './components/map/UserLocationMarker'
import { useGeolocation } from './hooks/useGeolocation'
import TopBar from './components/layout/TopBar'
import IntroDialog from './components/layout/IntroDialog'
import RoutePanel from './components/panels/RoutePanel'
import ReportForm from './components/panels/ReportForm'
import LocationPicker from './components/panels/LocationPicker'
import DirectionsPanel from './components/panels/DirectionsPanel'
import ElevatorVerifyDialog from './components/verification/ElevatorVerifyDialog'

import type { ElevatorPoint, Report, SeedRoute } from './types'
import { taksimGalataRoute } from './data/seedRoutes'
import { flattenPoints } from './lib/geo'
import { addReport, fetchReports, type DataMode } from './lib/reportsRepo'
import { fetchWalkingRoute, buildRoute, type Place as GeoPlace } from './lib/routing'

export type FontScale = 'small' | 'normal' | 'large'
const FONT_PX: Record<FontScale, number> = { small: 14, normal: 16, large: 19 }

export default function App() {
  const { t } = useTranslation()

  // Veri
  const [reports, setReports] = useState<Report[]>([])
  const [dataMode, setDataMode] = useState<DataMode>('offline')

  // Katman / rota
  const [layerOn, setLayerOn] = useState(true)
  const [route, setRoute] = useState<SeedRoute | null>(null)

  // Dialoglar
  const [introOpen, setIntroOpen] = useState(true)
  const [reportOpen, setReportOpen] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [directionsOpen, setDirectionsOpen] = useState(false)
  const [elevator, setElevator] = useState<ElevatorPoint | null>(null)
  const [elevatorOpen, setElevatorOpen] = useState(false)
  const [snack, setSnack] = useState<{ msg: string; sev: 'success' | 'error' } | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Canlı konum
  const geo = useGeolocation()
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; token: number } | null>(null)
  const flyToken = useRef(0)
  const wantRecenter = useRef(false)

  // A11y tercihleri (kalıcı)
  const [fontScale, setFontScale] = useState<FontScale>(
    () => (localStorage.getItem('gw_font') as FontScale) || 'normal',
  )
  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem('gw_contrast') === '1',
  )

  // Harita merkezi (rapor konumu için) — moveend ile güncellenir
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: (ISTANBUL_CENTER as [number, number])[0],
    lng: (ISTANBUL_CENTER as [number, number])[1],
  })

  const theme = useMemo(
    () => buildTheme(highContrast ? 'high-contrast' : 'normal'),
    [highContrast],
  )

  // Yazı ölçeği ve tercihleri uygula/sakla
  useEffect(() => {
    document.documentElement.style.fontSize = `${FONT_PX[fontScale]}px`
    localStorage.setItem('gw_font', fontScale)
  }, [fontScale])
  useEffect(() => {
    localStorage.setItem('gw_contrast', highContrast ? '1' : '0')
  }, [highContrast])

  // Bildirimleri yükle
  const loadReports = useCallback(async () => {
    const { reports: data, mode } = await fetchReports()
    setReports(data)
    setDataMode(mode)
  }, [])

  useEffect(() => {
    void loadReports()
    // Başkalarının bildirimleri otomatik görünsün diye periyodik yenile (canlı modda)
    const id = window.setInterval(() => void loadReports(), 25000)
    const onFocus = () => void loadReports()
    window.addEventListener('focus', onFocus)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [loadReports])

  const handleSubmitReport = useCallback(
    async (input: Omit<Report, 'id' | 'created_at' | 'source'>) => {
      const saved = await addReport(input)
      setReports((prev) => [saved, ...prev])
      setReportOpen(false)
      setSnack({ msg: t('report.success'), sev: 'success' })
    },
    [t],
  )

  // Canlı konum butonu: konum varsa oraya uç, yoksa takibi başlat ve ilk sabitlemede uç
  const locate = useCallback(() => {
    if (geo.position) {
      flyToken.current += 1
      setFlyTo({ lat: geo.position.lat, lng: geo.position.lng, token: flyToken.current })
    } else {
      wantRecenter.current = true
      geo.start()
    }
  }, [geo])

  useEffect(() => {
    if (geo.position && wantRecenter.current) {
      wantRecenter.current = false
      flyToken.current += 1
      setFlyTo({ lat: geo.position.lat, lng: geo.position.lng, token: flyToken.current })
    }
  }, [geo.position])

  useEffect(() => {
    if (geo.error) setSnack({ msg: t(`locate.${geo.error}`), sev: 'error' })
  }, [geo.error, t])

  const openRoute = useCallback(() => {
    setRoute(taksimGalataRoute)
    setIntroOpen(false)
  }, [])

  // Haritaya sağ tıkla → o nokta hedef olsun, başlangıç canlı konum (yoksa harita merkezi)
  const routeToPoint = useCallback(
    async (lat: number, lng: number) => {
      const start: GeoPlace = geo.position
        ? { label: t('directions.myLocation'), lat: geo.position.lat, lng: geo.position.lng }
        : { label: t('directions.mapCenter'), lat: center.lat, lng: center.lng }
      const to: GeoPlace = { label: t('directions.pickedTarget'), lat, lng }
      setDirectionsOpen(false)
      setSnack({ msg: t('directions.targetSet'), sev: 'success' })
      try {
        const osrm = await fetchWalkingRoute(start, to)
        setRoute(buildRoute(start, to, osrm, reports))
      } catch {
        setSnack({ msg: t('directions.error'), sev: 'error' })
      }
    },
    [geo.position, center, reports, t],
  )

  const visibleReports = layerOn ? reports : []
  const fitBounds = route ? flattenPoints(route.segments) : undefined

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ position: 'fixed', inset: 0 }}>
        <MapView
          fitBounds={fitBounds}
          flyTo={flyTo}
          placing={placing}
          onCenterChange={(lat, lng) => setCenter({ lat, lng })}
          onMapRightClick={(lat, lng) => {
            if (!placing) void routeToPoint(lat, lng)
          }}
        >
          {layerOn && route && <LivingRoute route={route} />}
          {layerOn && <ReportMarkers reports={visibleReports} />}
          {geo.position && <UserLocationMarker position={geo.position} />}
          {layerOn && route && (
            <ElevatorMarkers
              elevators={route.elevators}
              onVerify={(e) => {
                setElevator(e)
                setElevatorOpen(true)
              }}
            />
          )}
        </MapView>

        <TopBar
          dataMode={dataMode}
          layerOn={layerOn}
          onToggleLayer={() => setLayerOn((v) => !v)}
          onDirections={() => setDirectionsOpen(true)}
          fontScale={fontScale}
          onFontScale={setFontScale}
          highContrast={highContrast}
          onHighContrast={setHighContrast}
        />

        {directionsOpen && (
          <DirectionsPanel
            reports={reports}
            mapCenter={center}
            onClose={() => setDirectionsOpen(false)}
            onRoute={(r) => {
              setRoute(r)
              setDirectionsOpen(false)
            }}
          />
        )}

        {route && !directionsOpen && (
          <RoutePanel
            route={route}
            refreshKey={refreshKey}
            onClose={() => setRoute(null)}
            onVerifyElevator={(e) => {
              setElevator(e)
              setElevatorOpen(true)
            }}
          />
        )}

        {/* Canlı konum (mavi nokta) butonu */}
        {!placing && (
          <Tooltip title={t('locate.button')} placement="left">
            <Fab
              size="medium"
              color={geo.tracking ? 'primary' : 'default'}
              onClick={locate}
              aria-label={t('locate.button')}
              aria-pressed={geo.tracking}
              sx={{
                position: 'absolute',
                zIndex: 1000,
                right: 16,
                bottom: { xs: 84, md: 96 },
                bgcolor: geo.tracking ? undefined : '#fff',
              }}
            >
              <MyLocation sx={{ color: geo.tracking ? '#fff' : '#1a73e8' }} />
            </Fab>
          </Tooltip>
        )}

        {/* Engel bildir — büyük, sabit FAB (konum seçme veya form açıkken gizlenir) */}
        {!placing && !reportOpen && (
          <Fab
            variant="extended"
            color="primary"
            onClick={() => setPlacing(true)}
            sx={{
              position: 'absolute',
              zIndex: 1000,
              right: 16,
              bottom: { xs: 16, md: 24 },
              fontWeight: 600,
              px: 2.5,
            }}
          >
            <AddLocationAlt sx={{ mr: 1 }} />
            {t('report.addButton')}
          </Fab>
        )}

        {/* Konum seçme katmanı: önce haritada yeri belirle, sonra formu aç */}
        {placing && (
          <LocationPicker
            center={center}
            onCancel={() => setPlacing(false)}
            onConfirm={() => {
              setPlacing(false)
              setReportOpen(true)
            }}
          />
        )}

        {/* Atıf / künye */}
        <Box
          sx={{
            position: 'absolute',
            zIndex: 900,
            left: 8,
            bottom: 4,
            pointerEvents: 'none',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <Typography variant="caption" sx={{ color: '#5f6368', textShadow: '0 1px 2px #fff' }}>
            {t('footer.thesis')}
          </Typography>
        </Box>
      </Box>

      <IntroDialog open={introOpen} onExplore={() => setIntroOpen(false)} onTryRoute={openRoute} />

      <ReportForm
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleSubmitReport}
        location={center}
      />

      <ElevatorVerifyDialog
        elevator={elevator}
        open={elevatorOpen}
        onClose={() => setElevatorOpen(false)}
        onUpdated={() => setRefreshKey((k) => k + 1)}
      />

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack?.sev ?? 'success'} onClose={() => setSnack(null)} sx={{ fontWeight: 500 }}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  )
}
