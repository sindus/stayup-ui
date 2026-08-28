import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScrapCreateForm } from '@/components/admin/ScrapCreateForm'
import { FluxRequestsTable } from '@/components/admin/FluxRequestsTable'
import { FluxRequestApproveDialog } from '@/components/admin/FluxRequestApproveDialog'
import { LanguageProvider } from '@/context/LanguageContext'
import type { FluxRequest } from '@/types'

const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

const actions = vi.hoisted(() => ({
  adminCreateRepositoryAction: vi.fn(),
  adminApproveFluxRequestAction: vi.fn(),
  adminRejectFluxRequestAction: vi.fn(),
}))
vi.mock('@/lib/admin-actions', () => actions)

function withLang(ui: React.ReactElement) {
  return render(<LanguageProvider initialLang="en">{ui}</LanguageProvider>)
}

/**
 * The scrap config fields use bare <label> elements with no htmlFor, so they
 * cannot be reached with getByLabelText. Each label sits next to its input in
 * the same wrapper, so resolve the field through that wrapper instead.
 */
function field(labelText: string): HTMLInputElement {
  const label = screen.getByText(labelText)
  const input = label.parentElement?.querySelector('input')
  if (!input) throw new Error(`No input found for label "${labelText}"`)
  return input as HTMLInputElement
}

function request(overrides: Partial<FluxRequest> = {}): FluxRequest {
  return {
    id: 'r1',
    user_id: 'u1',
    user_email: 'ada@example.com',
    provider: 'scrap',
    url: 'https://example.com/blog',
    status: 'pending',
    created_at: '2026-02-01T00:00:00Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  for (const fn of Object.values(actions)) fn.mockResolvedValue({})
})

describe('ScrapCreateForm', () => {
  it('hides the form until the add button is clicked', async () => {
    const user = userEvent.setup()
    withLang(<ScrapCreateForm />)

    expect(screen.queryByText('New web scraping feed')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '+ Add scraping feed' }))
    expect(screen.getByText('New web scraping feed')).toBeInTheDocument()
  })

  it('collapses the form again via cancel', async () => {
    const user = userEvent.setup()
    withLang(<ScrapCreateForm />)

    await user.click(screen.getByRole('button', { name: '+ Add scraping feed' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByText('New web scraping feed')).not.toBeInTheDocument()
  })

  it('creates a scrap repository with the entered config', async () => {
    const user = userEvent.setup()
    withLang(<ScrapCreateForm />)

    await user.click(screen.getByRole('button', { name: '+ Add scraping feed' }))
    await user.type(field('Page URL'), 'https://example.com/blog')
    await user.type(field('Articles CSS selector'), 'h2 a')
    await user.type(field('Content CSS selector'), 'article')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(actions.adminCreateRepositoryAction).toHaveBeenCalledWith({
        url: 'https://example.com/blog',
        type: 'scrap',
        config: {
          articles_selector: 'h2 a',
          content_selector: 'article',
          max_scraps: 5,
          retention_days: 15,
        },
      }),
    )
    expect(refresh).toHaveBeenCalled()
  })

  it('includes DOM exclusions when some are added', async () => {
    const user = userEvent.setup()
    withLang(<ScrapCreateForm />)

    await user.click(screen.getByRole('button', { name: '+ Add scraping feed' }))
    await user.type(field('Page URL'), 'https://example.com/blog')
    await user.type(field('Articles CSS selector'), 'h2 a')
    await user.type(field('Content CSS selector'), 'article')

    await user.type(field('DOM exclusions (optional)'), 'div.ads')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(actions.adminCreateRepositoryAction).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({ exclude: ['div.ads'] }),
        }),
      ),
    )
  })

  it('surfaces the server error and keeps the form open', async () => {
    actions.adminCreateRepositoryAction.mockResolvedValue({ error: 'Duplicate URL' })
    const user = userEvent.setup()
    withLang(<ScrapCreateForm />)

    await user.click(screen.getByRole('button', { name: '+ Add scraping feed' }))
    await user.type(field('Page URL'), 'https://example.com/blog')
    await user.type(field('Articles CSS selector'), 'h2 a')
    await user.type(field('Content CSS selector'), 'article')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Duplicate URL')).toBeInTheDocument()
    expect(screen.getByText('New web scraping feed')).toBeInTheDocument()
    expect(refresh).not.toHaveBeenCalled()
  })
})

