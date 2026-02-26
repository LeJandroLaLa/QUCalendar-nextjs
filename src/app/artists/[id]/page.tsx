import ArtistDetail from './ArtistDetail'

export async function generateStaticParams() {
  return [{ id: '_' }]
}

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ArtistDetail id={id} />
}
