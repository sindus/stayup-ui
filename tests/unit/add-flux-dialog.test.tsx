import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddFluxDialog } from '@/components/feed/AddFluxDialog'
import { EmptyFeed } from '@/components/feed/EmptyFeed'
import { LanguageProvider } from '@/context/LanguageContext'
import { TEMPLATES } from './_templates'

const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Les providers renvoyés par GET /api/providers (proxy de GET /connectors/providers).
// `scrap` est en mode `manual` : l'ajout d'un flux inédit part en file d'approbation.
const DEFAULT_PROVIDERS = ['changelog', 'youtube', 'rss', 'scrap'].map((name) => ({
  name,
  displayName: TEMPLATES[name].displayName,
  fluxApproval: name === 'scrap' ? 'manual' : 'auto',
  template: TEMPLATES[name].template,
}))

function jsonRes(body: unknown, status = 200) {
  return { ok: status < 400, status, json: async () => body }
}

interface RouteOverrides {
  providers?: unknown[]
  fluxes?: unknown[]
  fluxesReject?: boolean
  addResult?: ReturnType<typeof jsonRes>
  subscribeResult?: ReturnType<typeof jsonRes>
}

function routeFetch(o: RouteOverrides = {}) {
  mockFetch.mockImplementation((rawUrl: string, opts?: { method?: string }) => {
    const url = rawUrl.split('?')[0]
    if (url === '/api/providers') {
      return Promise.resolve(jsonRes({ providers: o.providers ?? DEFAULT_PROVIDERS }))
    }
    if (/^\/api\/providers\/[^/]+\/fluxes$/.test(url)) {
      if (opts?.method === 'POST') {
        return Promise.resolve(o.subscribeResult ?? jsonRes({ success: true }, 201))
      }
      if (o.fluxesReject) return Promise.reject(new Error('offline'))
      return Promise.resolve(jsonRes({ fluxes: o.fluxes ?? [] }))
    }
    if (url === '/api/fluxes') {
      return Promise.resolve(o.addResult ?? jsonRes({ flux: { identifier: 'x' } }, 201))
    }
    return Promise.resolve(jsonRes({}))
  })
}

function renderDialog(props: Partial<React.ComponentProps<typeof AddFluxDialog>> = {}) {
  const onOpenChange = props.onOpenChange ?? vi.fn()
  const utils = render(
    <LanguageProvider initialLang="en">
      <AddFluxDialog open onOpenChange={onOpenChange} {...props} />
    </LanguageProvider>,
  )
  return { ...utils, onOpenChange }
}

async function chooseProvider(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(await screen.findByRole('button', { name }))
}

beforeEach(() => {
  vi.clearAllMocks()
  routeFetch()
})

