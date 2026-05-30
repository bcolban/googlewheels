import { Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Box, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { Report } from '../../types'
import { reportDivIcon } from './markerIcons'
import { timeAgo } from '../../lib/geo'
import SeverityChip from '../common/SeverityChip'

interface Props {
  reports: Report[]
}

export default function ReportMarkers({ reports }: Props) {
  const { t, i18n } = useTranslation()
  return (
    <MarkerClusterGroup chunkedLoading maxClusterRadius={45} showCoverageOnHover={false}>
      {reports.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={reportDivIcon(r.type, r.severity)}
          alt={t('a11y.reportMarker', { title: r.title })}
          keyboard
        >
          <Popup minWidth={240} maxWidth={300}>
            <Box sx={{ fontFamily: 'inherit' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <SeverityChip severity={r.severity} />
              </Stack>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                {r.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                {t(`types.${r.type}`)} · {timeAgo(r.created_at, i18n.language)}
              </Typography>
              {r.note && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  “{r.note}”
                </Typography>
              )}
            </Box>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  )
}
