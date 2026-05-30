import { Marker, Popup } from 'react-leaflet'
import { Box, Button, Stack, Typography } from '@mui/material'
import Elevator from '@mui/icons-material/Elevator'
import { useTranslation } from 'react-i18next'
import type { ElevatorPoint } from '../../types'
import { elevatorDivIcon } from './markerIcons'
import { getElevatorStatus } from '../../lib/reportsRepo'
import { timeAgo } from '../../lib/geo'

interface Props {
  elevators: ElevatorPoint[]
  onVerify: (e: ElevatorPoint) => void
}

export default function ElevatorMarkers({ elevators, onVerify }: Props) {
  const { t, i18n } = useTranslation()
  return (
    <>
      {elevators.map((e) => {
        const local = getElevatorStatus(e.id)
        const status = local?.status ?? e.status
        const reportedAt = local?.reported_at ?? e.reported_at
        const msg =
          status === 'working'
            ? t('elevator.lastReportWorking', { time: timeAgo(reportedAt, i18n.language) })
            : t('elevator.lastReportBroken', { time: timeAgo(reportedAt, i18n.language) })
        return (
          <Marker
            key={e.id}
            position={[e.lat, e.lng]}
            icon={elevatorDivIcon(status)}
            alt={t('a11y.elevatorMarker', { name: e.name })}
            keyboard
          >
            <Popup minWidth={220}>
              <Box sx={{ fontFamily: 'inherit' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Elevator fontSize="small" sx={{ color: status === 'working' ? '#1a73e8' : '#c5221f' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {e.name}
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', my: 0.5, color: status === 'working' ? '#188038' : '#c5221f', fontWeight: 600 }}
                >
                  {msg}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  fullWidth
                  onClick={() => onVerify(e)}
                  sx={{ mt: 0.5 }}
                >
                  {t('route.verifyCta')}
                </Button>
              </Box>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}
