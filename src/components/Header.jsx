import { useState } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-mp-white z-50 border-b border-mp-light">
        <div className="container flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0" onClick={closeMobileMenu}>
            <div className="text-2xl md:text-3xl font-light text-mp-navy font-display">
              Maison Paliquey
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/blanchisserie" className="text-mp-navy hover:text-mp-sand transition font-body text-sm">
              Blanchisserie
            </Link>
            <Link to="/pressing" className="text-mp-navy hover:text-mp-sand transition font-body text-sm">
              Pressing
            </Link>
            <Link to="/location-linge" className="text-mp-navy hover:text-mp-sand transition font-body text-sm">
              Location
            </Link>
            <Link to="/professionnels" className="text-mp-navy hover:text-mp-sand transition font-body text-sm">
              Espace Pros
            </Link>
          </nav>

          {/* Right side CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:+33XXXXXXXXX"
              className="flex items-center gap-2 text-mp-navy hover:text-mp-sand transition"
              aria-label="Appeler Maison Paliquey"
            >
              <Phone size={18} />
              <span className="text-sm font-medium">05 XX XX XX XX</span>
            </a>
            <Link to="/contact" className="btn btn-primary btn-sm">
              Devis gratuit
            </Link>
          </div>

          {/* Mobile CTA */}
          <div className="flex md:hidden items-center gap-3">
            <a
              href="tel:+33XXXXXXXXX"
              className="flex items-center justify-center w-10 h-10 text-mp-navy hover:text-mp-sand transition"
              aria-label="Appeler Maison Paliquey"
            >
              <Phone size={20} />
            </a>
            <button
              onClick={toggleMobileMenu}
              className="w-10 h-10 flex items-center justify-center text-mp-navy"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-mp-light bg-mp-white">
            <div className="container py-4 flex flex-col gap-4">
              <Link to="/blanchisserie" className="text-mp-navy hover:text-mp-sand transition font-body text-sm py-2" onClick={closeMobileMenu}>
                Blanchisserie
              </Link>
              <Link to="/pressing" className="text-mp-navy hover:text-mp-sand transition font-body text-sm py-2" onClick={closeMobileMenu}>
                Pressing
              </Link>
              <Link to="/location-linge" className="text-mp-navy hover:text-mp-sand transition font-body text-sm py-2" onClick={closeMobileMenu}>
                Location
              </Link>
              <Link to="/professionnels" className="text-mp-navy hover:text-mp-sand transition font-body text-sm py-2" onClick={closeMobileMenu}>
                Espace Pros
              </Link>
              <Link to="/contact" className="btn btn-primary btn-sm w-full text-center" onClick={closeMobileMenu}>
                Devis gratuit
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  )
}
