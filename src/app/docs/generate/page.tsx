import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { DocNav } from '@/components/docs/DocShell'
import { DocCode, DocList, DocNote, DocSection } from '@/components/docs/DocPieces'
import { ProjectGenerator } from '@/components/generate/ProjectGenerator'
import { getDoc } from '@/lib/docs'
import { GENERATE_ANCHORS as A } from '@/lib/docs/shared'
import { getServerLang } from '@/lib/serverLang'

export async function generateMetadata(): Promise<Metadata> {
  const d = getDoc(await getServerLang()).generate
  return { title: d.meta.title, description: d.meta.description }
}

export default async function GeneratePage() {
  const doc = getDoc(await getServerLang())
  const d = doc.generate

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <LandingHeader />

      <div className="mx-auto flex max-w-[1200px] gap-10 px-6 md:px-8">
        <DocNav
          title={doc.common.onThisPage}
          entries={[
            { id: A.how, label: d.how.heading },
            { id: A.requirements, label: d.requirements.heading },
            { id: A.form, label: d.title },
            { id: A.run, label: d.run.heading },
            { id: A.after, label: d.after.heading },
          ]}
        />

        <main className="min-w-0 flex-1 max-w-[900px] py-12 pb-28">
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

          <DocSection id={A.how} title={d.how.heading}>
            <DocList items={d.how.items} />
            <DocNote tone="sky">{d.how.note}</DocNote>
          </DocSection>

          <DocSection id={A.requirements} title={d.requirements.heading}>
            <DocList items={d.requirements.items} />
          </DocSection>

          <DocSection id={A.form} title={d.title}>
            <ProjectGenerator strings={d.form} />
          </DocSection>

          <DocSection id={A.run} title={d.run.heading}>
            <p className="mb-4 text-[15px]" style={{ color: 'var(--fg-soft)' }}>
              {d.run.intro}
            </p>
            <DocCode>{'chmod +x stayup-setup.sh\n./stayup-setup.sh'}</DocCode>
            <DocNote>{d.run.note}</DocNote>
          </DocSection>

          <DocSection id={A.after} title={d.after.heading}>
            <DocList items={d.after.items} />
            <DocNote tone="sky">{d.after.note}</DocNote>
          </DocSection>
        </main>
      </div>
    </div>
  )
}
