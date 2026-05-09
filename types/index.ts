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
  stop_order: number        // renamed from `order` — reserved SQL keyword
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

export type StopWithHunt = Stop & {
  hunt: Hunt
  totalStops: number
}

// ─── Input types (for server actions) ─────────────────────────────────────────

export type CreateStopInput = {
  stop_order: number        // renamed from `order`
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