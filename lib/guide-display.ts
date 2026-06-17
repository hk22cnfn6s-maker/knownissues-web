/**
 * Pulls a "(YYYY-YYYY)" style year range out of a guide title for display
 * as a badge, e.g. "Range Rover L322 (2002-2012) Buyers Guide" -> "2002-2012".
 * Purely presentational — the guides table has no dedicated year-range column.
 */
export function extractYearRange(title: string): string | null {
  const match = title.match(/\((\d{4}\s*-\s*\d{4})\)/)
  return match ? match[1].replace(/\s+/g, '') : null
}

import type { Guide, Manufacturer } from '@/types'

export interface ManufacturerGroup {
  manufacturer: Manufacturer | null
  guides: Guide[]
}

/**
 * Groups guides by manufacturer, ordered by the manufacturer's display_order.
 * Guides without a manufacturer_id are bucketed under a null manufacturer group, last.
 */
export function groupGuidesByManufacturer(
  guides: Guide[],
  manufacturers: Manufacturer[]
): ManufacturerGroup[] {
  const sortedManufacturers = [...manufacturers].sort(
    (a, b) => a.display_order - b.display_order
  )

  const groups: ManufacturerGroup[] = sortedManufacturers.map((manufacturer) => ({
    manufacturer,
    guides: guides.filter((g) => g.manufacturer_id === manufacturer.id),
  }))

  const ungrouped = guides.filter(
    (g) => !sortedManufacturers.some((m) => m.id === g.manufacturer_id)
  )
  if (ungrouped.length > 0) {
    groups.push({ manufacturer: null, guides: ungrouped })
  }

  return groups.filter((g) => g.guides.length > 0)
}
