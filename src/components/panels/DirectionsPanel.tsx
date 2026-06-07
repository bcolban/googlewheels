import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Paper,
  Box,
  Typography,
  Autocomplete,
  TextField,
  Button,
  IconButton,
  Stack,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material'
import MyLocation from '@mui/icons-material/MyLocation'
import CenterFocusStrong from '@mui/icons-material/CenterFocusStrong'
import Close from '@mui/icons-material/Close'
import TripOrigin from '@mui/icons-material/TripOrigin'
import Place from '@mui/icons-material/Place'
import DirectionsWalk from '@mui/icons-material/DirectionsWalk'
import { useTranslation } from 'react-i18next'
import { geocode, fetchWalkingRoute, buildRoute, type Place as GeoPlace } from '../../lib/routing'
import type { Report, SeedRoute } from '../../types'

interface Props {
  reports: Report[]
  mapCenter: { lat: number; lng: number }
  onClose: () => void
  onRoute: (route: SeedRoute) => void
}

/** Tek bir konum alanı: Nominatim ile debounce'lu arama yapan Autocomplete. */
function PlaceField({
  label,
  value,
  onChange,
  icon,
}: {
  label: string
  value: GeoPlace | null
  onChange: (p: GeoPlace | null) => void
  icon: React.ReactNode
}) {
  const { t, i18n } = useTranslation()
  const [input, setInput] = useState('')
  const [options, setOptions] = useState<GeoPlace[]>([])
  const [loading, setLoading] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current)
    if (input.trim().length < 3) {
      setOptions([])
      return
    }
    setLoading(true)
    timer.current = window.setTimeout(async () => {
      try {
        setOptions(await geocode(input, i18n.language))
      } catch {
        setOptions([])
      } finally {
        setLoading(false)
      }
    }, 450)
    return () => window.clearTimeout(timer.current)
  }, [input, i18n.language])

  return (
    <Autocomplete<GeoPlace>
      value={value}
      onChange={(_, v) => onChange(v)}
      onInputChange={(_, v) => setInput(v)}
      options={options}
      loading={loading}
      filterOptions={(x) => x}
      getOptionLabel={(o) => o.label}
      isOptionEqualToValue={(a, b) => a.lat === b.lat && a.lng === b.lng}
      noOptionsText={input.trim().length < 3 ? t('directions.typeMore') : t('directions.noOptions')}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={t('directions.search')}
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: <Box sx={{ mr: 1, display: 'flex' }}>{icon}</Box>,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  )
}

export default function DirectionsPanel({ reports, mapCenter, onClose, onRoute }: Props) {
  const { t } = useTranslation()
  const [from, setFrom] = useState<GeoPlace | null>(null)
  const [to, setTo] = useState<GeoPlace | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const centerPlace = useMemo<GeoPlace>(
    () => ({ label: t('directions.mapCenter'), lat: mapCenter.lat, lng: mapCenter.lng }),
    [mapCenter, t],
  )

  function useMyLocation() {
    setError(null)
    if (!navigator.geolocation) {
      setError(t('directions.geoError'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setFrom({ label: t('directions.myLocation'), lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError(t('directions.geoError')),
    )
  }

  async function createRoute() {
    const start = from ?? centerPlace
    if (!to) return
    setBusy(true)
    setError(null)
    try {
      const osrm = await fetchWalkingRoute(start, to)
      onRoute(buildRoute(start, to, osrm, reports))
    } catch {
      setError(t('directions.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Paper
      elevation={6}
      component="section"
      aria-label={t('directions.title')}
      sx={{
        position: 'absolute',
        zIndex: 1200,
        top: { xs: 'auto', md: 88 },
        bottom: { xs: 0, md: 'auto' },
        left: { xs: 0, md: 16 },
        right: { xs: 0, md: 'auto' },
        width: { xs: '100%', md: 360 },
        borderRadius: { xs: '16px 16px 0 0', md: 3 },
        p: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <DirectionsWalk color="primary" /> {t('directions.title')}
        </Typography>
        <IconButton onClick={onClose} aria-label={t('report.cancel')} size="small">
          <Close />
        </IconButton>
      </Stack>

      <Stack spacing={1.5}>
        <PlaceField
          label={t('directions.from')}
          value={from}
          onChange={setFrom}
          icon={<TripOrigin sx={{ color: '#34A853', fontSize: 18 }} />}
        />
        <Stack direction="row" spacing={1}>
          <Chip icon={<MyLocation />} label={t('directions.myLocation')} onClick={useMyLocation} variant="outlined" size="small" />
          <Chip
            icon={<CenterFocusStrong />}
            label={t('directions.mapCenter')}
            onClick={() => setFrom(centerPlace)}
            variant="outlined"
            size="small"
          />
        </Stack>

        <PlaceField
          label={t('directions.to')}
          value={to}
          onChange={setTo}
          icon={<Place sx={{ color: '#EA4335', fontSize: 20 }} />}
        />

        {error && <Alert severity="error">{error}</Alert>}

        <Button
          variant="contained"
          size="large"
          disabled={!to || busy}
          onClick={createRoute}
          startIcon={busy ? <CircularProgress size={20} color="inherit" /> : <DirectionsWalk />}
        >
          {busy ? t('directions.creating') : t('directions.create')}
        </Button>
        <Typography variant="caption" color="text.secondary">
          {t('directions.coloredByReports')}
        </Typography>
        <Alert severity="info" icon={false} sx={{ py: 0, fontSize: '0.78rem' }}>
          {t('directions.rightClickTip')}
        </Alert>
      </Stack>
    </Paper>
  )
}
