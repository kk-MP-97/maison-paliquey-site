import { useEffect } from 'react'
import {
  Bed,
  CalendarDays,
  Repeat,
  ShieldCheck,
  Package,
  Truck,
  CheckCircle,
  Phone,
  Star,
  ArrowRight
} from 'lucide-react'

import Hero from '../components/Hero'
import ProcessTimeline from '../components/ProcessTimeline'
import FAQ from '../components/FAQ'

export default function LocationLinge() {
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
    { icon: CalendarDays, title: 'Réservation', description: 'En boutique, par téléphone ou via le formulaire en ligne. Indiquez vos dates et le nombre de lits.' },
    { icon: Package, title: 'Préparation du kit', description: 'Nous préparons vos kits complets : draps, housses, taies, serviettes, tapis de bain. Tout est frais et repassé.' },
    { icon: Truck, title: 'Mise à disposition', description: 'Retrait en boutique ou livraison pour les pros. Les kits sont prêts à poser directement.' },
    { icon: Repeat, title: 'Retour & rotation', description: 'Déposez le linge sale en boutique. Pour les pros, nous assurons la rotation : linge propre contre linge sale.' }
  ]

  const faqItems = [
    { question: 'Que contient un kit de location ?', answer: 'Un kit Standard Double (lit 160cm) comprend : 1 drap housse, 1 housse de couette, 2 taies d\'oreiller, 2 serviettes de bain et 1 tapis de bain. Le kit Premium ajoute du linge en percale 400 fils et un peignoir.' },
    { question: 'Quelle est la durée minimale de location ?', answer: 'Il n\'y a pas de durée minimale. La location se fait à la rotation : vous récupérez un kit propre et nous rendez le linge sale. Idéal pour un week-end comme pour un mois entier.' },
    { question: 'Proposez-vous des kits pour lit simple ?', answer: 'Oui, le kit Standard Simple (lit 90cm) est à 15 € la rotation. Il comprend drap housse, housse de couette, 1 taie, 1 serviette de bain et 1 tapis de bain.' },
    { question: 'Les draps sont-ils lavés et repassés entre chaque location ?', answer: 'Absolument. Chaque kit est lavé, séché, repassé et contrôlé entre chaque rotation. C\'est notre métier de blanchisseur.' },
    { question: 'Je suis conciergerie, quels avantages pour les pros ?', answer: 'Tarifs dégressifs par volume, facturation mensuelle, rotations rapides (parfois le jour même), un interlocuteur unique et un suivi de vos kits via notre application. Contactez-nous pour un contrat personnalisé.' }
  ]

  const kits = [
    {
      name: 'Kit Standard Simple',
      desc: 'Lit 90cm — 1 personne',
      price: '15',
      items: ['Drap housse 90x200', 'Housse de couette 140x200', 'Taie d\'oreiller x1', 'Serviette de bain x1', 'Tapis de bain x1'],
      popular: false
    },
    {
      name: 'Kit Standard Double',
      desc: 'Lit 160cm — 2 personnes',
      price: '22',
      items: ['Drap housse 160x200', 'Housse de couette 240x220', 'Taie d\'oreiller x2', 'Serviette de bain x2', 'Tapis de bain x1'],
      popular: true
    },
    {
      name: 'Kit Premium 400TC',
      desc: 'Percale 400 fils — haut de gamme',
      price: '34',
      items: ['Drap housse percale 160x200', 'Housse couette percale 240x220', 'Taie percale x2', 'Serviette éponge premium x2', 'Peignoir x1'],
      popular: false
    }
  ]

  return (
    <>
      <Hero
        eyebrow="Service · Location de linge"
        title="Location de linge à Cap Ferret"
        subtitle="Kits complets pour vos locations saisonnières. Draps, serviettes, linge de maison — tout est prêt, propre, repassé."
        primary={{ text: 'Réserver mes kits', href: '/contact' }}
        secondary={{ text: 'Voir les kits', href: '#kits' }}
      />

      {/* Réassurance */}
      <section className="bg-mp-ivory py-6 border-b border-mp-light">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <Bed size={18} className="text-mp-sand" />
              <span>Kits complets prêts à poser</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <Repeat size={18} className="text-mp-sand" />
              <span>Rotation linge propre / sale</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <ShieldCheck size={18} className="text-mp-sand" />
              <span>Lavé & repassé entre chaque loc.</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <Star size={18} className="text-mp-sand" />
              <span>Option percale 400 fils</span>
            </div>
          </div>
        </div>
      </section>

      {/* Kits */}
      <section className="section bg-mp-white" id="kits">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Nos kits de location</h2>
            <p className="text-mp-gray max-w-2xl mx-auto">Choisissez le kit adapté à vos lits. Tarif à la rotation — vous ne payez que quand vous utilisez.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-on-scroll">
            {kits.map((kit, i) => (
              <div key={i} className={`card relative flex flex-col ${kit.popular ? 'ring-2 ring-mp-sand' : ''}`}>
                {kit.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-mp-sand text-mp-navy text-xs font-semibold px-4 py-1 rounded-full">
                    Le plus demandé
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-mp-navy font-display font-light text-xl mb-1">{kit.name}</h3>
                  <p className="text-mp-gray text-sm">{kit.desc}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-light text-mp-navy">{kit.price}</span>
                    <span className="text-mp-gray text-sm ml-1">€ / rotation</span>
                  </div>
                </div>
                <ul className="flex-grow space-y-3 mb-8">
                  {kit.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-mp-dark">
                      <CheckCircle size={14} className="text-mp-sand flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="/contact" className={`btn w-full text-center ${kit.popular ? 'btn-primary' : 'btn-ghost'}`}>
                  Réserver ce kit
                </a>
              </div>
            ))}
          </div>
          <p className="text-xs text-mp-gray text-center mt-6">Linge en vrac (nappes, torchons, serviettes hors kit) : tarif sur devis. Professionnels : tarifs dégressifs dès 10 rotations/mois.</p>
        </div>
      </section>

      {/* Process */}
      <section className="section bg-mp-ivory">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Comment ça marche</h2>
            <p className="text-mp-gray max-w-xl mx-auto">Simple et rapide, que vous soyez particulier ou professionnel.</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ProcessTimeline steps={processSteps} />
          </div>
        </div>
      </section>

      {/* Pour qui */}
      <section className="section bg-mp-white">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Pour qui ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-on-scroll">
            <div className="card p-8">
              <h3 className="text-mp-navy font-display font-light text-xl mb-4">Particuliers & vacanciers</h3>
              <p className="text-mp-gray text-sm mb-4">Vous venez en résidence secondaire et ne voulez pas voyager avec vos draps ? Réservez un kit pour votre séjour. On s'occupe de tout.</p>
              <ul className="space-y-2 text-sm text-mp-dark">
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-mp-sand mt-0.5" /> Réservation à la semaine ou au séjour</li>
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-mp-sand mt-0.5" /> Retrait en boutique</li>
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-mp-sand mt-0.5" /> Paiement au retrait</li>
              </ul>
            </div>
            <div className="card p-8 bg-mp-navy text-white">
              <h3 className="text-white font-display font-light text-xl mb-4">Conciergeries & pros</h3>
              <p className="text-mp-light text-sm mb-4">Vous gérez des locations saisonnières et avez besoin de rotations fiables entre chaque voyageur ? Nous sommes votre partenaire linge.</p>
              <ul className="space-y-2 text-sm text-mp-light">
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-mp-sand mt-0.5" /> Tarifs dégressifs par volume</li>
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-mp-sand mt-0.5" /> Rotation rapide (parfois J+0)</li>
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-mp-sand mt-0.5" /> Facturation mensuelle</li>
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-mp-sand mt-0.5" /> Interlocuteur dédié</li>
              </ul>
              <a href="/professionnels" className="btn btn-primary mt-6 w-full text-center">Demander un devis pro</a>
            </div>
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
          <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Prêt pour un séjour sans souci ?</h2>
          <p className="text-mp-gray mb-8 max-w-lg mx-auto">Réservez vos kits pour votre prochain séjour ou contactez-nous pour un contrat professionnel.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/contact" className="btn btn-primary">Réserver mes kits</a>
            <a href="tel:+33556XXXXXX" className="btn btn-ghost flex items-center justify-center gap-2">
              <Phone size={18} /> 05 56 XX XX XX
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
