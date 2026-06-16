import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

export default function GuideCard({
  title,
  slug,
  description,
  badge,
  ctaLabel = 'View Guide',
}: {
  title: string
  slug: string
  description?: string | null
  badge?: string | null
  ctaLabel?: string
}) {
  return (
    <div className="group flex flex-col bg-surface border border-border rounded-sm p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
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
  )
}
