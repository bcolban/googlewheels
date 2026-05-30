import { createTheme, type ThemeOptions } from '@mui/material/styles'

// Google kurumsal renkleri (tezdeki marka kimliği)
export const GOOGLE = {
  blue: '#1a73e8',
  blueBright: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC05',
  green: '#34A853',
} as const

// Erişilebilirlik şiddet renkleri.
// NOT: Sarı beyaz üstünde düşük kontrastlıdır → metin/zemin için koyulaştırılmış tonlar.
export const SEVERITY_COLOR = {
  green: '#188038', // koyu yeşil (kontrast ≥ 4.5:1)
  yellow: '#b06000', // koyu amber (sarı yerine metin/çizgi için)
  red: '#c5221f', // koyu kırmızı
} as const

// Harita çizgisi için daha canlı tonlar (zemin beyaz değil, kontrast yeterli)
export const SEVERITY_LINE = {
  green: '#34A853',
  yellow: '#F9AB00',
  red: '#EA4335',
} as const

const sharedTypography: ThemeOptions['typography'] = {
  fontFamily: '"Roboto", "Segoe UI", system-ui, Arial, sans-serif',
  button: { textTransform: 'none', fontWeight: 500 },
  h6: { fontWeight: 600 },
}

/** Yüksek kontrast modu ve normal mod için tema üretir. */
export function buildTheme(mode: 'normal' | 'high-contrast' = 'normal') {
  const highContrast = mode === 'high-contrast'
  return createTheme({
    palette: {
      mode: 'light',
      primary: { main: GOOGLE.blue },
      secondary: { main: GOOGLE.green },
      error: { main: SEVERITY_COLOR.red },
      warning: { main: SEVERITY_COLOR.yellow },
      success: { main: SEVERITY_COLOR.green },
      background: {
        default: '#ffffff',
        paper: '#ffffff',
      },
      text: {
        primary: highContrast ? '#000000' : '#202124',
        secondary: highContrast ? '#1a1a1a' : '#5f6368',
      },
    },
    typography: sharedTypography,
    shape: { borderRadius: 12 },
    components: {
      // WCAG 2.5.8: dokunma hedefleri ≥ 44px, kritik aksiyonlar daha büyük
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { minHeight: 44, borderRadius: 24, paddingInline: 20, fontSize: '0.95rem' },
          sizeLarge: { minHeight: 56, fontSize: '1.05rem' },
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { minWidth: 44, minHeight: 44 } },
      },
      MuiFab: {
        styleOverrides: { root: { minWidth: 56, minHeight: 56 } },
      },
      // Görünür, kalın odak halkası (WCAG 2.2 — Focus Appearance)
      MuiCssBaseline: {
        styleOverrides: {
          '*:focus-visible': {
            outline: `3px solid ${GOOGLE.blueBright}`,
            outlineOffset: '2px',
          },
          ...(highContrast
            ? { body: { filter: 'contrast(1.15)' } }
            : {}),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: highContrast ? { border: '1px solid #000' } : {},
        },
      },
      MuiTooltip: {
        styleOverrides: { tooltip: { fontSize: '0.85rem' } },
      },
    },
  })
}

export const theme = buildTheme('normal')
