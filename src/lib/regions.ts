import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { QURegion, QUUser } from '@/lib/types'

const REGIONS_COLLECTION = 'regions'
const USERS_COLLECTION = 'users'

export async function getRegion(regionId: string): Promise<QURegion | null> {
  const snap = await getDoc(doc(db, REGIONS_COLLECTION, regionId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as QURegion
}

export async function getAllRegions(): Promise<QURegion[]> {
  const snap = await getDocs(collection(db, REGIONS_COLLECTION))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as QURegion)
}

export async function getActiveRegions(): Promise<QURegion[]> {
  const snap = await getDocs(
    query(collection(db, REGIONS_COLLECTION), where('status', '==', 'active'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as QURegion)
}

export async function createRegion(data: Omit<QURegion, 'createdAt'>): Promise<void> {
  const ref = doc(db, REGIONS_COLLECTION, data.id)
  await setDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function updateRegionStatus(
  regionId: string,
  status: 'active' | 'pending'
): Promise<void> {
  const ref = doc(db, REGIONS_COLLECTION, regionId)
  await updateDoc(ref, { status })
}

export async function getRegionModerators(regionId: string): Promise<QUUser[]> {
  const snap = await getDocs(
    query(
      collection(db, USERS_COLLECTION),
      where('moderatorRegions', 'array-contains', regionId)
    )
  )
  return snap.docs.map(d => d.data() as QUUser)
}
