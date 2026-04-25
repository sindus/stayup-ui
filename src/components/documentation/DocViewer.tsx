interface DocViewerProps {
  content: string | null
  version: number | null
  scrapedAt: string | null
}

export function DocViewer({ content, version, scrapedAt }: DocViewerProps) {
  if (!content) {
    return (
      <p className="text-sm text-muted-foreground italic py-12 text-center">
        Le contenu n&apos;a pas encore été scrappé.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {version !== null && (
        <p className="text-xs text-muted-foreground">
          Version {version}
          {scrapedAt && (
            <>
              {' '}
              ·{' '}
              {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(
                new Date(scrapedAt),
              )}
            </>
          )}
        </p>
      )}
      <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/40 rounded-lg p-4 overflow-auto max-h-[70vh] leading-relaxed">
        {content}
      </pre>
    </div>
  )
}
