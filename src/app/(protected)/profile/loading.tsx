'use client'

import { Shimmer } from '@shimmer-from-structure/react'
import { ChangeEmailForm } from '@/components/profile/ChangeEmailForm'
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm'
import { FormCard } from '@/components/profile/FormCard'

export default function ProfileLoading() {
  return (
    <div className="flex w-full h-full">
      <aside
        className="w-[248px] shrink-0 hidden md:block"
        style={{ borderRight: '1px solid var(--border-soft)' }}
      />
      <main className="flex-1 overflow-y-auto">
        <div
          className="px-8 md:px-16 pt-11 pb-7"
          style={{ borderBottom: '1px solid var(--border-soft)' }}
        >
          <h1 className="font-serif text-[38px] leading-[1.1] tracking-editorial font-normal">
            Mon profil
          </h1>
        </div>

        <div className="px-8 md:px-16 py-8 max-w-[720px]">
          <Shimmer loading={true}>
            <FormCard title="Adresse e-mail" desc="Modifie l'adresse e-mail associée à ton compte.">
              <ChangeEmailForm currentEmail="email@exemple.com" />
            </FormCard>
          </Shimmer>

          <Shimmer loading={true}>
            <FormCard title="Mot de passe" desc="Choisis un nouveau mot de passe sécurisé.">
              <ChangePasswordForm />
            </FormCard>
          </Shimmer>
        </div>
      </main>
    </div>
  )
}
