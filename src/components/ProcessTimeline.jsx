export default function ProcessTimeline({ steps }) {
  return (
    <ol className="list-none space-y-0">
      {steps.map((step, index) => {
        const Icon = step.icon
        return (
          <li key={index} className="flex items-start animate-on-scroll in-view" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex flex-col md:flex-row md:items-center flex-1 relative">
              <div className="flex items-start md:items-center gap-4 md:gap-6 pb-8 md:pb-0 relative">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-mp-navy/10 flex items-center justify-center mb-0 md:mb-4">
                    <span className="text-mp-navy font-light font-display text-lg">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block w-1 h-16 bg-gradient-to-b from-mp-sand to-transparent absolute top-16" />
                  )}
                </div>

                <div className="flex-1 md:ml-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon size={20} className="text-mp-sand flex-shrink-0" />
                    <h3 className="font-medium text-mp-navy">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-mp-gray">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
