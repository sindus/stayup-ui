'use client'

import { GitBranch, Youtube } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/context/LanguageContext'

export function FeaturesSection() {
  const { t } = useLanguage()
  const f = t.landing.features

  const features = [
    { icon: GitBranch, key: 'changelog' as const, badge: 'changelog' },
    { icon: Youtube, key: 'youtube' as const, badge: 'youtube' },
  ]

  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold text-center mb-12">{f.title}</h2>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {features.map(({ icon: Icon, key, badge }) => (
          <Card key={badge} className="text-center">
            <CardHeader>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{f[key].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{f[key].description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
