import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedClientView } from '@/components/feed/FeedClientView'
import { FeedClientLayout } from '@/components/feed/FeedClientLayout'
import { ReadProvider } from '@/context/FeedReadContext'
import { LanguageProvider } from '@/context/LanguageContext'
import type { TaggedItem, UserRepository } from '@/types'
import { TEMPLATES } from './_templates'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  usePathname: () => '/feed',
}))

const reconnectInstanceAction = vi.fn(async () => ({}) as { error?: string })
vi.mock('@/lib/instances-actions', () => ({
  reconnectInstanceAction: (...a: unknown[]) => reconnectInstanceAction(...(a as [])),
}))

vi.stubGlobal(
  'fetch',
  vi.fn(async () => ({ ok: true, json: async () => ({ repos: [] }) })),
)

const REPOS = [{ repository_id: 1, url: 'https://github.com/facebook/react' }]

function item(id: number): TaggedItem {
  return {
    provider: 'changelog',
    item: {
      id,
      repository_id: 1,
      content: `release ${id}`,
      datetime: `2026-03-0${id}T10:00:00Z`,
      executed_at: `2026-03-0${id}T11:00:00Z`,
      success: true,
      version: `v${id}.0.0`,
    },
  } as TaggedItem
}

type Err = {
  instanceId: string
  instanceName: string
  reason: 'expired' | 'auth' | 'unreachable'
}

function renderView(items: TaggedItem[], instanceErrors: Err[] = []) {
  return render(
    <LanguageProvider initialLang="en">
      <ReadProvider primaryInstanceId="">
        <FeedClientView
          items={items}
          repositories={REPOS}
          templates={TEMPLATES}
          instanceErrors={instanceErrors}
        />
      </ReadProvider>
    </LanguageProvider>,
  )
}

