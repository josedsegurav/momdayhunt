import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getStopWithHunt } from '@/lib/actions'
import FinaleReveal from './Finalereveal'

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: {
  params:       { huntId: string }
  searchParams: { stopId?: string }
}): Promise<Metadata> {
  if (!searchParams.stopId) return { title: 'Happy Mother\'s Day 🌸' }

  const data = await getStopWithHunt(params.huntId, searchParams.stopId)
  if (!data) return { title: 'Happy Mother\'s Day 🌸' }

  return {
    title: `Happy Mother's Day, ${data.hunt.mother_name} 🌸`,
  }
}

// ─── Finale Page ──────────────────────────────────────────────────────────────
// Reached via redirect from /stop/[stopId] when is_finale === true.
// The stopId is passed as a query param so we can fetch the right stop data
// (message, media) for the finale card.

export default async function FinalePage({
  params,
  searchParams,
}: {
  params:       { huntId: string }
  searchParams: { stopId?: string }
}) {
  // If someone navigates here directly without a stopId,
  // try to find the finale stop for this hunt automatically.
  const { getHuntWithStops } = await import('@/lib/actions')

  let stopId = searchParams.stopId

  if (!stopId) {
    const hunt = await getHuntWithStops(params.huntId)
    if (!hunt) notFound()
    const finale = hunt.stops.find((s) => s.is_finale)
    if (!finale) notFound()
    stopId = finale.id
  }

  const data = await getStopWithHunt(params.huntId, stopId)
  if (!data) notFound()

  // Safety check — only finale stops should reach this page
  if (!data.is_finale) notFound()

  return <FinaleReveal data={data} />
}