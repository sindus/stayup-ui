import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedContentViewer } from '@/components/feed/FeedContentViewer'
import { ScrapList } from '@/components/feed/ScrapList'
import { LanguageProvider } from '@/context/LanguageContext'
import type { TaggedItem, ProviderFlux } from '@/types'
import { buildTemplateMap } from '@/lib/providerTemplate'
import { TEMPLATES } from './_templates'

// Deux modes qu'aucun connecteur officiel n'utilise encore : on les teste sur des
// templates locaux (podcast → audio, photos → gallery).
const MEDIA_TEMPLATES = buildTemplateMap([
  {
    name: 'podcast',
    displayName: 'Podcast',
    template: {
      version: 1,
      display: { name: 'Podcast', icon: 'book', accent: '#c5b1e8' },
      item: {
        parseContentAsJson: true,
        fields: { title: 'title', image: 'cover', timestamp: '$row.datetime' },
      },
      detail: {
        mode: 'audio',
        title: 'title',
        image: 'cover',
        audioUrl: 'audio',
        body: 'notes',
        openUrl: 'page',
        openLabel: 'Open episode',
      },
    },
  },
  {
    name: 'photos',
    displayName: 'Photos',
    template: {
      version: 1,
      display: { name: 'Photos', icon: 'dot', accent: '#a8d4b5' },
      item: { parseContentAsJson: true, fields: { title: 'album' } },
      detail: {
        mode: 'gallery',
        title: 'album',
        collection: 'shots',
        image: 'url',
        caption: 'caption',
        rowLink: 'url',
        openUrl: 'album_url',
        openLabel: 'Open album',
      },
    },
  },
])

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

const subscribeScrapAction = vi.fn()
const unsubscribeScrapAction = vi.fn()
vi.mock('@/lib/scrap-actions', () => ({
  subscribeScrapAction: (id: number) => subscribeScrapAction(id),
  unsubscribeScrapAction: (id: number) => unsubscribeScrapAction(id),
}))

const REPOS = [
  { repository_id: 1, url: 'https://github.com/facebook/react', provider: 'changelog' },
]

function withLang(ui: React.ReactElement) {
  return render(<LanguageProvider initialLang="en">{ui}</LanguageProvider>)
}

function viewer(item: TaggedItem | null, repositories = REPOS, templates = TEMPLATES) {
  return withLang(
    <FeedContentViewer item={item} repositories={repositories} templates={templates} />,
  )
}

const changelogItem = {
  id: 1,
  repository_id: 1,
  content: '## Fixes\n**bold** and `code`',
  datetime: '2026-03-01T10:00:00Z',
  executed_at: '2026-03-01T11:00:00Z',
  success: true,
  version: 'v19.1.0',
}

function tagged(provider: string, item: unknown): TaggedItem {
  return { provider, item } as TaggedItem
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  subscribeScrapAction.mockResolvedValue({})
  unsubscribeScrapAction.mockResolvedValue({})
})

