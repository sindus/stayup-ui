import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddFluxDialog } from '@/components/feed/AddFluxDialog'
import { EmptyFeed } from '@/components/feed/EmptyFeed'
import { LanguageProvider } from '@/context/LanguageContext'

const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Les 4 providers connus de l'app, tels que renvoyés par GET /api/providers (proxy de
// GET /connectors/providers côté stayup-api).
const DEFAULT_PROVIDERS = [
  { name: 'changelog', displayName: 'Changelog' },
  { name: 'youtube', displayName: 'YouTube' },
  { name: 'rss', displayName: 'RSS' },
  { name: 'scrap', displayName: 'Scrap' },
]

function renderDialog(props: Partial<React.ComponentProps<typeof AddFluxDialog>> = {}) {
  const onOpenChange = props.onOpenChange ?? vi.fn()
  const utils = render(
    <LanguageProvider initialLang="en">
      <AddFluxDialog open onOpenChange={onOpenChange} {...props} />
    </LanguageProvider>,
  )
  return { ...utils, onOpenChange }
}

/** Picks a provider tile in the 2x2 provider grid (loaded async from GET /api/providers). */
async function chooseProvider(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(await screen.findByRole('button', { name }))
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ repos: [] }) })
  // Le dialogue charge la liste des providers au montage (GET /api/providers) : c'est
  // toujours le tout premier appel fetch d'un test, donc un mockResolvedValueOnce
  // suffit et n'interfère pas avec les mockResolvedValue posés par chaque test pour
  // /api/scrap, /api/fluxes, etc.
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ providers: DEFAULT_PROVIDERS }),
  })
})

