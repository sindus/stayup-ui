import type { Metadata } from 'next'
import { getSession } from '@/lib/session'
import { ChangeEmailForm } from '@/components/profile/ChangeEmailForm'
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm'
import { ProfileSidebar } from '@/components/profile/ProfileSidebar'
import { IdentityCard } from '@/components/profile/IdentityCard'
import { FormCard } from '@/components/profile/FormCard'
import { DangerCard } from '@/components/profile/DangerCard'

export const metadata: Metadata = {
  title: 'Mon profil — StayUp',
}

export default async function ProfilePage() {
  const session = await getSession()

  return (
    <div className="flex w-full h-full">
      <ProfileSidebar />
      <main className="flex-1 overflow-y-auto">
        <div
          className="px-8 md:px-16 pt-11 pb-7"
          style={{ borderBottom: '1px solid var(--border-soft)' }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-micro text-muted-foreground mb-2">
            Compte
          </div>
          <h1 className="font-serif text-[38px] leading-[1.1] tracking-editorial font-normal">
            Mon profil
          </h1>
        </div>

        <div className="px-8 md:px-16 py-8 max-w-[720px]">
          <IdentityCard name={session!.name} email={session!.email} />

          <FormCard title="Adresse e-mail" desc="Modifie l'adresse e-mail associée à ton compte.">
            <ChangeEmailForm currentEmail={session!.email} />
          </FormCard>

          <FormCard title="Mot de passe" desc="Choisis un nouveau mot de passe sécurisé.">
            <ChangePasswordForm />
          </FormCard>

          <DangerCard />
        </div>
      </main>
    </div>
  )
}
