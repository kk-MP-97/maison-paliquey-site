export default function Hero({ eyebrow, title, subtitle, primary, secondary, bgColor = 'bg-gradient-to-b from-mp-navy to-mp-navy/90' }) {
  return (
    <section className={`${bgColor} text-white pt-32 md:pt-40 pb-16 md:pb-24`}>
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-on-scroll in-view">
            {eyebrow && (
              <span className="eyebrow-light block mb-4">
                {eyebrow}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-light font-display text-white mb-6">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-mp-light mb-8 leading-relaxed">
                {subtitle}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              {primary && (
                <a href={primary.href} className="btn btn-primary">
                  {primary.text}
                </a>
              )}
              {secondary && (
                <a href={secondary.href} className="btn btn-ghost">
                  {secondary.text}
                </a>
              )}
            </div>
          </div>

          {/* Visual */}
          <div className="hidden lg:flex items-center justify-center animate-on-scroll in-view" style={{ animationDelay: '0.2s' }}>
            <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-mp-sand to-mp-ivory flex items-center justify-center shadow-hover">
              <span className="text-mp-navy text-center text-sm">Visuel/Image</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
