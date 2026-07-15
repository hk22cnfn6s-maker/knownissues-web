'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

const navLinks = [
  { label: 'Guides', href: '/#guides' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/#about' },
  { label: 'How It Works', href: '/#how-it-works' },
]

export default function Header({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean
}) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 bg-surface/95 backdrop-blur-sm transition-shadow ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-heading text-xl font-semibold text-text-primary tracking-tight"
        >
          KnownIssues<span className="text-accent">.co.uk</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button href="/dashboard" variant="secondary">
                Dashboard
              </Button>
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="ghost">
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button href="/login" variant="secondary">
                Login
              </Button>
              <Button href="/register" variant="primary">
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 text-text-primary"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 sm:px-6 py-4 space-y-4">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 pt-2">
            {isAuthenticated ? (
              <>
                <Button href="/dashboard" variant="secondary" className="w-full">
                  Dashboard
                </Button>
                <form action="/api/auth/logout" method="POST">
                  <Button type="submit" variant="ghost" className="w-full">
                    Log out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button href="/login" variant="secondary" className="w-full">
                  Login
                </Button>
                <Button href="/register" variant="primary" className="w-full">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
