'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

const schema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
})

type FormData = z.infer<typeof schema>

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const router = useRouter()
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

    const result = await authClient.changeEmail({ newEmail: data.email, callbackURL: '/profile' })

    if (result.error) {
      setError(result.error.message ?? "Erreur lors de la mise à jour de l'e-mail.")
    } else {
      setSuccess(true)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Nouvelle adresse e-mail</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && (
        <p className="text-sm text-green-600">
          Un e-mail de confirmation a été envoyé à votre nouvelle adresse.
        </p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Mise à jour...' : "Mettre à jour l'e-mail"}
      </Button>
    </form>
  )
}
