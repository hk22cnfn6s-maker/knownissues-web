import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { ResourceItem } from '@/types'

export default function ResourceCard({ item }: { item: ResourceItem }) {
  return (
    <div className="flex flex-col bg-surface border border-border rounded-sm p-6">
      {(item.badge || item.tag) && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {item.badge && <Badge variant="amber">{item.badge}</Badge>}
          {item.tag && <Badge variant="grey">{item.tag}</Badge>}
        </div>
      )}

      <h3 className="text-base font-bold text-text-primary mb-2">{item.name}</h3>

      {item.description && (
        <p className="text-sm text-text-secondary leading-relaxed mb-6 flex-1">
          {item.description}
        </p>
      )}

      <Button
        href={item.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        variant="primary"
        className="self-start mt-auto"
      >
        Visit →
      </Button>
    </div>
  )
}
