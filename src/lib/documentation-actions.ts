'use server'

import { revalidatePath } from 'next/cache'
import { subscribeDoc, unsubscribeDoc } from './api-client'
import { getToken } from './session'

export async function subscribeDocAction(docId: number): Promise<{ error?: string }> {
  const token = await getToken()
  if (!token) return { error: 'Non authentifié' }
  try {
    await subscribeDoc(docId, token)
    revalidatePath('/documentation')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function unsubscribeDocAction(docId: number): Promise<{ error?: string }> {
  const token = await getToken()
  if (!token) return { error: 'Non authentifié' }
  try {
    await unsubscribeDoc(docId, token)
    revalidatePath('/documentation')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}
