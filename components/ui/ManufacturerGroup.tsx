import type { Manufacturer } from '@/types'

export default function ManufacturerGroupHeading({
  manufacturer,
}: {
  manufacturer: Manufacturer | null
}) {
  if (!manufacturer) {
    return (
      <h2 className="font-heading text-h4 text-text-primary mb-6">
        Other guides
      </h2>
    )
  }

  return (
    <div className="flex items-center gap-4 mb-6 pb-3 border-b border-border">
      {/* SVGs vary from square emblems to wide wordmarks — cap height at 48px,
          constrain max-width so wordmarks don't dominate, and preserve aspect ratio. */}
      <div className="flex items-center flex-shrink-0" style={{ height: '48px', maxWidth: '160px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/logos/${manufacturer.logo_filename}`}
          alt={`${manufacturer.name} logo`}
          style={{ maxHeight: '48px', maxWidth: '160px', width: 'auto', height: 'auto', objectFit: 'contain', objectPosition: 'left center' }}
        />
      </div>
      <h2 className="font-heading text-h4 text-text-primary">{manufacturer.name}</h2>
    </div>
  )
}
