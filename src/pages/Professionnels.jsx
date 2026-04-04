import { useState, useEffect } from 'react'
import {
  Phone,
  Users,
  FileText,
  TrendingUp,
  CheckCircle,
  Package,
  Briefcase,
  HeartHandshake,
  Building2,
  UtensilsCrossed,
  Home,
  Users2,
  ArrowRight
} from 'lucide-react'

import Hero from '../components/Hero'
import ProcessTimeline from '../components/ProcessTimeline'
import FAQ from '../components/FAQ'

export default function Professionnels() {
  const [formState, setFormState] = useState({
    company: '',
    contactName: '',
    email: '',
    establishmentType: '',
    estimatedVolume: ''
  })

  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
    { icon: Package, title: 'Diagnostic gratuit', description: 'Nous évaluons vos besoins en volume, vos contraintes de délai et vos exigences qualité. Visite sur site si nécessaire.' },
    { icon: CheckCircle, title: 'Mise en place', description: 'Configuration de votre compte dédié, définition des modalités de collecte/livraison, formation des équipes.' },
    { icon: TrendingUp, title: 'Opérations quotidiennes', description: 'Rotations régulières, suivi de traçabilité nominatif, facturation mensuelle consolidée, interlocuteur dédié.' }
  ]

  const clientProfiles = [
    {
      icon: Building2,
      title: 'Hôtels & Résidences',
      bullets: [
        'Draps, housses, serviettes en rotation quotidienne',
        'Gestion de stocks importants avec traçabilité',
        'Adaptabilité aux pics saisonniers'
      ]
    },
    {
      icon: UtensilsCrossed,
      title: 'Restaurants & Traiteurs',
      bullets: [
        'Nappes, torchons, vêtements de service',
        'Délais express et rotations rapides',
        'Nettoyage hygiénique certifié'
      ]
    },
    {
      icon: Home,
      title: 'Conciergeries & Airbnb',
      bullets: [
        'Linge de lit et de maison en stock permanent',
        'Livraison flexible selon calendrier d\'occupation',
        'Tarifs dégressifs sur volumes moyens'
      ]
    },
    {
      icon: Users2,
      title: 'Collectivités',
      bullets: [
        'Uniformes, linge collectif, serviettes',
        'Facturation simplifiée et rapports de conformité',
        'Partenariat long terme et stabilité tarifaire'
      ]
    }
  ]

  const advantages = [
    {
      icon: Users,
      title: 'Compte dédié',
      description: 'Un interlocuteur unique qui connaît votre activité, vos saisons et vos exigences. Disponibilité prioritaire et suivi personnalisé.'
    },
    {
      icon: FileText,
      title: 'Facturation simplifiée',
      description: 'Facture mensuelle consolidée, tarifs dégressifs selon volumes, conditions de paiement adaptées à votre trésorerie.'
    },
    {
      icon: TrendingUp,
      title: 'Capacité saisonnière',
      description: 'Flexibilité intégrée pour absorber vos pics d\'activité. Nous planifions avec vous pour garantir les délais.'
    }
  ]

  const faqItems = [
    {
      question: 'Quel est le volume minimum pour un compte professionnel ?',
      answer: 'Il n\'y a pas de volume minimum imposé, mais à partir de 50 pièces par semaine, les tarifs dégressifs et le compte dédié deviennent vraiment rentables. Nous étudions chaque cas.'
    },
    {
      question: 'Quel est le cycle de facturation ?',
      answer: 'Facturation mensuelle consolidée, basée sur vos volumes réels. Conditions de paiement flexibles (comptant, 15 jours, fin de mois selon contrat).'
    },
    {
      question: 'Pouvez-vous gérer des pics saisonniers ?',
      answer: 'Oui, absolument. Nous planifions avec vous les périodes de forte activité et réservons les capacités. Délais express possibles sur certains créneaux.'
    },
    {
      question: 'Comment s\'organise la collecte et la livraison ?',
      answer: 'Collecte planifiée (quotidienne, bi-quotidienne ou hebdomadaire selon vos besoins) et livraison à heures fixes. Zones de desserte : Cap Ferret, Lège, Arès et environs.'
    },
    {
      question: 'Combien de temps pour mettre en place le contrat ?',
      answer: 'Diagnostic gratuit 1-2 jours, signature et mise en place opérationnelle 3-5 jours. Vous pouvez commencer vos rotations immédiatement après.'
    }
  ]

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false)
      setSubmitted(true)
      setFormState({ company: '', contactName: '', email: '', establishmentType: '', estimatedVolume: '' })
      setTimeout(() => setSubmitted(false), 5000)
    }, 800)
  }

  return (
    <>
      <Hero
        eyebrow="Espace Professionnels"
        title="Votre partenaire blanchisserie à Cap Ferret"
        subtitle="Comptes dédiés, tarifs dégressifs, facturation mensuelle et livraison planifiée. Laissez-nous gérer votre linge pour vous concentrer sur votre activité."
        primary={{ text: 'Demander un devis pro', href: '#devis-pro' }}
        secondary={{ text: 'Nous appeler', href: 'tel:+33556XXXXXX' }}
      />

      {/* Réassurance pro */}
      <section className="bg-mp-ivory py-6 border-b border-mp-light">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <FileText size={18} className="text-mp-sand" />
              <span>Facturation mensuelle</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <CheckCircle size={18} className="text-mp-sand" />
              <span>Suivi nominatif</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <Package size={18} className="text-mp-sand" />
              <span>Livraison planifiée</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-mp-navy">
              <Users size={18} className="text-mp-sand" />
              <span>Interlocuteur dédié</span>
            </div>
          </div>
        </div>
      </section>

      {/* Profils clients */}
      <section className="section bg-mp-white">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Profils clients</h2>
            <p className="text-mp-gray max-w-2xl mx-auto">Nous servons tous les secteurs d'activité professionnelle. Quels que soient votre métier et vos volumes, nous avons une solution adaptée.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-on-scroll">
            {clientProfiles.map((profile, i) => {
              const Icon = profile.icon
              return (
                <div key={i} className="card p-6 hover:bg-mp-navy/5 transition-colors duration-300 group cursor-pointer">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon size={24} className="text-mp-sand group-hover:scale-110 transition-transform" />
                    <h3 className="text-mp-navy font-medium">{profile.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {profile.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-mp-gray">
                        <span className="text-mp-sand mt-1 flex-shrink-0">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Avantages compte pro */}
      <section className="section bg-mp-ivory">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Avantages du compte professionnel</h2>
            <p className="text-mp-gray max-w-2xl mx-auto">Tout est pensé pour simplifier votre gestion du linge et réduire vos coûts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-on-scroll">
            {advantages.map((adv, i) => {
              const Icon = adv.icon
              return (
                <div key={i} className="card p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <Icon size={32} className="text-mp-sand" />
                  </div>
                  <h3 className="text-mp-navy font-medium text-lg mb-3">{adv.title}</h3>
                  <p className="text-mp-gray text-sm leading-relaxed">{adv.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section bg-mp-white">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Notre processus d'onboarding</h2>
            <p className="text-mp-gray max-w-xl mx-auto">Trois étapes simples pour démarrer votre partenariat avec nous.</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ProcessTimeline steps={processSteps} />
          </div>
        </div>
      </section>

      {/* Formulaire devis pro */}
      <section className="section bg-mp-ivory" id="devis-pro">
        <div className="container max-w-2xl">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Demander votre devis professionnel</h2>
            <p className="text-mp-gray">Diagnostic gratuit, aucun engagement. Nous vous répondrons sous 24h.</p>
          </div>

          <div className="bg-mp-white rounded-lg p-8 md:p-12 shadow-card animate-on-scroll">
            {submitted ? (
              <div className="bg-mp-ivory p-6 rounded-lg flex gap-4">
                <CheckCircle className="text-mp-green flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <p className="font-medium text-mp-navy">Merci pour votre demande !</p>
                  <p className="text-sm text-mp-gray mt-1">
                    Nous vous recontacterons sous 24h à l'email ou au téléphone indiqué pour discuter de vos besoins spécifiques.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Company and Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="company"
                      placeholder="Nom de la société / établissement"
                      required
                      value={formState.company}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-mp-light rounded focus:outline-none focus:border-mp-sand transition text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="contactName"
                      placeholder="Nom du contact"
                      required
                      value={formState.contactName}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-mp-light rounded focus:outline-none focus:border-mp-sand transition text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    value={formState.email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-mp-light rounded focus:outline-none focus:border-mp-sand transition text-sm"
                  />
                </div>

                {/* Establishment Type */}
                <div>
                  <select
                    name="establishmentType"
                    required
                    value={formState.establishmentType}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-mp-light rounded focus:outline-none focus:border-mp-sand transition text-sm bg-white"
                  >
                    <option value="">Type d'établissement</option>
                    <option value="hotel">Hôtel ou résidence</option>
                    <option value="restaurant">Restaurant ou traiteur</option>
                    <option value="concierge">Conciergerie ou Airbnb</option>
                    <option value="collectivity">Collectivité</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                {/* Estimated Volume */}
                <div>
                  <select
                    name="estimatedVolume"
                    required
                    value={formState.estimatedVolume}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-mp-light rounded focus:outline-none focus:border-mp-sand transition text-sm bg-white"
                  >
                    <option value="">Volume estimé par semaine</option>
                    <option value="micro">Moins de 50 pièces</option>
                    <option value="small">50–200 pièces</option>
                    <option value="medium">200–500 pièces</option>
                    <option value="large">500+ pièces</option>
                  </select>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full md:w-auto"
                >
                  {isLoading ? 'Envoi...' : 'Demander mon devis pro'}
                </button>

                {/* Reassurance */}
                <p className="text-xs text-mp-gray">
                  Réponse sous 24h · Aucun engagement · Diagnostic gratuit
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-mp-white">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Questions fréquentes (B2B)</h2>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="bg-mp-white space-y-0 animate-on-scroll">
              {faqItems.map((item, index) => (
                <details key={index} className="border-b border-mp-light">
                  <summary className="py-4 md:py-6 cursor-pointer flex justify-between items-center group">
                    <span className="font-medium text-mp-navy group-hover:text-mp-sand transition">
                      {item.question}
                    </span>
                    <svg className="w-5 h-5 text-mp-sand flex-shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </summary>
                  <div className="pb-4 md:pb-6 text-sm text-mp-gray leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="section bg-mp-navy text-white">
        <div className="container text-center animate-on-scroll">
          <h2 className="text-3xl font-light font-display mb-4">Prêt à nous faire confiance ?</h2>
          <p className="text-mp-light mb-8 max-w-lg mx-auto">Un diagnostic gratuit, une mise en place rapide, et vous réduisez immédiatement vos coûts et vos contraintes.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#devis-pro" className="btn btn-primary">
              Demander mon devis pro
            </a>
            <a href="tel:+33556XXXXXX" className="btn btn-ghost flex items-center justify-center gap-2">
              <Phone size={18} /> Nous appeler
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
