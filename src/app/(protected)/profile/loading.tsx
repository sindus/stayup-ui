'use client'

import { Shimmer } from '@shimmer-from-structure/react'
import { ChangeEmailForm } from '@/components/profile/ChangeEmailForm'
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function ProfileLoading() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mon profil</h1>

      <Shimmer loading={true}>
        <Card>
          <CardHeader>
            <CardTitle>Adresse e-mail</CardTitle>
            <CardDescription>
              Modifiez l&apos;adresse e-mail associée à votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangeEmailForm currentEmail="email@exemple.com" />
          </CardContent>
        </Card>
      </Shimmer>

      <Separator />

      <Shimmer loading={true}>
        <Card>
          <CardHeader>
            <CardTitle>Mot de passe</CardTitle>
            <CardDescription>Choisissez un nouveau mot de passe sécurisé.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </Shimmer>
    </div>
  )
}
