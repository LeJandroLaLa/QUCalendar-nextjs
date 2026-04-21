import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Invite {
  email: string
  used: boolean
  usedBy?: string
  createdAt: Timestamp
  usedAt?: Timestamp
}

export async function validateInvite(token: string): Promise<Invite | null> {
  if (!token) return null
  try {
    const snap = await getDoc(doc(db, 'invites', token))
    if (!snap.exists()) return null
    const data = snap.data() as Invite
    if (data.used) return null
    return data
  } catch {
    return null
  }
}

export async function markInviteUsed(token: string, uid: string): Promise<void> {
  await updateDoc(doc(db, 'invites', token), {
    used: true,
    usedBy: uid,
    usedAt: Timestamp.now(),
  })
}
