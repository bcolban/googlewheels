import { Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { Severity } from '../../types'
import { SEVERITY_COLOR } from '../../theme/theme'
import { SEVERITY_ICON } from '../../lib/icons'

interface Props {
  severity: Severity
  size?: 'small' | 'medium'
}

/**
 * Erişilebilirlik şiddetini RENK + İKON + METİN birlikte gösterir.
 * Renk tek başına anlam taşımaz (renk körü ve yüksek kontrast için kritik).
 */
export default function SeverityChip({ severity, size = 'small' }: Props) {
  const { t } = useTranslation()
  const Icon = SEVERITY_ICON[severity]
  const color = SEVERITY_COLOR[severity]
  return (
    <Chip
      size={size}
      icon={<Icon sx={{ color: `${color} !important` }} aria-hidden />}
      label={t(`severity.${severity}`)}
      sx={{
        fontWeight: 600,
        color,
        bgcolor: `${color}14`,
        border: `1.5px solid ${color}`,
        '& .MuiChip-icon': { ml: 0.5 },
      }}
    />
  )
}
