import type { Metadata } from 'next'
import { getSession } from '@/lib/session'
import { ChangeEmailForm } from '@/components/profile/ChangeEmailForm'
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Mon profil — StayUp',
}

export default async function ProfilePage() {
  const session = await getSession()

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mon profil</h1>

      <Card>
        <CardHeader>
          <CardTitle>Adresse e-mail</CardTitle>
          <CardDescription>Modifiez l'adresse e-mail associée à votre compte.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangeEmailForm currentEmail={session!.email} />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Mot de passe</CardTitle>
          <CardDescription>Choisissez un nouveau mot de passe sécurisé.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
