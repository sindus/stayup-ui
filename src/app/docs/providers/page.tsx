import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { DocChecklist, DocNav, DocTabs } from '@/components/docs/DocShell'
import {
  DiagramArrow,
  DiagramBox,
  DocCode,
  DocDiagram,
  DocInline,
  DocNote,
  DocOrderedList,
  DocSection,
  DocSubheading,
  DocTable,
} from '@/components/docs/DocPieces'
import { getDoc, type DocContent } from '@/lib/docs'
import {
  CHECKLIST_CODE,
  NAMING_ROWS,
  PROVIDER_ANCHORS as A,
  ENGINES,
  ENGINE_TABLES,
  SNIPPETS,
} from '@/lib/docs/shared'
import { getServerLang } from '@/lib/serverLang'

export async function generateMetadata(): Promise<Metadata> {
  const d = getDoc(await getServerLang()).providers
  return { title: d.meta.title, description: d.meta.description }
}

export default async function ProvidersPage() {
  const doc = getDoc(await getServerLang())
  const d = doc.providers
  const c = d.contract

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <LandingHeader />

      <div className="mx-auto flex max-w-[1200px] gap-10 px-6 md:px-8">
        <DocNav
          title={doc.common.onThisPage}
          entries={[
            { id: A.what, label: d.what.heading },
            { id: A.access, label: d.access.heading },
            { id: A.existing, label: d.existing.heading },
            { id: A.creating, label: d.creating.heading },
            { id: A.contract, label: c.heading },
          ]}
        />

        <main className="min-w-0 flex-1 max-w-[820px] py-12 pb-28">
          <Link
            href="/docs"
            className="mb-6 inline-block text-[13px] transition-colors hover:text-fg"
            style={{ color: 'var(--muted-foreground)' }}
          >
            ← {doc.common.docsHome}
          </Link>
          <p
            className="mb-3 text-[12px] font-mono font-semibold uppercase tracking-widest"
            style={{ color: 'var(--sky)' }}
          >
            {d.eyebrow}
          </p>
          <h1
            className="mb-4 font-serif text-[42px] font-normal leading-[1.15] tracking-editorial"
            style={{ color: 'var(--fg)' }}
          >
            {d.title}
          </h1>
          <p
            className="mb-12 max-w-[640px] text-[16px] leading-relaxed"
            style={{ color: 'var(--fg-soft)' }}
          >
            {d.lede}
          </p>

          <DocSection id={A.what} title={d.what.heading}>
            <p className="mb-6 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.what.body}
            </p>
            <DocNote tone="sky">{d.what.note}</DocNote>

            <DocDiagram title={d.what.diagram.title} tone="sky">
              <DiagramBox
                title={d.what.diagram.sources}
                subtitle={d.what.diagram.sourcesItems}
                accent="var(--sky)"
              />
              <DiagramArrow label={d.what.diagram.fetch} />
              <DiagramBox title={d.what.diagram.compare} />
              <DiagramArrow label={d.what.diagram.store} />
              <DiagramBox title={d.what.diagram.exposed} accent="var(--sage)" />
            </DocDiagram>

            <DocSubheading>{d.what.steps.heading}</DocSubheading>
            <DocOrderedList items={d.what.steps.items} />
          </DocSection>

          <DocSection id={A.access} title={d.access.heading}>
            <p className="mb-5 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.access.body}
            </p>
            <Link
              href="/docs/self-hosting"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium"
              style={{ color: 'var(--peach)' }}
            >
              {d.access.cta}
              <ArrowRight size={13} />
            </Link>
          </DocSection>

          <DocSection id={A.existing} title={d.existing.heading}>
            <p className="text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.existing.body}
            </p>
          </DocSection>

          <DocSection id={A.creating} title={d.creating.heading}>
            <DocSubheading>{d.creating.naming.heading}</DocSubheading>
            <p className="mb-5 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.creating.naming.intro}
            </p>
            <DocTable
              columns={[d.creating.naming.columnWhere, d.creating.naming.columnExample]}
              rows={NAMING_ROWS.map((r, i) => [
                d.creating.naming.rows[i],
                <DocInline key={r.example}>{r.example}</DocInline>,
              ])}
            />
            <DocNote>{d.creating.naming.note}</DocNote>

            <DocSubheading>{d.creating.shape.heading}</DocSubheading>
            <p className="mb-6 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.creating.shape.body}
            </p>

            <DocSubheading>{d.creating.schedule.heading}</DocSubheading>
            <p className="text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.creating.schedule.body}
            </p>
          </DocSection>

          <DocSection id={A.contract} title={c.heading}>
            <DocNote>{c.lede}</DocNote>

            <DocDiagram title={c.diagramTitle} tone="sky">
              <DiagramBox title={c.yourScript} />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <DiagramBox
                  title="repository"
                  subtitle={`${c.readOnly} — ${c.repositoryDesc}`}
                  accent="var(--sky)"
                />
                <DiagramBox
                  title="connector_<name>"
                  subtitle={`${c.readWrite} — ${c.connectorDesc}`}
                />
                <DiagramBox
                  title="provider_registry"
                  subtitle={`${c.upsertOne} — ${c.registryDesc}`}
                  accent="var(--sky)"
                />
                <DiagramBox
                  title="log"
                  subtitle={`${c.writeOnError} — ${c.logDesc}`}
                  accent="var(--sky)"
                />
              </div>
            </DocDiagram>
            <DocNote>{c.warning}</DocNote>

            <DocSubheading>{c.tablesHeading}</DocSubheading>
            <p className="mb-6 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {c.tablesIntro}
            </p>

            <p className="mb-5 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {c.engineIntro}
            </p>
            <DocTabs
              tabs={ENGINES.map((engine, i) => ({
                label: engine.label,
                content: <EngineTables engine={engine.id} c={c} note={c.engineNotes[i]} />,
              }))}
            />

            <DocSubheading>{c.addingSources.heading}</DocSubheading>
            <p className="mb-4 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {c.addingSources.body}
            </p>
            <DocTabs
              tabs={ENGINES.map((engine) => ({
                label: engine.label,
                content: <DocCode>{ENGINE_TABLES[engine.id].selectSources}</DocCode>,
              }))}
            />
            <DocCode>{SNIPPETS.addSource}</DocCode>

            <DocSubheading>{c.checklist.heading}</DocSubheading>
            <DocChecklist
              items={CHECKLIST_CODE.map((code, i) => ({ code, label: c.checklist.items[i] }))}
            />
          </DocSection>
        </main>
      </div>
    </div>
  )
}

