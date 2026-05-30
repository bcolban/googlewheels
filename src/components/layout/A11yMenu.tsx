import { useState } from 'react'
import {
  IconButton,
  Popover,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  Stack,
  Tooltip,
} from '@mui/material'
import Settings from '@mui/icons-material/SettingsAccessibility'
import Translate from '@mui/icons-material/Translate'
import { useTranslation } from 'react-i18next'
import type { FontScale } from '../../App'

interface Props {
  fontScale: FontScale
  onFontScale: (v: FontScale) => void
  highContrast: boolean
  onHighContrast: (v: boolean) => void
}

export default function A11yMenu({ fontScale, onFontScale, highContrast, onHighContrast }: Props) {
  const { t, i18n } = useTranslation()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  return (
    <>
      <Tooltip title={t('a11y.open')}>
        <IconButton
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label={t('a11y.open')}
          sx={{ color: '#5f6368' }}
        >
          <Settings />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, width: 280 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
            {t('a11y.title')}
          </Typography>

          {/* Dil */}
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Translate fontSize="small" /> {t('a11y.language')}
          </Typography>
          <ToggleButtonGroup
            value={i18n.language.startsWith('en') ? 'en' : 'tr'}
            exclusive
            fullWidth
            size="small"
            onChange={(_, v) => v && i18n.changeLanguage(v)}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="tr">Türkçe</ToggleButton>
            <ToggleButton value="en">English</ToggleButton>
          </ToggleButtonGroup>

          {/* Yazı boyutu */}
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {t('a11y.fontSize')}
          </Typography>
          <ToggleButtonGroup
            value={fontScale}
            exclusive
            fullWidth
            size="small"
            onChange={(_, v) => v && onFontScale(v)}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="small" sx={{ fontSize: '0.8rem' }}>
              {t('a11y.small')}
            </ToggleButton>
            <ToggleButton value="normal" sx={{ fontSize: '0.95rem' }}>
              {t('a11y.normal')}
            </ToggleButton>
            <ToggleButton value="large" sx={{ fontSize: '1.1rem' }}>
              {t('a11y.large')}
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Yüksek kontrast */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {t('a11y.highContrast')}
            </Typography>
            <Switch
              checked={highContrast}
              onChange={(e) => onHighContrast(e.target.checked)}
              inputProps={{ 'aria-label': t('a11y.highContrast') }}
            />
          </Stack>
        </Box>
      </Popover>
    </>
  )
}
