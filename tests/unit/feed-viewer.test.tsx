import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedContentViewer } from '@/components/feed/FeedContentViewer'
import { FeedItemList } from '@/components/feed/FeedItemList'
import { ScrapList } from '@/components/feed/ScrapList'
import { LanguageProvider } from '@/context/LanguageContext'
import type { TaggedItem, ScrapRepository } from '@/types'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

const subscribeScrapAction = vi.fn()
const unsubscribeScrapAction = vi.fn()
vi.mock('@/lib/scrap-actions', () => ({
  subscribeScrapAction: (id: number) => subscribeScrapAction(id),
  unsubscribeScrapAction: (id: number) => unsubscribeScrapAction(id),
}))

const REPOS = [{ repository_id: 1, url: 'https://github.com/facebook/react' }]

function withLang(ui: React.ReactElement) {
  return render(<LanguageProvider initialLang="en">{ui}</LanguageProvider>)
}

const changelogItem = {
  id: 1,
  repository_id: 1,
  content: '## Fixes\n**bold** and `code`',
  diff: null,
  datetime: '2026-03-01T10:00:00Z',
  executed_at: '2026-03-01T11:00:00Z',
  success: true,
  version: 'v19.1.0',
}

function tagged(provider: TaggedItem['provider'], item: unknown): TaggedItem {
  return { provider, item } as TaggedItem
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  subscribeScrapAction.mockResolvedValue({})
  unsubscribeScrapAction.mockResolvedValue({})
})

describe('FeedContentViewer', () => {
  it('prompts to select an item when nothing is open', () => {
    withLang(<FeedContentViewer item={null} repositories={REPOS} />)
    expect(screen.getByText('Pick something to read.')).toBeInTheDocument()
  })

  it('renders changelog content with markdown markers stripped', () => {
    withLang(<FeedContentViewer item={tagged('changelog', changelogItem)} repositories={REPOS} />)

    expect(screen.getByText('facebook/react')).toBeInTheDocument()
    expect(screen.getByText('v19.1.0')).toBeInTheDocument()
    expect(screen.getByText(/bold and code/)).toBeInTheDocument()
  })

  it('links a changelog entry to its GitHub release', () => {
    withLang(<FeedContentViewer item={tagged('changelog', changelogItem)} repositories={REPOS} />)
    expect(screen.getByRole('link', { name: /View on GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/facebook/react/releases/tag/v19.1.0',
    )
  })

  it('omits the GitHub link for an unknown repository', () => {
    withLang(<FeedContentViewer item={tagged('changelog', changelogItem)} repositories={[]} />)
    expect(screen.queryByRole('link', { name: /View on GitHub/ })).not.toBeInTheDocument()
    expect(screen.getByText('repository')).toBeInTheDocument()
  })

  it('renders youtube content with a watch link', () => {
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
      diff: null,
      datetime: '2026-03-02T10:00:00Z',
      executed_at: '2026-03-02T11:00:00Z',
      success: true,
    }
    withLang(<FeedContentViewer item={tagged('youtube', item)} repositories={REPOS} />)

    expect(screen.getByText('React 19')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Watch on YouTube/ })).toBeInTheDocument()
  })

  it('falls back to the untitled label for unparseable youtube content', () => {
    const item = {
      id: 2,
      repository_id: 2,
      version: 'v',
      content: 'not json',
      diff: null,
      datetime: null,
      executed_at: '2026-03-02T11:00:00Z',
      success: true,
    }
    withLang(<FeedContentViewer item={tagged('youtube', item)} repositories={REPOS} />)
    expect(screen.getByText('Untitled')).toBeInTheDocument()
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
    withLang(<FeedContentViewer item={tagged('rss', item)} repositories={REPOS} />)

    expect(screen.getByRole('heading', { name: 'Modern CSS' })).toBeInTheDocument()
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
    withLang(<FeedContentViewer item={tagged('scrap', item)} repositories={REPOS} />)

    expect(screen.getByText(/Scraped body/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Visit website/ })).toHaveAttribute(
      'href',
      'https://example.com/blog',
    )
  })

  describe('font size controls', () => {
    it('increases the font size and persists the offset', async () => {
      const user = userEvent.setup()
      withLang(<FeedContentViewer item={tagged('changelog', changelogItem)} repositories={REPOS} />)

      await user.click(screen.getByRole('button', { name: 'Agrandir la police' }))
      await waitFor(() => expect(localStorage.getItem('STAYUP_FONT_SIZE_OFFSET')).toBe('1'))
    })

    it('decreases the font size', async () => {
      const user = userEvent.setup()
      withLang(<FeedContentViewer item={null} repositories={REPOS} />)

      await user.click(screen.getByRole('button', { name: 'Réduire la police' }))
      await waitFor(() => expect(localStorage.getItem('STAYUP_FONT_SIZE_OFFSET')).toBe('-1'))
    })

    it('restores a stored offset on mount', () => {
      localStorage.setItem('STAYUP_FONT_SIZE_OFFSET', '2')
      withLang(<FeedContentViewer item={null} repositories={REPOS} />)
      expect(screen.getByRole('button', { name: 'Agrandir la police' })).toBeInTheDocument()
    })

    it('ignores a non-numeric stored offset', () => {
      localStorage.setItem('STAYUP_FONT_SIZE_OFFSET', 'abc')
      withLang(<FeedContentViewer item={null} repositories={REPOS} />)
      expect(screen.getByRole('button', { name: 'Réduire la police' })).not.toBeDisabled()
    })

    it('clamps at the minimum offset', async () => {
      const user = userEvent.setup()
      withLang(<FeedContentViewer item={null} repositories={REPOS} />)

      const shrink = screen.getByRole('button', { name: 'Réduire la police' })
      for (let i = 0; i < 8; i++) await user.click(shrink)
      expect(shrink).toBeDisabled()
    })

    it('clamps at the maximum offset', async () => {
      const user = userEvent.setup()
      withLang(<FeedContentViewer item={null} repositories={REPOS} />)

      const grow = screen.getByRole('button', { name: 'Agrandir la police' })
      for (let i = 0; i < 12; i++) await user.click(grow)
      expect(grow).toBeDisabled()
    })
  })
})