describe('ScrapConfigFields exclusions', () => {
  async function openForm() {
    const user = userEvent.setup()
    withLang(<ScrapCreateForm />)
    await user.click(screen.getByRole('button', { name: '+ Add scraping feed' }))
    return user
  }

  it('adds an exclusion with the Add button', async () => {
    const user = await openForm()

    await user.type(field('DOM exclusions (optional)'), '.sidebar')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByText('.sidebar')).toBeInTheDocument()
    expect(field('DOM exclusions (optional)')).toHaveValue('')
  })

  it('adds an exclusion with the Enter key', async () => {
    const user = await openForm()

    const input = field('DOM exclusions (optional)')
    await user.type(input, '.ads{Enter}')

    expect(screen.getByText('.ads')).toBeInTheDocument()
  })

  it('adds an exclusion with a comma', async () => {
    const user = await openForm()

    const input = field('DOM exclusions (optional)')
    await user.type(input, '.promo,')

    expect(screen.getByText('.promo')).toBeInTheDocument()
  })

  it('ignores a blank exclusion', async () => {
    const user = await openForm()

    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.queryByRole('button', { name: '×' })).not.toBeInTheDocument()
  })

  it('ignores a duplicate exclusion', async () => {
    const user = await openForm()

    const input = field('DOM exclusions (optional)')
    await user.type(input, '.ads{Enter}')
    await user.type(input, '.ads{Enter}')

    expect(screen.getAllByText('.ads')).toHaveLength(1)
  })

  it('removes an exclusion', async () => {
    const user = await openForm()

    await user.type(field('DOM exclusions (optional)'), '.ads{Enter}')
    await user.click(screen.getByRole('button', { name: '×' }))

    expect(screen.queryByText('.ads')).not.toBeInTheDocument()
  })

  it('accepts custom max scraps and retention values', async () => {
    const user = await openForm()

    const maxScraps = field('Max scraps')
    await user.clear(maxScraps)
    await user.type(maxScraps, '9')

    const retention = field('Retention (days)')
    await user.clear(retention)
    await user.type(retention, '30')

    await user.type(field('Page URL'), 'https://example.com/blog')
    await user.type(field('Articles CSS selector'), 'h2 a')
    await user.type(field('Content CSS selector'), 'article')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(actions.adminCreateRepositoryAction).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({ max_scraps: 9, retention_days: 30 }),
        }),
      ),
    )
  })
})

describe('FluxRequestsTable', () => {
  it('shows the empty state', () => {
    withLang(<FluxRequestsTable requests={[]} />)
    expect(screen.getByText('No requests')).toBeInTheDocument()
  })

  it('renders a pending request with its provider and both actions', () => {
    withLang(<FluxRequestsTable requests={[request({ provider: 'rss' })]} />)

    expect(screen.getByText('rss')).toBeInTheDocument()
    expect(screen.getByText('https://example.com/blog')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()
  })

  it('offers no actions for an already-approved request', () => {
    withLang(<FluxRequestsTable requests={[request({ status: 'approved' })]} />)
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
  })

  it('rejects a request and refreshes', async () => {
    const user = userEvent.setup()
    withLang(<FluxRequestsTable requests={[request()]} />)

    await user.click(screen.getByRole('button', { name: 'Reject' }))

    await waitFor(() => expect(actions.adminRejectFluxRequestAction).toHaveBeenCalledWith('r1'))
    expect(refresh).toHaveBeenCalled()
  })

  it('opens the approve dialog', async () => {
    const user = userEvent.setup()
    withLang(<FluxRequestsTable requests={[request()]} />)

    await user.click(screen.getByRole('button', { name: 'Approve' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Approve request')).toBeInTheDocument()
  })
})

describe('FluxRequestApproveDialog', () => {
  it('shows the requester, provider and url', () => {
    withLang(<FluxRequestApproveDialog request={request({ provider: 'rss' })} onClose={vi.fn()} />)

    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByText('rss')).toBeInTheDocument()
    expect(screen.getByText('https://example.com/blog')).toBeInTheDocument()
  })

  it('approves a scrap request with the entered config (no url in the payload)', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    withLang(<FluxRequestApproveDialog request={request()} onClose={onClose} />)

    await user.type(field('Articles CSS selector'), 'h2 a')
    await user.type(field('Content CSS selector'), 'article')
    await user.click(screen.getByRole('button', { name: 'Approve' }))

    await waitFor(() =>
      expect(actions.adminApproveFluxRequestAction).toHaveBeenCalledWith('r1', {
        config: {
          articles_selector: 'h2 a',
          content_selector: 'article',
          max_scraps: 5,
          retention_days: 15,
        },
      }),
    )
    expect(onClose).toHaveBeenCalled()
    expect(refresh).toHaveBeenCalled()
  })

  it('approves a non-scrap request with no config at all', async () => {
    const user = userEvent.setup()
    withLang(<FluxRequestApproveDialog request={request({ provider: 'rss' })} onClose={vi.fn()} />)

    // No scrap config fields for a non-scrap provider.
    expect(screen.queryByText('Articles CSS selector')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Approve' }))

    await waitFor(() =>
      expect(actions.adminApproveFluxRequestAction).toHaveBeenCalledWith('r1', {}),
    )
  })

  it('includes exclusions when some are added', async () => {
    const user = userEvent.setup()
    withLang(<FluxRequestApproveDialog request={request()} onClose={vi.fn()} />)

    await user.type(field('Articles CSS selector'), 'h2 a')
    await user.type(field('Content CSS selector'), 'article')
    await user.type(field('DOM exclusions (optional)'), 'nav{Enter}')
    await user.click(screen.getByRole('button', { name: 'Approve' }))

    await waitFor(() =>
      expect(actions.adminApproveFluxRequestAction).toHaveBeenCalledWith(
        'r1',
        expect.objectContaining({ config: expect.objectContaining({ exclude: ['nav'] }) }),
      ),
    )
  })

  it('surfaces the server error and stays open', async () => {
    actions.adminApproveFluxRequestAction.mockResolvedValue({ error: 'Invalid selector' })
    const onClose = vi.fn()
    const user = userEvent.setup()
    withLang(<FluxRequestApproveDialog request={request()} onClose={onClose} />)

    await user.type(field('Articles CSS selector'), 'h2 a')
    await user.type(field('Content CSS selector'), 'article')
    await user.click(screen.getByRole('button', { name: 'Approve' }))

    expect(await screen.findByText('Invalid selector')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes on cancel', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    withLang(<FluxRequestApproveDialog request={request()} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })
})
