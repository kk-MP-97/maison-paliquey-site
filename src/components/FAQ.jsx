import { ChevronDown } from 'lucide-react'

export default function FAQ({ title = 'Questions fréquentes', items }) {
  return (
    <section className="bg-mp-white py-12 md:py-16">
      <div className="container max-w-2xl">
        <h2 className="text-3xl font-light font-display text-mp-navy mb-12 text-center animate-on-scroll in-view">
          {title}
        </h2>

        <div className="space-y-0 animate-on-scroll in-view">
          {items.map((item, index) => (
            <details key={index} className="border-b border-mp-light">
              <summary className="py-4 md:py-6 cursor-pointer flex justify-between items-center group">
                <span className="font-medium text-mp-navy group-hover:text-mp-sand transition">
                  {item.question}
                </span>
                <ChevronDown size={20} className="text-mp-sand flex-shrink-0" />
              </summary>
              <div className="pb-4 md:pb-6 text-sm text-mp-gray leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
