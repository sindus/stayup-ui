import { Button } from '@/components/ui/button'

interface IdentityCardProps {
  name: string
  email: string
}

export function IdentityCard({ name, email }: IdentityCardProps) {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <div
      className="flex items-center gap-4 rounded-[14px] p-5 mb-6"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-[22px] font-semibold shrink-0"
        style={{
          background: 'linear-gradient(135deg, var(--peach), var(--lavender))',
          color: 'var(--peach-on)',
        }}
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-foreground truncate">{name}</p>
        <p className="text-[13px] font-mono text-muted-foreground truncate">{email}</p>
      </div>
      <Button variant="outline" size="sm" disabled title="Bientôt disponible">
        Changer la photo
      </Button>
    </div>
  )
}
