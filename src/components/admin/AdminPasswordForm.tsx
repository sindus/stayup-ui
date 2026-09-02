'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { adminChangeOwnPasswordAction } from '@/lib/admin-actions'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormData = { currentPassword: string; password: string }

export function AdminPasswordForm() {
  const { t } = useLanguage()
  const schema = z.object({
    currentPassword: z.string().min(1, t.admin.login.passwordRequired),
    password: z.string().min(8, t.auth.passwordTooShort),
  })
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setError(null)
    setDone(false)
    const result = await adminChangeOwnPasswordAction(data)
    if (result.error) setError(result.error)
    else {
      setDone(true)
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">{t.admin.currentPassword}</Label>
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
        <Label htmlFor="password">{t.admin.newPassword}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {done && <p className="text-sm text-emerald-600">{t.admin.passwordUpdated}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t.admin.saving : t.admin.save}
      </Button>
    </form>
  )
}
