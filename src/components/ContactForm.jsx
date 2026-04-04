import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

export default function ContactForm({ title = 'Demandez votre devis gratuit' }) {
  const [formState, setFormState] = useState({
    firstName: '',
    phone: '',
    email: '',
    serviceType: '',
    message: ''
  })

  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setSubmitted(true)
      setFormState({ firstName: '', phone: '', email: '', serviceType: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    }, 800)
  }

  return (
    <div className="bg-mp-white rounded-lg p-8 md:p-12 shadow-card animate-on-scroll in-view">
      <h3 className="text-2xl font-light font-display text-mp-navy mb-2">
        {title}
      </h3>
      <p className="text-mp-gray text-sm mb-8">
        Remplissez le formulaire ci-dessous et nous vous répondrons sous 24h.
      </p>

      {submitted ? (
        <div className="bg-mp-ivory p-6 rounded-lg flex gap-4">
          <CheckCircle className="text-mp-green flex-shrink-0 mt-0.5" size={24} />
          <div>
            <p className="font-medium text-mp-navy">Merci pour votre demande !</p>
            <p className="text-sm text-mp-gray mt-1">
              Nous vous répondrons sous 24h à l'email ou au téléphone indiqué.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input type="text" name="firstName" placeholder="Votre prénom" required value={formState.firstName} onChange={handleChange} className="w-full px-4 py-3 border border-mp-light rounded focus:outline-none focus:border-mp-sand transition text-sm" />
            </div>
            <div>
              <input type="tel" name="phone" placeholder="Téléphone" required value={formState.phone} onChange={handleChange} className="w-full px-4 py-3 border border-mp-light rounded focus:outline-none focus:border-mp-sand transition text-sm" />
            </div>
          </div>

          <div>
            <input type="email" name="email" placeholder="Email" required value={formState.email} onChange={handleChange} className="w-full px-4 py-3 border border-mp-light rounded focus:outline-none focus:border-mp-sand transition text-sm" />
          </div>

          <div>
            <select name="serviceType" required value={formState.serviceType} onChange={handleChange} className="w-full px-4 py-3 border border-mp-light rounded focus:outline-none focus:border-mp-sand transition text-sm bg-white">
              <option value="">Type de service</option>
              <option value="blanchisserie">Blanchisserie</option>
              <option value="pressing">Pressing</option>
              <option value="location">Location de linge</option>
              <option value="conciergerie">Conciergerie linge</option>
              <option value="pro">Compte professionnel</option>
            </select>
          </div>

          <div>
            <textarea name="message" placeholder="Votre message (optionnel)" rows="3" value={formState.message} onChange={handleChange} className="w-full px-4 py-3 border border-mp-light rounded focus:outline-none focus:border-mp-sand transition text-sm resize-none" />
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary w-full md:w-auto">
            {isLoading ? 'Envoi...' : 'Envoyer ma demande'}
          </button>

          <p className="text-xs text-mp-gray">
            Réponse sous 24h · Aucun démarchage · Données protégées
          </p>
        </form>
      )}
    </div>
  )
}
