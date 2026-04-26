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
import type { QUInvite } from '@/lib/types'

const INVITES_COLLECTION = 'invites'

export async function generateInvite(
  email: string,
  adminUID: string,
  role: 'artist' | 'space' | 'moderator' | 'superadmin',
  regionId: string
): Promise<string> {
  const token = crypto.randomUUID()
  const ref = doc(collection(db, INVITES_COLLECTION), token)

  await setDoc(ref, {
    token,
    email,
    role,
    regionId,
    createdAt: serverTimestamp(),
    createdBy: adminUID,
    used: false,
    usedAt: null,
    usedBy: null,
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  return `${baseUrl}/register?invite=${token}`
}

export async function validateInvite(token: string): Promise<QUInvite | null> {
  const snap = await getDocs(
    query(
      collection(db, INVITES_COLLECTION),
      where('token', '==', token),
      where('used', '==', false)
    )
  )

  if (snap.empty) return null

  return snap.docs[0].data() as QUInvite
}

export async function markInviteUsed(token: string, userUID: string): Promise<void> {
  const ref = doc(collection(db, INVITES_COLLECTION), token)
  const snap = await getDoc(ref)

  if (!snap.exists()) throw new Error(`Invite not found: ${token}`)

  await updateDoc(ref, {
    used: true,
    usedAt: serverTimestamp(),
    usedBy: userUID,
  })
}
