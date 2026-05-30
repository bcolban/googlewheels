import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Stack,
} from '@mui/material'
import RouteIcon from '@mui/icons-material/Route'
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt'
import ElevatorIcon from '@mui/icons-material/Elevator'
import { useTranslation } from 'react-i18next'

interface Props {
  open: boolean
  onExplore: () => void
  onTryRoute: () => void
}

export default function IntroDialog({ open, onExplore, onTryRoute }: Props) {
  const { t } = useTranslation()
  const features = [
    { icon: <RouteIcon color="primary" />, text: t('intro.feature1') },
    { icon: <AddLocationAltIcon sx={{ color: '#EA4335' }} />, text: t('intro.feature2') },
    { icon: <ElevatorIcon sx={{ color: '#34A853' }} />, text: t('intro.feature3') },
  ]
  return (
    <Dialog open={open} maxWidth="xs" fullWidth aria-labelledby="intro-title">
      <DialogContent sx={{ p: 3, textAlign: 'center' }}>
        <Box
          component="img"
          src={`${import.meta.env.BASE_URL}logo.svg`}
          alt="GoogleWheels"
          sx={{ width: 72, height: 72, mb: 1 }}
        />
        <Typography id="intro-title" variant="h5" sx={{ fontWeight: 700 }}>
          {t('intro.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          {t('intro.body')}
        </Typography>

        <Stack spacing={1.25} sx={{ textAlign: 'left', mb: 3 }}>
          {features.map((f, i) => (
            <Stack key={i} direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ display: 'flex' }}>{f.icon}</Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {f.text}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Stack spacing={1}>
          <Button variant="contained" size="large" startIcon={<RouteIcon />} onClick={onTryRoute}>
            {t('intro.tryRoute')}
          </Button>
          <Button variant="text" size="large" onClick={onExplore}>
            {t('intro.start')}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
