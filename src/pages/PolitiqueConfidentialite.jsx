import { useEffect } from 'react'

export default function PolitiqueConfidentialite() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      {/* Header */}
      <section className="bg-mp-navy py-12 md:py-16">
        <div className="container">
          <h1 className="text-white font-light font-display text-4xl md:text-5xl">Politique de confidentialité</h1>
          <p className="text-mp-light mt-3 text-sm">Informations sur le traitement de vos données personnelles</p>
        </div>
      </section>

      {/* Content */}
      <section className="section bg-mp-white">
        <div className="container max-w-3xl mx-auto">
          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Protection de vos données</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                Maison Paliquey accorde la plus grande importance à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations, en conformité avec le Règlement Général sur la Protection des Données (RGPD) en vigueur en France.
              </p>
              <p>
                Nous nous engageons à respecter la vie privée de chaque visiteur et client, et à maintenir un traitement responsable et transparent de vos données.
              </p>
            </div>
          </div>

          {/* Données collectées */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Données que nous collectons</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-mp-dark">Via le formulaire de contact :</strong> prénom, email, téléphone, message et toute information que vous choisissez de nous fournir.
              </p>
              <p>
                <strong className="text-mp-dark">Lors de commandes ou de demandes de devis :</strong> nom complet, adresse, numéro de téléphone, email, détails de la commande ou demande.
              </p>
              <p>
                <strong className="text-mp-dark">Via le site web :</strong> informations de navigation (pages consultées, durée de visite, etc.) collectées par Google Analytics pour l'amélioration du site.
              </p>
              <p>
                <strong className="text-mp-dark">Données techniques :</strong> adresse IP, type de navigateur, système d'exploitation, langue (usage non-identifiant).
              </p>
            </div>
          </div>

          {/* Finalités */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Finalités du traitement</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                Nous traitons vos données pour les finalités suivantes :
              </p>
              <ul className="space-y-2 ml-4">
                <li><strong className="text-mp-dark">Traitement des demandes :</strong> répondre à vos questions, établir des devis, gérer les commandes et réclamations.</li>
                <li><strong className="text-mp-dark">Communication :</strong> vous adresser des confirmations, des suivis ou des informations relatives à votre demande.</li>
                <li><strong className="text-mp-dark">Amélioration du service :</strong> analyser l'utilisation du site pour optimiser l'expérience utilisateur et la performance.</li>
                <li><strong className="text-mp-dark">Conformité légale :</strong> respecter les obligations comptables, fiscales et administratives en vigueur.</li>
                <li><strong className="text-mp-dark">Sécurité :</strong> prévenir et détecter les fraudes, les abus ou les activités illégales.</li>
              </ul>
            </div>
          </div>

          {/* Base légale */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Base légale du traitement</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-mp-dark">Exécution d'un contrat :</strong> traitement des commandes et devis sur la base d'un intérêt contractuel.
              </p>
              <p>
                <strong className="text-mp-dark">Consentement :</strong> utilisation de cookies analytics et communications marketing (si applicable).
              </p>
              <p>
                <strong className="text-mp-dark">Obligation légale :</strong> conservation de factures, archives commerciales selon la loi française.
              </p>
              <p>
                <strong className="text-mp-dark">Intérêt légitime :</strong> amélioration du site et prévention de la fraude.
              </p>
            </div>
          </div>

          {/* Durée de conservation */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Durée de conservation des données</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-mp-dark">Données de contact :</strong> conservées pendant la durée du traitement de votre demande, puis supprimées sauf si vous demandez à rester en contact ou si une relation commerciale est établie.
              </p>
              <p>
                <strong className="text-mp-dark">Données de commande / facturation :</strong> archivées pendant 10 ans, conformément aux obligations comptables et fiscales françaises.
              </p>
              <p>
                <strong className="text-mp-dark">Données analytics (Google Analytics) :</strong> conservées selon les paramètres de Google Analytics, généralement 26 mois.
              </p>
              <p>
                <strong className="text-mp-dark">Emails de correspondance :</strong> conservés pour justifier la relation commerciale et respecter les délais de prescription.
              </p>
              <p>
                Au-delà de ces délais, vos données sont supprimées ou anonymisées, sauf obligation légale contraire.
              </p>
            </div>
          </div>

          {/* Partage des données */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Partage des données avec des tiers</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                Vos données personnelles ne sont jamais vendues, louées ou divulguées à des tiers à des fins marketing sans votre consentement explicite.
              </p>
              <p>
                <strong className="text-mp-dark">Prestataires de service :</strong> nous pouvons partager vos données avec des partenaires techniques (hébergeur Vercel, Google Analytics) strictement pour les finalités décrites ci-dessus.
              </p>
              <p>
                <strong className="text-mp-dark">Obligations légales :</strong> vos données peuvent être divulguées aux autorités compétentes (fiscales, judiciaires) si la loi l'exige.
              </p>
              <p>
                <strong className="text-mp-dark">Transferts internationaux :</strong> Google Analytics peut transférer des données aux États-Unis. Ces transferts sont effectués sous conditions conformes aux dispositions du RGPD (clauses contractuelles types).
              </p>
            </div>
          </div>

          {/* Vos droits */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Vos droits</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="space-y-2 ml-4">
                <li><strong className="text-mp-dark">Droit d'accès :</strong> obtenir une copie de vos données personnelles.</li>
                <li><strong className="text-mp-dark">Droit de rectification :</strong> corriger ou mettre à jour des données inexactes ou incomplètes.</li>
                <li><strong className="text-mp-dark">Droit à l'effacement :</strong> demander la suppression de vos données (« droit à l'oubli ») sous certaines conditions.</li>
                <li><strong className="text-mp-dark">Droit à la limitation du traitement :</strong> restreindre le traitement de vos données dans certaines circonstances.</li>
                <li><strong className="text-mp-dark">Droit à la portabilité :</strong> recevoir vos données dans un format structuré et les transférer à un autre responsable.</li>
                <li><strong className="text-mp-dark">Droit d'opposition :</strong> vous opposer au traitement de vos données pour certaines finalités, notamment marketing.</li>
                <li><strong className="text-mp-dark">Droit relatif à la prise de décision automatisée :</strong> ne pas faire l'objet de décisions basées uniquement sur un traitement automatisé.</li>
              </ul>
              <p className="mt-4">
                Pour exercer l'un de ces droits, contactez-nous à <a href="mailto:contact@maisonpaliquey.fr" className="text-mp-sand hover:underline">contact@maisonpaliquey.fr</a> en joignant une preuve de votre identité. Nous répondrons à votre demande dans un délai de 30 jours.
              </p>
            </div>
          </div>

          {/* Sécurité */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Sécurité de vos données</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                Maison Paliquey met en place des mesures de sécurité appropriées pour protéger vos données personnelles contre l'accès non autorisé, la modification ou la destruction.
              </p>
              <p>
                <strong className="text-mp-dark">Mesures techniques :</strong> utilisation de chiffrement, de certificats SSL, de pare-feu et de protocoles de sécurité lors de la transmission de données sensibles.
              </p>
              <p>
                <strong className="text-mp-dark">Mesures organisationnelles :</strong> contrôle d'accès, formations du personnel, et audit régulier des pratiques de sécurité.
              </p>
              <p>
                Cependant, aucun système de sécurité ne peut garantir une protection absolue. En utilisant le site, vous acceptez les risques inhérents à la transmission d'informations en ligne.
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Politique de cookies</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-mp-dark">Qu'est-ce qu'un cookie ? </strong> Un cookie est un petit fichier texte stocké sur votre appareil lors de la visite du site.
              </p>
              <p>
                <strong className="text-mp-dark">Cookies utilisés :</strong>
              </p>
              <ul className="space-y-2 ml-4">
                <li><strong>Cookies techniques obligatoires :</strong> assurent le fonctionnement du site (sessions, sécurité). Aucun consentement requis.</li>
                <li><strong>Google Analytics :</strong> analysent l'utilisation du site (pages vues, durée, source du trafic). Nécessitent votre consentement explicite.</li>
                <li><strong>Cookies de préférences :</strong> mémorisent vos choix (langue, consentement cookies). Non traçants.</li>
              </ul>
              <p className="mt-4">
                <strong className="text-mp-dark">Gestion des cookies :</strong> Un bandeau de consentement s'affiche à votre première visite. Vous pouvez à tout moment modifier vos préférences via les paramètres de votre navigateur ou en nous contactant.
              </p>
            </div>
          </div>

          {/* Contact DPO */}
          <div className="mb-12">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Responsable du traitement</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-mp-dark">Responsable du traitement :</strong> Maison Paliquey (SAS LAVOK)<br />
                <strong>Adresse :</strong> 28 ter Route de Bordeaux, 33950 Lège-Cap-Ferret<br />
                <strong>Email :</strong> <a href="mailto:contact@maisonpaliquey.fr" className="text-mp-sand hover:underline">contact@maisonpaliquey.fr</a>
              </p>
              <p>
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, contactez-nous via les coordonnées ci-dessus.
              </p>
            </div>
          </div>

          {/* Modifications */}
          <div className="mb-12 pb-8 border-b border-mp-light">
            <h2 className="text-mp-navy text-xl font-display font-light mb-6 mt-8">Modifications de cette politique</h2>
            <div className="text-mp-gray text-sm leading-relaxed space-y-3">
              <p>
                Cette politique de confidentialité peut être mise à jour à tout moment pour refléter des changements dans nos pratiques, la technologie ou le cadre légal. Les modifications matérielles seront signalées par email ou via une notification sur le site.
              </p>
              <p>
                La date de la dernière modification est indiquée ci-dessous. Nous vous encourageons à consulter régulièrement cette page pour rester informé.
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
