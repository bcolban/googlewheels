import {
  Paper,
  Box,
  Typography,
  Stack,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
} from '@mui/material'
import DirectionsWalk from '@mui/icons-material/DirectionsWalk'
import Elevator from '@mui/icons-material/Elevator'
import Straighten from '@mui/icons-material/Straighten'
import Schedule from '@mui/icons-material/Schedule'
import Close from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import type { ElevatorPoint, SeedRoute } from '../../types'
import { getElevatorStatus } from '../../lib/reportsRepo'
import { timeAgo } from '../../lib/geo'
import RouteLegend from './RouteLegend'

interface Props {
  route: SeedRoute
  onVerifyElevator: (e: ElevatorPoint) => void
  onClose: () => void
  refreshKey?: number
}

/** Sol panel: seçili "Yaşayan Rota"nın özeti, açıklama ve asansör noktaları. */
export default function RoutePanel({ route, onVerifyElevator, onClose, refreshKey }: Props) {
  const { t, i18n } = useTranslation()
  return (
    <Paper
      elevation={4}
      component="aside"
      aria-label={t('route.title')}
      sx={{
        position: 'absolute',
        zIndex: 1000,
        top: { xs: 'auto', md: 88 },
        bottom: { xs: 0, md: 'auto' },
        left: { xs: 0, md: 16 },
        right: { xs: 0, md: 'auto' },
        width: { xs: '100%', md: 340 },
        maxHeight: { xs: '45vh', md: 'calc(100vh - 110px)' },
        overflowY: 'auto',
        borderRadius: { xs: '16px 16px 0 0', md: 3 },
        p: 2,
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <DirectionsWalk color="primary" /> {t('route.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t(route.fromKey)} → {t(route.toKey)}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label={t('report.cancel')}>
          <Close />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ my: 1.5 }}>
        <Chip icon={<Straighten />} label={t('route.distance', { km: (route.distanceMeters / 1000).toFixed(1) })} size="small" />
        <Chip icon={<Schedule />} label={t('route.duration', { min: route.durationMinutes })} size="small" />
      </Stack>

      <Typography variant="caption" color="text.secondary">
        {t('route.subtitle')}
      </Typography>

      <Divider sx={{ my: 1.5 }} />
      <RouteLegend />

      <Divider sx={{ my: 1.5 }} />
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {t('route.elevatorsOnRoute')}
      </Typography>
      <List dense disablePadding key={refreshKey}>
        {route.elevators.map((e) => {
          const local = getElevatorStatus(e.id)
          const status = local?.status ?? e.status
          const reportedAt = local?.reported_at ?? e.reported_at
          const color = status === 'working' ? '#188038' : '#c5221f'
          const msg =
            status === 'working'
              ? t('elevator.lastReportWorking', { time: timeAgo(reportedAt, i18n.language) })
              : t('elevator.lastReportBroken', { time: timeAgo(reportedAt, i18n.language) })
          return (
            <ListItemButton key={e.id} onClick={() => onVerifyElevator(e)} sx={{ borderRadius: 2 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Elevator sx={{ color }} />
              </ListItemIcon>
              <ListItemText
                primary={e.name}
                secondary={msg}
                slotProps={{
                  primary: { fontWeight: 600, fontSize: '0.9rem' },
                  secondary: { color, fontSize: '0.78rem' },
                }}
              />
            </ListItemButton>
          )
        })}
      </List>
    </Paper>
  )
}
