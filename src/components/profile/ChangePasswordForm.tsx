'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfileAction } from '@/lib/auth-actions'
import { useLanguage } from '@/context/LanguageContext'

type FormData = { currentPassword: string; newPassword: string; confirmPassword: string }

export function ChangePasswordForm() {
  const { t } = useLanguage()
  const schema = z
    .object({
      // L'API exige le mot de passe actuel : un token seul ne doit pas suffire à
      // verrouiller le compte de son propriétaire.
      currentPassword: z.string().min(1, t.profile.currentPasswordRequired),
      newPassword: z.string().min(8, t.auth.passwordTooShort),
      confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: t.auth.passwordMismatch,
      path: ['confirmPassword'],
    })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setError(null)
    setSuccess(false)
    const result = await updateProfileAction({
      password: data.newPassword,
      currentPassword: data.currentPassword,
    })
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">{t.profile.currentPassword}</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          {...register('currentPassword')}
        />
        {errors.currentPassword && (
          <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">{t.profile.newPassword}</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          {...register('newPassword')}
        />
        {errors.newPassword && (
          <p className="text-sm text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t.profile.confirmNewPassword}</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && (
        <p className="text-sm" style={{ color: 'var(--sage)' }}>
          {t.profile.passwordUpdated}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t.profile.updatingPassword : t.profile.updatePassword}
      </Button>
    </form>
  )
}
