import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { Fab, Snackbar, Alert, Box, Typography } from '@mui/material'
import AddLocationAlt from '@mui/icons-material/AddLocationAlt'
import { useTranslation } from 'react-i18next'

import { buildTheme } from './theme/theme'
import MapView, { ISTANBUL_CENTER } from './components/map/MapView'
import LivingRoute from './components/map/LivingRoute'
import ReportMarkers from './components/map/ReportMarkers'
import ElevatorMarkers from './components/map/ElevatorMarkers'
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
  const [snack, setSnack] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

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
  }, [loadReports])

  const handleSubmitReport = useCallback(
    async (input: Omit<Report, 'id' | 'created_at' | 'source'>) => {
      const saved = await addReport(input)
      setReports((prev) => [saved, ...prev])
      setReportOpen(false)
      setSnack(t('report.success'))
    },
    [t],
  )

  const openRoute = useCallback(() => {
    setRoute(taksimGalataRoute)
    setIntroOpen(false)
  }, [])

  const visibleReports = layerOn ? reports : []
  const fitBounds = route ? flattenPoints(route.segments) : undefined

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ position: 'fixed', inset: 0 }}>
        <MapView
          fitBounds={fitBounds}
          placing={placing}
          onCenterChange={(lat, lng) => setCenter({ lat, lng })}
        >
          {layerOn && route && <LivingRoute route={route} />}
          {layerOn && <ReportMarkers reports={visibleReports} />}
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
        <Alert severity="success" onClose={() => setSnack(null)} sx={{ fontWeight: 500 }}>
          {snack}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  )
}
