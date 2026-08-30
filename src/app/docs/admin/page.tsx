import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { DocNav } from '@/components/docs/DocShell'
import { DocList, DocNote, DocOrderedList, DocSection, DocTable } from '@/components/docs/DocPieces'
import { getDoc } from '@/lib/docs'
import { ADMIN_ANCHORS as A } from '@/lib/docs/shared'
import { getServerLang } from '@/lib/serverLang'

export async function generateMetadata(): Promise<Metadata> {
  const d = getDoc(await getServerLang()).admin
  return { title: d.meta.title, description: d.meta.description }
}

export default async function AdminDocsPage() {
  const doc = getDoc(await getServerLang())
  const d = doc.admin

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <LandingHeader />

      <div className="mx-auto flex max-w-[1200px] gap-10 px-6 md:px-8">
        <DocNav
          title={doc.common.onThisPage}
          entries={[
            { id: A.webUi, label: d.webUi.heading },
            { id: A.roles, label: d.roles.heading },
            { id: A.managingAdmins, label: d.managingAdmins.heading },
            { id: A.fluxApproval, label: d.fluxApproval.heading },
            { id: A.usersAndFluxes, label: d.usersAndFluxes.heading },
            { id: A.dataSources, label: d.dataSources.heading },
            { id: A.addingFlux, label: d.addingFlux.heading },
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

          <DocSection id={A.webUi} title={d.webUi.heading}>
            <p className="mb-5 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.webUi.body}
            </p>
            <DocNote tone="sky">{d.webUi.note}</DocNote>
          </DocSection>

          <DocSection id={A.roles} title={d.roles.heading}>
            <p className="mb-6 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.roles.intro}
            </p>
            <DocTable
              columns={[d.roles.columnRole, d.roles.columnCan]}
              rows={d.roles.rows.map((r) => [
                <span key={r.role} className="font-semibold" style={{ color: 'var(--fg)' }}>
                  {r.role}
                </span>,
                r.can,
              ])}
            />
            <DocNote>{d.roles.note}</DocNote>
          </DocSection>

          <DocSection id={A.managingAdmins} title={d.managingAdmins.heading}>
            <p className="mb-4 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.managingAdmins.body}
            </p>
            <DocOrderedList items={d.managingAdmins.steps} />
            <DocNote>{d.managingAdmins.note}</DocNote>
          </DocSection>

          <DocSection id={A.fluxApproval} title={d.fluxApproval.heading}>
            <p className="mb-5 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.fluxApproval.intro}
            </p>
            <DocList items={[d.fluxApproval.autoBody, d.fluxApproval.manualBody]} />
            <DocNote tone="sky">{d.fluxApproval.note}</DocNote>
          </DocSection>

          <DocSection id={A.usersAndFluxes} title={d.usersAndFluxes.heading}>
            <p className="mb-4 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.usersAndFluxes.body}
            </p>
            <DocList items={d.usersAndFluxes.items} />
          </DocSection>

          <DocSection id={A.dataSources} title={d.dataSources.heading}>
            <p className="mb-4 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.dataSources.intro}
            </p>
            <DocOrderedList items={d.dataSources.steps} />
            <DocNote tone="sky">{d.dataSources.note}</DocNote>
          </DocSection>

          <DocSection id={A.addingFlux} title={d.addingFlux.heading}>
            <p className="mb-4 text-[15px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
              {d.addingFlux.intro}
            </p>
            <DocOrderedList items={d.addingFlux.steps} />
            <DocNote tone="sky">{d.addingFlux.note}</DocNote>
          </DocSection>
        </main>
      </div>
    </div>
  )
}
