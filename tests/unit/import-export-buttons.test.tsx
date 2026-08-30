import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportExportButtons } from '@/components/feed/ImportExportButtons'
import { LanguageProvider } from '@/context/LanguageContext'
import { buildOpml } from '@/lib/opml'
import type { UserRepository } from '@/types'

const refresh = vi.fn()
vi.mock('next/navigation', () => ({
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
    instanceId: '',
    instanceName: '',
    ...overrides,
  }
}

function opmlFile(xml: string) {
  return new File([xml], 'feeds.opml', { type: 'text/x-opml' })
}

function renderButtons(fluxes: UserRepository[] = []) {
  return render(
    <LanguageProvider initialLang="en">
      <ImportExportButtons fluxes={fluxes} />
    </LanguageProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('export', () => {
  it('builds a Blob download link when the export button is clicked', async () => {
    const user = userEvent.setup()
    renderButtons([flux()])
    await user.click(screen.getByLabelText('Export feeds'))
    expect(URL.createObjectURL).toHaveBeenCalled()
  })
})

describe('import', () => {
  it('adds new entries and reports the count', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })
    const user = userEvent.setup()
    renderButtons([])

    const xml = buildOpml(
      [{ provider: 'rss', url: 'https://blog.example.com/feed.xml', identifier: 'blog' }],
      'StayUp',
    )
    await user.upload(screen.getByTestId('import-file-input'), opmlFile(xml))

    await waitFor(() => expect(screen.getByText(/1 added/)).toBeInTheDocument())
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/fluxes',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ provider: 'rss', url: 'https://blog.example.com/feed.xml' }),
      }),
    )
    expect(refresh).toHaveBeenCalled()
  })

  it('skips entries already present without calling the API', async () => {
    const user = userEvent.setup()
    renderButtons([flux()])

    const xml = buildOpml(
      [
        {
          provider: 'changelog',
          url: 'https://github.com/facebook/react/',
          identifier: 'facebook/react',
        },
      ],
      'StayUp',
    )
    await user.upload(screen.getByTestId('import-file-input'), opmlFile(xml))

    await waitFor(() => expect(screen.getByText(/1 already present/)).toBeInTheDocument())
    expect(mockFetch).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
  })

  it('marks a scrap entry unavailable when no matching repository is subscribable', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ fluxes: [] }) })
    const user = userEvent.setup()
    renderButtons([])

    const xml = buildOpml(
      [
        {
          provider: 'scrap',
          url: 'https://news.ycombinator.com',
          identifier: 'news.ycombinator.com',
        },
      ],
      'StayUp',
    )
    await user.upload(screen.getByTestId('import-file-input'), opmlFile(xml))

    await waitFor(() => expect(screen.getByText(/1 unavailable/)).toBeInTheDocument())
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith('/api/providers/scrap/fluxes')
  })

  it('subscribes to a matching scrap repository', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/providers/scrap/fluxes') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ fluxes: [{ id: 7, url: 'https://news.ycombinator.com' }] }),
        })
      }
      return Promise.resolve({ ok: true, json: async () => ({}) })
    })
    const user = userEvent.setup()
    renderButtons([])

    const xml = buildOpml(
      [
        {
          provider: 'scrap',
          url: 'https://news.ycombinator.com',
          identifier: 'news.ycombinator.com',
        },
      ],
      'StayUp',
    )
    await user.upload(screen.getByTestId('import-file-input'), opmlFile(xml))

    await waitFor(() => expect(screen.getByText(/1 added/)).toBeInTheDocument())
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/providers/scrap/fluxes',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ id: 7 }),
      }),
    )
  })

  it('shows an error for a file with no valid entries', async () => {
    const user = userEvent.setup()
    renderButtons([])
    await user.upload(screen.getByTestId('import-file-input'), opmlFile('not opml'))
    await waitFor(() =>
      expect(
        screen.getByText('This file could not be read as a valid OPML file.'),
      ).toBeInTheDocument(),
    )
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
