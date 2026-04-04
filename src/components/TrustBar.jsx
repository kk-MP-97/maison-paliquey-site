import { ShieldCheck, Clock, MapPin, Users } from 'lucide-react'

export default function TrustBar() {
  const items = [
    { icon: ShieldCheck, text: 'Linge nominatif', description: 'Identification et traçabilité' },
    { icon: Clock, text: 'Délais respectés', description: 'Engagements tenus' },
    { icon: MapPin, text: 'Cap Ferret', description: 'Ancrage local' },
    { icon: Users, text: 'Pros & particuliers', description: 'Flexibilité B2C/B2B' }
  ]

  return (
    <section className="bg-mp-ivory py-12 md:py-16">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="flex flex-col items-center text-center animate-on-scroll in-view" style={{ animationDelay: `${index * 0.1}s` }}>
                <Icon size={28} className="text-mp-sand mb-3" />
                <p className="font-medium text-mp-navy text-sm md:text-base">{item.text}</p>
                <p className="text-xs text-mp-gray mt-1">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
