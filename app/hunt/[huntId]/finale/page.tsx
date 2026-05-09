import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getStopWithHunt, getHuntWithStops } from '@/lib/actions'
import FinaleReveal from './Finalereveal'

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: {
  params:       Promise<{ huntId: string }>
  searchParams: Promise<{ stopId?: string }>
}): Promise<Metadata> {
  const { huntId }  = await params
  const { stopId }  = await searchParams
  if (!stopId) return { title: "Happy Mother's Day 🌸" }

  const data = await getStopWithHunt(huntId, stopId)
  if (!data) return { title: "Happy Mother's Day 🌸" }

  return {
    title: `Happy Mother's Day, ${data.hunt.mother_name} 🌸`,
  }
}

// ─── Finale Page ──────────────────────────────────────────────────────────────

export default async function FinalePage({
  params,
  searchParams,
}: {
  params:       Promise<{ huntId: string }>
  searchParams: Promise<{ stopId?: string }>
}) {
  const { huntId }    = await params
  const { stopId: qStopId } = await searchParams

  let stopId = qStopId

  // No stopId in query — find the finale stop automatically
  if (!stopId) {
    const hunt = await getHuntWithStops(huntId)
    if (!hunt) notFound()
    const finale = hunt.stops.find((s) => s.is_finale)
    if (!finale) notFound()
    stopId = finale.id
  }

  const data = await getStopWithHunt(huntId, stopId)
  if (!data) notFound()

  if (!data.is_finale) notFound()

  return <FinaleReveal data={data} />
}