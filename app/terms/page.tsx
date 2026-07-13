import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

export const metadata = {
  title: 'Terms of Use — KnownIssues.co.uk',
  description:
    'Terms of use for KnownIssues.co.uk, including copyright, licensing, and content usage rules.',
}

export default async function TermsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
      <Header isAuthenticated={Boolean(user)} />

      <section className="bg-dark-surface text-white">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Badge variant="amber" className="mb-4">
            Legal
          </Badge>
          <h1 className="font-heading text-3xl sm:text-h1 text-white text-balance mb-4">
            Terms of Use
          </h1>
          <p className="text-white/60 text-sm">Last updated: 2026</p>
        </div>
      </section>

      <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="space-y-14">
          <section>
            <h2 className="font-heading text-h3 text-text-primary mb-4">Who We Are</h2>
            <p className="text-base text-text-secondary leading-relaxed">
              KnownIssues.co.uk is an independent used car buyers guide website
              written and operated by Kelly Jones, a car enthusiast with over
              30 years of hands-on ownership experience. All guides published
              on this site are original works based on personal ownership
              experience, research, and community knowledge.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-h3 text-text-primary mb-6">
              Our Content and Your Rights
            </h2>

            <div className="mb-8">
              <h3 className="font-heading text-h4 text-text-primary mb-3">Copyright</h3>
              <p className="text-base text-text-secondary leading-relaxed">
                All content published on KnownIssues.co.uk — including buyers
                guides, articles, photographs, and written descriptions — is
                the original work of Kelly Jones and is protected by UK and
                international copyright law. Copyright remains with the
                author at all times.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-h4 text-text-primary mb-3">
                Creative Commons Licence
              </h3>
              <p className="text-base text-text-secondary leading-relaxed mb-4">
                Our guides are made available under a Creative Commons
                Attribution-NonCommercial-NoDerivatives 4.0 International
                Licence (CC BY-NC-ND 4.0).
              </p>
              <p className="text-base text-text-secondary leading-relaxed mb-4">
                In plain English this means:
              </p>
              <p className="text-base text-text-secondary leading-relaxed mb-4">
                You are free to share — copy and redistribute our content in
                any medium or format — under the following conditions:
              </p>
              <ul className="space-y-3 mb-4">
                <li className="text-base text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">Attribution:</strong>{' '}
                  You must give clear credit to KnownIssues.co.uk as the
                  source, name Kelly Jones as the author, and provide a
                  direct link back to the original content on this site.
                </li>
                <li className="text-base text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">Non-commercial:</strong>{' '}
                  You may not use our content for commercial purposes.
                </li>
                <li className="text-base text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">No derivatives:</strong>{' '}
                  You may not remix, transform, adapt, or build upon our
                  content.
                </li>
              </ul>
              <p className="text-sm text-text-secondary">
                Full licence text:{' '}
                <a
                  href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-hover underline"
                >
                  creativecommons.org/licenses/by-nc-nd/4.0
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-h3 text-text-primary mb-6">
              What This Means in Practice
            </h2>

            <div className="mb-8">
              <h3 className="font-heading text-h4 text-text-primary mb-3">You can:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-base text-text-secondary leading-relaxed">
                  <svg
                    className="text-accent shrink-0 mt-1"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Share a link to any guide on KnownIssues.co.uk on forums,
                  social media, or in conversation
                </li>
                <li className="flex items-start gap-3 text-base text-text-secondary leading-relaxed">
                  <svg
                    className="text-accent shrink-0 mt-1"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Quote a short passage (a sentence or two) with clear credit
                  and a link back to the original
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading text-h4 text-text-primary mb-3">You cannot:</h3>
              <ul className="space-y-3">
                {[
                  'Copy and paste guides in full or in substantial part anywhere without written permission',
                  'Republish our content on any website regardless of whether it carries advertising',
                  'Use our content to train artificial intelligence or machine learning models',
                  'Remove or obscure authorship, copyright notices, or site attribution from any content',
                  'Share downloaded PDF guides with third parties — guides are licensed for the personal use of the registered individual only',
                  'Forward or post download links — these are personal to your account and expire quickly',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-base text-text-secondary leading-relaxed"
                  >
                    <svg
                      className="text-accent shrink-0 mt-1"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-h3 text-text-primary mb-4">
              Downloaded Guides
            </h2>
            <p className="text-base text-text-secondary leading-relaxed">
              When you register and download a guide you are granted a
              personal, non-transferable licence to use that guide for your
              own private reference. Each download is logged against your
              account and IP address.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-h3 text-text-primary mb-4">
              Accuracy and Disclaimer
            </h2>
            <p className="text-base text-text-secondary leading-relaxed mb-4">
              The guides on KnownIssues.co.uk represent the personal
              experience, research, and opinion of the author. Content is
              provided for general information and guidance only and does
              not constitute professional mechanical, legal, or financial
              advice.
            </p>
            <p className="text-base text-text-secondary leading-relaxed">
              Always have any vehicle independently inspected by a qualified
              professional before purchase. KnownIssues.co.uk accepts no
              liability for any loss, damage, or expense arising from
              decisions made based on content published on this site.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-h3 text-text-primary mb-4">
              Reporting Misuse
            </h2>
            <p className="text-base text-text-secondary leading-relaxed">
              If you find our content reproduced without permission please
              contact us at{' '}
              <a
                href="mailto:support@knownissues.co.uk"
                className="text-accent hover:text-accent-hover underline"
              >
                support@knownissues.co.uk
              </a>
            </p>
          </section>

          <section className="border-t border-border pt-10">
            <h2 className="font-heading text-h3 text-text-primary mb-4">Contact</h2>
            <p className="text-base text-text-secondary leading-relaxed mb-2">
              Email:{' '}
              <a
                href="mailto:support@knownissues.co.uk"
                className="text-accent hover:text-accent-hover underline"
              >
                support@knownissues.co.uk
              </a>
            </p>
            <p className="text-base text-text-secondary leading-relaxed mb-6">
              Website:{' '}
              <Link href="/" className="text-accent hover:text-accent-hover underline">
                knownissues.co.uk
              </Link>
            </p>
            <p className="text-sm text-text-muted mb-8">
              These terms are governed by the laws of England and Wales.
            </p>
            <Button href="mailto:support@knownissues.co.uk" variant="secondary">
              Contact Us
            </Button>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
