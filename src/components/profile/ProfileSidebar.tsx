'use client'

const ITEMS = [
  { id: 'profile', label: 'Mon profil', active: true },
  { id: 'notifications', label: 'Notifications', active: false },
  { id: 'appearance', label: 'Apparence', active: false },
  { id: 'privacy', label: 'Confidentialité', active: false },
  { id: 'sessions', label: 'Sessions', active: false },
  { id: 'billing', label: 'Facturation', active: false },
]

export function ProfileSidebar() {
  return (
    <aside
      className="w-[248px] shrink-0 px-3.5 py-6 hidden md:block"
      style={{ borderRight: '1px solid var(--border-soft)' }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-micro text-muted-foreground px-2.5 mb-2">
        Compte
      </div>
      <nav className="flex flex-col gap-0.5">
        {ITEMS.map((item) => (
          <div
            key={item.id}
            className="px-2.5 py-2 rounded-md text-[13.5px]"
            style={
              item.active
                ? { background: 'var(--surface)', color: 'var(--fg)', fontWeight: 500 }
                : { color: 'var(--dim)', cursor: 'default' }
            }
          >
            {item.label}
          </div>
        ))}
      </nav>
    </aside>
  )
}