describe('AddFluxDialog', () => {
  it('defaults to the GitHub changelog provider', async () => {
    renderDialog()
    expect(screen.getByLabelText('GitHub repository')).toBeInTheDocument()
    // Attend le chargement async des tuiles pour éviter un act() warning.
    await screen.findByRole('button', { name: 'GitHub' })
  })

  it('lists exactly the four supported providers', async () => {
    renderDialog()

    for (const name of ['GitHub', 'YouTube', 'RSS', 'Page web']) {
      expect(await screen.findByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('no longer offers a documentation provider', async () => {
    renderDialog()
    await screen.findByRole('button', { name: 'GitHub' })
    expect(screen.queryByRole('button', { name: 'Documentation' })).not.toBeInTheDocument()
  })

  it('requires an identifier', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('This field is required')).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalledWith('/api/fluxes', expect.anything())
  })

  it('creates a changelog feed and closes on success', async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderDialog()

    await user.type(screen.getByLabelText('GitHub repository'), 'facebook/react')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/fluxes',
        expect.objectContaining({ method: 'POST' }),
      ),
    )
    const call = mockFetch.mock.calls.find((c) => c[0] === '/api/fluxes')
    expect(JSON.parse(call![1].body)).toEqual({
      provider: 'changelog',
      identifier: 'facebook/react',
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(refresh).toHaveBeenCalled()
  })

  it('surfaces the API error and stays open', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: async () => ({ error: 'Already followed' }) })
    const user = userEvent.setup()
    const { onOpenChange } = renderDialog()

    await user.type(screen.getByLabelText('GitHub repository'), 'facebook/react')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Already followed')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it('falls back to a generic error when the body has none', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: async () => ({}) })
    const user = userEvent.setup()
    renderDialog()

    await user.type(screen.getByLabelText('GitHub repository'), 'facebook/react')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('An error occurred.')).toBeInTheDocument()
  })

  it('switches the label when picking the YouTube provider', async () => {
    const user = userEvent.setup()
    renderDialog()

    await chooseProvider(user, 'YouTube')
    expect(await screen.findByLabelText('YouTube channel')).toBeInTheDocument()
  })

  it('switches the label when picking the RSS provider', async () => {
    const user = userEvent.setup()
    renderDialog()

    await chooseProvider(user, 'RSS')
    expect(await screen.findByLabelText('RSS feed URL')).toBeInTheDocument()
  })

  describe('scrap provider', () => {
    it('loads the available scrap repositories', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          repos: [{ id: 1, url: 'https://a.dev/blog', is_subscribed: false }],
        }),
      })
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'Page web')
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('/api/scrap'))
      expect(await screen.findByLabelText('Available feed')).toBeInTheDocument()
    })

    it('requires a selection before submitting', async () => {
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'Page web')
      await user.click(screen.getByRole('button', { name: 'Add' }))

      // "Select a feed" is also the Select placeholder, hence the count check.
      await waitFor(() => expect(screen.getAllByText('Select a feed').length).toBeGreaterThan(1))
      expect(mockFetch).not.toHaveBeenCalledWith('/api/fluxes', expect.anything())
    })

    it('subscribes to the chosen repository', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          repos: [{ id: 7, url: 'https://a.dev/blog', is_subscribed: false }],
        }),
      })
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'Page web')
      await user.click(await screen.findByRole('combobox', { name: 'Available feed' }))
      await user.click(await screen.findByRole('option', { name: 'https://a.dev/blog' }))
      await user.click(screen.getByRole('button', { name: 'Add' }))

      await waitFor(() => {
        const call = mockFetch.mock.calls.find((c) => c[0] === '/api/fluxes')
        expect(call).toBeDefined()
        expect(JSON.parse(call![1].body)).toEqual({ provider: 'scrap', scrapRepoId: 7 })
      })
    })

    it('hides repositories the user already follows', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          repos: [{ id: 1, url: 'https://taken.dev', is_subscribed: true }],
        }),
      })
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'Page web')
      await user.click(await screen.findByRole('combobox', { name: 'Available feed' }))
      expect((await screen.findAllByText('No feeds available')).length).toBeGreaterThan(0)
      expect(screen.queryByText('https://taken.dev')).not.toBeInTheDocument()
    })

    it('degrades to an empty list when the repo fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('offline'))
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'Page web')
      expect(await screen.findByLabelText('Available feed')).toBeInTheDocument()
    })

    it('submits a scraping request in request mode', async () => {
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'Page web')
      await user.click(await screen.findByRole('button', { name: 'Make a request' }))
      await user.type(screen.getByLabelText('URL to scrape'), 'https://new.dev/blog')
      await user.click(screen.getByRole('button', { name: 'Add' }))

      await waitFor(() => {
        const call = mockFetch.mock.calls.find((c) => c[0] === '/api/scrap/requests')
        expect(call).toBeDefined()
        expect(JSON.parse(call![1].body)).toEqual({ url: 'https://new.dev/blog' })
      })
      expect(await screen.findByText('Request sent!')).toBeInTheDocument()
    })

    it('rejects an empty request URL', async () => {
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'Page web')
      await user.click(await screen.findByRole('button', { name: 'Make a request' }))
      await user.click(screen.getByRole('button', { name: 'Add' }))

      expect(await screen.findByText('This field is required')).toBeInTheDocument()
    })

    // The input is type="url", so the browser blocks a malformed value before
    // submit. Submitting the form directly bypasses that interactive check and
    // exercises the component's own `new URL()` guard.
    it('rejects a malformed request URL', async () => {
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'Page web')
      await user.click(await screen.findByRole('button', { name: 'Make a request' }))
      const input = screen.getByLabelText('URL to scrape')
      await user.type(input, 'not-a-url')

      fireEvent.submit(input.closest('form')!)

      expect(await screen.findByText('The URL is not valid')).toBeInTheDocument()
      expect(mockFetch).not.toHaveBeenCalledWith('/api/scrap/requests', expect.anything())
    })

    it('surfaces a rejected scraping request', async () => {
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'Page web')
      await user.click(await screen.findByRole('button', { name: 'Make a request' }))
      await user.type(screen.getByLabelText('URL to scrape'), 'https://dup.dev')

      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'You already have a pending request for this URL' }),
      })
      await user.click(screen.getByRole('button', { name: 'Add' }))

      expect(
        await screen.findByText('You already have a pending request for this URL'),
      ).toBeInTheDocument()
    })

    it('can switch back from request mode to selection mode', async () => {
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'Page web')
      await user.click(await screen.findByRole('button', { name: 'Make a request' }))
      await user.click(screen.getByRole('button', { name: 'Choose an existing feed' }))

      expect(await screen.findByLabelText('Available feed')).toBeInTheDocument()
    })
  })

  describe('a provider unknown to the app', () => {
    it('renders a generic tile and posts a plain URL identifier', async () => {
      mockFetch.mockReset()
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({ repos: [] }) })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          providers: [...DEFAULT_PROVIDERS, { name: 'podcast', displayName: 'Podcast' }],
        }),
      })
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'Podcast')
      expect(await screen.findByLabelText('URL')).toBeInTheDocument()

      await user.type(screen.getByLabelText('URL'), 'https://example.com/feed.xml')
      await user.click(screen.getByRole('button', { name: 'Add' }))

      await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/fluxes',
          expect.objectContaining({ method: 'POST' }),
        ),
      )
      const call = mockFetch.mock.calls.find((c) => c[0] === '/api/fluxes')
      expect(JSON.parse(call![1].body)).toEqual({
        provider: 'podcast',
        identifier: 'https://example.com/feed.xml',
      })
    })
  })

  it('resets its state when cancelled', async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderDialog()

    await user.type(screen.getByLabelText('GitHub repository'), 'facebook/react')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('EmptyFeed', () => {
  it('opens the add-feed dialog', async () => {
    const user = userEvent.setup()
    render(
      <LanguageProvider initialLang="en">
        <EmptyFeed />
      </LanguageProvider>,
    )

    expect(screen.getByText('No feeds yet.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add one →' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })
})
