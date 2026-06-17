import Image from 'next/image'
import type { Manufacturer } from '@/types'

export default function ManufacturerGroupHeading({
  manufacturer,
}: {
  manufacturer: Manufacturer | null
}) {
  if (!manufacturer) {
    return (
      <h2 className="font-heading text-h4 text-text-primary mb-4">
        Other guides
      </h2>
    )
  }

  return (
    <div className="flex items-center gap-3 mb-4">
      <Image
        src={`/logos/${manufacturer.logo_filename}`}
        alt={`${manufacturer.name} logo`}
        width={120}
        height={30}
        className="h-7 w-auto"
      />
      <h2 className="font-heading text-h4 text-text-primary">{manufacturer.name}</h2>
    </div>
  )
}
