import { useEffect } from 'react'
import { Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react'

import Hero from '../components/Hero'
import ContactForm from '../components/ContactForm'
import FAQ from '../components/FAQ'

export default function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0)
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('in-view')),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const faqItems = [
    { question: 'Avez-vous un parking ?', answer: 'Oui, la boutique dispose d\'un petit parking gratuit réservé à la clientèle. Accès facile depuis la Route de Bordeaux.' },
    { question: 'Quels moyens de paiement acceptez-vous ?', answer: 'Nous acceptons les espèces, les cartes bancaires (CB, Visa, Mastercard) et les virements bancaires pour les clients professionnels.' },
    { question: 'Faut-il prendre rendez-vous ?', answer: 'Non, pour un dépôt ou un retrait. Cependant, pour une consultation spécialisée (tâches délicates, devis important), nous vous recommandons d\'appeler avant.' },
    { question: 'Quel est le délai de réponse pour un devis ?', answer: 'Nous répondons à tous les devis et demandes de contact sous 24 heures, par email ou téléphone selon votre préférence.' }
  ]

  return (
    <>
      <Hero
        eyebrow="Contact"
        title="Nous contacter"
        subtitle="Une question, un devis, un renseignement ? Nous répondons sous 24h."
        primary={{ text: 'Appeler maintenant', href: 'tel:+33556XXXXXX' }}
        secondary={{ text: 'Envoyer un email', href: 'mailto:contact@maisonpaliquey.fr' }}
      />

      {/* Contact Info Cards */}
      <section className="section bg-mp-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-on-scroll">
            <a href="tel:+33556XXXXXX" className="card p-8 text-center hover:shadow-hover transition group">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-mp-sand/10 flex items-center justify-center group-hover:bg-mp-sand/20 transition">
                  <Phone size={24} className="text-mp-sand" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-mp-navy mb-2">Téléphone</h3>
              <p className="text-mp-navy font-semibold mb-2">05 XX XX XX XX</p>
              <p className="text-sm text-mp-gray">Lun–Ven 8h–18h · Sam 9h–12h</p>
            </a>

            <a href="mailto:contact@maisonpaliquey.fr" className="card p-8 text-center hover:shadow-hover transition group">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-mp-sand/10 flex items-center justify-center group-hover:bg-mp-sand/20 transition">
                  <Mail size={24} className="text-mp-sand" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-mp-navy mb-2">Email</h3>
              <p className="text-mp-navy font-semibold mb-2">contact@maisonpaliquey.fr</p>
              <p className="text-sm text-mp-gray">Réponse sous 24h</p>
            </a>

            <a href="https://maps.google.com/?q=28+ter+Route+de+Bordeaux,+Lège-Cap-Ferret" target="_blank" rel="noopener noreferrer" className="card p-8 text-center hover:shadow-hover transition group">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-mp-sand/10 flex items-center justify-center group-hover:bg-mp-sand/20 transition">
                  <MapPin size={24} className="text-mp-sand" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-mp-navy mb-2">Adresse</h3>
              <p className="text-mp-navy font-semibold mb-2">28 ter Route de Bordeaux</p>
              <p className="text-sm text-mp-gray">Lège-Cap-Ferret, 33950</p>
            </a>
          </div>
        </div>
      </section>

      {/* Two-column: Form + Practical Info */}
      <section className="section bg-mp-ivory">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ContactForm title="Demandez votre devis gratuit" />

            <div className="animate-on-scroll in-view">
              <div className="card p-8 mb-8">
                <div className="flex gap-3 mb-6">
                  <Clock size={24} className="text-mp-sand flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-mp-navy mb-4">Horaires</h3>
                    <div className="space-y-2 text-sm text-mp-gray">
                      <p><span className="text-mp-navy font-medium">Lundi au vendredi</span><br />8h – 18h</p>
                      <p><span className="text-mp-navy font-medium">Samedi</span><br />9h – 12h</p>
                      <p className="text-xs text-mp-sand italic mt-3">Horaires étendus juillet–août</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-8 mb-8">
                <h3 className="text-lg font-medium text-mp-navy mb-4">Accès & Stationnement</h3>
                <p className="text-sm text-mp-gray leading-relaxed mb-4">
                  La boutique est facilement accessible depuis la Route de Bordeaux. Nous disposons d'un parking gratuit réservé à la clientèle, avec entrée par le sud du bâtiment.
                </p>
                <a href="https://maps.google.com/?q=28+ter+Route+de+Bordeaux,+Lège-Cap-Ferret" target="_blank" rel="noopener noreferrer" className="text-mp-sand text-sm font-medium hover:text-mp-navy transition flex items-center gap-2">
                  Voir sur Google Maps <ArrowRight size={16} />
                </a>
              </div>

              <div className="card p-8 bg-mp-navy text-white">
                <h3 className="text-lg font-medium mb-2">Vous êtes professionnel ?</h3>
                <p className="text-sm text-mp-light mb-6">Bénéficiez de tarifs dégressifs, d'un service de collecte et livraison, et d'un compte dédié.</p>
                <a href="/professionnels" className="btn btn-ghost text-sm">En savoir plus</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps Placeholder */}
      <section className="section bg-mp-ivory">
        <div className="container">
          <div className="rounded-lg overflow-hidden shadow-card animate-on-scroll">
            <div className="h-80 bg-mp-ivory flex items-center justify-center border border-mp-light">
              <div className="text-center">
                <p className="text-mp-gray">[Google Maps intégré ici]</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-mp-white">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-mp-navy font-light font-display text-3xl mb-4">Questions fréquentes</h2>
            <p className="text-mp-gray max-w-xl mx-auto">Trouvez rapidement les réponses à vos questions les plus courantes.</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <FAQ items={faqItems} />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section bg-mp-navy text-white">
        <div className="container text-center animate-on-scroll">
          <h2 className="text-3xl font-light font-display mb-4">Prêt à confier votre linge ?</h2>
          <p className="text-mp-light text-lg mb-8 max-w-xl mx-auto">Déposez en boutique ou contactez-nous pour un devis. Réponse sous 24h.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="tel:+33556XXXXXX" className="btn btn-primary">Appeler maintenant</a>
            <a href="mailto:contact@maisonpaliquey.fr" className="btn btn-ghost flex items-center justify-center gap-2">
              <Mail size={18} /> Envoyer un email
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
