'use client'

import Link from 'next/link'
import { RegisterForm } from './RegisterForm'
import { OAuthButtons } from './OAuthButtons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useLanguage } from '@/context/LanguageContext'

export function RegisterPageContent() {
  const { t } = useLanguage()
  const a = t.auth

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{a.registerTitle}</CardTitle>
        <CardDescription>{a.registerSubtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <OAuthButtons />
        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">{a.or}</span>
          <Separator className="flex-1" />
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          {a.alreadyAccount}{' '}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            {a.signIn}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
