import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MagazineReferenceCard from '@/components/ui/MagazineReferenceCard'
import Badge from '@/components/ui/Badge'
import type { MagazineReference } from '@/types'

export const metadata = {
  title: 'In the Press — KnownIssues.co.uk',
  description:
    'A reference library of magazine and online coverage for the cars featured in our buying guides.',
}

type MagazineGroup = { magazine: string; references: MagazineReference[] }

async function getMagazineReferences(): Promise<MagazineGroup[]> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  try {
    const res = await fetch(`${siteUrl}/api/magazine-references`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return (data.magazines ?? []) as MagazineGroup[]
  } catch (err) {
    console.error('[magazine references page]', err)
    return []
  }
}

export default async function MagazineReferencesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const magazines = await getMagazineReferences()

  return (
    <>
      <Header isAuthenticated={Boolean(user)} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl mb-14">
          <h1 className="font-heading text-h2 text-text-primary mb-4">In the Press</h1>
          <p className="text-sm text-text-muted leading-relaxed">
            A reference library of magazine and online coverage for the cars in our buying
            guides. Useful for tracking down original road tests in your back issue
            collection, or reading the best online coverage.
          </p>
        </div>

        {magazines.length === 0 ? (
          <p className="text-text-muted">
            We&apos;re building this reference library from our magazine collection and online
            research — check back soon.
          </p>
        ) : (
          <div className="space-y-16">
            {magazines.map((group) => (
              <section key={group.magazine}>
                <div className="flex items-center gap-3">
                  <h2 className="font-heading text-h3 text-text-primary">{group.magazine}</h2>
                  <Badge variant="grey">
                    {group.references.length} reference
                    {group.references.length === 1 ? '' : 's'}
                  </Badge>
                </div>
                <div className="w-12 h-1 bg-accent rounded-sm mt-2 mb-6" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.references.map((reference) => (
                    <MagazineReferenceCard key={reference.id} reference={reference} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
