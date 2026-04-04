export default function TestimonialCard({ quote, author, role, establishment, rating = 5 }) {
  const stars = Array(rating).fill(0)

  return (
    <div className="card bg-white animate-on-scroll in-view">
      {/* Stars */}
      <div className="flex gap-1 mb-3">
        {stars.map((_, i) => (
          <span key={i} className="text-mp-sand text-lg">★</span>
        ))}
      </div>

      {/* Quote */}
      <p className="text-mp-navy italic mb-6 text-sm leading-relaxed">
        "{quote}"
      </p>

      {/* Author */}
      <div className="border-t border-mp-light pt-4">
        <p className="font-medium text-mp-navy text-sm">
          {author}
        </p>
        <p className="text-xs text-mp-gray">
          {role} — {establishment}
        </p>
      </div>
    </div>
  )
}
