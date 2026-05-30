import type { SeedRoute } from '../types'

// Demo "Yaşayan Rota": Taksim Meydanı → Galata Kulesi (İstiklal / Galip Dede ekseni).
// Segmentler fiziksel erişilebilirliğe göre renklendirilmiştir:
//  - Yeşil: düz yaya bölgesi
//  - Sarı: kalabalık / hafif eğim / bozuk zemin
//  - Kırmızı: dik parke taşı inişi
export const taksimGalataRoute: SeedRoute = {
  id: 'route-taksim-galata',
  fromKey: 'places.taksim',
  toKey: 'places.galata',
  distanceMeters: 1450,
  durationMinutes: 22,
  segments: [
    {
      severity: 'green',
      label: 'severity.greenDesc',
      points: [
        [41.037, 28.9853],
        [41.0366, 28.9842],
        [41.0358, 28.982],
        [41.0349, 28.9802],
        [41.0341, 28.9788],
      ],
    },
    {
      severity: 'yellow',
      label: 'severity.yellowDesc',
      points: [
        [41.0341, 28.9788],
        [41.0335, 28.9779],
        [41.0322, 28.9762],
        [41.0307, 28.9751],
        [41.0296, 28.9747],
      ],
    },
    {
      severity: 'red',
      label: 'severity.redDesc',
      points: [
        [41.0296, 28.9747],
        [41.0284, 28.9744],
        [41.0272, 28.9739],
        [41.0263, 28.974],
        [41.0256, 28.9742],
      ],
    },
  ],
  elevators: [
    {
      id: 'elev-sishane',
      name: 'Şişhane Metro (M2)',
      lat: 41.0296,
      lng: 28.9747,
      status: 'working',
      reported_at: '2026-05-30T08:55:00.000Z',
    },
    {
      id: 'elev-ata-ustgecit',
      name: 'Ata Üst Geçidi',
      lat: 41.0341,
      lng: 28.9788,
      status: 'working',
      reported_at: '2026-05-30T08:30:00.000Z',
    },
  ],
}

export const seedRoutes: SeedRoute[] = [taksimGalataRoute]
