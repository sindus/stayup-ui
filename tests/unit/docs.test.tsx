import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react'
import { getDoc } from '@/lib/docs'
import { en } from '@/lib/docs/en'
import {
  CHECKLIST_CODE,
  ENGINES,
  ENGINE_TABLES,
  ENV_VARS,
  NAMING_ROWS,
  SCHEMA_COMMANDS,
  SNIPPETS,
} from '@/lib/docs/shared'
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
import type { Language } from '@/lib/translations'

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

const LANGUAGES: Language[] = ['en', 'fr', 'de', 'es', 'it', 'pt', 'ja', 'zh']

/** Toutes les feuilles chaîne d'un objet, avec leur chemin. */
function stringPaths(value: unknown, prefix = ''): [string, string][] {
  if (typeof value === 'string') return [[prefix, value]]
  if (Array.isArray(value)) return value.flatMap((v, i) => stringPaths(v, `${prefix}[${i}]`))
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => stringPaths(v, prefix ? `${prefix}.${k}` : k))
  }
  return []
}

describe('documentation dictionaries', () => {
  it('covers every supported language', () => {
    for (const lang of LANGUAGES) {
      expect(getDoc(lang), lang).toBeTruthy()
    }
  })

  it('has the same shape in every language', () => {
    const reference = stringPaths(en).map(([path]) => path)
    for (const lang of LANGUAGES) {
      expect(
        stringPaths(getDoc(lang)).map(([p]) => p),
        lang,
      ).toEqual(reference)
    }
  })

  it('leaves no empty string anywhere', () => {
    for (const lang of LANGUAGES) {
      const empty = stringPaths(getDoc(lang))
        .filter(([, value]) => value.trim() === '')
        .map(([path]) => path)
      expect(empty, lang).toEqual([])
    }
  })

  // Une traduction laissée à l'identique de l'anglais est presque toujours un oubli.
  // Les seules exceptions légitimes sont les noms propres et les mots partagés.
  it('actually translates the prose away from English', () => {
    // Noms propres et termes partagés : identiques d'une langue à l'autre.
    const SHARED = new Set([
      'home.concept.diagram.database',
      'home.concept.diagram.api',
      'home.concept.diagram.sourcesItems',
      'home.concept.diagram.apps',
      'providers.what.diagram.sourcesItems',
      // Example git URL shown as a placeholder — the host is not prose.
      'generate.form.customUrlPlaceholder',
    ])
    for (const lang of LANGUAGES.filter((l) => l !== 'en')) {
      const doc = getDoc(lang)
      const untranslated = stringPaths(doc).filter(([path, value]) => {
        if (SHARED.has(path)) return false
        const english = stringPaths(en).find(([p]) => p === path)?.[1]
        return english !== undefined && english === value && value.length > 24
      })
      expect(
        untranslated.map(([p]) => p),
        lang,
      ).toEqual([])
    }
  })

  it('keeps the deployment tab labels aligned with the snippets', () => {
    for (const lang of LANGUAGES) {
      expect(getDoc(lang).install.deploy.tabs, lang).toHaveLength(3)
    }
  })

  it('matches the shared tables row for row', () => {
    for (const lang of LANGUAGES) {
      const doc = getDoc(lang)
      expect(doc.install.env.descriptions, lang).toHaveLength(ENV_VARS.length)
      expect(doc.providers.creating.naming.rows, lang).toHaveLength(NAMING_ROWS.length)
      expect(doc.providers.contract.optionalDescriptions, lang).toHaveLength(
        ENGINE_TABLES.postgres.optionalColumns.length,
      )
      // Un onglet par moteur : une note manquante laisserait un panneau muet.
      expect(doc.providers.contract.engineNotes, lang).toHaveLength(ENGINES.length)
      expect(doc.install.schema.engineNotes, lang).toHaveLength(ENGINES.length)
      expect(doc.providers.contract.checklist.items, lang).toHaveLength(CHECKLIST_CODE.length)
    }
  })

  // La doc doit décrire l'architecture — une API au-dessus de providers quelconques —
  // et non le catalogue que l'instance de référence fait tourner. La page de
  // concept ne nomme aucun collecteur ; l'install et providers en citent un
  // (RSS) comme exemple concret de marche à suivre, pas comme une liste.
  it('describes the architecture, not the reference instance’s catalogue', () => {
    const NAMES = /YouTube|\bRSS\b|changelog|github-trending/i
    for (const lang of LANGUAGES) {
      const doc = getDoc(lang)

      // La page de concept ne nomme aucun provider : sinon on lit « StayUp, c'est
      // ces quatre-là » au lieu de « StayUp accepte n'importe lequel ».
      expect(JSON.stringify(doc.home), `${lang} — index`).not.toMatch(NAMES)

      // La page install en cite un seul, dans la marche à suivre, comme exemple.
      const installMentions = (
        JSON.stringify(doc.install).match(new RegExp(NAMES, 'gi')) ?? []
      ).filter((m) => m.toLowerCase() !== 'rss').length
      expect(installMentions, `${lang} — install`).toBe(0)

      // La page providers a une section « exemples à lire » qui nomme les
      // collecteurs de référence : c'est pointer vers des exemples, pas dresser
      // le catalogue de ce que StayUp couvre. On borne pour éviter la dérive.
      const mentions = JSON.stringify(doc.providers).match(new RegExp(NAMES, 'gi')) ?? []
      expect(mentions.length, `${lang} — providers: ${mentions.join(', ')}`).toBeLessThanOrEqual(8)
    }
  })

  // Le reproche fait à l'ancienne page : elle mélangeait deux publics et ouvrait
  // sur du SQL. Le contrat de provider (la table connector_<name>) reste cantonné
  // à la page des providers ; l'install peut renvoyer vers `provider_registry`
  // dans un point de dépannage, mais pas enseigner le contrat.
  it('keeps the two journeys separate', () => {
    for (const lang of LANGUAGES) {
      const doc = getDoc(lang)
      const installText = JSON.stringify(doc.install)
      expect(installText, `${lang} — connector_ hors de la page providers`).not.toContain(
        'connector_',
      )
      // L'index n'explique que le concept : il ne verse pas dans le contrat.
      expect(JSON.stringify(doc.home), lang).not.toContain('connector_')
    }
  })
})

