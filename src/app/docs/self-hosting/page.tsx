import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { DocNav, DocTabs } from '@/components/docs/DocShell'
import {
  DiagramBox,
  DocCode,
  DocInline,
  DocList,
  DocNote,
  DocSection,
  DocSubheading,
  DocTable,
} from '@/components/docs/DocPieces'
import { getDoc } from '@/lib/docs'
import {
  ENGINES,
  ENV_VARS,
  SCHEMA_COMMANDS,
  SELF_HOSTING_ANCHORS as A,
  SNIPPETS,
} from '@/lib/docs/shared'
import { getServerLang } from '@/lib/serverLang'

export async function generateMetadata(): Promise<Metadata> {
  const d = getDoc(await getServerLang()).selfHosting
  return { title: d.meta.title, description: d.meta.description }
}

export default async function SelfHostingPage() {
  const doc = getDoc(await getServerLang())
  const d = doc.selfHosting

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <LandingHeader />

      <div className="mx-auto flex max-w-[1200px] gap-10 px-6 md:px-8">
        <DocNav
          title={doc.common.onThisPage}
          entries={[
            { id: A.why, label: d.why.heading },
            { id: A.pieces, label: d.pieces.heading },
            { id: A.requirements, label: d.requirements.heading },
            { id: A.databases, label: d.databases.heading },
            { id: A.env, label: d.env.heading },
            { id: A.deploy, label: d.deploy.heading },
            { id: A.schema, label: d.schema.heading },
            { id: A.pointing, label: d.pointing.heading },
            { id: A.troubleshooting, label: d.troubleshooting.heading },
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
            style={{ color: 'var(--peach)' }}
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

          <DocSection id={A.why} title={d.why.heading}>
            <p className="mb-5 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.why.intro}
            </p>
            <DocList items={d.why.items} />
            <DocNote>{d.why.note}</DocNote>
          </DocSection>

          <DocSection id={A.pieces} title={d.pieces.heading}>
            <div className="grid gap-4 md:grid-cols-3">
              <DiagramBox
                title={d.pieces.database}
                subtitle={d.pieces.databaseBody}
                accent="var(--sky)"
              />
              <DiagramBox title={d.pieces.api} subtitle={d.pieces.apiBody} accent="var(--sage)" />
              <DiagramBox title={d.pieces.providers} subtitle={d.pieces.providersBody} />
            </div>
          </DocSection>

          <DocSection id={A.requirements} title={d.requirements.heading}>
            <DocList items={d.requirements.items} />
          </DocSection>

          <DocSection id={A.databases} title={d.databases.heading}>
            <p className="mb-5 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.databases.intro}
            </p>
            <DocTable
              columns={[
                d.databases.columnEngine,
                d.databases.columnScheme,
                d.databases.columnDriver,
              ]}
              rows={ENGINES.map((engine) => [
                engine.label,
                <DocInline key={engine.id}>{engine.schemes}</DocInline>,
                engine.driver === '—' ? (
                  '—'
                ) : (
                  <DocInline key={`${engine.id}-driver`}>{engine.driver}</DocInline>
                ),
              ])}
            />
            <DocNote>{d.databases.note}</DocNote>
            <DocNote tone="sky">{d.databases.workersNote}</DocNote>
          </DocSection>

          <DocSection id={A.env} title={d.env.heading}>
            <DocTable
              columns={[d.env.columnVariable, d.env.columnRequired, d.env.columnDescription]}
              rows={ENV_VARS.map((v, i) => [
                <DocInline key={v.name}>{v.name}</DocInline>,
                v.required ? d.env.yes : d.env.no,
                d.env.descriptions[i],
              ])}
            />
            <DocNote>{d.env.note}</DocNote>
          </DocSection>

          <DocSection id={A.deploy} title={d.deploy.heading}>
            <DocTabs
              tabs={[
                {
                  label: d.deploy.tabs[0],
                  content: (
                    <Tab
                      intro={d.deploy.dockerIntro}
                      code={SNIPPETS.docker}
                      note={d.deploy.dockerNote}
                    />
                  ),
                },
                {
                  label: d.deploy.tabs[1],
                  content: (
                    <Tab
                      intro={d.deploy.workersIntro}
                      code={SNIPPETS.workers}
                      note={d.deploy.workersNote}
                    />
                  ),
                },
                {
                  label: d.deploy.tabs[2],
                  content: (
                    <Tab intro={d.deploy.nodeIntro} code={SNIPPETS.node} note={d.deploy.nodeNote} />
                  ),
                },
              ]}
            />
          </DocSection>

          <DocSection id={A.schema} title={d.schema.heading}>
            <p className="mb-4 text-[15px]" style={{ color: 'var(--fg-soft)' }}>
              {d.schema.applyIntro}
            </p>
            <DocTabs
              tabs={ENGINES.map((engine, i) => ({
                label: engine.label,
                content: (
                  <>
                    <DocCode>{SCHEMA_COMMANDS[engine.id]}</DocCode>
                    <p
                      className="text-[14px] leading-relaxed"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {d.schema.engineNotes[i]}
                    </p>
                  </>
                ),
              }))}
            />
            <DocNote>{d.schema.applyNote}</DocNote>

            <p className="mb-4 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.schema.userIntro}
            </p>
            <DocCode>{SNIPPETS.createUser}</DocCode>

            <p className="mb-4 text-[15px]" style={{ color: 'var(--fg-soft)' }}>
              {d.schema.verifyIntro}
            </p>
            <DocCode>{SNIPPETS.verify}</DocCode>
            <DocNote tone="sky">{d.schema.verifyNote}</DocNote>
          </DocSection>

          <DocSection id={A.pointing} title={d.pointing.heading}>
            <DocList items={d.pointing.items} />
            <DocNote tone="sky">{d.pointing.note}</DocNote>
          </DocSection>

          <DocSection id={A.troubleshooting} title={d.troubleshooting.heading}>
            {d.troubleshooting.items.map((item) => (
              <div key={item.symptom} className="mb-5">
                <DocSubheading>{item.symptom}</DocSubheading>
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {item.cause}
                </p>
              </div>
            ))}
          </DocSection>
        </main>
      </div>
    </div>
  )
}

function Tab({ intro, code, note }: { intro: string; code: string; note: string }) {
  return (
    <>
      <p className="mb-4 text-[15px]" style={{ color: 'var(--fg-soft)' }}>
        {intro}
      </p>
      <DocCode>{code}</DocCode>
      <p className="text-[14px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {note}
      </p>
    </>
  )
}
