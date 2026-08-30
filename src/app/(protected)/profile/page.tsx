import type { Metadata } from 'next'
import { getSession } from '@/lib/session'
import { readInstances, hostOf } from '@/lib/instances'
import { ChangeEmailForm } from '@/components/profile/ChangeEmailForm'
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm'
import { InstancesCard, type InstanceView } from '@/components/profile/InstancesCard'
import { ProfileSidebar } from '@/components/profile/ProfileSidebar'
import { IdentityCard } from '@/components/profile/IdentityCard'
import { FormCard } from '@/components/profile/FormCard'
import { DangerCard } from '@/components/profile/DangerCard'

export const metadata: Metadata = {
  title: 'Mon profil — StayUp',
}

function isExpired(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as {
      exp?: number
    }
    return payload.exp !== undefined && payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export default async function ProfilePage() {
  const session = await getSession()
  const instances = await readInstances()
  const instanceViews: InstanceView[] = instances.map((i) => ({
    id: i.id,
    name: i.name,
    host: hostOf(i.url),
    expired: isExpired(i.token),
  }))

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

          <InstancesCard instances={instanceViews} />

          <DangerCard />
        </div>
      </main>
    </div>
  )
}