describe('AddFluxDialog', () => {
  it('lists exactly the four supported providers', async () => {
    renderDialog()
    for (const name of ['Changelog', 'YouTube', 'RSS', 'Scrap']) {
      expect(await screen.findByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('shows the "add a new one" input by default when no flux is available', async () => {
    renderDialog()
    // Le template changelog fournit le libellé de son champ.
    expect(await screen.findByLabelText('GitHub repo (owner/repo or URL)')).toBeInTheDocument()
  })

  it('requires an identifier before submitting a new flux', async () => {
    const user = userEvent.setup()
    renderDialog()
    await screen.findByRole('button', { name: 'Changelog' })

    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('This field is required')).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalledWith('/api/fluxes', expect.anything())
  })

  it('creates a changelog feed from the form input and closes on success', async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderDialog()

    const input = await screen.findByLabelText('GitHub repo (owner/repo or URL)')
    await user.type(input, 'facebook/react')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      const call = mockFetch.mock.calls.find((c) => c[0] === '/api/fluxes')
      expect(call).toBeDefined()
      expect(JSON.parse(call![1].body)).toEqual({
        provider: 'changelog',
        url: 'https://github.com/facebook/react/',
      })
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(refresh).toHaveBeenCalled()
  })

  it('surfaces the API error and stays open', async () => {
    routeFetch({ addResult: jsonRes({ error: 'Already followed' }, 409) })
    const user = userEvent.setup()
    const { onOpenChange } = renderDialog()

    await user.type(
      await screen.findByLabelText('GitHub repo (owner/repo or URL)'),
      'facebook/react',
    )
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Already followed')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it('shows the pending screen when the provider is `manual` (202)', async () => {
    routeFetch({ addResult: jsonRes({ status: 'pending' }, 202) })
    const user = userEvent.setup()
    renderDialog()

    await chooseProvider(user, 'Scrap')
    await user.click(await screen.findByRole('button', { name: 'Add a new one' }))
    await user.type(screen.getByLabelText('URL'), 'https://new.dev/blog')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Request sent!')).toBeInTheDocument()
  })

  it('switches the label to the YouTube form label', async () => {
    const user = userEvent.setup()
    renderDialog()
    await chooseProvider(user, 'YouTube')
    expect(await screen.findByLabelText('YouTube channel (@handle or URL)')).toBeInTheDocument()
  })

  describe('subscribing to an existing flux', () => {
    it('lists the provider fluxes and subscribes to the chosen one', async () => {
      routeFetch({ fluxes: [{ id: 7, url: 'https://a.dev/blog', is_subscribed: false }] })
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'RSS')
      const fluxBtn = await screen.findByRole('button', { name: 'https://a.dev/blog' })
      await user.click(fluxBtn)
      await user.click(screen.getByRole('button', { name: 'Add' }))

      await waitFor(() => {
        const call = mockFetch.mock.calls.find(
          (c) => c[0] === '/api/providers/rss/fluxes' && c[1]?.method === 'POST',
        )
        expect(call).toBeDefined()
        expect(JSON.parse(call![1].body)).toEqual({ id: 7 })
      })
    })

    it('hides fluxes the user already follows', async () => {
      routeFetch({ fluxes: [{ id: 1, url: 'https://taken.dev', is_subscribed: true }] })
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'RSS')
      // Only subscribable ones show; the subscribed one does not.
      await user.click(await screen.findByRole('button', { name: 'Choose an existing feed' }))
      expect(screen.queryByText('https://taken.dev')).not.toBeInTheDocument()
    })

    it('degrades gracefully when the flux list fetch fails', async () => {
      routeFetch({ fluxesReject: true })
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'RSS')
      // Falls back to the "add new" input.
      expect(await screen.findByLabelText('RSS/Atom feed URL')).toBeInTheDocument()
    })
  })

  describe('a provider unknown to the app', () => {
    it('renders a generic tile and posts the raw URL', async () => {
      routeFetch({
        providers: [...DEFAULT_PROVIDERS, { name: 'podcast', displayName: 'Podcast' }],
      })
      const user = userEvent.setup()
      renderDialog()

      await chooseProvider(user, 'Podcast')
      const input = await screen.findByLabelText('URL')
      await user.type(input, 'https://example.com/feed.xml')
      await user.click(screen.getByRole('button', { name: 'Add' }))

      await waitFor(() => {
        const call = mockFetch.mock.calls.find((c) => c[0] === '/api/fluxes')
        expect(call).toBeDefined()
        expect(JSON.parse(call![1].body)).toEqual({
          provider: 'podcast',
          url: 'https://example.com/feed.xml',
        })
      })
    })
  })

  it('resets its state when cancelled', async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderDialog()

    await screen.findByRole('button', { name: 'Changelog' })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  describe('with several servers', () => {
    const instances = [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
    ]

    it('has no server picker with a single instance', async () => {
      renderDialog({ instances: [instances[0]] })
      await screen.findByRole('button', { name: 'Changelog' })
      expect(screen.queryByLabelText('Instance')).not.toBeInTheDocument()
    })

    it('targets the chosen server for provider discovery and flux creation', async () => {
      const user = userEvent.setup()
      renderDialog({ instances })

      await user.selectOptions(await screen.findByLabelText('Instance'), 'b')

      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('/api/providers?instanceId=b'))

      await chooseProvider(user, 'Changelog')
      await user.click(screen.getByRole('button', { name: 'Add a new one' }))
      await user.type(
        await screen.findByLabelText('GitHub repo (owner/repo or URL)'),
        'facebook/react',
      )
      await user.click(screen.getByRole('button', { name: 'Add' }))

      await waitFor(() => {
        const call = mockFetch.mock.calls.find((c) => c[0] === '/api/fluxes?instanceId=b')
        expect(call).toBeDefined()
      })
    })
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
