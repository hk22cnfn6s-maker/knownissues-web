const steps = [
  {
    number: '01',
    title: 'Register free',
    description: 'Create a free account in seconds — no card required.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="9" cy="7" r="3.5" />
        <path strokeLinecap="round" d="M3.5 20c0-3.6 2.9-6.5 6.5-6.5" />
        <path strokeLinecap="round" d="M17 8v6M14 11h6" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Verify your email',
    description: 'Click the link we send you — it only takes a moment.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7l8 6 8-6" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Download your guide',
    description: 'Get instant access to the full PDF, delivered to your inbox too.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0l-4-4m4 4l4-4" />
        <path strokeLinecap="round" d="M4 18v1.5A1.5 1.5 0 005.5 21h13a1.5 1.5 0 001.5-1.5V18" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h2 className="font-heading text-3xl sm:text-h2 text-text-primary text-center mb-12 sm:mb-16">
          How it works
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center sm:text-left">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent mb-5">
                {step.icon}
              </div>
              <p className="text-xs font-semibold tracking-widest text-accent mb-2">
                STEP {step.number}
              </p>
              <h3 className="font-heading text-h4 text-text-primary mb-2">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