/** Les quatre tables d'un provider, dans le dialecte d'un moteur. */
function EngineTables({
  engine,
  c,
  note,
}: {
  engine: keyof typeof ENGINE_TABLES
  c: DocContent['providers']['contract']
  note: string
}) {
  const t = ENGINE_TABLES[engine]

  return (
    <>
      <DocSubheading>{c.repositoryTitle}</DocSubheading>
      <DocCode>{t.repository}</DocCode>
      <p className="mb-6 text-[14px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {c.repositoryBody}
      </p>

      <DocSubheading>{c.connectorTitle}</DocSubheading>
      <DocCode>{t.connector}</DocCode>
      <p className="mb-3 text-[14px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {c.connectorBody}
      </p>
      <ul className="mb-6 space-y-2">
        {t.optionalColumns.map((col, i) => (
          <li key={col} className="text-[14px] leading-relaxed">
            <DocInline>{col}</DocInline>{' '}
            <span style={{ color: 'var(--muted-foreground)' }}>{c.optionalDescriptions[i]}</span>
          </li>
        ))}
      </ul>

      <DocSubheading>{c.registryTitle}</DocSubheading>
      <DocCode>{t.registry}</DocCode>
      <p className="mb-6 text-[14px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {c.registryBody}
      </p>

      <DocSubheading>{c.logTitle}</DocSubheading>
      <DocCode>{t.log}</DocCode>
      <p className="mb-6 text-[14px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {c.logBody}
      </p>

      <DocNote>{note}</DocNote>
    </>
  )
}
