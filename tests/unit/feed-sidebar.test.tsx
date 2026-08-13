import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedSidebar } from '@/components/feed/FeedSidebar'
import { LanguageProvider } from '@/context/LanguageContext'
import type { UserRepository } from '@/types'

let pathname = '/feed'
const refresh = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useRouter: () => ({ refresh }),
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function flux(overrides: Partial<UserRepository> = {}): UserRepository {
  return {
    id: 'l1',
    userId: 'u1',
    repositoryId: 1,
    provider: 'changelog',
    url: 'https://github.com/facebook/react/',
    identifier: 'facebook/react',
    config: {},
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function renderSidebar(props: Partial<React.ComponentProps<typeof FeedSidebar>> = {}) {
  return render(
    <LanguageProvider initialLang="en">
      <FeedSidebar fluxes={[]} {...props} />
    </LanguageProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  pathname = '/feed'
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })
  vi.stubGlobal(
    'confirm',
    vi.fn(() => true),
  )
})

describe('FeedSidebar', () => {
  it('links to the aggregated feed and marks it active on /feed', () => {
    renderSidebar()
    const all = screen.getByRole('link', { name: 'All feeds' })
    expect(all).toHaveAttribute('href', '/feed')
    expect(all.className).toContain('font-medium')
  })

  it('shows the empty state when there are no feeds', () => {
    renderSidebar()
    expect(screen.getByText('No feeds')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Add' })).toBeInTheDocument()
  })

  it('groups feeds by provider', () => {
    renderSidebar({
      fluxes: [
        flux(),
        flux({ id: 'l2', repositoryId: 2, provider: 'youtube', identifier: 'fireship' }),
      ],
    })

    expect(screen.getByRole('link', { name: /GitHub Changelog/ })).toHaveAttribute(
      'href',
      '/feed/category/changelog',
    )
    expect(screen.getByRole('link', { name: /YouTube/ })).toHaveAttribute(
      'href',
      '/feed/category/youtube',
    )
  })

  it('renders one link per feed, stripped of its URL scheme', () => {
    renderSidebar({
      fluxes: [flux({ provider: 'rss', identifier: 'https://www.example.com/feed.xml' })],
    })
    expect(screen.getByRole('link', { name: 'example.com/feed.xml' })).toHaveAttribute(
      'href',
      '/feed/flux/l1',
    )
  })

  it('marks the active category', () => {
    pathname = '/feed/category/changelog'
    renderSidebar({ fluxes: [flux()] })
    expect(screen.getByRole('link', { name: /GitHub Changelog/ }).className).toContain(
      'font-medium',
    )
  })

  it('marks the active feed', () => {
    pathname = '/feed/flux/l1'
    renderSidebar({ fluxes: [flux()] })
    expect(screen.getByRole('link', { name: 'facebook/react' }).className).toContain('font-medium')
  })

  it('shows unread counts per feed and summed per provider', () => {
    renderSidebar({
      fluxes: [flux(), flux({ id: 'l2', repositoryId: 2 })],
      unreadCountByRepoId: { 1: 3, 2: 4 },
    })

    expect(screen.getByRole('link', { name: /GitHub Changelog 7/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /facebook\/react 3/ })).toBeInTheDocument()
  })

  it('omits the unread badge when everything is read', () => {
    renderSidebar({ fluxes: [flux()], unreadCountByRepoId: { 1: 0 } })
    expect(screen.getByRole('link', { name: 'facebook/react' })).toBeInTheDocument()
  })

  it('collapses and re-expands a provider group', async () => {
    const user = userEvent.setup()
    renderSidebar({ fluxes: [flux()] })

    expect(screen.getByRole('link', { name: 'facebook/react' })).toBeInTheDocument()

    // The chevron is the first button inside the provider row.
    const chevron = screen.getAllByRole('button')[1]
    await user.click(chevron)
    expect(screen.queryByRole('link', { name: 'facebook/react' })).not.toBeInTheDocument()

    await user.click(chevron)
    expect(screen.getByRole('link', { name: 'facebook/react' })).toBeInTheDocument()
  })

  it('deletes a feed after confirmation and refreshes', async () => {
    const user = userEvent.setup()
    renderSidebar({ fluxes: [flux()] })

    await user.click(screen.getByRole('button', { name: 'Delete this feed' }))

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith('/api/fluxes/l1', { method: 'DELETE' }),
    )
    expect(refresh).toHaveBeenCalled()
  })

  it('does not delete when the confirmation is dismissed', async () => {
    vi.stubGlobal(
      'confirm',
      vi.fn(() => false),
    )
    const user = userEvent.setup()
    renderSidebar({ fluxes: [flux()] })

    await user.click(screen.getByRole('button', { name: 'Delete this feed' }))

    expect(mockFetch).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
  })

  it('opens the add-feed dialog from the header button', async () => {
    const user = userEvent.setup()
    renderSidebar({ fluxes: [flux()] })

    await user.click(screen.getByRole('button', { name: 'Add a feed' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('opens the add-feed dialog from the empty state', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByRole('button', { name: '+ Add' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('applies the requested width', () => {
    renderSidebar({ width: 300 })
    expect(document.querySelector('aside')).toHaveStyle({ width: '300px' })
  })
})
