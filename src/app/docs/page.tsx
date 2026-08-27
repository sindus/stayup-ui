import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { DocNav } from '@/components/docs/DocShell'
import {
  DiagramArrow,
  DiagramBox,
  DocDiagram,
  DocList,
  DocNote,
  DocSection,
} from '@/components/docs/DocPieces'
import { getDoc } from '@/lib/docs'
import { HOME_ANCHORS as A } from '@/lib/docs/shared'
import { getServerLang } from '@/lib/serverLang'

export async function generateMetadata(): Promise<Metadata> {
  const d = getDoc(await getServerLang()).home
  return { title: d.meta.title, description: d.meta.description }
}

export default async function DocsHomePage() {
  const d = getDoc(await getServerLang())
  const h = d.home

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <LandingHeader />

      <div className="mx-auto flex max-w-[1200px] gap-10 px-6 md:px-8">
        <DocNav
          title={d.common.onThisPage}
          entries={[
            { id: A.concept, label: h.concept.heading },
            { id: A.paths, label: h.paths.heading },
          ]}
        />

        <main className="min-w-0 flex-1 max-w-[820px] py-12 pb-28">
          <p
            className="mb-3 text-[12px] font-mono font-semibold uppercase tracking-widest"
            style={{ color: 'var(--peach)' }}
          >
            {h.eyebrow}
          </p>
          <h1
            className="mb-4 font-serif text-[42px] font-normal leading-[1.15] tracking-editorial"
            style={{ color: 'var(--fg)' }}
          >
            {h.title}
          </h1>
          <p
            className="mb-12 max-w-[640px] text-[16px] leading-relaxed"
            style={{ color: 'var(--fg-soft)' }}
          >
            {h.lede}
          </p>

          <DocSection id={A.concept} title={h.concept.heading}>
            <DocList items={h.concept.points} />
            <DocNote>{h.concept.note}</DocNote>

            <DocDiagram title={h.concept.diagram.title}>
              <DiagramBox
                title={h.concept.diagram.sources}
                subtitle={h.concept.diagram.sourcesItems}
                accent="var(--sky)"
              />
              <DiagramArrow label={h.concept.diagram.providers} />
              <DiagramBox
                title={h.concept.diagram.providers}
                subtitle={h.concept.diagram.providersSub}
              />
              <DiagramArrow label={h.concept.diagram.database} />
              <DiagramBox
                title={h.concept.diagram.database}
                subtitle={h.concept.diagram.databaseSub}
                accent="var(--sky)"
              />
              <DiagramArrow label={h.concept.diagram.api} />
              <DiagramBox
                title={h.concept.diagram.api}
                subtitle={h.concept.diagram.apiSub}
                accent="var(--sage)"
              />
              <DiagramArrow label={h.concept.diagram.apps} />
              <DiagramBox title={h.concept.diagram.apps} subtitle={h.concept.diagram.appsSub} />
            </DocDiagram>
          </DocSection>

          <DocSection id={A.paths} title={h.paths.heading}>
            <div className="mb-7 grid gap-4 md:grid-cols-2">
              <PathCard
                href="/docs/self-hosting"
                title={h.paths.selfHostingTitle}
                body={h.paths.selfHostingBody}
                cta={h.paths.selfHostingCta}
                accent="var(--peach)"
              />
              <PathCard
                href="/docs/providers"
                title={h.paths.providersTitle}
                body={h.paths.providersBody}
                cta={h.paths.providersCta}
                accent="var(--sky)"
              />
            </div>
            <DocNote tone="sky">{h.paths.relation}</DocNote>
          </DocSection>
        </main>
      </div>
    </div>
  )
}

function PathCard({
  href,
  title,
  body,
  cta,
  accent,
}: {
  href: string
  title: string
  body: string
  cta: string
  accent: string
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-[10px] p-5 transition-colors"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
    >
      <p className="mb-2 text-[16px] font-semibold" style={{ color: accent }}>
        {title}
      </p>
      <p className="mb-4 flex-1 text-[14px] leading-relaxed" style={{ color: 'var(--fg-soft)' }}>
        {body}
      </p>
      <span
        className="inline-flex items-center gap-1.5 text-[13.5px] font-medium"
        style={{ color: accent }}
      >
        {cta}
        <ArrowRight size={13} />
      </span>
    </Link>
  )
}
