'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { CreateHuntInput, HuntWithStops, StopWithHunt } from '@/types'

// ─── Create Hunt ───────────────────────────────────────────────────────────────
// Media URLs are resolved client-side before this is called.
// This action only writes to the database — no file handling here.

export async function createHunt(input: CreateHuntInput): Promise<string> {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: hunt, error: huntError } = await supabase
    .from('hunts')
    .insert({
      mother_name: input.mother_name,
      created_by:  input.created_by,
    })
    .select()
    .single()

  if (huntError || !hunt) {
    throw new Error(huntError?.message ?? 'Failed to create hunt')
  }

  const stopsToInsert = input.stops.map((stop) => ({
    hunt_id:       hunt.id,
    stop_order:    stop.stop_order,
    location_hint: stop.location_hint,
    message:       stop.message,
    media_url:     stop.media_url,
    media_type:    stop.media_type,
    next_hint:     stop.next_hint,
    is_finale:     stop.is_finale,
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

export async function getHuntWithStops(huntId: string): Promise<HuntWithStops | null> {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: hunt, error: huntError } = await supabase
    .from('hunts')
    .select('*')
    .eq('id', huntId)
    .single()

  if (huntError || !hunt) return null

  const { data: stops, error: stopsError } = await supabase
    .from('stops')
    .select('*')
    .eq('hunt_id', huntId)
    .order('stop_order', { ascending: true })

  if (stopsError) return null

  return { ...hunt, stops: stops ?? [] } as HuntWithStops
}

// ─── Get Single Stop with Hunt context ────────────────────────────────────────

export async function getStopWithHunt(
  huntId: string,
  stopId: string
): Promise<StopWithHunt | null> {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: stop, error: stopError } = await supabase
    .from('stops')
    .select('*')
    .eq('id', stopId)
    .eq('hunt_id', huntId)
    .single()

  if (stopError || !stop) return null

  const { data: hunt, error: huntError } = await supabase
    .from('hunts')
    .select('*')
    .eq('id', huntId)
    .single()

  if (huntError || !hunt) return null

  const { count } = await supabase
    .from('stops')
    .select('*', { count: 'exact', head: true })
    .eq('hunt_id', huntId)
    .eq('is_finale', false)

  return {
    ...stop,
    hunt,
    totalStops: count ?? 0,
  } as StopWithHunt
}