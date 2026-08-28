import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UnifiedFeedList } from '@/components/feed/UnifiedFeedList'
import { LanguageProvider } from '@/context/LanguageContext'
import type { TaggedItem } from '@/types'
import { TEMPLATES } from './_templates'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

const REPOS = [
  { repository_id: 1, url: 'https://github.com/facebook/react/', provider: 'changelog' },
  { repository_id: 2, url: 'https://www.youtube.com/@fireship', provider: 'youtube' },
]

function changelog(overrides = {}): TaggedItem {
  return {
    provider: 'changelog',
    item: {
      id: 1,
      repository_id: 1,
      content: '## Fixes\r\nsomething important',
      datetime: '2026-03-01T10:00:00Z',
      executed_at: '2026-03-01T11:00:00Z',
      success: true,
      version: 'v19.1.0',
      ...overrides,
    },
  } as TaggedItem
}

function youtube(content: string, overrides = {}): TaggedItem {
  return {
    provider: 'youtube',
    item: {
      id: 2,
      repository_id: 2,
      version: 'abc',
      content,
      datetime: '2026-03-02T10:00:00Z',
      executed_at: '2026-03-02T11:00:00Z',
      success: true,
      ...overrides,
    },
  } as TaggedItem
}

function rss(content: string): TaggedItem {
  return {
    provider: 'rss',
    item: {
      id: 3,
      repository_id: 3,
      content,
      datetime: '2026-03-03T10:00:00Z',
      executed_at: '2026-03-03T11:00:00Z',
      success: true,
    },
  } as TaggedItem
}

function scrap(params: unknown, content = 'Scraped body text'): TaggedItem {
  return {
    provider: 'scrap',
    item: {
      id: 4,
      repository_id: 4,
      content,
      params,
      executed_at: '2026-03-04T11:00:00Z',
      success: true,
    },
  } as TaggedItem
}

function renderList(props: Partial<React.ComponentProps<typeof UnifiedFeedList>> = {}) {
  return render(
    <LanguageProvider initialLang="en">
      <UnifiedFeedList
        items={[]}
        selectedIndex={null}
        onSelect={vi.fn()}
        repositories={REPOS}
        templates={TEMPLATES}
        {...props}
      />
    </LanguageProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('UnifiedFeedList', () => {
  it('shows the empty state', () => {
    renderList()
    expect(screen.getByText('No content available.')).toBeInTheDocument()
  })

  it('calls onSelect with the clicked index', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    renderList({ items: [changelog(), rss('{"title":"Post"}')], onSelect })

    await user.click(screen.getByText('Post'))
    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('dims items that are already read', () => {
    renderList({ items: [changelog()], readIds: new Set(['changelog:1']) })
    expect(screen.getByText('v19.1.0').closest('div.flex.gap-3')).toHaveStyle({ opacity: '0.45' })
  })

  it('keeps the selected item at full opacity even when read', () => {
    renderList({
      items: [changelog()],
      readIds: new Set(['changelog:1']),
      selectedIndex: 0,
    })
    expect(screen.getByText('v19.1.0').closest('div.flex.gap-3')).toHaveStyle({ opacity: '1' })
  })

  it('renders a generic entry for a provider with no template', () => {
    const item = {
      provider: 'podcast',
      item: {
        id: 9,
        repository_id: 9,
        content: 'A brand new episode',
        executed_at: '2026-03-05T00:00:00Z',
      },
    } as TaggedItem
    renderList({ items: [item] })
    expect(screen.getByText('A brand new episode')).toBeInTheDocument()
    expect(screen.getByText('Podcast')).toBeInTheDocument()
  })
})

describe('changelog entries (template: row)', () => {
  it('shows the repo slug, version and a stripped content snippet', () => {
    renderList({ items: [changelog()] })
    expect(screen.getByText('facebook/react')).toBeInTheDocument()
    expect(screen.getByText('v19.1.0')).toBeInTheDocument()
    expect(screen.getByText(/Fixes\s+something important/)).toBeInTheDocument()
  })

  it('still renders with datetime null', () => {
    renderList({ items: [changelog({ datetime: null })] })
    expect(screen.getByText('v19.1.0')).toBeInTheDocument()
  })

  it('omits the snippet when there is no content', () => {
    renderList({ items: [changelog({ content: '' })] })
    expect(screen.queryByText(/Fixes/)).not.toBeInTheDocument()
  })

  it('shows a dash title when the source repository is unknown', () => {
    renderList({ items: [changelog({ repository_id: 999 })], repositories: [] })
    expect(screen.getByText('v19.1.0')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})

describe('youtube entries (template: media)', () => {
  it('shows the title, channel handle and thumbnail', () => {
    renderList({
      items: [
        youtube(
          JSON.stringify({
            title: 'React 19 is here',
            thumbnail: 'https://img.example.com/t.jpg',
            url: 'https://www.youtube.com/@fireship',
          }),
        ),
      ],
    })
    expect(screen.getByText('React 19 is here')).toBeInTheDocument()
    expect(screen.getByText('@fireship')).toBeInTheDocument()
    expect(screen.getByAltText('React 19 is here')).toBeInTheDocument()
  })

  it('renders a placeholder when there is no thumbnail', () => {
    renderList({
      items: [youtube(JSON.stringify({ title: 'No thumb', thumbnail: '', url: '' }))],
    })
    expect(screen.getByText('No thumb')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders a dash when the content is not JSON', () => {
    renderList({ items: [youtube('not json')] })
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('keeps the channel path for a /channel/ URL', () => {
    renderList({
      items: [
        youtube(
          JSON.stringify({ title: 'X', thumbnail: '', url: 'https://youtube.com/channel/UC1' }),
        ),
      ],
    })
    expect(screen.getByText('channel/UC1')).toBeInTheDocument()
  })
})

describe('rss entries (template: row)', () => {
  it('shows the title and the source hostname without www.', () => {
    renderList({
      items: [rss(JSON.stringify({ title: 'Modern CSS', link: 'https://www.css-tricks.com/a' }))],
    })
    expect(screen.getByText('Modern CSS')).toBeInTheDocument()
    expect(screen.getByText('css-tricks.com')).toBeInTheDocument()
  })

  it('renders a dash for unparseable content', () => {
    renderList({ items: [rss('nope')] })
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('omits the source when there is no link', () => {
    renderList({ items: [rss(JSON.stringify({ title: 'No link' }))] })
    expect(screen.getByText('No link')).toBeInTheDocument()
  })

  it('falls back to the raw link when it is not a valid URL', () => {
    renderList({ items: [rss(JSON.stringify({ title: 'T', link: 'garbage' }))] })
    expect(screen.getByText('garbage')).toBeInTheDocument()
  })
})

describe('scrap entries (template: row)', () => {
  it('shows a content preview and the source host from object params', () => {
    renderList({ items: [scrap({ url: 'https://example.com/blog' })] })
    expect(screen.getByText('Scraped body text')).toBeInTheDocument()
    expect(screen.getByText('example.com')).toBeInTheDocument()
  })

  it('parses stringified params', () => {
    renderList({ items: [scrap(JSON.stringify({ url: 'https://example.org/x' }))] })
    expect(screen.getByText('example.org')).toBeInTheDocument()
  })

  it('tolerates unparseable stringified params', () => {
    renderList({ items: [scrap('not json')] })
    expect(screen.getByText('Scraped body text')).toBeInTheDocument()
  })

  it('omits the source when params carry no url', () => {
    renderList({ items: [scrap({})] })
    expect(screen.getByText('Scraped body text')).toBeInTheDocument()
  })
})