/** The item list sits left of the drag divider, the content viewer right of it. */
function panes() {
  const divider = document.querySelector('div.cursor-col-resize') as HTMLElement
  return {
    divider,
    list: divider.previousElementSibling as HTMLElement,
    viewer: divider.nextElementSibling as HTMLElement,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('FeedClientView', () => {
  it('shows the total count on the All filter', () => {
    renderView([item(1), item(2)])
    expect(screen.getByRole('button', { name: /All 2/ })).toBeInTheDocument()
  })

  it('shows an unreachable-instance banner and still renders the feed', () => {
    renderView([item(1)], [{ instanceId: 'b', instanceName: 'Beta', reason: 'unreachable' }])
    expect(screen.getByText('Unreachable: Beta')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /All 1/ })).toBeInTheDocument()
    // A transient failure does not raise the reconnection dialog.
    expect(screen.queryByText('Reconnect to your servers')).not.toBeInTheDocument()
  })

  it('has no banner when every instance answered', () => {
    renderView([item(1)])
    expect(screen.queryByText(/Unreachable/)).not.toBeInTheDocument()
  })

  it('raises the reconnect dialog for a dead session, not the unreachable strip', () => {
    renderView([item(1)], [{ instanceId: 'b', instanceName: 'Beta', reason: 'expired' }])
    expect(screen.getByText('Reconnect to your servers')).toBeInTheDocument()
    expect(screen.getByText(/These servers need you to sign in again:.*Beta/)).toBeInTheDocument()
    expect(screen.queryByText(/Unreachable/)).not.toBeInTheDocument()
  })

  it('treats a rejected token (auth) as needing reconnection too', () => {
    renderView([item(1)], [{ instanceId: 'b', instanceName: 'Beta', reason: 'auth' }])
    expect(screen.getByText('Reconnect to your servers')).toBeInTheDocument()
  })

  it('lets the reconnect dialog be dismissed', async () => {
    const user = userEvent.setup()
    renderView([item(1)], [{ instanceId: 'b', instanceName: 'Beta', reason: 'expired' }])
    await user.click(screen.getByRole('button', { name: 'Later' }))
    expect(screen.queryByText('Reconnect to your servers')).not.toBeInTheDocument()
  })

  it('submits the reconnect form against the dead instance', async () => {
    const user = userEvent.setup()
    renderView([item(1)], [{ instanceId: 'b', instanceName: 'Beta', reason: 'expired' }])
    await user.type(screen.getByLabelText('Email'), 'u@x.io')
    await user.type(screen.getByLabelText('Password'), 'pw')
    await user.click(screen.getByRole('button', { name: 'Reconnect' }))
    expect(reconnectInstanceAction).toHaveBeenCalledWith('b', 'u@x.io', 'pw')
  })

  it('shows the unread count on the Unread filter', () => {
    renderView([item(1), item(2)])
    expect(screen.getByRole('button', { name: /Unread 2/ })).toBeInTheDocument()
  })

  it('opens an item on click and marks it read', async () => {
    const user = userEvent.setup()
    renderView([item(1), item(2)])

    await user.click(within(panes().list).getByText('v1.0.0'))

    expect(await within(panes().viewer).findByText(/release 1/)).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Unread 1/ })).toBeInTheDocument(),
    )
  })

  it('hides the unread badge once everything is read', async () => {
    const user = userEvent.setup()
    renderView([item(1)])

    await user.click(screen.getByRole('button', { name: 'Mark all read' }))

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Mark all read' })).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: 'Unread' })).toBeInTheDocument()
  })

  it('keeps the open item visible when switching to the unread filter', async () => {
    const user = userEvent.setup()
    renderView([item(1), item(2)])

    await user.click(within(panes().list).getByText('v1.0.0'))
    await user.click(screen.getByRole('button', { name: /Unread/ }))

    // The open item stays listed so it does not vanish while being read.
    expect(within(panes().list).getByText('v1.0.0')).toBeInTheDocument()
    expect(within(panes().list).getByText('v2.0.0')).toBeInTheDocument()
  })

  it('drops a read item from the unread list once another is opened', async () => {
    const user = userEvent.setup()
    renderView([item(1), item(2)])

    await user.click(within(panes().list).getByText('v1.0.0'))
    await user.click(screen.getByRole('button', { name: /Unread/ }))
    await user.click(within(panes().list).getByText('v2.0.0'))

    await waitFor(() => expect(within(panes().list).queryByText('v1.0.0')).not.toBeInTheDocument())
  })

  it('moves down the list with ArrowDown', async () => {
    renderView([item(1), item(2)])

    fireEvent.keyDown(window, { key: 'ArrowDown' })
    expect(await within(panes().viewer).findByText(/release 1/)).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'ArrowDown' })
    expect(await within(panes().viewer).findByText(/release 2/)).toBeInTheDocument()
  })

  it('stops at the last item', async () => {
    renderView([item(1), item(2)])

    fireEvent.keyDown(window, { key: 'ArrowDown' })
    fireEvent.keyDown(window, { key: 'ArrowDown' })
    fireEvent.keyDown(window, { key: 'ArrowDown' })

    expect(await within(panes().viewer).findByText(/release 2/)).toBeInTheDocument()
  })

  it('moves up the list with ArrowUp and stops at the first item', async () => {
    renderView([item(1), item(2)])

    fireEvent.keyDown(window, { key: 'ArrowDown' })
    fireEvent.keyDown(window, { key: 'ArrowDown' })
    fireEvent.keyDown(window, { key: 'ArrowUp' })
    expect(await within(panes().viewer).findByText(/release 1/)).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'ArrowUp' })
    expect(await within(panes().viewer).findByText(/release 1/)).toBeInTheDocument()
  })

  it('ignores arrow keys typed inside an input', async () => {
    renderView([item(1)])

    const input = document.createElement('input')
    document.body.appendChild(input)
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    expect(screen.getByText('Pick something to read.')).toBeInTheDocument()
    input.remove()
  })

  it('ignores unrelated keys', () => {
    renderView([item(1)])
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getByText('Pick something to read.')).toBeInTheDocument()
  })

  it('resizes the list pane by dragging the divider', () => {
    renderView([item(1)])

    const divider = document.querySelector('div.cursor-col-resize') as HTMLElement
    const pane = divider.previousElementSibling as HTMLElement
    expect(pane).toHaveStyle({ width: '380px' })

    fireEvent.mouseDown(divider, { clientX: 380 })
    fireEvent.mouseMove(window, { clientX: 460 })
    expect(pane).toHaveStyle({ width: '460px' })

    fireEvent.mouseUp(window)
    fireEvent.mouseMove(window, { clientX: 600 })
    expect(pane).toHaveStyle({ width: '460px' })
  })

  it('clamps the list pane to its maximum width', () => {
    renderView([item(1)])

    const divider = document.querySelector('div.cursor-col-resize') as HTMLElement
    const pane = divider.previousElementSibling as HTMLElement

    fireEvent.mouseDown(divider, { clientX: 0 })
    fireEvent.mouseMove(window, { clientX: 5000 })
    expect(pane).toHaveStyle({ width: '600px' })
  })

  it('clamps the list pane to its minimum width', () => {
    renderView([item(1)])

    const divider = document.querySelector('div.cursor-col-resize') as HTMLElement
    const pane = divider.previousElementSibling as HTMLElement

    fireEvent.mouseDown(divider, { clientX: 380 })
    fireEvent.mouseMove(window, { clientX: -5000 })
    expect(pane).toHaveStyle({ width: '260px' })
  })
})

describe('FeedClientLayout', () => {
  function flux(): UserRepository {
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
    }
  }

  function renderLayout(items: TaggedItem[]) {
    return render(
      <LanguageProvider initialLang="en">
        <FeedClientLayout
          fluxes={[flux()]}
          allItems={items}
          templates={TEMPLATES}
          instances={[]}
          primaryInstanceId=""
        >
          <div>child content</div>
        </FeedClientLayout>
      </LanguageProvider>,
    )
  }

  it('renders the sidebar and its children', () => {
    renderLayout([item(1)])
    expect(screen.getByRole('link', { name: 'All feeds' })).toBeInTheDocument()
    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('passes per-repository unread counts to the sidebar', () => {
    renderLayout([item(1), item(2)])
    expect(screen.getByRole('link', { name: /facebook\/react 2/ })).toBeInTheDocument()
  })

  it('excludes already-read items from the counts', () => {
    localStorage.setItem('STAYUP_READ_ITEMS', JSON.stringify([':changelog:1']))
    renderLayout([item(1), item(2)])
    expect(screen.getByRole('link', { name: /facebook\/react 1/ })).toBeInTheDocument()
  })

  it('resizes the sidebar by dragging its divider', () => {
    renderLayout([item(1)])

    const divider = document.querySelector('div.cursor-col-resize') as HTMLElement
    const sidebar = document.querySelector('aside') as HTMLElement
    expect(sidebar).toHaveStyle({ width: '220px' })

    fireEvent.mouseDown(divider, { clientX: 220 })
    fireEvent.mouseMove(window, { clientX: 300 })
    expect(sidebar).toHaveStyle({ width: '300px' })
    fireEvent.mouseUp(window)
  })
})
