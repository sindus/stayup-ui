'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { reconnectInstanceAction } from '@/lib/instances-actions'
import { useLanguage } from '@/context/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface DeadInstance {
  instanceId: string
  instanceName: string
}

/** Poussée dès qu'une instance a une session morte (token expiré ou rejeté),
 *  à chaque rendu serveur du feed — donc au chargement et après `router.refresh()`.
 *  Rejouable : « Plus tard » ne la garde fermée que jusqu'au prochain rendu.
 *  Sur le web la reconnexion se fait par e-mail + mot de passe (l'aller-retour
 *  OAuth d'une instance secondaire ne peut pas revenir sur cette origine). */
export function ReconnectModal({ instances }: { instances: DeadInstance[] }) {
  const { t } = useLanguage()
  const [dismissed, setDismissed] = useState(false)

  // Chaque rendu serveur fournit un nouveau tableau : on repropose tant qu'une
  // session reste morte, même si l'utilisateur avait fermé.
  useEffect(() => {
    setDismissed(false)
  }, [instances])

  const open = !dismissed && instances.length > 0

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setDismissed(true)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.instances.reconnectTitle}</DialogTitle>
          <DialogDescription>
            {t.instances.reconnectPrompt} {instances.map((i) => i.instanceName).join(', ')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {instances.map((inst) => (
            <ReconnectRow key={inst.instanceId} instance={inst} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-[12px] text-muted-foreground underline"
        >
          {t.instances.reconnectLater}
        </button>
      </DialogContent>
    </Dialog>
  )
}

function ReconnectRow({ instance }: { instance: DeadInstance }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="rounded-[10px] border p-3" style={{ borderColor: 'var(--border-color)' }}>
      <p className="mb-2 text-sm font-medium">{instance.instanceName}</p>
      <div className="space-y-1.5">
        <Label htmlFor={`rc-${instance.instanceId}-email`}>{t.instances.email}</Label>
        <Input
          id={`rc-${instance.instanceId}-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mt-2 space-y-1.5">
        <Label htmlFor={`rc-${instance.instanceId}-password`}>{t.instances.password}</Label>
        <Input
          id={`rc-${instance.instanceId}-password`}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <Button
        type="button"
        className="mt-3"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null)
            const res = await reconnectInstanceAction(instance.instanceId, email, password)
            if (res.error) setError(res.error)
            else router.refresh()
          })
        }
      >
        {pending ? t.instances.connecting : t.instances.reconnect}
      </Button>
    </div>
  )
}
