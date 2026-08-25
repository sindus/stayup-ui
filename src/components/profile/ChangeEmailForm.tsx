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

type FormData = { email: string }

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const { t } = useLanguage()
  const schema = z.object({
    email: z.string().email(t.auth.emailInvalid),
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: currentEmail },
  })

  async function onSubmit(data: FormData) {
    setError(null)
    setSuccess(false)
    const result = await updateProfileAction({ email: data.email })
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t.profile.newEmail}</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && (
        <p className="text-sm" style={{ color: 'var(--sage)' }}>
          {t.profile.emailUpdated}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t.profile.updatingEmail : t.profile.updateEmail}
      </Button>
    </form>
  )
}
