import {
  Paper,
  Box,
  InputBase,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Divider,
  useMediaQuery,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import DirectionsIcon from '@mui/icons-material/Directions'
import LayersIcon from '@mui/icons-material/Layers'
import CloudDoneIcon from '@mui/icons-material/CloudDone'
import StorageIcon from '@mui/icons-material/Storage'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import type { DataMode } from '../../lib/reportsRepo'
import type { FontScale } from '../../App'
import A11yMenu from './A11yMenu'

interface Props {
  dataMode: DataMode
  layerOn: boolean
  onToggleLayer: () => void
  onDirections: () => void
  fontScale: FontScale
  onFontScale: (v: FontScale) => void
  highContrast: boolean
  onHighContrast: (v: boolean) => void
}

export default function TopBar(props: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box
      component="header"
      sx={{
        position: 'absolute',
        zIndex: 1100,
        top: 12,
        left: 12,
        right: 12,
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          px: 1,
          py: 0.5,
          borderRadius: 99,
          flex: 1,
          maxWidth: 560,
          gap: 0.5,
        }}
      >
        {/* Logo + marka */}
        <Box
          component="img"
          src={`${import.meta.env.BASE_URL}logo.svg`}
          alt="GoogleWheels"
          sx={{ width: 32, height: 32, ml: 0.5 }}
        />
        {!isMobile && (
          <Box sx={{ fontWeight: 700, fontSize: '1.05rem', mr: 0.5, whiteSpace: 'nowrap' }}>
            Google<span style={{ color: '#1a73e8' }}>Wheels</span>
          </Box>
        )}
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <SearchIcon sx={{ color: '#5f6368' }} aria-hidden />
        <InputBase
          placeholder={t('search.placeholder')}
          inputProps={{ 'aria-label': t('search.placeholder') }}
          sx={{ flex: 1, fontSize: '0.95rem' }}
        />
        <Tooltip title={t('search.directions')}>
          <IconButton
            onClick={props.onDirections}
            aria-label={t('search.directions')}
            sx={{ color: '#1a73e8' }}
          >
            <DirectionsIcon />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Sağ kontrol grubu */}
      <Paper
        elevation={3}
        sx={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 99,
          px: 0.5,
        }}
      >
        <Tooltip title={`${t('layer.title')}: ${props.layerOn ? t('layer.on') : t('layer.off')}`}>
          <IconButton
            onClick={props.onToggleLayer}
            aria-label={t('layer.title')}
            aria-pressed={props.layerOn}
            sx={{ color: props.layerOn ? '#1a73e8' : '#9aa0a6' }}
          >
            <LayersIcon />
          </IconButton>
        </Tooltip>
        <A11yMenu
          fontScale={props.fontScale}
          onFontScale={props.onFontScale}
          highContrast={props.highContrast}
          onHighContrast={props.onHighContrast}
        />
      </Paper>

      {/* Veri modu rozeti (masaüstü) */}
      {!isMobile && (
        <Stack sx={{ pointerEvents: 'auto' }}>
          <Tooltip title={props.dataMode === 'live' ? t('data.liveTip') : t('data.offlineTip')}>
            <Chip
              icon={props.dataMode === 'live' ? <CloudDoneIcon /> : <StorageIcon />}
              label={props.dataMode === 'live' ? t('data.live') : t('data.offline')}
              color={props.dataMode === 'live' ? 'primary' : 'default'}
              sx={{ bgcolor: '#fff', boxShadow: 'var(--gw-shadow)', fontWeight: 600 }}
            />
          </Tooltip>
        </Stack>
      )}
    </Box>
  )
}
