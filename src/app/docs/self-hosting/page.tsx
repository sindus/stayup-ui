import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { DocChecklist, DocNav, DocTabs } from '@/components/docs/DocShell'
import {
  DiagramArrow,
  DiagramBox,
  DocCode,
  DocDiagram,
  DocInline,
  DocList,
  DocNote,
  DocOrderedList,
  DocPartHeading,
  DocSection,
  DocSubheading,
  DocTable,
} from '@/components/docs/DocPieces'
import { getSelfHostingDoc } from '@/lib/docs/selfHosting'
import {
  CHECKLIST_CODE,
  DOC_ANCHORS as A,
  ENV_VARS,
  NAMING_ROWS,
  OPTIONAL_COLUMNS,
  SNIPPETS,
} from '@/lib/docs/selfHosting/shared'
import { getServerLang } from '@/lib/serverLang'

export async function generateMetadata(): Promise<Metadata> {
  const d = getSelfHostingDoc(await getServerLang())
  return { title: d.meta.title, description: d.meta.description }
}

export default async function SelfHostingDocPage() {
  const d = getSelfHostingDoc(await getServerLang())

  const navEntries = [
    { id: A.overview, label: d.overview.heading },
    { id: A.selfHosting, label: d.part1.heading },
    { id: A.requirements, label: d.part1.requirements.heading, nested: true },
    { id: A.env, label: d.part1.env.heading, nested: true },
    { id: A.deploy, label: d.part1.deploy.heading, nested: true },
    { id: A.schema, label: d.part1.schema.heading, nested: true },
    { id: A.pointing, label: d.part1.pointing.heading, nested: true },
    { id: A.providers, label: d.part2.heading },
    { id: A.contract, label: d.part2.contract.heading, nested: true },
    { id: A.naming, label: d.part2.naming.heading, nested: true },
    { id: A.tables, label: d.part2.tables.heading, nested: true },
    { id: A.eachRun, label: d.part2.eachRun.heading, nested: true },
    { id: A.checklist, label: d.part2.checklist.heading, nested: true },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <LandingHeader />

      <div className="mx-auto flex max-w-[1200px] gap-10 px-6 md:px-8">
        <DocNav title={d.nav.onThisPage} entries={navEntries} />

        <main className="min-w-0 flex-1 py-12 pb-28 max-w-[820px]">
          <p
            className="text-[12px] font-mono font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--peach)' }}
          >
            {d.eyebrow}
          </p>
          <h1
            className="font-serif text-[42px] leading-[1.15] tracking-editorial font-normal mb-4"
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

          {/* ── Overview ────────────────────────────────────────────────── */}
          <DocSection id={A.overview} title={d.overview.heading}>
            <DocList items={d.overview.points} />
            <DocNote>{d.overview.note}</DocNote>

            <DocDiagram title={d.overview.diagram.title} note={d.overview.diagram.note}>
              <DiagramBox
                title={d.overview.diagram.providers}
                items={[
                  'stayup-cmd-changelog',
                  'stayup-cmd-youtube',
                  'stayup-cmd-rss',
                  'stayup-cmd-scrap',
                  d.overview.diagram.yourProvider,
                ]}
              />
              <DiagramArrow label={d.overview.diagram.writesCron} />
              <DiagramBox
                title={d.overview.diagram.database}
                accent="var(--sky)"
                items={[
                  `repository — ${d.overview.diagram.dbShared}`,
                  `connector_* — ${d.overview.diagram.dbPerProvider}`,
                  `provider_registry — ${d.overview.diagram.dbShared}`,
                  `log — ${d.overview.diagram.dbShared}`,
                ]}
              />
              <DiagramArrow label={d.overview.diagram.readsWrites} />
              <DiagramBox
                title={d.overview.diagram.api}
                subtitle={d.overview.diagram.apiSubtitle}
                accent="var(--sage)"
              />
              <DiagramArrow label={d.overview.diagram.http} />
              <DiagramBox
                title={d.overview.diagram.clients}
                subtitle={d.overview.diagram.endUser}
                items={['stayup-ui', 'stayup-desktop', 'stayup-mobile']}
              />
            </DocDiagram>
          </DocSection>

          {/* ── Part 1 ──────────────────────────────────────────────────── */}
          <DocPartHeading id={A.selfHosting} eyebrow={d.part1.eyebrow} title={d.part1.heading} />

          <DocSection id={A.requirements} title={d.part1.requirements.heading}>
            <DocList items={d.part1.requirements.items} />
          </DocSection>

          <DocSection id={A.env} title={d.part1.env.heading}>
            <DocTable
              columns={[
                d.part1.env.columnVariable,
                d.part1.env.columnRequired,
                d.part1.env.columnDescription,
              ]}
              rows={ENV_VARS.map((v, i) => [
                <DocInline key={v.name}>{v.name}</DocInline>,
                v.required ? d.part1.env.yes : d.part1.env.no,
                d.part1.env.descriptions[i],
              ])}
            />
            <DocNote>{d.part1.env.note}</DocNote>
          </DocSection>

          <DocSection id={A.deploy} title={d.part1.deploy.heading}>
            <DocTabs
              tabs={[
                {
                  label: d.part1.deploy.tabs[0],
                  content: (
                    <>
                      <p className="mb-4 text-[15px]" style={{ color: 'var(--fg-soft)' }}>
                        {d.part1.deploy.dockerIntro}
                      </p>
                      <DocCode>{SNIPPETS.docker}</DocCode>
                      <p
                        className="text-[14px] leading-relaxed"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {d.part1.deploy.dockerNote}
                      </p>
                    </>
                  ),
                },
                {
                  label: d.part1.deploy.tabs[1],
                  content: (
                    <>
                      <p className="mb-4 text-[15px]" style={{ color: 'var(--fg-soft)' }}>
                        {d.part1.deploy.workersIntro}
                      </p>
                      <DocCode>{SNIPPETS.workers}</DocCode>
                      <p
                        className="text-[14px] leading-relaxed"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {d.part1.deploy.workersNote}
                      </p>
                    </>
                  ),
                },
                {
                  label: d.part1.deploy.tabs[2],
                  content: (
                    <>
                      <p className="mb-4 text-[15px]" style={{ color: 'var(--fg-soft)' }}>
                        {d.part1.deploy.nodeIntro}
                      </p>
                      <DocCode>{SNIPPETS.node}</DocCode>
                      <p
                        className="text-[14px] leading-relaxed"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {d.part1.deploy.nodeNote}
                      </p>
                    </>
                  ),
                },
              ]}
            />
          </DocSection>

          <DocSection id={A.schema} title={d.part1.schema.heading}>
            <p className="mb-4 text-[15px]" style={{ color: 'var(--fg-soft)' }}>
              {d.part1.schema.applyIntro}
            </p>
            <DocCode>{SNIPPETS.schema}</DocCode>
            <DocNote>{d.part1.schema.applyNote}</DocNote>

            <p className="mb-4 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.part1.schema.userIntro}
            </p>
            <DocCode>{SNIPPETS.createUser}</DocCode>

            <p className="mb-4 text-[15px]" style={{ color: 'var(--fg-soft)' }}>
              {d.part1.schema.verifyIntro}
            </p>
            <DocCode>{SNIPPETS.verify}</DocCode>
            <DocNote tone="sky">{d.part1.schema.verifyNote}</DocNote>
          </DocSection>

          <DocSection id={A.pointing} title={d.part1.pointing.heading}>
            <DocList items={d.part1.pointing.items} />
            <DocDiagram
              title={d.part1.pointing.diagram.title}
              note={d.part1.pointing.diagram.note}
              tone="sky"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <DiagramBox
                  title={d.part1.pointing.diagram.instanceA}
                  subtitle={d.part1.pointing.diagram.connected}
                  items={[d.part1.pointing.diagram.providersA]}
                />
                <DiagramBox
                  title={d.part1.pointing.diagram.instanceB}
                  subtitle={d.part1.pointing.diagram.switch}
                  accent="var(--sky)"
                  items={[d.part1.pointing.diagram.providersB]}
                />
              </div>
              <DiagramArrow label={d.part1.pointing.diagram.client} />
              <DiagramBox title="stayup-ui · stayup-desktop · stayup-mobile" accent="var(--sage)" />
            </DocDiagram>
          </DocSection>

          {/* ── Part 2 ──────────────────────────────────────────────────── */}
          <DocPartHeading id={A.providers} eyebrow={d.part2.eyebrow} title={d.part2.heading} />

          <p className="mb-10 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
            {d.part2.intro}
          </p>

          <DocSection id={A.contract} title={d.part2.contract.heading}>
            <DocDiagram title={d.part2.contract.diagramTitle} tone="sky">
              <DiagramBox title={d.part2.contract.yourScript} />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <DiagramBox
                  title="repository"
                  subtitle={`${d.part2.contract.readOnly} — ${d.part2.contract.repositoryDesc}`}
                  accent="var(--sky)"
                />
                <DiagramBox
                  title="connector_<name>"
                  subtitle={`${d.part2.contract.readWrite} — ${d.part2.contract.connectorDesc}`}
                />
                <DiagramBox
                  title="provider_registry"
                  subtitle={`${d.part2.contract.upsertOne} — ${d.part2.contract.registryDesc}`}
                  accent="var(--sky)"
                />
                <DiagramBox
                  title="log"
                  subtitle={`${d.part2.contract.writeOnError} — ${d.part2.contract.logDesc}`}
                  accent="var(--sky)"
                />
              </div>
            </DocDiagram>
            <DocNote>{d.part2.contract.warning}</DocNote>
          </DocSection>

          <DocSection id={A.naming} title={d.part2.naming.heading}>
            <p className="mb-5 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.part2.naming.intro}
            </p>
            <DocTable
              columns={[d.part2.naming.columnWhere, d.part2.naming.columnExample]}
              rows={NAMING_ROWS.map((r, i) => [
                d.part2.naming.rows[i],
                <DocInline key={r.example}>{r.example}</DocInline>,
              ])}
            />
            <DocNote>{d.part2.naming.note}</DocNote>
          </DocSection>

          <DocSection id={A.tables} title={d.part2.tables.heading}>
            <p className="mb-2 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.part2.tables.intro}
            </p>

            <DocSubheading>{d.part2.tables.repositoryTitle}</DocSubheading>
            <DocCode>{SNIPPETS.repositoryTable}</DocCode>
            <p
              className="mb-6 text-[14px] leading-relaxed"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {d.part2.tables.repositoryDesc}
            </p>

            <DocSubheading>{d.part2.tables.connectorTitle}</DocSubheading>
            <DocCode>{SNIPPETS.connectorTable}</DocCode>
            <p
              className="mb-3 text-[14px] leading-relaxed"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {d.part2.tables.connectorDesc}
            </p>
            <ul className="mb-6 space-y-2">
              {OPTIONAL_COLUMNS.map((col, i) => (
                <li key={col.name} className="text-[14px] leading-relaxed">
                  <DocInline>{col.name}</DocInline>{' '}
                  <span style={{ color: 'var(--muted-foreground)' }}>
                    {d.part2.tables.optionalDescriptions[i]}
                  </span>
                </li>
              ))}
            </ul>

            <DocSubheading>{d.part2.tables.registryTitle}</DocSubheading>
            <DocCode>{SNIPPETS.registryTable}</DocCode>
            <p
              className="mb-6 text-[14px] leading-relaxed"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {d.part2.tables.registryDesc}
            </p>

            <DocSubheading>{d.part2.tables.logTitle}</DocSubheading>
            <DocCode>{SNIPPETS.logTable}</DocCode>
            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              {d.part2.tables.logDesc}
            </p>
          </DocSection>

          <DocSection id={A.eachRun} title={d.part2.eachRun.heading}>
            <DocOrderedList items={d.part2.eachRun.steps} />
            <DocCode>{SNIPPETS.selectSources}</DocCode>
            <p className="mb-4 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.part2.eachRun.addFlag}
            </p>
            <DocCode>{SNIPPETS.addSource}</DocCode>

            <DocSubheading>{d.part2.conventions.heading}</DocSubheading>
            <p className="mb-6 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.part2.conventions.body}
            </p>

            <DocSubheading>{d.part2.schedule.heading}</DocSubheading>
            <p className="text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.part2.schedule.body}
            </p>
          </DocSection>

          <DocSection id={A.checklist} title={d.part2.checklist.heading}>
            <DocChecklist
              items={CHECKLIST_CODE.map((code, i) => ({
                code,
                label: d.part2.checklist.items[i],
              }))}
            />
          </DocSection>

          <p className="mt-14">
            <Link
              href="/"
              className="text-[13.5px] underline underline-offset-4 transition-colors hover:text-fg"
              style={{ color: 'var(--muted-foreground)' }}
            >
              ← {d.nav.backToSite}
            </Link>
          </p>
        </main>
      </div>
    </div>
  )
}
