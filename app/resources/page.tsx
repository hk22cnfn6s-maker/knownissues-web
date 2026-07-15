import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ResourceCard from '@/components/ui/ResourceCard'
import type { ResourceSection } from '@/types'

export const metadata = {
  title: 'Recommended Resources — KnownIssues.co.uk',
  description:
    'Tools, services, and products the author personally uses or has researched and recommends for used car buyers.',
}

async function getResources(): Promise<ResourceSection[]> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  try {
    const res = await fetch(`${siteUrl}/api/resources`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return (data.sections ?? []) as ResourceSection[]
  } catch (err) {
    console.error('[resources page]', err)
    return []
  }
}

export default async function ResourcesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const allSections = await getResources()
  const sections = allSections.filter((s) => s.items.length > 0)

  return (
    <>
      <Header isAuthenticated={Boolean(user)} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl mb-14">
          <h1 className="font-heading text-h2 text-text-primary mb-4">Recommended Resources</h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Tools, services, and products the author personally uses or has researched and
            recommends. Some links are affiliate links — if you purchase through them it
            supports the site at no extra cost to you.
          </p>
        </div>

        {sections.length === 0 ? (
          <p className="text-text-muted">No resources listed yet — check back soon.</p>
        ) : (
          <div className="space-y-16">
            {sections.map((section) => (
              <section key={section.id}>
                <div className="mb-8">
                  <h2 className="font-heading text-h3 text-text-primary">{section.title}</h2>
                  <div className="w-12 h-1 bg-accent rounded-sm mt-2 mb-3" />
                  {section.description && (
                    <p className="text-sm text-text-secondary max-w-2xl">
                      {section.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((item) => (
                    <ResourceCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="mt-20 pt-8 border-t border-border">
          <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
            Disclosure: Some links on this page are affiliate links. KnownIssues.co.uk may earn
            a small commission if you make a purchase through these links, at no additional
            cost to you. We only recommend products and services we genuinely use or have
            researched thoroughly.
          </p>
        </div>
      </main>

      <Footer />
    </>
  )
}
