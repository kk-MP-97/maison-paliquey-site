export default function AlternatingSection({ eyebrow, title, text, link, imagePosition = 'right', imageBg = 'from-mp-navy to-mp-blue' }) {
  const isImageRight = imagePosition === 'right'

  const contentDiv = (
    <div className="animate-on-scroll in-view">
      {eyebrow && (
        <span className="eyebrow block mb-4">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-light font-display text-mp-navy mb-6">
        {title}
      </h2>
      <p className="text-mp-gray leading-relaxed mb-6 max-w-lg">
        {text}
      </p>
      {link && (
        <a href={link.href} className="link-arrow">
          {link.text} →
        </a>
      )}
    </div>
  )

  const imageDiv = (
    <div className="hidden lg:flex items-center justify-center animate-on-scroll in-view" style={{ animationDelay: '0.2s' }}>
      <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${imageBg} flex items-center justify-center shadow-hover`}>
        <span className="text-white text-center text-sm">Visuel/Image</span>
      </div>
    </div>
  )

  return (
    <section className="py-12 md:py-16 bg-mp-white">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {isImageRight ? (
            <>
              {contentDiv}
              {imageDiv}
            </>
          ) : (
            <>
              {imageDiv}
              {contentDiv}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
