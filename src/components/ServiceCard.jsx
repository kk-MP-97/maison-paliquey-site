import { Link } from 'react-router-dom'

export default function ServiceCard({ icon: Icon, title, description, points, link }) {
  return (
    <div className="card h-full flex flex-col animate-on-scroll in-view">
      {/* Icon */}
      <Icon size={32} className="text-mp-sand mb-4" />

      {/* Title */}
      <h3 className="text-mp-navy font-light font-display text-xl mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-mp-gray text-sm mb-4 flex-grow">
        {description}
      </p>

      {/* Points */}
      {points && (
        <ul className="mb-6 space-y-2">
          {points.map((point, idx) => (
            <li key={idx} className="flex gap-2 text-xs text-mp-gray">
              <span className="text-mp-sand flex-shrink-0 mt-0.5">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Link */}
      <Link to={link} className="link-arrow text-sm">
        En savoir plus →
      </Link>
    </div>
  )
}
