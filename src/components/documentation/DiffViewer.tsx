import { cn } from '@/lib/utils'

interface DiffViewerProps {
  diff: string
  version: number
  scrapedAt: string
}

function classifyLine(line: string): 'added' | 'removed' | 'header' | 'context' {
  if (line.startsWith('+') && !line.startsWith('+++')) return 'added'
  if (line.startsWith('-') && !line.startsWith('---')) return 'removed'
  if (line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++')) return 'header'
  return 'context'
}

export function DiffViewer({ diff, version, scrapedAt }: DiffViewerProps) {
  const lines = diff.split('\n')

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Version {version} ·{' '}
        {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(
          new Date(scrapedAt),
        )}
      </p>
      <div className="rounded-lg border overflow-auto max-h-[70vh] text-xs font-mono">
        {lines.map((line, i) => {
          const kind = classifyLine(line)
          return (
            <div
              key={i}
              className={cn('px-4 py-0.5 whitespace-pre', {
                'bg-green-500/10 text-green-700 dark:text-green-400': kind === 'added',
                'bg-red-500/10 text-red-700 dark:text-red-400': kind === 'removed',
                'bg-muted/60 text-muted-foreground': kind === 'header',
                'text-foreground': kind === 'context',
              })}
            >
              {line || ' '}
            </div>
          )
        })}
      </div>
    </div>
  )
}
