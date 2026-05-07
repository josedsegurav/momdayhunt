export type MediaType = 'image' | 'video'

// ─── Core entities (match Supabase table columns exactly) ─────────────────────

export type Hunt = {
  id: string
  mother_name: string
  created_by: string
  created_at: string
}

export type Stop = {
  id: string
  hunt_id: string
  order: number
  location_hint: string
  message: string
  media_url: string | null
  media_type: MediaType | null
  next_hint: string | null
  is_finale: boolean
  created_at: string
}

// ─── Composed types ────────────────────────────────────────────────────────────

export type HuntWithStops = Hunt & {
  stops: Stop[]
}

// Stop with its parent hunt — used in the reveal page so we have
// mother_name, created_by, and total stop count available.
export type StopWithHunt = Stop & {
  hunt: Hunt
  totalStops: number
}

// ─── Input types (for server actions) ─────────────────────────────────────────

export type CreateStopInput = {
  order: number
  location_hint: string
  message: string
  media_url: string | null
  media_type: MediaType | null
  next_hint: string | null
  is_finale: boolean
}

export type CreateHuntInput = {
  mother_name: string
  created_by: string
  stops: CreateStopInput[]
}