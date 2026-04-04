import { useEffect } from 'react'
import {
  Shirt,
  ShieldCheck,
  Timer,
  Sparkles,
  Truck,
  CheckCircle,
  Package,
  Phone,
  ArrowRight
} from 'lucide-react'

import Hero from '../components/Hero'
import ProcessTimeline from '../components/ProcessTimeline'
import FAQ from '../components/FAQ'

export default function Pressing() {
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
    { icon: Package, title: 'Dépôt en boutique', description: 'Apportez vos vêtements au comptoir. Noa vérifie chaque pièce avec vous et note les instructions spéciales.' },
    { icon: Truck, title: 'Envoi au pressing partenaire', description: 'Vos vêtements sont confiés à notre pressing partenaire spécialisé pour un traitement professionnel.' },
    { icon: Sparkles, title: 'Nettoyage & détachage', description: 'Nettoyage à sec ou aquanettoyage selon la matière. Détachage ciblé si nécessaire.' },
    { icon: CheckCircle, title: 'Contrôle qualité au retour', description: 'Chaque pièce est inspectée à son retour avant d\'être mise à disposition.' },
    { icon: Shirt, title: 'Retrait en boutique', description: 'Récupérez vos vêtements sur cintre, sous housse, prêts à porter. Délai habituel : 3 à 5 jours.' }
  ]

  const faqItems = [
    {
      question: 'Pourquoi le pressing est-il sous-traité ?',
      answer: 'Le nettoyage à sec nécessite des équipements spécialisés et des solvants professionnels. Nous travaillons avec un pressing partenaire de confiance pour vous garantir un résultat optimal, tout en assurant le contrôle qualité en boutique.'
    },
    {
      question: 'Quel est le délai pour récupérer mes vêtements ?',
      answer: 'Le délai standard est de 3 à 5 jours ouvrés. En haute saison (juillet-août), prévoyez un jour supplémentaire. Service express possible sur demande (supplément).'
    },
    {
      question: 'Acceptez-vous les pièces fragiles ou de luxe ?',
      answer: 'Oui, nous acceptons la soie, le cachemire, le lin, les costumes et robes de marque. Chaque pièce est examinée individuellement et traitée selon les recommandations du fabricant.'
    },
    {
      question: 'Que faire si je constate un problème sur une pièce ?',
      answer: 'Signalez-le lors du retrait en boutique. Nous assurons un suivi avec notre partenaire pressing et trouvons une solution adaptée (re-traitement, compensation).'
    },
    {
      question: 'Proposez-vous des retouches ?',
      answer: 'Pas directement, mais nous pouvons vous orienter vers un retoucheur de confiance sur le Bassin d\'Arcachon.'
    }
  ]

  return (
    <>
      <Hero
        eyebrow="Service · Pressing"
        title="Pressing soigné à Cap Ferret"
        subtitle="Confiez-nous vos vêtements délicats. Nettoyage professionnel par notre pressing partenaire, contrôle qualité en boutique."
        primary={{ text: 'Déposer mes vêtements', href: '/contact' }}
        secondary={{ text: 'Voir les tarifs', href: '#tarifs' }}
      />

      {/* Réassurance */}
      <section className="bg-mp-ivory py-6 border-b border-mp-light">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <ShieldCheck size={18} className="text-mp-sand" />
              <span>Pressing partenaire expert</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <Timer size={18} className="text-mp-sand" />
              <span>3–5 jours ouvrés</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <Sparkles size={18} className="text-mp-sand" />
              <span>Détachage inclus</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <Shirt size={18} className="text-mp-sand" />
              <span>Retour sur cintre sous housse</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ce que nous traitons */}
      <section className="section bg-mp-white">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Vêtements acceptés au pressing</h2>
            <p className="text-mp-gray max-w-2xl mx-auto">Du costume au manteau d'hiver, nous traitons toutes les pièces qui nécessitent un nettoyage professionnel.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-on-scroll">
            {[
              { name: 'Chemises', detail: 'Coton, lin, soie' },
              { name: 'Costumes & tailleurs', detail: '2 pièces et 3 pièces' },
              { name: 'Robes & jupes', detail: 'Toutes matières' },
              { name: 'Vestes & blazers', detail: 'Classiques et techniques' },
              { name: 'Manteaux', detail: 'Laine, cachemire, duvet' },
              { name: 'Pantalons', detail: 'Toile, laine, flanelle' },
              { name: 'Cravates & écharpes', detail: 'Soie et matières délicates' },
              { name: 'Robes de cérémonie', detail: 'Sur devis, traitement spécial' }
            ].map((item, i) => (
              <div key={i} className="card text-center p-6">
                <h3 className="text-mp-navy font-medium text-sm mb-1">{item.name}</h3>
                <p className="text-mp-gray text-xs">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pressing partenaire — transparence */}
      <section className="section bg-mp-ivory">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <span className="eyebrow block mb-4">Transparence</span>
              <h2 className="text-mp-navy font-light font-display text-3xl mb-6">Un pressing partenaire, un contrôle Maison Paliquey</h2>
              <p className="text-mp-gray mb-4 leading-relaxed">
                Le nettoyage à sec est un métier à part entière. Plutôt que d'investir dans des machines industrielles incompatibles avec notre positionnement artisanal, nous avons choisi de travailler avec un pressing partenaire reconnu.
              </p>
              <p className="text-mp-gray mb-6 leading-relaxed">
                Vous déposez et récupérez en boutique. Nous assurons le contrôle qualité au retour, et restons votre interlocuteur unique en cas de question.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  'Point de dépôt unique en boutique à Cap Ferret',
                  'Suivi de votre commande à chaque étape',
                  'Ticket avec timeline du process remis au dépôt',
                  'Contrôle visuel systématique au retour'
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-mp-dark">
                    <CheckCircle size={16} className="text-mp-sand flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="card p-8 bg-mp-navy text-white">
                <h3 className="font-display font-light text-xl mb-6 text-mp-sand">Le process en coulisses</h3>
                <ProcessTimeline steps={processSteps} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section className="section bg-mp-white" id="tarifs">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Tarifs pressing indicatifs</h2>
            <p className="text-mp-gray max-w-xl mx-auto">Tarifs TTC. Pièces délicates ou de luxe : devis sur présentation en boutique.</p>
          </div>
          <div className="max-w-3xl mx-auto animate-on-scroll">
            <div className="card overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-mp-ivory border-b border-mp-light">
                    <th className="px-6 py-3 text-mp-navy font-semibold text-xs uppercase tracking-wider">Vêtement</th>
                    <th className="px-6 py-3 text-mp-navy font-semibold text-xs uppercase tracking-wider text-right">Tarif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mp-light">
                  {[
                    ['Chemise', '4,50 €'],
                    ['Pantalon', '6,50 €'],
                    ['Veste / Blazer', '9,00 €'],
                    ['Costume 2 pièces', '15,00 €'],
                    ['Robe simple', '10,00 €'],
                    ['Manteau', '14,00 — 18,00 €'],
                    ['Cravate / Écharpe', '5,00 €'],
                  ].map(([item, price], i) => (
                    <tr key={i} className="hover:bg-mp-ivory/50 transition-colors">
                      <td className="px-6 py-4 text-mp-dark">{item}</td>
                      <td className="px-6 py-4 text-mp-navy font-semibold text-right">{price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-mp-gray text-center mt-4">Détachage inclus. Supplément possible pour pièces spéciales (cuir, fourrure, robe de mariée).</p>
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
          <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Un vêtement à confier ?</h2>
          <p className="text-mp-gray mb-8 max-w-lg mx-auto">Passez en boutique ou contactez-nous pour toute question sur le traitement de vos pièces.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/contact" className="btn btn-primary">Nous contacter</a>
            <a href="tel:+33556XXXXXX" className="btn btn-ghost flex items-center justify-center gap-2">
              <Phone size={18} /> 05 56 XX XX XX
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