describe('FeedItemList', () => {
  it('shows the empty state', () => {
    withLang(<FeedItemList items={[]} provider="changelog" />)
    expect(screen.getByText('No content available.')).toBeInTheDocument()
  })

  it('renders changelog items', () => {
    withLang(<FeedItemList items={[changelogItem]} provider="changelog" repositories={REPOS} />)
    expect(screen.getByText('v19.1.0')).toBeInTheDocument()
  })

  it('renders youtube items', () => {
    const item = {
      id: 2,
      repository_id: 2,
      version: 'v',
      content: JSON.stringify({ title: 'Vid', thumbnail: '', url: '' }),
      diff: null,
      datetime: null,
      executed_at: '2026-03-02T11:00:00Z',
      success: true,
    }
    withLang(<FeedItemList items={[item]} provider="youtube" />)
    expect(screen.getByText('Vid')).toBeInTheDocument()
  })

  it('renders rss items', () => {
    const item = {
      id: 3,
      repository_id: 3,
      content: JSON.stringify({ title: 'Post', link: 'https://a.dev/p' }),
      datetime: null,
      executed_at: '2026-03-03T11:00:00Z',
      success: true,
    }
    withLang(<FeedItemList items={[item]} provider="rss" />)
    expect(screen.getByText('Post')).toBeInTheDocument()
  })

  it('renders scrap items', () => {
    const item = {
      id: 4,
      repository_id: 4,
      content: 'Body text',
      params: { url: 'https://a.dev', articles_selector: 'h2', content_selector: 'article' },
      executed_at: '2026-03-04T11:00:00Z',
      success: true,
    }
    withLang(<FeedItemList items={[item]} provider="scrap" />)
    expect(screen.getByText(/Body text/)).toBeInTheDocument()
  })
})

describe('ScrapList', () => {
  function repo(overrides: Partial<ScrapRepository> = {}): ScrapRepository {
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
