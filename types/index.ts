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
