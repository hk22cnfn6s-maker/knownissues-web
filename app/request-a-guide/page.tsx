import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'

export const metadata = {
  title: 'Request a Guide — KnownIssues.co.uk',
  description:
    "Can't find the car you're looking for? Let us know what you need and we'll do our best to add it to the library.",
}

export default async function RequestAGuidePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
      <Header isAuthenticated={Boolean(user)} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
        <h1 className="font-heading text-h2 text-text-primary mb-3">Request a Guide</h1>
        <p className="text-lg text-text-secondary mb-8">
          Can't find the car you're looking for?
        </p>

        <div className="space-y-4 text-left mb-10">
          <p className="text-base text-text-secondary leading-relaxed">
            Our guides are written from real ownership experience — which means we're
            selective about what we cover. If you don't see the car you're researching, get
            in touch and let us know what you need.
          </p>
          <p className="text-base text-text-secondary leading-relaxed">
            We can't promise to cover every model, but if there's enough interest or it's a
            car we know well, we'll do our best to add it to the library.
          </p>
          <p className="text-base text-text-secondary leading-relaxed">
            Drop us an email at{' '}
            <a
              href="mailto:support@knownissues.co.uk"
              className="text-accent hover:text-accent-hover underline"
            >
              support@knownissues.co.uk
            </a>{' '}
            with the make, model, and year range you're interested in, and we'll get back to
            you.
          </p>
        </div>

        <Button href="mailto:support@knownissues.co.uk?subject=Guide%20Request" variant="primary">
          Email your request
        </Button>

        <p className="text-sm text-text-muted mt-6">
          We aim to respond within a few days. No spam, no mailing lists — just a
          straightforward reply.
        </p>
      </main>

      <Footer />
    </>
  )
}
