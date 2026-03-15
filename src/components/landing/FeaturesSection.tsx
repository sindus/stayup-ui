import { GitBranch, Youtube } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: GitBranch,
    title: 'Changelog GitHub',
    description:
      "Suivez les releases de vos dépôts GitHub préférés. Recevez les notes de mise à jour dès qu'une nouvelle version est publiée.",
    badge: 'changelog',
  },
  {
    icon: Youtube,
    title: 'Chaînes YouTube',
    description:
      "Restez informé des dernières vidéos de vos créateurs favoris. Retrouvez titre, description et lien en un coup d'œil.",
    badge: 'youtube',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold text-center mb-12">Deux providers, un seul flux</h2>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.badge} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
