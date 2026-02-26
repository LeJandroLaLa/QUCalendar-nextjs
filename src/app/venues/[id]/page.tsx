import VenueDetail from './VenueDetail'

export async function generateStaticParams() {
  return [{ id: '_' }]
}

export default async function VenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <VenueDetail id={id} />
}
