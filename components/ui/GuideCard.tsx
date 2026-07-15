import Image from 'next/image'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

export default function GuideCard({
  title,
  slug,
  description,
  badge,
  coverImage,
  ctaLabel = 'View Guide',
}: {
  title: string
  slug: string
  description?: string | null
  badge?: string | null
  coverImage?: string | null
  ctaLabel?: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  return (
    <div className="group flex flex-col bg-surface border border-border rounded-sm overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-video bg-background">
        {coverImage ? (
          <Image
            src={`${siteUrl}/api/images/${coverImage}`}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="font-heading text-lg text-text-muted tracking-tight">
              KnownIssues.co.uk
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-6">
        {badge && (
          <Badge variant="amber" className="mb-3 self-start">
            {badge}
          </Badge>
        )}

        <h3 className="font-heading text-h3 text-text-primary mb-2">{title}</h3>

        {description && (
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 mb-6 flex-1">
            {description}
          </p>
        )}

        <Button href={`/guides/${slug}`} variant="secondary" className="self-start mt-auto">
          {ctaLabel}
        </Button>
      </div>
    </div>
  )
}
