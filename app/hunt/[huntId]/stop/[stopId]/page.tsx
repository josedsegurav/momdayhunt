import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getStopWithHunt } from '@/lib/actions'
import StopReveal from './Stopreveal'

// ─── Dynamic metadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ huntId: string; stopId: string }>
}): Promise<Metadata> {
  const { huntId, stopId } = await params
  const data = await getStopWithHunt(huntId, stopId)
  if (!data) return { title: 'A message for you 🌸' }

  return {
    title: data.is_finale
      ? `Happy Mother's Day, ${data.hunt.mother_name} 🌸`
      : `Stop ${data.stop_order} · A message for ${data.hunt.mother_name}`,
  }
}

// ─── Stop Reveal Page ─────────────────────────────────────────────────────────

export default async function StopPage({
  params,
}: {
  params: Promise<{ huntId: string; stopId: string }>
}) {
  const { huntId, stopId } = await params
  const data = await getStopWithHunt(huntId, stopId)

  if (!data) notFound()

  if (data.is_finale) {
    redirect(`/hunt/${huntId}/finale?stopId=${stopId}`)
  }

  return <StopReveal data={data} />
}