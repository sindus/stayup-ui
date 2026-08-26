'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormCard } from './FormCard'
import { resetApiUrlAction, setApiUrlAction } from '@/lib/settings-actions'
import { useLanguage } from '@/context/LanguageContext'

export function ApiUrlForm({ currentApiUrl }: { currentApiUrl: string }) {
  const router = useRouter()
  const { t } = useLanguage()
  const [value, setValue] = useState(currentApiUrl)
  const [pending, setPending] = useState<'save' | 'reset' | null>(null)
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    setPending('save')
    setError(false)
    setSuccess(false)
    const result = await setApiUrlAction(value)
    setPending(null)
    if (result.error) {
      setError(true)
    } else {
      setSuccess(true)
      router.refresh()
    }
  }

  async function handleReset() {
    setPending('reset')
    setError(false)
    setSuccess(false)
    await resetApiUrlAction()
    setPending(null)
    router.refresh()
  }

  return (
    <FormCard title={t.profile.apiUrlLabel} desc={t.profile.apiUrlDesc}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiUrl">{t.profile.apiUrlLabel}</Label>
          <Input
            id="apiUrl"
            type="url"
            placeholder={t.profile.apiUrlPlaceholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{t.profile.apiUrlInvalid}</p>}
        {success && (
          <p className="text-sm" style={{ color: 'var(--sage)' }}>
            {t.profile.apiUrlSaved}
          </p>
        )}
        <div className="flex gap-2">
          <Button type="button" onClick={handleSave} disabled={pending !== null}>
            {pending === 'save' ? t.profile.apiUrlSaving : t.profile.apiUrlSave}
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} disabled={pending !== null}>
            {pending === 'reset' ? t.profile.apiUrlResetting : t.profile.apiUrlReset}
          </Button>
        </div>
      </div>
    </FormCard>
  )
}
