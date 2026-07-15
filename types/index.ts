export interface UserProfile {
  id: string
  email: string
  created_at: string
  is_verified: boolean
}

export interface Guide {
  id: string
  title: string
  slug: string
  description: string | null
  filename: string
  is_published: boolean
  manufacturer_id: string | null
  cover_image: string | null
  created_at: string
}

export interface Manufacturer {
  id: string
  name: string
  slug: string
  logo_filename: string
  display_order: number
  created_at: string
}

export interface Download {
  id: string
  user_id: string
  guide_id: string
  downloaded_at: string
  ip_address: string | null
}

export interface VerificationToken {
  id: string
  user_id: string
  token: string
  expires_at: string
  used: boolean
}

export interface ResourceItem {
  id: string
  section_id: string
  name: string
  description: string | null
  url: string
  badge: string | null
  tag: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

export interface ResourceSection {
  id: string
  title: string
  description: string | null
  display_order: number
  created_at: string
  items: ResourceItem[]
}

export type ReferenceType = 'print' | 'web'

export interface MagazineReferenceGuideLink {
  id: string
  title: string
  slug: string
}

export interface MagazineReference {
  id: string
  magazine: string
  issue_number: string | null
  issue_date: string | null
  article_title: string | null
  url: string | null
  notes: string | null
  reference_type: ReferenceType
  display_order: number
  is_active: boolean
  created_at: string
  guides: MagazineReferenceGuideLink[]
}
