import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getHuntWithStops } from '@/lib/actions'
import HuntWelcome from './Huntwelcome'

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ huntId: string }>
}): Promise<Metadata> {
  const { huntId } = await params
  const hunt = await getHuntWithStops(huntId)
  if (!hunt) return { title: 'Your surprise is waiting 🌸' }

  return {
    title: `Something special for ${hunt.mother_name} 🌸`,
    description: `A Mother's Day scavenger hunt from ${hunt.created_by}.`,
  }
}

// ─── Hunt Welcome Page ────────────────────────────────────────────────────────
// Entry point for mom. The creator shares this URL via text or shows it
// on screen. Reveals a welcome letter and the first tag's location hint.

export default async function HuntPage({
  params,
}: {
  params: Promise<{ huntId: string }>
}) {
  const { huntId } = await params
  const hunt = await getHuntWithStops(huntId)
  if (!hunt) notFound()

  // Ensure stops are sorted by order — defensive in case DB returns unsorted
  hunt.stops = hunt.stops.sort((a, b) => a.stop_order - b.stop_order)

  // Need at least one stop to show a first clue
  if (hunt.stops.length === 0) notFound()

  return <HuntWelcome hunt={hunt} />
}