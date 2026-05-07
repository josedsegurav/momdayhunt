'use server'

import { createClient } from '@/lib/supabase/server'
import { CreateHuntInput, HuntWithStops, StopWithHunt } from '@/types'

// ─── Create Hunt ───────────────────────────────────────────────────────────────
// Inserts the hunt row first, then bulk-inserts all stops in one query.
// Returns the new hunt's ID so the caller can redirect to /hunt/[id]/admin.

export async function createHunt(input: CreateHuntInput): Promise<string> {
  const supabase = await createClient()

  // 1. Insert hunt
  const { data: hunt, error: huntError } = await supabase
    .from('hunts')
    .insert({
      mother_name: input.mother_name,
      created_by: input.created_by,
    })
    .select()
    .single()

  if (huntError || !hunt) {
    throw new Error(huntError?.message ?? 'Failed to create hunt')
  }

  // 2. Bulk-insert stops, attaching the hunt id
  const stopsToInsert = input.stops.map((stop) => ({
    ...stop,
    hunt_id: hunt.id,
  }))

  const { error: stopsError } = await supabase
    .from('stops')
    .insert(stopsToInsert)

  if (stopsError) {
    throw new Error(stopsError.message)
  }

  return hunt.id
}

// ─── Get Hunt with all Stops ───────────────────────────────────────────────────
// Used in the admin page. Returns the hunt + all stops sorted by order.

export async function getHuntWithStops(huntId: string): Promise<HuntWithStops | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hunts')
    .select(`
      *,
      stops (*)
    `)
    .eq('id', huntId)
    .order('order', { referencedTable: 'stops', ascending: true })
    .single()

  if (error || !data) return null

  return data as HuntWithStops
}

// ─── Get Single Stop with Hunt context ────────────────────────────────────────
// Used in the stop reveal page.
// Returns the stop + its parent hunt + total non-finale stop count.

export async function getStopWithHunt(
  huntId: string,
  stopId: string
): Promise<StopWithHunt | null> {
  const supabase = await createClient()

  // Fetch the stop, joining its parent hunt
  const { data: stop, error: stopError } = await supabase
    .from('stops')
    .select(`
      *,
      hunt:hunts (*)
    `)
    .eq('id', stopId)
    .eq('hunt_id', huntId)
    .single()

  if (stopError || !stop) return null

  // Count total non-finale stops so the reveal page can show "Stop 2 of 4"
  const { count } = await supabase
    .from('stops')
    .select('*', { count: 'exact', head: true })
    .eq('hunt_id', huntId)
    .eq('is_finale', false)

  return {
    ...stop,
    hunt: stop.hunt,
    totalStops: count ?? 0,
  } as StopWithHunt
}

// ─── Upload Media ──────────────────────────────────────────────────────────────
// Uploads an image or video to Supabase Storage (bucket: hunt-media).
// Returns the public URL to be stored in the stop row.
// Called from the Create wizard with a FormData payload.

export async function uploadMedia(formData: FormData): Promise<string> {
  const supabase = await createClient()

  const file = formData.get('file') as File

  if (!file || file.size === 0) {
    throw new Error('No file provided')
  }

  const ext = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('hunt-media')
    .upload(fileName, arrayBuffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage.from('hunt-media').getPublicUrl(fileName)

  return data.publicUrl
}