interface FormCardProps {
  title: string
  desc: string
  children: React.ReactNode
}

export function FormCard({ title, desc, children }: FormCardProps) {
  return (
    <div
      className="rounded-[14px] p-6 mb-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}
    >
      <h2 className="text-[16px] font-semibold text-foreground mb-1">{title}</h2>
      <p className="text-[13px] text-muted-foreground mb-5">{desc}</p>
      {children}
    </div>
  )
}
