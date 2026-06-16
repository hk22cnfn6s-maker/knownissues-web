/**
 * Pulls a "(YYYY-YYYY)" style year range out of a guide title for display
 * as a badge, e.g. "Range Rover L322 (2002-2012) Buyers Guide" -> "2002-2012".
 * Purely presentational — the guides table has no dedicated year-range column.
 */
export function extractYearRange(title: string): string | null {
  const match = title.match(/\((\d{4}\s*-\s*\d{4})\)/)
  return match ? match[1].replace(/\s+/g, '') : null
}
