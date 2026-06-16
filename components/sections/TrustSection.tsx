const trustPoints = [
  {
    label: 'Real ownership experience',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13l2-5a3 3 0 013-2h8a3 3 0 013 2l2 5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h18v4a1 1 0 01-1 1h-1.5a1 1 0 01-1-1v-1h-11v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z" />
        <circle cx="7.5" cy="17" r="0.5" />
        <circle cx="16.5" cy="17" r="0.5" />
      </svg>
    ),
  },
  {
    label: '30+ years of car knowledge',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    label: 'No corporate agenda',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
]

export default function TrustSection() {
  return (
    <section id="about" className="bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <h2 className="font-heading text-3xl sm:text-h2 text-text-primary mb-6">
          Written by a real owner
        </h2>
        <p className="text-base text-text-secondary leading-relaxed mb-12">
          KnownIssues guides are written from direct ownership experience — not
          press releases or forum hearsay. Every guide covers a car the author
          has personally owned, maintained, and restored.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
          {trustPoints.map((point) => (
            <div key={point.label} className="flex flex-col items-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent">
                {point.icon}
              </div>
              <p className="text-sm font-semibold text-text-primary">{point.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
