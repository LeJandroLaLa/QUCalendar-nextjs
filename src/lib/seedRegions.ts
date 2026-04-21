import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const CINCINNATI_REGION = {
  id: 'cincinnati-oh-us',
  name: 'Cincinnati',
  state: 'OH',
  country: 'US',
  timezone: 'America/New_York',
  status: 'active' as const,
}

export async function seedCincinnatiRegion(): Promise<{ created: boolean; message: string }> {
  const ref = doc(db, 'regions', CINCINNATI_REGION.id)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    return { created: false, message: 'Cincinnati region already exists.' }
  }

  await setDoc(ref, {
    ...CINCINNATI_REGION,
    createdAt: serverTimestamp(),
  })

  return { created: true, message: 'Cincinnati region created successfully.' }
}
