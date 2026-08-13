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

function renderDialog(props: Partial<React.ComponentProps<typeof AddFluxDialog>> = {}) {
  const onOpenChange = props.onOpenChange ?? vi.fn()
  const utils = render(
    <LanguageProvider initialLang="en">
      <AddFluxDialog open onOpenChange={onOpenChange} {...props} />
    </LanguageProvider>,
  )
  return { ...utils, onOpenChange }
}

/** Picks an option in the provider Select (a Radix listbox). */
async function chooseProvider(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('combobox', { name: /provider/i }))
  await user.click(await screen.findByRole('option', { name }))
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ repos: [] }) })
})

describe('AddFluxDialog', () => {
  it('defaults to the GitHub changelog provider', () => {
    renderDialog()
    expect(screen.getByLabelText('GitHub repository')).toBeInTheDocument()
  })

  it('lists exactly the four supported providers', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('combobox', { name: /provider/i }))
    const options = (await screen.findAllByRole('option')).map((o) => o.textContent)
    expect(options).toEqual(['GitHub Changelog', 'YouTube', 'RSS', 'Web scraping'])
  })

  it('no longer offers a documentation provider', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('combobox', { name: /provider/i }))
    expect(screen.queryByRole('option', { name: 'Documentation' })).not.toBeInTheDocument()
  })

  it('requires an identifier', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('This field is required')).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalled()
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
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
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

      await chooseProvider(user, 'Web scraping')
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('/api/scrap'))
      expect(await screen.findByLabelText('Available feed')).toBeInTheDocument()
    })

    it('requires a selection before submitting', async () => {
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'Web scraping')
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

      await chooseProvider(user, 'Web scraping')
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

      await chooseProvider(user, 'Web scraping')
      await user.click(await screen.findByRole('combobox', { name: 'Available feed' }))
      expect((await screen.findAllByText('No feeds available')).length).toBeGreaterThan(0)
      expect(screen.queryByText('https://taken.dev')).not.toBeInTheDocument()
    })

    it('degrades to an empty list when the repo fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('offline'))
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'Web scraping')
      expect(await screen.findByLabelText('Available feed')).toBeInTheDocument()
    })

    it('submits a scraping request in request mode', async () => {
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'Web scraping')
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

      await chooseProvider(user, 'Web scraping')
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

      await chooseProvider(user, 'Web scraping')
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

      await chooseProvider(user, 'Web scraping')
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

      await chooseProvider(user, 'Web scraping')
      await user.click(await screen.findByRole('button', { name: 'Make a request' }))
      await user.click(screen.getByRole('button', { name: 'Choose an existing feed' }))

      expect(await screen.findByLabelText('Available feed')).toBeInTheDocument()
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

    expect(screen.getByText('Votre flux est vide')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ajouter mon premier flux' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })
})
