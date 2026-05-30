import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Stack,
  Button,
  Alert,
  Box,
} from '@mui/material'
import Elevator from '@mui/icons-material/Elevator'
import CheckCircle from '@mui/icons-material/CheckCircle'
import BuildCircle from '@mui/icons-material/BuildCircle'
import { useTranslation } from 'react-i18next'
import type { ElevatorPoint } from '../../types'
import { setElevatorStatus } from '../../lib/reportsRepo'

interface Props {
  elevator: ElevatorPoint | null
  open: boolean
  onClose: () => void
  onUpdated?: () => void
}

/**
 * Tezdeki "Yerinde Doğrulama" akışı: kullanıcı asansörlü noktaya yaklaşınca
 * "Asansör hâlâ çalışıyor mu?" sorusu büyük, kolay dokunulabilir butonlarla sorulur.
 */
export default function ElevatorVerifyDialog({ elevator, open, onClose, onUpdated }: Props) {
  const { t } = useTranslation()
  const [result, setResult] = useState<'working' | 'broken' | null>(null)

  async function handle(status: 'working' | 'broken') {
    if (!elevator) return
    await setElevatorStatus(elevator.id, status)
    setResult(status)
    onUpdated?.()
  }

  function close() {
    setResult(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={close} maxWidth="xs" fullWidth aria-labelledby="elev-title">
      <DialogTitle id="elev-title" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
        <Elevator color="primary" /> {t('elevator.dialogTitle')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {t('elevator.dialogBody', { name: elevator?.name ?? '' })}
        </DialogContentText>

        {result ? (
          <Box aria-live="polite">
            <Alert severity={result === 'working' ? 'success' : 'warning'} sx={{ fontWeight: 500 }}>
              {result === 'working' ? t('elevator.thanksWorking') : t('elevator.thanksBroken')}
            </Alert>
            <Button fullWidth size="large" variant="text" onClick={close} sx={{ mt: 2 }}>
              {t('report.cancel')}
            </Button>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            <Button
              size="large"
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={() => handle('working')}
              sx={{ py: 2, fontSize: '1.1rem', bgcolor: '#1a73e8' }}
            >
              {t('elevator.working')}
            </Button>
            <Button
              size="large"
              variant="outlined"
              color="inherit"
              startIcon={<BuildCircle />}
              onClick={() => handle('broken')}
              sx={{ py: 2, fontSize: '1.1rem', borderColor: '#5f6368', color: '#3c4043' }}
            >
              {t('elevator.broken')}
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  )
}
