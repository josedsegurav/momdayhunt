import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getStopWithHunt } from '@/lib/actions'
import StopReveal from './Stopreveal'

// ─── Dynamic metadata ─────────────────────────────────────────────────────────
// Gives the browser tab a personalised title while mom taps through.

export async function generateMetadata({
  params,
}: {
  params: { huntId: string; stopId: string }
}): Promise<Metadata> {
  const data = await getStopWithHunt(params.huntId, params.stopId)
  if (!data) return { title: 'A message for you 🌸' }

  return {
    title: data.is_finale
      ? `Happy Mother's Day, ${data.hunt.mother_name} 🌸`
      : `Stop ${data.order} · A message for ${data.hunt.mother_name}`,
  }
}

// ─── Stop Reveal Page ─────────────────────────────────────────────────────────

export default async function StopPage({
  params,
}: {
  params: { huntId: string; stopId: string }
}) {
  const data = await getStopWithHunt(params.huntId, params.stopId)

  // Unknown huntId / stopId → 404
  if (!data) notFound()

  // Finale stop has its own dedicated page with a bigger celebration
  if (data.is_finale) {
    redirect(`/hunt/${params.huntId}/finale?stopId=${params.stopId}`)
  }

  return <StopReveal data={data} />
}