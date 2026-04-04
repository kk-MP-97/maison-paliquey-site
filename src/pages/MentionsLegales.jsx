import { useEffect } from 'react'

export default function MentionsLegales() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      {/* Header */}
      <section className="bg-mp-navy py-12 md:py-16">
        <div className="container">
          <h1 className="text-white font-light font-display text-4xl md:text-5xl">Mentions légales</h1>
          <p className="text-mp-light mt-3 text-sm">Informations juridiques et administratives</p>
        </div>
      </section>

      {/* Content */}
      <section className="section bg-mp-white">
        <div className="container max-w-3xl mx-auto">
          {/* Éditeur du site */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Éditeur du site</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-mp-dark">Nom commercial :</strong> Maison Paliquey — Blanchisserie & Maison de Linge
              </p>
              <p>
                <strong className="text-mp-dark">Entité juridique :</strong> SAS LAVOK
              </p>
              <p>
                <strong className="text-mp-dark">Adresse :</strong> 28 ter Route de Bordeaux, 33950 Lège-Cap-Ferret, France
              </p>
              <p>
                <strong className="text-mp-dark">Téléphone :</strong> Disponible sur demande
              </p>
              <p>
                <strong className="text-mp-dark">Email :</strong> <a href="mailto:contact@maisonpaliquey.fr" className="text-mp-sand hover:underline">contact@maisonpaliquey.fr</a>
              </p>
              <p>
                <strong className="text-mp-dark">Directeur de la publication :</strong> Karl Music
              </p>
              <p>
                <strong className="text-mp-dark">Site web :</strong> <a href="https://www.maisonpaliquey.fr" target="_blank" rel="noopener noreferrer" className="text-mp-sand hover:underline">www.maisonpaliquey.fr</a>
              </p>
            </div>
          </div>

          {/* Hébergement */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Hébergement</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                Le site www.maisonpaliquey.fr est hébergé par :
              </p>
              <p>
                <strong className="text-mp-dark">Vercel Inc.</strong><br />
                440 N Barranca Ave #4133<br />
                Covina, CA 91723<br />
                États-Unis
              </p>
              <p>
                Vercel assure l'hébergement, la maintenance technique et la sécurité des infrastructures du site.
              </p>
            </div>
          </div>

          {/* Propriété intellectuelle */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Propriété intellectuelle</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                L'ensemble du contenu présent sur le site www.maisonpaliquey.fr — textes, images, logos, photographies, vidéos et éléments de design — est la propriété exclusive de Maison Paliquey ou de ses partenaires, sauf mention contraire.
              </p>
              <p>
                Toute reproduction, représentation, modification ou adaptation, intégrale ou partielle, est strictement interdite sans autorisation écrite préalable de Maison Paliquey. Les contrevenants s'exposent à des poursuites judiciaires conformément aux dispositions du Code de la propriété intellectuelle français.
              </p>
              <p>
                L'accès au site ne confère aucun droit de propriété intellectuelle sur le contenu consulté.
              </p>
            </div>
          </div>

          {/* Données personnelles */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Données personnelles (RGPD)</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                Conformément au Règlement général sur la protection des données (RGPD) et à la Loi Informatique et Libertés, Maison Paliquey collecte et traite des données personnelles exclusivement aux fins de traitement de vos demandes.
              </p>
              <p>
                <strong className="text-mp-dark">Données collectées :</strong> prénom, email, téléphone, message (via le formulaire de contact).
              </p>
              <p>
                <strong className="text-mp-dark">Finalités :</strong> répondre à votre demande, établir des devis, assurer le suivi commercial et administratif.
              </p>
              <p>
                <strong className="text-mp-dark">Stockage :</strong> Les données sont conservées uniquement le temps nécessaire au traitement de votre demande et à la gestion administrative qui en découle, conformément aux obligations légales (délai de prescription commerciale).
              </p>
              <p>
                <strong className="text-mp-dark">Vos droits :</strong> Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer l'un de ces droits, contactez-nous à <a href="mailto:contact@maisonpaliquey.fr" className="text-mp-sand hover:underline">contact@maisonpaliquey.fr</a>
              </p>
              <p>
                Les données ne sont jamais cédées à des tiers sans votre consentement explicite.
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Cookies</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                Le site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic (Google Analytics). Ces cookies permettent de comprendre comment les visiteurs utilisent le site et d'optimiser son contenu.
              </p>
              <p>
                <strong className="text-mp-dark">Consentement requis :</strong> L'utilisation de cookies de suivi analytics requiert votre consentement préalable. Un bandeau d'information apparaît à votre première visite pour vous permettre d'accepter ou de refuser.
              </p>
              <p>
                <strong className="text-mp-dark">Cookies obligatoires :</strong> Certains cookies techniques sont essentiels au fonctionnement du site et ne requièrent pas de consentement.
              </p>
              <p>
                Vous pouvez à tout moment modifier vos préférences ou désactiver les cookies dans les paramètres de votre navigateur.
              </p>
            </div>
          </div>

          {/* Responsabilité */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Responsabilité</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                Maison Paliquey met en œuvre tous les efforts pour assurer l'exactitude, la pertinence et la disponibilité des informations présentes sur le site. Cependant, elle ne peut garantir l'absence totale d'erreur ou d'interruption de service.
              </p>
              <p>
                Le site est fourni « tel quel » et Maison Paliquey ne peut être tenue responsable de dommages directs ou indirects résultant de l'accès, de l'utilisation ou de l'impossibilité d'accès au site.
              </p>
              <p>
                Les liens externes (hyperliens) vers des sites tiers ne constituent pas une approbation ou une endorsement. Maison Paliquey n'est pas responsable du contenu de ces sites externes.
              </p>
            </div>
          </div>

          {/* Droit applicable */}
          <div className="mb-12 pb-8 border-b border-mp-light">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Droit applicable et juridiction</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                Ces mentions légales sont régies par la loi française. Tout différend concernant l'accès ou l'utilisation du site www.maisonpaliquey.fr sera soumis à la juridiction exclusive des tribunaux de Bordeaux.
              </p>
              <p>
                Pour toute réclamation, veuillez contactez-nous à <a href="mailto:contact@maisonpaliquey.fr" className="text-mp-sand hover:underline">contact@maisonpaliquey.fr</a>
              </p>
            </div>
          </div>

          {/* Dernière mise à jour */}
          <div className="text-xs text-mp-gray italic pt-8">
            Dernière mise à jour : avril 2026
          </div>
        </div>
      </section>
    </>
  )
}
