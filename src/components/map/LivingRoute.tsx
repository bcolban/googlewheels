import { Polyline, Tooltip } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import type { SeedRoute } from '../../types'
import { severityLineColor } from '../../lib/geo'

interface Props {
  route: SeedRoute
}

/**
 * "Yaşayan Rota": her segment fiziksel erişilebilirliğe göre ayrı renkte çizilir.
 * Renk tek sinyal olmasın diye her segmentin tooltip'inde açıklama vardır.
 */
export default function LivingRoute({ route }: Props) {
  const { t } = useTranslation()
  return (
    <>
      {route.segments.map((seg, i) => {
        const color = severityLineColor(seg.severity)
        return (
          <Polyline
            key={i}
            positions={seg.points}
            pathOptions={{ color, weight: 7, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }}
          >
            <Tooltip sticky>
              <strong>{t(`severity.${seg.severity}`)}</strong>
              <br />
              {t(seg.label)}
            </Tooltip>
          </Polyline>
        )
      })}
    </>
  )
}
