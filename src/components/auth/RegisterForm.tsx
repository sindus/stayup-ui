'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerAction } from '@/lib/auth-actions'
import { useLanguage } from '@/context/LanguageContext'

function makeSchema(a: {
  nameTooShort: string
  emailInvalid: string
  passwordTooShort: string
  passwordMismatch: string
}) {
  return z
    .object({
      name: z.string().min(2, a.nameTooShort),
      email: z.string().email(a.emailInvalid),
      password: z.string().min(8, a.passwordTooShort),
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: a.passwordMismatch,
      path: ['confirmPassword'],
    })
}

export function RegisterForm() {
  const { t } = useLanguage()
  const a = t.auth
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(makeSchema(a)) })

  async function onSubmit(data: { name: string; email: string; password: string }) {
    setError(null)
    const result = await registerAction(data.name, data.email, data.password)
    if (result?.error) setError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{a.name}</Label>
        <Input
          id="name"
          placeholder={a.namePlaceholder}
          autoComplete="name"
          {...register('name')}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
      </div>
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
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message as string}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{a.confirmPassword}</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message as string}</p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? a.creatingAccount : a.createAccount}
      </Button>
    </form>
  )
}
