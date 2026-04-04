import { useEffect } from 'react'
import {
  Shirt,
  Sparkles,
  Bed,
  Building2,
  Package,
  Truck,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react'

import Hero from '../components/Hero'
import TrustBar from '../components/TrustBar'
import ServiceCard from '../components/ServiceCard'
import TestimonialCard from '../components/TestimonialCard'
import ProcessTimeline from '../components/ProcessTimeline'
import AlternatingSection from '../components/AlternatingSection'
import ContactForm from '../components/ContactForm'
import FAQ from '../components/FAQ'

export default function Home() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
        }
      })
    }, observerOptions)

    const elements = document.querySelectorAll('.animate-on-scroll')
    elements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Hero */}
      <Hero
        eyebrow="Cap Ferret · Bassin d'Arcachon"
        title="Votre linge, entre de bonnes mains"
        subtitle="Blanchisserie artisanale premium pour particuliers et professionnels. Soin du détail, respect des textiles, délais tenus."
        primary={{ text: 'Demander un devis', href: '#contact' }}
        secondary={{ text: 'Nos services', href: '#services' }}
      />

      {/* Trust Bar */}
      <TrustBar />

      {/* Services Grid */}
      <section id="services" className="py-12 md:py-16 bg-mp-ivory">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll in-view">
            <h2 className="text-3xl md:text-4xl font-light font-display text-mp-navy mb-4">
              Nos services
            </h2>
            <p className="text-mp-gray max-w-lg mx-auto">
              Cinq solutions complètes pour répondre à tous vos besoins en matière de linge et de textile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              icon={Shirt}
              title="Blanchisserie"
              description="Service de lavage et repassage pour linge personnel et domestique."
              points={['Linge plié ou sur cintres', 'Traitement délicat des textiles', 'Tarifs à la pièce ou au poids']}
              link="/blanchisserie"
            />

            <ServiceCard
              icon={Sparkles}
              title="Pressing"
              description="Confiez vos articles délicats à notre pressing partenaire expert."
              points={['Nettoyage à sec professionnel', 'Contrôle qualité en boutique', 'Retour sur cintre sous housse']}
              link="/pressing"
            />

            <ServiceCard
              icon={Bed}
              title="Location de Linge"
              description="Kits complets draps, serviettes et linge de maison pour vos séjours."
              points={['Kits prêts à poser', 'Rotation linge propre / sale', 'Option percale 400 fils']}
              link="/location-linge"
            />

            <ServiceCard
              icon={Building2}
              title="Espace Professionnels"
              description="Service complet de gestion du linge pour conciergeries et établissements."
              points={['Tarifs dégressifs par volume', 'Facturation mensuelle', 'Interlocuteur dédié']}
              link="/professionnels"
            />
          </div>
        </div>
      </section>

      {/* Why Us - Alternating Sections */}
      <section className="py-12 md:py-16 bg-mp-white">
        <div className="container mb-12">
          <h2 className="text-3xl md:text-4xl font-light font-display text-mp-navy text-center mb-16 animate-on-scroll in-view">
            Pourquoi nous choisir ?
          </h2>
        </div>

        <AlternatingSection
          eyebrow="Soin artisanal"
          title="Le soin du linge, c'est notre métier"
          text="Depuis des années, nous perfectionnons nos techniques pour respecter chaque textile. Chaque pièce est traitée avec attention : observation du tissu, choix des produits, température d'eau, temps de lavage. C'est cet artisanat du quotidien qui fait la différence."
          link={{ text: 'Découvrir notre approche', href: '#' }}
          imagePosition="right"
          imageBg="from-mp-sand to-mp-ivory"
        />

        <AlternatingSection
          eyebrow="Ancrage local"
          title="Cap Ferret, notre terroir"
          text="Implanté à Cap Ferret depuis longtemps, nous connaissons notre communauté : résidents permanents, visiteurs saisonniers, établissements touristiques. Cette proximité nous permet de répondre vite et bien aux besoins spécifiques du Bassin d'Arcachon."
          link={{ text: 'Nous trouver', href: '#' }}
          imagePosition="left"
          imageBg="from-mp-blue to-mp-navy"
        />

        <AlternatingSection
          eyebrow="Expertise multi-services"
          title="Tous vos besoins en un lieu"
          text="Du simple repassage à la gestion complète du linge pour un hôtel, nous adaptons nos services à votre profil. Particulier, professionnel du tourisme, restaurateur ou collectivité : vous trouvez chez Maison Paliquey la solution à la bonne échelle."
          link={{ text: 'Explorer nos solutions', href: '#' }}
          imagePosition="right"
          imageBg="from-mp-purple to-mp-blue"
        />
      </section>

      {/* Pro Teaser */}
      <section className="bg-mp-navy text-white py-12 md:py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll in-view">
              <span className="eyebrow-light block mb-4">
                Pour les professionnels
              </span>
              <h2 className="text-3xl md:text-4xl font-light font-display text-white mb-6">
                Hôtels, restaurants, Airbnb : un partenaire linge à votre mesure
              </h2>
              <p className="text-mp-light mb-8 leading-relaxed">
                Compte dédié, suivi nominatif, facturation mensuelle, capacité à monter en charge en saison. Maison Paliquey est votre partenaire de confiance pour tous vos besoins en linge professionnel.
              </p>
              <a href="/professionnels" className="btn btn-sand">
                Demander un devis pro →
              </a>
            </div>

            <div className="hidden lg:flex items-center justify-center animate-on-scroll in-view" style={{ animationDelay: '0.2s' }}>
              <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-mp-sand/30 to-mp-ivory/20 flex items-center justify-center">
                <span className="text-mp-light text-center text-sm">Visuel Professionnel</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16 bg-mp-white">
        <div className="container max-w-5xl">
          <div className="text-center mb-12 animate-on-scroll in-view">
            <h2 className="text-3xl md:text-4xl font-light font-display text-mp-navy mb-4">
              Ce que nos clients disent
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Service impeccable. Linge toujours en parfait état, délais respectés. Merci pour ce partenariat fiable."
              author="Sophie L."
              role="Gestionnaire"
              establishment="Gîte Cap Ferret"
              rating={5}
            />

            <TestimonialCard
              quote="Le pressing est rapide et soigné. On confie nos costumes sans stress. Vraiment recommandé."
              author="Marc D."
              role="Restaurateur"
              establishment="Restaurant Bassin d'Arcachon"
              rating={5}
            />

            <TestimonialCard
              quote="Blanchisserie au-dessus de tout. Pas de machine à laver à la villa, et hop, c'est résolu en 48h. Parfait."
              author="Elisabeth M."
              role="Résidente"
              establishment="Vacancière Cap Ferret"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Process Timeline Section */}
      <section className="py-12 md:py-16 bg-mp-ivory">
        <div className="container max-w-3xl">
          <div className="text-center mb-12 animate-on-scroll in-view">
            <h2 className="text-3xl md:text-4xl font-light font-display text-mp-navy mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-mp-gray">
              Découvrez le processus simple pour nous confier votre linge.
            </p>
          </div>

          <ProcessTimeline
            steps={[
              { icon: Package, title: 'Dépôt chez nous', description: 'Amenez votre linge à notre établissement. Nous enregistrons votre commande et discutons de vos besoins spécifiques.' },
              { icon: Shirt, title: 'Lavage & repassage', description: 'Votre linge est traité selon vos souhaits : lavage soigné, séchage adapté, repassage minutieux.' },
              { icon: CheckCircle, title: 'Contrôle qualité', description: 'Chaque pièce est vérifiée avant emballage pour garantir votre satisfaction.' },
              { icon: Truck, title: 'Retrait ou livraison', description: 'Récupérez votre commande chez nous ou laissez-nous la livrer à votre adresse.' }
            ]}
          />
        </div>
      </section>

      {/* FAQ */}
      <FAQ
        title="Vos questions, nos réponses"
        items={[
          { question: 'Quels sont vos tarifs ?', answer: 'Nos tarifs varient selon le service : blanchisserie à la pièce ou au poids, pressing à la pièce, location à la semaine. Contactez-nous pour un devis personnalisé adapté à votre profil (particulier ou professionnel).' },
          { question: 'Quel est le délai moyen de retour ?', answer: 'Délai standard : 48h pour le linge de blanchisserie. Pressing : variable selon la charge, généralement 5-7 jours. Pour les demandes urgentes, demandez-nous un service express.' },
          { question: 'Que se passe-t-il si mon linge est endommagé ?', answer: 'Chaque article est assuré. En cas de sinistre avéré, nous discutons d\'une solution (remplacement ou indemnité). Mais rassurez-vous : nos techniques soigneuses minimisent ce risque.' },
          { question: 'Proposez-vous un service de livraison ?', answer: 'Oui, nous livrons à domicile à Cap Ferret et dans les environs. Des frais de livraison s\'appliquent. Pour les professionnels, nous pouvons mettre en place un service de collecte/livraison régulier.' },
          { question: 'Avez-vous des horaires étendus en été ?', answer: 'Oui, nous étendons nos horaires de juillet à août pour répondre à l\'afflux saisonnier. Consultez nos horaires en ligne ou appelez-nous.' },
          { question: 'Comment devenir partenaire professionnel ?', answer: 'Contactez-nous via notre formulaire devis pro ou appelez directement. Nous établissons un diagnostic gratuit et proposons une solution sur mesure : compte dédié, tarifs spéciaux, suivi nominatif.' }
        ]}
      />

      {/* Contact Section */}
      <section id="contact" className="py-12 md:py-16 bg-mp-ivory">
        <div className="container max-w-2xl">
          <ContactForm />
        </div>
      </section>

      {/* Info Bar */}
      <section className="bg-mp-navy text-white py-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <a href="tel:+33XXXXXXXXX" className="flex items-center gap-3 text-mp-light hover:text-mp-sand transition">
              <span className="text-mp-sand">📞</span>
              <span>05 XX XX XX XX</span>
            </a>
            <a href="mailto:contact@maisonpaliquey.fr" className="flex items-center gap-3 text-mp-light hover:text-mp-sand transition">
              <span className="text-mp-sand">✉️</span>
              <span>contact@maisonpaliquey.fr</span>
            </a>
            <div className="flex items-center gap-3 text-mp-light">
              <span className="text-mp-sand">📍</span>
              <span>[Adresse] · Cap Ferret, 33970</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
