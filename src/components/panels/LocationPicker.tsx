import { Box, Paper, Typography, Button, Stack } from '@mui/material'
import Place from '@mui/icons-material/Place'
import { useTranslation } from 'react-i18next'

interface Props {
  /** Anlık merkez koordinatı (üstte gösterilir). */
  center: { lat: number; lng: number }
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Engel bildirmeden önce konum seçme katmanı.
 * Ekranın ortasında sabit bir işaret durur; kullanıcı haritayı kaydırarak
 * işareti engelin üzerine getirir ("haritayı işaretin altında oynat" deseni).
 */
export default function LocationPicker({ center, onConfirm, onCancel }: Props) {
  const { t } = useTranslation()
  return (
    <>
      {/* Üst bilgi şeridi */}
      <Paper
        elevation={4}
        sx={{
          position: 'absolute',
          zIndex: 1200,
          top: 72,
          left: '50%',
          transform: 'translateX(-50%)',
          px: 2,
          py: 1,
          borderRadius: 99,
          maxWidth: '92vw',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {t('report.placeTitle')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('report.placeHint')}
        </Typography>
      </Paper>

      {/* Ekran ortasındaki sabit işaret (ucu tam merkezde) */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          zIndex: 1150,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -100%)',
          pointerEvents: 'none',
          filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.4))',
        }}
      >
        <Place sx={{ fontSize: 52, color: '#EA4335' }} />
        {/* Yere değdiği noktayı belirten küçük halka */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: -4,
            width: 10,
            height: 4,
            bgcolor: 'rgba(0,0,0,0.3)',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      </Box>

      {/* Alt onay çubuğu */}
      <Paper
        elevation={6}
        sx={{
          position: 'absolute',
          zIndex: 1200,
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 24,
          px: 2,
          py: 1.5,
          borderRadius: 4,
          width: { xs: '92vw', sm: 'auto' },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          </Typography>
          <Button onClick={onCancel} color="inherit" size="large">
            {t('report.cancel')}
          </Button>
          <Button onClick={onConfirm} variant="contained" size="large" startIcon={<Place />}>
            {t('report.confirmLocation')}
          </Button>
        </Stack>
      </Paper>
    </>
  )
}
