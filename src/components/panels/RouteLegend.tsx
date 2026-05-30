import { Box, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { Severity } from '../../types'
import { SEVERITY_LINE, SEVERITY_COLOR } from '../../theme/theme'
import { SEVERITY_ICON } from '../../lib/icons'

const ORDER: Severity[] = ['green', 'yellow', 'red']

/** Rota renk kodlarının açıklaması — renk + çizgi örneği + ikon + metin. */
export default function RouteLegend() {
  const { t } = useTranslation()
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        {t('route.legendTitle')}
      </Typography>
      <Stack spacing={1.25}>
        {ORDER.map((s) => {
          const Icon = SEVERITY_ICON[s]
          return (
            <Stack key={s} direction="row" spacing={1.25} alignItems="center">
              <Box sx={{ width: 28, height: 6, borderRadius: 3, bgcolor: SEVERITY_LINE[s], flexShrink: 0 }} />
              <Icon fontSize="small" sx={{ color: SEVERITY_COLOR[s] }} aria-hidden />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: SEVERITY_COLOR[s], lineHeight: 1.2 }}>
                  {t(`severity.${s}`)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t(`severity.${s}Desc`)}
                </Typography>
              </Box>
            </Stack>
          )
        })}
      </Stack>
    </Box>
  )
}
