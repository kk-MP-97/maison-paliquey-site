import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-mp-navy text-mp-light">
      <div className="container py-12 md:py-16">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand column */}
          <div>
            <Link to="/" className="text-xl font-light font-display text-white mb-4 block">
              Maison Paliquey
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Blanchisserie artisanale à Cap Ferret. Service soigné pour particuliers et professionnels.
            </p>
            <div className="flex gap-4">
              <a href="#" aria-label="Facebook" className="w-10 h-10 flex items-center justify-center rounded border border-mp-sand text-mp-sand hover:bg-mp-sand hover:text-mp-navy transition">
                <span className="text-xs">f</span>
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 flex items-center justify-center rounded border border-mp-sand text-mp-sand hover:bg-mp-sand hover:text-mp-navy transition">
                <span className="text-xs">in</span>
              </a>
            </div>
          </div>

          {/* Services links */}
          <div>
            <h4 className="text-sm font-semibold font-body text-white mb-6 uppercase tracking-wider">
              Nos services
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/blanchisserie" className="text-mp-light hover:text-mp-sand transition">Blanchisserie</Link></li>
              <li><Link to="/pressing" className="text-mp-light hover:text-mp-sand transition">Pressing</Link></li>
              <li><Link to="/location-linge" className="text-mp-light hover:text-mp-sand transition">Location de linge</Link></li>
              <li><Link to="/professionnels" className="text-mp-light hover:text-mp-sand transition">Espace Professionnels</Link></li>
              <li><Link to="/contact" className="text-mp-light hover:text-mp-sand transition">Contact</Link></li>
            </ul>
          </div>

          {/* Info practiques */}
          <div>
            <h4 className="text-sm font-semibold font-body text-white mb-6 uppercase tracking-wider">
              Infos pratiques
            </h4>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin size={16} className="text-mp-sand flex-shrink-0 mt-0.5" />
                <div>
                  <p>[Adresse]</p>
                  <p>Cap Ferret, 33970</p>
                </div>
              </div>
              <a href="tel:+33XXXXXXXXX" className="flex gap-3 text-mp-light hover:text-mp-sand transition">
                <Phone size={16} className="text-mp-sand flex-shrink-0" />
                <span>05 XX XX XX XX</span>
              </a>
              <a href="mailto:contact@maisonpaliquey.fr" className="flex gap-3 text-mp-light hover:text-mp-sand transition">
                <Mail size={16} className="text-mp-sand flex-shrink-0" />
                <span>contact@maisonpaliquey.fr</span>
              </a>
            </div>
          </div>

          {/* Horaires */}
          <div>
            <h4 className="text-sm font-semibold font-body text-white mb-6 uppercase tracking-wider">
              Horaires
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <Clock size={16} className="text-mp-sand flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Lun–Ven</p>
                  <p>8h–18h</p>
                </div>
              </div>
              <div className="ml-6">
                <p className="font-medium">Samedi</p>
                <p>9h–12h</p>
              </div>
              <p className="text-xs text-mp-light ml-6 italic">
                Horaires étendus juillet–août
              </p>
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="mb-12 hidden md:block">
          <div className="bg-mp-white/10 rounded-lg h-48 flex items-center justify-center">
            <p className="text-mp-light text-sm">[Google Maps intégré ici]</p>
          </div>
          <a href="#" className="text-mp-sand text-sm hover:text-white transition mt-3 inline-flex items-center gap-2">
            Voir sur Google Maps →
          </a>
        </div>

        {/* Divider */}
        <div className="border-t border-mp-sand/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-mp-light">
            <p>© 2026 Maison Paliquey — SAS LAVOK · Tous droits réservés</p>
            <div className="flex gap-6">
              <Link to="/mentions-legales" className="text-mp-sand hover:text-white transition">Mentions légales</Link>
              <Link to="/politique-confidentialite" className="text-mp-sand hover:text-white transition">Politique de confidentialité</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
