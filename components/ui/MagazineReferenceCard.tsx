import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import type { MagazineReference } from '@/types'

export default function MagazineReferenceCard({
  reference,
}: {
  reference: MagazineReference
}) {
  const isWeb = reference.reference_type === 'web'
  const hasUrl = isWeb && Boolean(reference.url)
  const title = reference.article_title || reference.magazine
  const meta = isWeb
    ? reference.issue_date
    : [reference.issue_number, reference.issue_date].filter(Boolean).join(' · ')

  return (
    <div className="flex flex-col bg-surface border border-border rounded-sm p-6">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge variant="grey">{isWeb ? 'Web' : 'Print'}</Badge>
        {meta && <span className="text-xs text-text-muted">{meta}</span>}
      </div>

      {hasUrl ? (
        <a
          href={reference.url!}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-bold text-text-primary hover:text-accent transition-colors mb-2"
        >
          {title}
        </a>
      ) : (
        <h3 className="text-base font-bold text-text-primary mb-2">{title}</h3>
      )}

      {reference.notes && (
        <p className="text-sm text-text-secondary leading-relaxed mb-3 flex-1">
          {reference.notes}
        </p>
      )}

      {hasUrl && (
        <a
          href={reference.url!}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent hover:text-accent-hover font-medium mb-3"
        >
          Read article →
        </a>
      )}

      {reference.guides.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-1">
          {reference.guides.map((g) => (
            <Link key={g.id} href={`/guides/${g.slug}`}>
              <Badge
                variant="amber"
                className="hover:bg-accent/20 transition-colors cursor-pointer"
              >
                {g.title}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
