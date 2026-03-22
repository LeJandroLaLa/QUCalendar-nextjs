import { collectionGroup, query, where, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * Updates the displayName field on every RosterEntry that references the given artistId.
 *
 * NOTE: This is a client-side workaround. It should eventually be replaced with a
 * Cloud Function trigger that fires on writes to /artists/{artistId} and fans out
 * the displayName update to all matching roster sub-collection documents automatically.
 */
export async function updateRosterDisplayName(
  artistId: string,
  newDisplayName: string
): Promise<void> {
  const rosterQuery = query(
    collectionGroup(db, 'roster'),
    where('participantId', '==', artistId)
  )

  const snap = await getDocs(rosterQuery)
  const updates = snap.docs.map((docSnap) =>
    updateDoc(docSnap.ref, { displayName: newDisplayName })
  )

  await Promise.all(updates)
}
