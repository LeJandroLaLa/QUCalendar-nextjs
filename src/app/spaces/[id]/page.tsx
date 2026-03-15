import SpaceDetail from './SpaceDetail'

export async function generateStaticParams() {
  return [{ id: '_' }]
}

export default async function SpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SpaceDetail id={id} />
}