describe('FeedContentViewer (template-driven)', () => {
  it('prompts to select an item when nothing is open', () => {
    viewer(null)
    expect(screen.getByText('Pick something to read.')).toBeInTheDocument()
  })

  it('renders changelog text with markdown markers stripped', () => {
    viewer(tagged('changelog', changelogItem))
    expect(screen.getByText('facebook/react')).toBeInTheDocument()
    expect(screen.getByText('v19.1.0')).toBeInTheDocument()
    expect(screen.getByText(/bold and code/)).toBeInTheDocument()
  })

  it('links a changelog entry to its GitHub release', () => {
    viewer(tagged('changelog', changelogItem))
    expect(screen.getByRole('link', { name: /Open on GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/facebook/react/releases/tag/v19.1.0',
    )
  })

  it('omits the open link when the source repository is unknown', () => {
    viewer(tagged('changelog', changelogItem), [])
    expect(screen.queryByRole('link', { name: /Open on GitHub/ })).not.toBeInTheDocument()
    expect(screen.getByText('v19.1.0')).toBeInTheDocument()
  })

  it('renders youtube media with a watch link', () => {
    const item = {
      id: 2,
      repository_id: 2,
      version: 'vid123',
      content: JSON.stringify({
        title: 'React 19',
        thumbnail: 'https://img.example.com/a.jpg',
        url: 'https://www.youtube.com/@fireship',
        link: 'https://www.youtube.com/watch?v=vid123',
      }),
      datetime: '2026-03-02T10:00:00Z',
      executed_at: '2026-03-02T11:00:00Z',
      success: true,
    }
    viewer(tagged('youtube', item))
    expect(screen.getByText('React 19')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Watch on YouTube/ })).toBeInTheDocument()
  })

  it('renders youtube without a watch link when the content is not JSON', () => {
    const item = {
      id: 2,
      repository_id: 2,
      version: 'v',
      content: 'not json',
      datetime: null,
      executed_at: '2026-03-02T11:00:00Z',
      success: true,
    }
    viewer(tagged('youtube', item))
    expect(screen.getByRole('button', { name: 'Agrandir la police' })).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders rss content including its HTML summary', () => {
    const item = {
      id: 3,
      repository_id: 3,
      content: JSON.stringify({
        version: 'e1',
        title: 'Modern CSS',
        link: 'https://www.css-tricks.com/post',
        summary: '<p>Grid <strong>rules</strong></p>',
      }),
      datetime: '2026-03-03T10:00:00Z',
      executed_at: '2026-03-03T11:00:00Z',
      success: true,
    }
    viewer(tagged('rss', item))
    expect(screen.getByText('Modern CSS')).toBeInTheDocument()
    expect(screen.getByText('css-tricks.com')).toBeInTheDocument()
    expect(screen.getByText('rules')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Read article/ })).toHaveAttribute(
      'href',
      'https://www.css-tricks.com/post',
    )
  })

  it('renders scrap content with its source link', () => {
    const item = {
      id: 4,
      repository_id: 4,
      content: 'Scraped body',
      params: { url: 'https://example.com/blog' },
      executed_at: '2026-03-04T11:00:00Z',
      success: true,
    }
    viewer(tagged('scrap', item))
    expect(screen.getByText(/Scraped body/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Visit website/ })).toHaveAttribute(
      'href',
      'https://example.com/blog',
    )
  })

  it('renders a github-trending snapshot as a table of repositories', () => {
    const item = {
      id: 5,
      repository_id: 5,
      version: 'daily@2026-03-05',
      content: JSON.stringify({
        since: 'daily',
        url: 'https://github.com/trending?since=daily',
        count: 2,
        fetched_at: '2026-03-05T00:00:03Z',
        repos: [
          {
            rank: 1,
            owner: 'vercel',
            name: 'next.js',
            url: 'https://github.com/vercel/next.js',
            description: 'The React Framework',
            language: 'TypeScript',
            stars: 129000,
            forks: 27600,
            stars_period: 318,
          },
          {
            rank: 2,
            owner: 'ollama',
            name: 'ollama',
            url: 'https://github.com/ollama/ollama',
            description: 'Run LLMs locally',
            language: 'Go',
            stars: 142000,
            forks: 12000,
            stars_period: 271,
          },
        ],
      }),
      datetime: '2026-03-05T00:00:03Z',
      executed_at: '2026-03-05T00:00:03Z',
      success: true,
    }
    viewer(tagged('github_trending', item))

    expect(screen.getByText('Trending today')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Repository' })).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'vercel/next.js' })
    expect(link).toHaveAttribute('href', 'https://github.com/vercel/next.js')
    expect(screen.getByText('The React Framework')).toBeInTheDocument()
    // compactNumber — l'ICU du test rend « 129 k », un vrai navigateur « 129K ».
    expect(screen.getByText(/129\s*k/i)).toBeInTheDocument()
    expect(screen.getByText('+318')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open on github\.com\/trending/ })).toHaveAttribute(
      'href',
      'https://github.com/trending?since=daily',
    )
  })

  it('renders an audio episode with a player, cover, notes and open button', () => {
    const { container } = viewer(
      tagged('podcast', {
        id: 6,
        repository_id: 6,
        content: JSON.stringify({
          title: 'Episode 12 — Testing',
          cover: 'https://cdn.example.com/ep12.jpg',
          audio: 'https://cdn.example.com/ep12.mp3',
          notes: 'In this episode we talk about templates.',
          page: 'https://pod.example.com/12',
        }),
        datetime: '2026-03-06T00:00:00Z',
        executed_at: '2026-03-06T00:00:00Z',
        success: true,
      }),
      REPOS,
      MEDIA_TEMPLATES,
    )
    expect(screen.getByText('Episode 12 — Testing')).toBeInTheDocument()
    const audio = container.querySelector('audio')
    expect(audio).toHaveAttribute('src', 'https://cdn.example.com/ep12.mp3')
    expect(screen.getByAltText('Episode 12 — Testing')).toBeInTheDocument()
    expect(screen.getByText(/we talk about templates/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open episode' })).toHaveAttribute(
      'href',
      'https://pod.example.com/12',
    )
  })

  it('renders a gallery of images with captions and per-image links', () => {
    viewer(
      tagged('photos', {
        id: 8,
        repository_id: 8,
        content: JSON.stringify({
          album: 'Trip to Kyoto',
          album_url: 'https://photos.example.com/kyoto',
          shots: [
            { url: 'https://cdn.example.com/1.jpg', caption: 'Fushimi Inari' },
            { url: 'https://cdn.example.com/2.jpg', caption: 'Arashiyama' },
          ],
        }),
        datetime: '2026-03-07T00:00:00Z',
        executed_at: '2026-03-07T00:00:00Z',
        success: true,
      }),
      REPOS,
      MEDIA_TEMPLATES,
    )
    expect(screen.getByText('Trip to Kyoto')).toBeInTheDocument()
    expect(screen.getByAltText('Fushimi Inari')).toHaveAttribute(
      'src',
      'https://cdn.example.com/1.jpg',
    )
    expect(screen.getByText('Arashiyama')).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(3) // 2 images + the open button
  })

  it('renders a generic card for a provider with no template', () => {
    viewer(
      tagged('podcast', {
        id: 7,
        repository_id: 7,
        content: 'A fresh episode about testing',
        executed_at: '2026-03-06T00:00:00Z',
      }),
      REPOS,
      {},
    )
    expect(screen.getByText('Podcast')).toBeInTheDocument()
    expect(screen.getByText(/A fresh episode about testing/)).toBeInTheDocument()
  })

  describe('font size controls', () => {
    it('increases the font size and persists the offset', async () => {
      const user = userEvent.setup()
      viewer(tagged('changelog', changelogItem))
      await user.click(screen.getByRole('button', { name: 'Agrandir la police' }))
      await waitFor(() => expect(localStorage.getItem('STAYUP_FONT_SIZE_OFFSET')).toBe('1'))
    })

    it('decreases the font size', async () => {
      const user = userEvent.setup()
      viewer(null)
      await user.click(screen.getByRole('button', { name: 'Réduire la police' }))
      await waitFor(() => expect(localStorage.getItem('STAYUP_FONT_SIZE_OFFSET')).toBe('-1'))
    })

    it('restores a stored offset on mount', () => {
      localStorage.setItem('STAYUP_FONT_SIZE_OFFSET', '2')
      viewer(null)
      expect(screen.getByRole('button', { name: 'Agrandir la police' })).toBeInTheDocument()
    })

    it('ignores a non-numeric stored offset', () => {
      localStorage.setItem('STAYUP_FONT_SIZE_OFFSET', 'abc')
      viewer(null)
      expect(screen.getByRole('button', { name: 'Réduire la police' })).not.toBeDisabled()
    })

    it('clamps at the minimum offset', async () => {
      const user = userEvent.setup()
      viewer(null)
      const shrink = screen.getByRole('button', { name: 'Réduire la police' })
      for (let i = 0; i < 8; i++) await user.click(shrink)
      expect(shrink).toBeDisabled()
    })

    it('clamps at the maximum offset', async () => {
      const user = userEvent.setup()
      viewer(null)
      const grow = screen.getByRole('button', { name: 'Agrandir la police' })
      for (let i = 0; i < 12; i++) await user.click(grow)
      expect(grow).toBeDisabled()
    })
  })
})

