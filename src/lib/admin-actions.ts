'use server'

import { revalidatePath } from 'next/cache'
import { getToken } from './session'
import {
  adminClearRepositoryData,
  adminDeleteRepository,
  adminDeleteUser,
  deleteUserRepository,
} from './api-client'

const API_URL = process.env.STAYUP_API_URL?.replace(/\/$/, '') ?? ''

export async function adminDeleteUserAction(userId: string): Promise<{ error?: string }> {
  const token = await getToken()
  if (!token) return { error: 'Non authentifié' }
  try {
    await adminDeleteUser(userId, token)
    revalidatePath('/admin/users')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function adminUpdateUserAction(
  userId: string,
  data: { name?: string; email?: string; password?: string },
): Promise<{ error?: string }> {
  const token = await getToken()
  if (!token) return { error: 'Non authentifié' }

  const res = await fetch(`${API_URL}/ui/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    return { error: body.error ?? 'Erreur lors de la mise à jour' }
  }

  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/users')
  return {}
}

export async function adminDeleteUserFluxAction(
  userId: string,
  linkId: string,
): Promise<{ error?: string }> {
  const token = await getToken()
  if (!token) return { error: 'Non authentifié' }
  try {
    await deleteUserRepository(userId, linkId, token)
    revalidatePath(`/admin/users/${userId}`)
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function adminDeleteRepositoryAction(repoId: number): Promise<{ error?: string }> {
  const token = await getToken()
  if (!token) return { error: 'Non authentifié' }
  try {
    await adminDeleteRepository(repoId, token)
    revalidatePath('/admin/repositories')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function adminClearRepositoryDataAction(repoId: number): Promise<{ error?: string }> {
  const token = await getToken()
  if (!token) return { error: 'Non authentifié' }
  try {
    await adminClearRepositoryData(repoId, token)
    revalidatePath('/admin/repositories')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}