describe('shared snippets', () => {
  // Le code ne passe pas par la traduction : il doit rester identique quelle que
  // soit la langue, et ne jamais contenir de prose traduite.
  it('never leaks a placeholder that was meant to be filled in', () => {
    for (const snippet of Object.values(SNIPPETS)) {
      expect(snippet).not.toMatch(/TODO|FIXME|XXX/)
    }
  })

  // Ce que la doc promet : d'un moteur à l'autre, seuls le dialecte et les types
  // changent, jamais les noms — sinon un provider serait à réécrire par base.
  it('names the same things whichever engine is shown', () => {
    for (const engine of ENGINES) {
      const t = ENGINE_TABLES[engine.id]
      expect(t.connector, engine.label).toContain('connector_<name>')
      expect(t.registry, engine.label).toContain('provider_registry')
      expect(t.repository, engine.label).toContain('repository')
      expect(t.log, engine.label).toContain('log')
      expect(t.selectSources, engine.label).toContain('<name>')
      expect(
        t.optionalColumns.map((col) => col.split(/[ :]/)[0]),
        engine.label,
      ).toEqual(['datetime', 'version'])
    }
  })

  it('gives every supported engine a way to create the schema', () => {
    for (const engine of ENGINES) {
      expect(SCHEMA_COMMANDS[engine.id], engine.label).toBeTruthy()
    }
  })
})

