'use server'

import { revalidatePath } from 'next/cache'
import { getServerTranslations } from './serverLang'
import { getApiUrl } from './apiUrl'
import { getAdminToken } from './session'
import {
  adminApproveFluxRequest,
  adminApprovePendingUser,
  adminChangeOwnPassword,
  adminClearRepositoryData,
  adminCreateAdmin,
  adminCreateRepository,
  adminDeleteAdmin,
  adminDeleteRepository,
  adminDeleteUser,
  adminListFluxRequests,
  adminListPendingUsers,
  adminListProviders,
  adminRejectFluxRequest,
  adminRejectPendingUser,
  adminSetProviderApproval,
  adminUpdateAdmin,
  deleteUserRepository,
  type AdminPendingUser,
} from './api-client'
import type { FluxRequest } from '@/types'

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

// ─── Admin accounts (super-admin only) ────────────────────────────────────────

export async function adminCreateAdminAction(data: {
  email: string
  name: string
  password: string
}): Promise<{ error?: string }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
  try {
    await adminCreateAdmin(data, token)
    revalidatePath('/admin/admins')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function adminUpdateAdminAction(
  id: string,
  data: { name?: string; email?: string; password?: string },
): Promise<{ error?: string }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
  try {
    await adminUpdateAdmin(id, data, token)
    revalidatePath('/admin/admins')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function adminDeleteAdminAction(id: string): Promise<{ error?: string }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
  try {
    await adminDeleteAdmin(id, token)
    revalidatePath('/admin/admins')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function adminChangeOwnPasswordAction(data: {
  currentPassword: string
  password: string
}): Promise<{ error?: string }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
  try {
    await adminChangeOwnPassword(data, token)
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

export async function adminListFluxRequestsAction(): Promise<FluxRequest[]> {
  const token = await getAdminToken()
  if (!token) return []
  return adminListFluxRequests(token).catch(() => [])
}

// ─── Pending sign-ups (REGISTRATION_MODE=approval) ────────────────────────────

export async function adminListPendingUsersAction(): Promise<AdminPendingUser[]> {
  const token = await getAdminToken()
  if (!token) return []
  return adminListPendingUsers(token).catch(() => [])
}

export async function adminApprovePendingUserAction(id: string): Promise<{ error?: string }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
  try {
    await adminApprovePendingUser(id, token)
    revalidatePath('/admin/users')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function adminRejectPendingUserAction(id: string): Promise<{ error?: string }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
  try {
    await adminRejectPendingUser(id, token)
    revalidatePath('/admin/users')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function adminRejectFluxRequestAction(requestId: string): Promise<{ error?: string }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
  try {
    await adminRejectFluxRequest(requestId, token)
    revalidatePath('/admin/flux-requests')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function adminApproveFluxRequestAction(
  requestId: string,
  data: { config?: Record<string, unknown> },
): Promise<{ error?: string; repository_id?: number }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
  try {
    const result = await adminApproveFluxRequest(requestId, data, token)
    revalidatePath('/admin/flux-requests')
    revalidatePath('/admin/repositories')
    return { repository_id: result.repository_id }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

// ─── Providers (mode d'approbation de flux) ───────────────────────────────────

export async function adminListProvidersAction(): Promise<
  { name: string; displayName: string; flux_approval: 'auto' | 'manual' }[]
> {
  const token = await getAdminToken()
  if (!token) return []
  return adminListProviders(token).catch(() => [])
}

export async function adminSetProviderApprovalAction(
  name: string,
  flux_approval: 'auto' | 'manual',
): Promise<{ error?: string }> {
  const token = await getAdminToken()
  if (!token) return { error: (await getServerTranslations()).errors.notAuthenticated }
  try {
    await adminSetProviderApproval(name, flux_approval, token)
    revalidatePath('/admin/providers')
    return {}
  } catch (err) {
    return { error: (err as Error).message }
  }
}
