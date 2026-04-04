import { useEffect } from 'react'
import {
  Droplets,
  ThermometerSun,
  Timer,
  ShieldCheck,
  Shirt,
  Package,
  Truck,
  CheckCircle,
  Phone,
  ArrowRight
} from 'lucide-react'

import Hero from '../components/Hero'
import ProcessTimeline from '../components/ProcessTimeline'
import FAQ from '../components/FAQ'

export default function Blanchisserie() {
  useEffect(() => {
    window.scrollTo(0, 0)
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('in-view')),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const processSteps = [
    { icon: Package, title: 'Dépôt en boutique ou collecte', description: 'Apportez votre linge au 28 ter Route de Bordeaux ou programmez un retrait pour les pros.' },
    { icon: Droplets, title: 'Tri & lavage adapté', description: 'Chaque textile est trié par matière et couleur. Lavage à température contrôlée avec des produits professionnels respectueux des fibres.' },
    { icon: ThermometerSun, title: 'Séchage & repassage', description: 'Séchage calibré pour préserver la qualité. Repassage soigné pièce par pièce.' },
    { icon: CheckCircle, title: 'Contrôle qualité', description: 'Vérification visuelle et tactile de chaque article avant emballage.' },
    { icon: Truck, title: 'Retrait ou livraison', description: 'Récupérez en boutique ou recevez votre linge propre — délai standard 24 à 48h.' }
  ]

  const faqItems = [
    { question: 'Quels types de linge acceptez-vous ?', answer: 'Draps, housses de couette, serviettes, nappes, torchons, vêtements du quotidien, linge de maison. Nous traitons tous les textiles lavables en machine, des fibres naturelles aux synthétiques.' },
    { question: 'Quel est le délai de traitement ?', answer: 'Le délai standard est de 24 à 48 heures selon le volume. Pour les professionnels avec contrat, nous proposons des rotations le jour même sur certains créneaux.' },
    { question: 'Proposez-vous un service de collecte et livraison ?', answer: 'Oui, pour les clients professionnels (conciergeries, hôtels, restaurants) sur le secteur Cap Ferret — Lège — Arès. Les particuliers déposent et récupèrent en boutique.' },
    { question: 'Quels produits utilisez-vous ?', answer: 'Des produits lessiviels professionnels Christeyns, adaptés à chaque type de fibre. Nous proposons également un traitement hypoallergénique sur demande.' },
    { question: 'Comment sont calculés les tarifs ?', answer: 'Pour les particuliers, les tarifs sont à la pièce ou au poids selon le type d\'article. Les professionnels bénéficient de tarifs dégressifs par volume avec facturation mensuelle.' }
  ]

  return (
    <>
      <Hero
        eyebrow="Service · Blanchisserie"
        title="Blanchisserie artisanale à Cap Ferret"
        subtitle="Un soin professionnel pour votre linge du quotidien et vos textiles de maison. Lavage, séchage et repassage dans le respect de chaque fibre."
        primary={{ text: 'Demander un devis', href: '/contact' }}
        secondary={{ text: 'Nos tarifs', href: '#tarifs' }}
      />

      {/* Réassurance */}
      <section className="bg-mp-ivory py-6 border-b border-mp-light">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <ShieldCheck size={18} className="text-mp-sand" />
              <span>Produits professionnels</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <Timer size={18} className="text-mp-sand" />
              <span>24–48h de délai</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <Shirt size={18} className="text-mp-sand" />
              <span>Tri par matière</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <Droplets size={18} className="text-mp-sand" />
              <span>Respect des textiles</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ce que nous traitons */}
      <section className="section bg-mp-white" id="services">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Ce que nous traitons</h2>
            <p className="text-mp-gray max-w-2xl mx-auto">Du linge de lit aux vêtements du quotidien, nous prenons soin de chaque textile avec la même exigence.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-on-scroll">
            {[
              { name: 'Draps & housses', detail: 'Toutes tailles, coton et percale' },
              { name: 'Serviettes & peignoirs', detail: 'Bain, toilette, plage' },
              { name: 'Nappes & torchons', detail: 'Restauration et maison' },
              { name: 'Couettes & oreillers', detail: 'Synthétique et naturel' },
              { name: 'Vêtements quotidiens', detail: 'T-shirts, polos, pantalons' },
              { name: 'Linge de bébé', detail: 'Traitement hypoallergénique' },
              { name: 'Uniformes', detail: 'Personnel hôtelier et restauration' },
              { name: 'Rideaux & voilages', detail: 'Sur devis, prise de mesure' }
            ].map((item, i) => (
              <div key={i} className="card text-center p-6">
                <h3 className="text-mp-navy font-medium text-sm mb-1">{item.name}</h3>
                <p className="text-mp-gray text-xs">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section bg-mp-ivory">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Comment ça marche</h2>
            <p className="text-mp-gray max-w-xl mx-auto">Un process simple et transparent, du dépôt au retrait.</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ProcessTimeline steps={processSteps} />
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section className="section bg-mp-white" id="tarifs">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Nos tarifs indicatifs</h2>
            <p className="text-mp-gray max-w-xl mx-auto">Tarifs TTC pour les particuliers. Professionnels : contactez-nous pour un devis personnalisé.</p>
          </div>
          <div className="max-w-3xl mx-auto animate-on-scroll">
            <div className="card overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-mp-ivory border-b border-mp-light">
                    <th className="px-6 py-3 text-mp-navy font-semibold text-xs uppercase tracking-wider">Article</th>
                    <th className="px-6 py-3 text-mp-navy font-semibold text-xs uppercase tracking-wider text-right">Tarif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mp-light">
                  {[
                    ['Drap housse (1 ou 2 personnes)', '4,50 — 6,00 €'],
                    ['Housse de couette', '6,00 — 8,00 €'],
                    ['Serviette de bain', '3,00 €'],
                    ['Nappe restaurant', '5,00 — 7,00 €'],
                    ['Couette synthétique', '15,00 — 20,00 €'],
                    ['Linge au kilo (min. 3 kg)', '8,00 € / kg'],
                  ].map(([item, price], i) => (
                    <tr key={i} className="hover:bg-mp-ivory/50 transition-colors">
                      <td className="px-6 py-4 text-mp-dark">{item}</td>
                      <td className="px-6 py-4 text-mp-navy font-semibold text-right">{price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-mp-gray text-center mt-4">Tarifs susceptibles d'évoluer. Devis gratuit pour les professionnels et volumes importants.</p>
          </div>
        </div>
      </section>

      {/* CTA Pro */}
      <section className="py-16 bg-mp-navy text-white">
        <div className="container text-center animate-on-scroll">
          <h2 className="text-3xl font-light font-display mb-4">Vous êtes professionnel ?</h2>
          <p className="text-mp-light text-lg mb-8 max-w-xl mx-auto">Conciergeries, hôtels, restaurants — bénéficiez de tarifs dégressifs, d'un compte dédié et de rotations adaptées à votre activité.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/professionnels" className="btn btn-primary">Découvrir l'offre pro</a>
            <a href="tel:+33556XXXXXX" className="btn btn-ghost flex items-center justify-center gap-2">
              <Phone size={18} /> Appeler directement
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-mp-ivory">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Questions fréquentes</h2>
          </div>
          <div className="max-w-2xl mx-auto">
            <FAQ items={faqItems} />
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="section bg-mp-white">
        <div className="container text-center animate-on-scroll">
          <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Prêt à confier votre linge ?</h2>
          <p className="text-mp-gray mb-8 max-w-lg mx-auto">Déposez votre linge en boutique ou demandez un devis en ligne. Réponse sous 24h.</p>
          <a href="/contact" className="btn btn-primary">Demander un devis gratuit</a>
        </div>
      </section>
    </>
  )
}
