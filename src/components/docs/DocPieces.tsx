// Briques de présentation de la doc. Serveur uniquement : rien ici n'a d'état.

export function DocSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string
  eyebrow?: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 mb-14">
      {eyebrow && (
        <p
          className="text-[11px] font-mono font-semibold uppercase tracking-widest mb-2"
          style={{ color: 'var(--peach)' }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="text-[12px] font-semibold uppercase tracking-widest pb-2.5 mb-5"
        style={{ color: 'var(--fg)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

export function DocPartHeading({
  id,
  eyebrow,
  title,
}: {
  id: string
  eyebrow: string
  title: string
}) {
  return (
    <div id={id} className="scroll-mt-20 mb-10 pt-4">
      <p
        className="text-[11px] font-mono font-semibold uppercase tracking-widest mb-2"
        style={{ color: 'var(--peach)' }}
      >
        {eyebrow}
      </p>
      <h2
        className="font-serif text-[30px] leading-tight font-normal"
        style={{ color: 'var(--fg)' }}
      >
        {title}
      </h2>
    </div>
  )
}

export function DocList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3 mb-7">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[15px] leading-relaxed">
          <span
            aria-hidden
            className="mt-2 h-[5px] w-[5px] shrink-0 rounded-full"
            style={{ background: 'var(--peach)' }}
          />
          <span style={{ color: 'var(--fg-soft)' }}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function DocOrderedList({ items }: { items: readonly string[] }) {
  return (
    <ol className="space-y-3 mb-7">
      {items.map((item, i) => (
        <li key={item} className="flex gap-3 text-[15px] leading-relaxed">
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-mono font-medium"
            style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}
          >
            {i + 1}
          </span>
          <span style={{ color: 'var(--fg-soft)' }}>{item}</span>
        </li>
      ))}
    </ol>
  )
}

export function DocNote({
  children,
  tone = 'peach',
}: {
  children: React.ReactNode
  tone?: 'peach' | 'sky'
}) {
  return (
    <p
      className="mb-7 rounded-r-lg px-5 py-3.5 font-serif text-[16px] italic leading-relaxed"
      style={{
        color: 'var(--fg)',
        background: tone === 'sky' ? 'var(--sky-dim)' : 'var(--peach-dim)',
        borderLeft: `3px solid ${tone === 'sky' ? 'var(--sky)' : 'var(--peach)'}`,
      }}
    >
      {children}
    </p>
  )
}

export function DocCode({ children }: { children: string }) {
  return (
    <pre
      className="mb-6 overflow-x-auto rounded-[10px] p-4 text-[13px] leading-relaxed font-mono"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
    >
      <code style={{ color: 'var(--fg-soft)' }}>{children}</code>
    </pre>
  )
}

export function DocInline({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="font-mono text-[0.88em] px-1.5 py-0.5 rounded"
      style={{ background: 'var(--surface)', color: 'var(--peach)' }}
    >
      {children}
    </code>
  )
}

export function DocSubheading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="font-serif italic text-[18px] font-normal mb-3 mt-8"
      style={{ color: 'var(--fg)' }}
    >
      {children}
    </h3>
  )
}

export function DocTable({
  columns,
  rows,
}: {
  columns: readonly string[]
  rows: readonly (readonly React.ReactNode[])[]
}) {
  return (
    <div className="mb-7 overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left text-[14px]">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                className="pb-2.5 pr-4 text-[11px] font-mono font-semibold uppercase tracking-widest"
                style={{ color: 'var(--dim)', borderBottom: '1px solid var(--border-subtle)' }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="py-3 pr-4 align-top leading-relaxed"
                  style={{ color: 'var(--fg-soft)', borderBottom: '1px solid var(--border-soft)' }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Encadré de schéma : une grille de boîtes légendées, plutôt qu'une image figée
 *  qu'il faudrait régénérer à chaque traduction. */
export function DocDiagram({
  title,
  children,
  note,
  tone = 'peach',
}: {
  title: string
  children: React.ReactNode
  note?: string
  tone?: 'peach' | 'sky'
}) {
  return (
    <figure
      className="mb-10 rounded-[14px] p-6"
      style={{
        background: 'var(--bg-soft, var(--surface))',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <figcaption
        className="mb-5 text-[11px] font-mono uppercase tracking-widest"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {title}
      </figcaption>
      {children}
      {note && (
        <p
          className="mt-5 rounded-lg px-4 py-3 font-serif text-[14px] italic leading-relaxed"
          style={{
            color: 'var(--fg)',
            background: tone === 'sky' ? 'var(--sky-dim)' : 'var(--peach-dim)',
          }}
        >
          {note}
        </p>
      )}
    </figure>
  )
}

export function DiagramBox({
  title,
  subtitle,
  items,
  accent = 'var(--peach)',
}: {
  title: string
  subtitle?: string
  items?: readonly string[]
  accent?: string
}) {
  return (
    <div
      className="rounded-[10px] p-4"
      style={{ background: 'var(--surface)', border: `1px solid ${accent}` }}
    >
      <p className="text-[13.5px] font-semibold" style={{ color: accent }}>
        {title}
      </p>
      {subtitle && (
        <p
          className="mt-1 text-[12.5px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {subtitle}
        </p>
      )}
      {items && (
        <ul className="mt-2.5 space-y-1">
          {items.map((item) => (
            <li key={item} className="font-mono text-[12px]" style={{ color: 'var(--fg-soft)' }}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function DiagramArrow({ label }: { label: string }) {
  return (
    <p
      className="my-2.5 text-center font-mono text-[11px] uppercase tracking-widest"
      style={{ color: 'var(--dim)' }}
    >
      ↓ {label}
    </p>
  )
}
