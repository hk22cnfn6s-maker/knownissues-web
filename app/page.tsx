import { createClient, createServiceClient } from '@/lib/supabase/server'
import { extractYearRange, groupGuidesByManufacturer } from '@/lib/guide-display'
import type { Guide, Manufacturer } from '@/types'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import GuideCard from '@/components/ui/GuideCard'
import ManufacturerGroupHeading from '@/components/ui/ManufacturerGroup'
import HowItWorks from '@/components/sections/HowItWorks'
import TrustSection from '@/components/sections/TrustSection'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Published guides are public marketing content — visible to anonymous
  // visitors too, so this bypasses the guides RLS policy (which otherwise
  // restricts reads to verified, logged-in users for the in-app listing).
  const service = createServiceClient()
  const [{ data: guides }, { data: manufacturers }] = await Promise.all([
    service
      .from('guides')
      .select('id, title, slug, description, manufacturer_id, cover_image, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
    service
      .from('manufacturers')
      .select('id, name, slug, logo_filename, display_order, created_at')
      .order('display_order', { ascending: true }),
  ])

  const groups = groupGuidesByManufacturer(
    (guides ?? []) as Guide[],
    (manufacturers ?? []) as Manufacturer[]
  )

  return (
    <>
      <Header isAuthenticated={Boolean(user)} />

      {/* Hero */}
      <section className="bg-dark-surface text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center">
          <h1 className="font-heading text-4xl sm:text-h1 text-white text-balance mb-6">
            Know exactly what you're buying
          </h1>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto mb-10">
            Expert used car buyers guides written by real owners. No fluff, no
            filler — just the known issues, common faults, and honest advice
            you need before handing over your money.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="#guides" variant="primary">
              Browse Guides
            </Button>
            <Button
              href="#how-it-works"
              variant="secondary"
              className="!border-white !text-white hover:!bg-white hover:!text-text-primary"
            >
              How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Guide cards */}
      <section id="guides" className="bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <h2 className="font-heading text-3xl sm:text-h2 text-text-primary text-center mb-12">
            Available Guides
          </h2>

          {groups.length === 0 ? (
            <p className="text-center text-text-muted">No guides available yet.</p>
          ) : (
            <div className="space-y-12">
              {groups.map((group) => (
                <div key={group.manufacturer?.id ?? 'other'}>
                  <ManufacturerGroupHeading manufacturer={group.manufacturer} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.guides.map((guide) => (
                      <GuideCard
                        key={guide.id}
                        title={guide.title}
                        slug={guide.slug}
                        description={guide.description}
                        badge={extractYearRange(guide.title)}
                        coverImage={guide.cover_image}
                        ctaLabel={user ? 'View Guide' : 'Register Free to Download'}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <HowItWorks />
      <TrustSection />
      <Footer />
    </>
  )
}