describe('DocTabs', () => {
  it('shows the first panel and switches on click', () => {
    render(
      <DocTabs
        tabs={[
          { label: 'One', content: <p>first panel</p> },
          { label: 'Two', content: <p>second panel</p> },
        ]}
      />,
    )

    expect(screen.getByText('first panel')).toBeInTheDocument()
    expect(screen.queryByText('second panel')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Two' }))

    expect(screen.getByText('second panel')).toBeInTheDocument()
    expect(screen.queryByText('first panel')).not.toBeInTheDocument()
  })

  it('marks the selected tab for assistive tech', () => {
    render(
      <DocTabs
        tabs={[
          { label: 'One', content: null },
          { label: 'Two', content: null },
        ]}
      />,
    )
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'false')
  })
})

describe('DocChecklist', () => {
  it('toggles an item on and back off', () => {
    render(<DocChecklist items={[{ code: 'log', label: 'errors written here' }]} />)
    const item = screen.getByRole('button')

    expect(item).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(item)
    expect(item).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(item)
    expect(item).toHaveAttribute('aria-pressed', 'false')
  })

  it('keeps items independent', () => {
    render(
      <DocChecklist
        items={[
          { code: 'a', label: 'first' },
          { code: 'b', label: 'second' },
        ]}
      />,
    )
    const [first, second] = screen.getAllByRole('button')

    fireEvent.click(second)

    expect(first).toHaveAttribute('aria-pressed', 'false')
    expect(second).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('DocNav', () => {
  it('lists every entry as an anchor', () => {
    render(
      <DocNav
        title="On this page"
        entries={[
          { id: 'a', label: 'First' },
          { id: 'b', label: 'Second', nested: true },
        ]}
      />,
    )

    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'First' })).toHaveAttribute('href', '#a')
    expect(screen.getByRole('link', { name: 'Second' })).toHaveAttribute('href', '#b')
  })

  it('renders without a matching section in the document', () => {
    expect(() =>
      render(<DocNav title="Nav" entries={[{ id: 'missing', label: 'Nowhere' }]} />),
    ).not.toThrow()
  })

  // Le sommaire suit la section passée sous l'en-tête : on pilote nous-mêmes
  // l'IntersectionObserver, que jsdom ne fournit pas.
  describe('active section highlighting', () => {
    const realObserver = globalThis.IntersectionObserver
    let notify: ((records: IntersectionObserverEntry[]) => void) | null = null

    beforeEach(() => {
      notify = null
      globalThis.IntersectionObserver = class {
        constructor(cb: (records: IntersectionObserverEntry[]) => void) {
          notify = cb
        }
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return []
        }
        root = null
        rootMargin = ''
        thresholds = []
      } as unknown as typeof IntersectionObserver
    })

    afterEach(() => {
      globalThis.IntersectionObserver = realObserver
    })

    function record(id: string, top: number, isIntersecting: boolean) {
      return {
        target: { id } as Element,
        isIntersecting,
        boundingClientRect: { top } as DOMRectReadOnly,
      } as IntersectionObserverEntry
    }

    it('marks the topmost visible section as current', () => {
      for (const id of ['a', 'b']) {
        const section = document.createElement('section')
        section.id = id
        document.body.appendChild(section)
      }

      render(
        <DocNav
          title="Nav"
          entries={[
            { id: 'a', label: 'First' },
            { id: 'b', label: 'Second' },
          ]}
        />,
      )

      act(() => notify?.([record('b', 120, true), record('a', 40, true)]))
      expect(screen.getByRole('link', { name: 'First' })).toHaveAttribute(
        'aria-current',
        'location',
      )

      act(() => notify?.([record('b', 10, true)]))
      expect(screen.getByRole('link', { name: 'Second' })).toHaveAttribute(
        'aria-current',
        'location',
      )
      expect(screen.getByRole('link', { name: 'First' })).not.toHaveAttribute('aria-current')
    })

    it('keeps the previous section when nothing is visible', () => {
      const section = document.createElement('section')
      section.id = 'a'
      document.body.appendChild(section)

      render(<DocNav title="Nav" entries={[{ id: 'a', label: 'First' }]} />)

      act(() => notify?.([record('a', 20, true)]))
      act(() => notify?.([record('a', -400, false)]))

      expect(screen.getByRole('link', { name: 'First' })).toHaveAttribute(
        'aria-current',
        'location',
      )
    })
  })
})

