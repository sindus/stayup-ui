'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginAction } from '@/lib/auth-actions'
import { useLanguage } from '@/context/LanguageContext'

function makeSchema(t: { emailInvalid: string; passwordRequired: string }) {
  return z.object({
    email: z.string().email(t.emailInvalid),
    password: z.string().min(1, t.passwordRequired),
  })
}

export function LoginForm() {
  const { t } = useLanguage()
  const a = t.auth
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(makeSchema(a)) })

  async function onSubmit(data: { email: string; password: string }) {
    setError(null)
    const result = await loginAction(data.email, data.password)
    if (result?.error) setError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{a.email}</Label>
        <Input
          id="email"
          type="email"
          placeholder={a.emailPlaceholder}
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message as string}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{a.password}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message as string}</p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? a.signingIn : a.signIn}
      </Button>
    </form>
  )
}
