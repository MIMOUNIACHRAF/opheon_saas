'use client'

interface EventItem {
  date: string
  title: string
  description: string
  badge: string
}

const EVENTS: EventItem[] = [
  {
    date: '25 Mai 2026',
    title: 'Soirée Gastronomique',
    description: 'Une soirée dédiée aux saveurs méditerranéennes avec un menu dégustation de 5 plats signatures préparés par notre chef.',
    badge: 'Événement',
  },
  {
    date: 'Tous les vendredis',
    title: 'Happy Hour Signature',
    description: 'De 18h à 20h, profitez de nos cocktails maison à prix réduit accompagnés de nos tapas orientaux.',
    badge: 'Offre Spéciale',
  },
  {
    date: '15 Juin 2026',
    title: 'Gala Nuit Marocaine',
    description: 'Célébrez avec nous la richesse de la table marocaine lors d\'un dîner festif avec musique live et spectacle.',
    badge: 'À venir',
  },
]

export function EventsSection() {
  return (
    <section className="py-24" style={{ background: '#1A0F0A' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-3">
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
            <span className="font-accent text-sm tracking-[0.4em] uppercase" style={{ color: '#C9A84C' }}>
              Agenda &amp; Promotions
            </span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
          </div>
          <h2 className="font-display text-4xl md:text-5xl" style={{ color: '#F5EDD8' }}>
            Événements <span style={{ color: '#C9A84C' }}>à venir</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {EVENTS.map((event, i) => (
            <div
              key={i}
              className="relative rounded-2xl p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                background: '#2C1F17',
                border: '1px solid rgba(201,168,76,0.15)',
              }}
            >
              <span
                className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wider"
                style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}
              >
                {event.badge}
              </span>

              <p className="font-accent text-sm mb-3" style={{ color: 'rgba(201,168,76,0.6)' }}>
                {event.date}
              </p>

              <h3 className="font-display text-2xl mb-4" style={{ color: '#F5EDD8' }}>
                {event.title}
              </h3>

              <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,237,216,0.5)' }}>
                {event.description}
              </p>

              <div
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
