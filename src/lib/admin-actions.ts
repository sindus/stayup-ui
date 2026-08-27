'use server'

import { revalidatePath } from 'next/cache'
import { getServerTranslations } from './serverLang'
import { getApiUrl } from './apiUrl'
import { getAdminToken } from './session'
import {
  adminClearRepositoryData,
  adminCreateRepository,
  adminDeleteRepository,
  adminDeleteUser,
  adminListScrapRequests,
  adminApproveScrapRequest,
  adminRejectScrapRequest,
  deleteUserRepository,
} from './api-client'
import type { ScrapRequest } from '@/types'

export async function adminDeleteUserAction(userId: string): Promise<{ error?: string }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
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
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }

  const apiUrl = await getApiUrl()
  const res = await fetch(`${apiUrl}/ui/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  })

  if (!res.ok) {
    const t = await getServerTranslations()
    // Le message de l'API est en anglais quel que soit le visiteur : on branche sur
    // le statut plutôt que de relayer son texte.
    if (res.status === 409) return { error: t.errors.emailTaken }
    return { error: t.errors.updateFailed }
  }

  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/users')
  return {}
}

export async function adminDeleteUserFluxAction(
  userId: string,
  linkId: string,
): Promise<{ error?: string }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
  try {
    await deleteUserRepository(userId, linkId, token)
    revalidatePath(`/admin/users/${userId}`)
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function adminDeleteRepositoryAction(repoId: number): Promise<{ error?: string }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
  try {
    await adminDeleteRepository(repoId, token)
    revalidatePath('/admin/repositories')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function adminClearRepositoryDataAction(repoId: number): Promise<{ error?: string }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
  try {
    await adminClearRepositoryData(repoId, token)
    revalidatePath('/admin/repositories')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function adminCreateRepositoryAction(data: {
  url: string
  type: string
  config: Record<string, unknown>
}): Promise<{ error?: string }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
  try {
    await adminCreateRepository(data, token)
    revalidatePath('/admin/repositories')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function adminListScrapRequestsAction(): Promise<ScrapRequest[]> {
  const token = await getAdminToken()
  if (!token) return []
  return adminListScrapRequests(token).catch(() => [])
}

export async function adminRejectScrapRequestAction(
  requestId: string,
): Promise<{ error?: string }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
  try {
    await adminRejectScrapRequest(requestId, token)
    revalidatePath('/admin/scrap-requests')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function adminApproveScrapRequestAction(
  requestId: string,
  data: { url: string; config: Record<string, unknown> },
): Promise<{ error?: string; repository_id?: number }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
  try {
    const result = await adminApproveScrapRequest(requestId, data, token)
    revalidatePath('/admin/scrap-requests')
    revalidatePath('/admin/repositories')
    return { repository_id: result.repository_id }
  } catch (err) {
    return { error: (err as Error).message }
  }
}