describe('ScrapList', () => {
  function repo(overrides: Partial<ProviderFlux> = {}): ProviderFlux {
    return {
      id: 1,
      url: 'https://example.com/blog',
      config: { articles_selector: '.post' },
      created_at: '2026-01-01T00:00:00Z',
      is_subscribed: false,
      ...overrides,
    }
  }

  it('shows the empty state', () => {
    withLang(<ScrapList repos={[]} />)
    expect(screen.getByText('No scraping feeds are available yet.')).toBeInTheDocument()
  })

  it('shows the URL and the articles selector', () => {
    withLang(<ScrapList repos={[repo()]} />)
    expect(screen.getByText('https://example.com/blog')).toBeInTheDocument()
    expect(screen.getByText('.post')).toBeInTheDocument()
  })

  it('omits the selector line when there is none', () => {
    withLang(<ScrapList repos={[repo({ config: {} })]} />)
    expect(screen.queryByText('.post')).not.toBeInTheDocument()
  })

  it('subscribes to an unfollowed feed', async () => {
    const user = userEvent.setup()
    withLang(<ScrapList repos={[repo()]} />)
    await user.click(screen.getByRole('button', { name: 'Follow' }))
    await waitFor(() => expect(subscribeScrapAction).toHaveBeenCalledWith(1))
  })

  it('unsubscribes from a followed feed', async () => {
    const user = userEvent.setup()
    withLang(<ScrapList repos={[repo({ is_subscribed: true })]} />)
    await user.click(screen.getByRole('button', { name: 'Unfollow' }))
    await waitFor(() => expect(unsubscribeScrapAction).toHaveBeenCalledWith(1))
  })

  it('renders one card per repository', () => {
    withLang(<ScrapList repos={[repo(), repo({ id: 2, url: 'https://b.dev' })]} />)
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })
})
