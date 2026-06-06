import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Stack,
  IconButton,
} from '@mui/material'
import Close from '@mui/icons-material/Close'
import Place from '@mui/icons-material/Place'
import { useTranslation } from 'react-i18next'
import type { Report, ReportType, Severity } from '../../types'
import { ALL_TYPES, TYPE_ICON, TYPE_DEFAULT_SEVERITY, SEVERITY_ICON } from '../../lib/icons'
import { SEVERITY_COLOR } from '../../theme/theme'

interface Props {
  open: boolean
  onClose: () => void
  /** Form gönderildiğinde çağrılır; konum App tarafından (harita merkezi) verilir. */
  onSubmit: (input: Omit<Report, 'id' | 'created_at' | 'source'>) => void
  /** Bildirimin ekleneceği konum (harita merkezi ya da seçilen nokta). */
  location: { lat: number; lng: number }
}

const SEVERITIES: Severity[] = ['green', 'yellow', 'red']

export default function ReportForm({ open, onClose, onSubmit, location }: Props) {
  const { t } = useTranslation()
  const [type, setType] = useState<ReportType>('roadwork')
  const [severity, setSeverity] = useState<Severity>('yellow')
  const [note, setNote] = useState('')

  // Tür seçilince varsayılan şiddeti öner
  useEffect(() => {
    setSeverity(TYPE_DEFAULT_SEVERITY[type])
  }, [type])

  function reset() {
    setType('roadwork')
    setNote('')
  }

  function submit() {
    onSubmit({
      type,
      severity,
      lat: location.lat,
      lng: location.lng,
      title: t(`types.${type}`),
      note: note.trim() || undefined,
    })
    reset()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="report-title">
      <DialogTitle id="report-title" sx={{ pr: 6 }}>
        <Typography component="span" variant="h6" sx={{ fontWeight: 700 }}>
          {t('report.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('report.subtitle')}
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label={t('report.cancel')}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Engel türü — ikon grid */}
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          {t('report.type')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 1,
            mb: 3,
          }}
          role="radiogroup"
          aria-label={t('report.type')}
        >
          {ALL_TYPES.map((tp) => {
            const Icon = TYPE_ICON[tp]
            const selected = tp === type
            return (
              <Box
                key={tp}
                role="radio"
                aria-checked={selected}
                tabIndex={0}
                onClick={() => setType(tp)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setType(tp)
                  }
                }}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 2,
                  p: 1.25,
                  minHeight: 84,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: 0.5,
                  border: selected ? '2px solid #1a73e8' : '2px solid #e0e0e0',
                  bgcolor: selected ? 'rgba(26,115,232,0.08)' : '#fff',
                  transition: 'border-color .15s, background-color .15s',
                }}
              >
                <Icon sx={{ color: selected ? '#1a73e8' : '#5f6368' }} />
                <Typography variant="caption" sx={{ lineHeight: 1.1, fontWeight: selected ? 600 : 400 }}>
                  {t(`types.${tp}`)}
                </Typography>
              </Box>
            )
          })}
        </Box>

        {/* Şiddet */}
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          {t('report.severity')}
        </Typography>
        <ToggleButtonGroup
          value={severity}
          exclusive
          onChange={(_, v) => v && setSeverity(v)}
          fullWidth
          sx={{ mb: 3 }}
          aria-label={t('report.severity')}
        >
          {SEVERITIES.map((s) => {
            const Icon = SEVERITY_ICON[s]
            return (
              <ToggleButton
                key={s}
                value={s}
                sx={{
                  py: 1.25,
                  gap: 0.75,
                  '&.Mui-selected': {
                    bgcolor: `${SEVERITY_COLOR[s]}1a`,
                    color: SEVERITY_COLOR[s],
                    fontWeight: 700,
                    '&:hover': { bgcolor: `${SEVERITY_COLOR[s]}26` },
                  },
                }}
              >
                <Icon fontSize="small" /> {t(`severity.${s}`)}
              </ToggleButton>
            )
          })}
        </ToggleButtonGroup>

        {/* Not */}
        <TextField
          label={t('report.noteLabel')}
          placeholder={t('report.notePlaceholder')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          inputProps={{ maxLength: 240 }}
        />
        <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} alignItems="center">
          <Place fontSize="small" sx={{ color: '#EA4335' }} aria-hidden />
          <Typography variant="caption" color="text.secondary">
            {t('report.selectedLocation')}: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} size="large" color="inherit">
          {t('report.cancel')}
        </Button>
        <Button onClick={submit} size="large" variant="contained">
          {t('report.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
