'use server'

import { revalidatePath } from 'next/cache'
import { getToken } from './session'
import { subscribeScrap, unsubscribeScrap } from './api-client'

export async function subscribeScrapAction(repoId: number): Promise<{ error?: string }> {
  const token = await getToken()
  if (!token) return { error: 'Non authentifié' }
  try {
    await subscribeScrap(repoId, token)
    revalidatePath('/scrap')
    revalidatePath('/feed')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function unsubscribeScrapAction(repoId: number): Promise<{ error?: string }> {
  const token = await getToken()
  if (!token) return { error: 'Non authentifié' }
  try {
    await unsubscribeScrap(repoId, token)
    revalidatePath('/scrap')
    revalidatePath('/feed')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}
