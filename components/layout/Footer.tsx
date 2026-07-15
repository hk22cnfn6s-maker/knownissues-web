import Link from 'next/link'

const links = [
  { label: 'Guides', href: '/#guides' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/#about' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

export default function Footer() {
  return (
    <footer className="bg-dark-surface text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          <div>
            <p className="font-heading text-xl font-semibold">
              KnownIssues<span className="text-accent">.co.uk</span>
            </p>
            <p className="text-sm text-white/60 mt-2 max-w-xs">
              Know exactly what you're buying
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-white/40">Written by enthusiasts, for buyers</p>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} KnownIssues.co.uk. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
