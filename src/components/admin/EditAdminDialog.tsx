'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { adminUpdateAdminAction } from '@/lib/admin-actions'
import type { AdminAccount } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormData = { name: string; email: string; password?: string }

export function EditAdminDialog({
  admin,
  onSuccess,
}: {
  admin: AdminAccount
  onSuccess: () => void
}) {
  const { t } = useLanguage()
  const schema = z.object({
    name: z.string().min(1, t.auth.nameTooShort),
    email: z.string().email(t.auth.emailInvalid),
    password: z.string().optional(),
  })
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: admin.name, email: admin.email },
  })

  async function onSubmit(data: FormData) {
    setError(null)
    const payload: { name: string; email: string; password?: string } = {
      name: data.name,
      email: data.email,
    }
    if (data.password) payload.password = data.password

    const result = await adminUpdateAdminAction(admin.id, payload)
    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
      reset({ name: data.name, email: data.email })
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t.admin.edit}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l&apos;administrateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">{t.admin.name}</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t.admin.email}</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.admin.newPasswordOptional}</Label>
            <Input id="password" type="password" {...register('password')} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.admin.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t.admin.saving : t.admin.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
