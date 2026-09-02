'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { adminLoginAction } from '@/lib/auth-actions'
import { useLanguage } from '@/context/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Translations } from '@/lib/translations'

function makeSchema(t: Translations) {
  return z.object({
    username: z.string().email(t.admin.login.emailInvalid),
    password: z.string().min(1, t.admin.login.passwordRequired),
  })
}

type FormData = { username: string; password: string }

export function AdminLoginForm() {
  const { t } = useLanguage()
  const schema = useMemo(() => makeSchema(t), [t])
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setError(null)
    const result = await adminLoginAction(data.username, data.password)
    if (result?.error) setError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">{t.admin.email}</Label>
        <Input id="username" type="email" autoComplete="email" {...register('username')} />
        {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t.admin.login.password}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t.admin.login.submitting : t.admin.login.submit}
      </Button>
    </form>
  )
}