describe('doc presentation pieces', () => {
  it('gives every section an anchor id and a heading', () => {
    const { container } = render(
      <DocSection id="env" eyebrow="Part 1" title="Environment variables">
        <p>body</p>
      </DocSection>,
    )
    expect(container.querySelector('#env')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Environment variables' })).toBeInTheDocument()
    expect(screen.getByText('Part 1')).toBeInTheDocument()
    expect(screen.getByText('body')).toBeInTheDocument()
  })

  it('renders a section without an eyebrow', () => {
    render(
      <DocSection id="plain" title="Plain">
        {null}
      </DocSection>,
    )
    expect(screen.getByRole('heading', { name: 'Plain' })).toBeInTheDocument()
  })

  it('renders a part heading with its anchor', () => {
    const { container } = render(
      <DocPartHeading id="providers" eyebrow="Part 2" title="Building a provider" />,
    )
    expect(container.querySelector('#providers')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Building a provider' })).toBeInTheDocument()
  })

  it('renders bulleted and numbered lists', () => {
    render(
      <>
        <DocList items={['first bullet', 'second bullet']} />
        <DocOrderedList items={['first step', 'second step']} />
      </>,
    )
    expect(screen.getByText('first bullet')).toBeInTheDocument()
    expect(screen.getByText('second step')).toBeInTheDocument()
    // La liste ordonnée numérote elle-même ses étapes.
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders notes in both tones', () => {
    render(
      <>
        <DocNote>peach note</DocNote>
        <DocNote tone="sky">sky note</DocNote>
      </>,
    )
    expect(screen.getByText('peach note')).toBeInTheDocument()
    expect(screen.getByText('sky note')).toBeInTheDocument()
  })

  it('renders code verbatim', () => {
    render(<DocCode>{'SELECT 1;\nSELECT 2;'}</DocCode>)
    expect(screen.getByText(/SELECT 1;/)).toBeInTheDocument()
  })

  it('renders inline code and subheadings', () => {
    render(
      <>
        <DocInline>DATABASE_URL</DocInline>
        <DocSubheading>Optional columns</DocSubheading>
      </>,
    )
    expect(screen.getByText('DATABASE_URL')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Optional columns' })).toBeInTheDocument()
  })

  it('renders a table with its header and cells', () => {
    render(
      <DocTable
        columns={['Variable', 'Required']}
        rows={[
          ['DATABASE_URL', 'yes'],
          ['UI_URL', 'no'],
        ]}
      />,
    )
    expect(screen.getByRole('columnheader', { name: 'Variable' })).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(screen.getByRole('cell', { name: 'UI_URL' })).toBeInTheDocument()
  })

  it('renders a diagram with boxes, arrows and an optional note', () => {
    render(
      <DocDiagram title="Architecture" note="a closing thought">
        <DiagramBox title="PostgreSQL" subtitle="shared" items={['repository', 'log']} />
        <DiagramArrow label="writes" />
        <DiagramBox title="stayup-api" />
      </DocDiagram>,
    )
    expect(screen.getByText('Architecture')).toBeInTheDocument()
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument()
    expect(screen.getByText('shared')).toBeInTheDocument()
    expect(screen.getByText('repository')).toBeInTheDocument()
    expect(screen.getByText(/writes/)).toBeInTheDocument()
    expect(screen.getByText('a closing thought')).toBeInTheDocument()
  })

  it('renders a diagram without a note', () => {
    render(
      <DocDiagram title="Bare" tone="sky">
        <DiagramBox title="only a box" />
      </DocDiagram>,
    )
    expect(screen.getByText('only a box')).toBeInTheDocument()
  })
})
