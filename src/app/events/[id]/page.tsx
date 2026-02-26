import EventDetail from './EventDetail'

export async function generateStaticParams() {
  return [{ id: '_' }]
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EventDetail id={id} />
}
