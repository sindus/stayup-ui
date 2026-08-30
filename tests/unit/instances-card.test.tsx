import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InstancesCard } from '@/components/profile/InstancesCard'
import { LanguageProvider } from '@/context/LanguageContext'

const actions = vi.hoisted(() => ({
  addInstanceAction: vi.fn(),
  probeInstanceAction: vi.fn(),
  reconnectInstanceAction: vi.fn(),
  removeInstanceAction: vi.fn(),
  renameInstanceAction: vi.fn(),
  setPrimaryInstanceAction: vi.fn(),
}))
vi.mock('@/lib/instances-actions', () => actions)

const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

const list = [
  { id: 'p', name: 'Home', host: 'home.dev', expired: false },
  { id: 's', name: 'Beta', host: 'beta.dev', expired: true },
]

function renderCard(instances = list) {
  return render(
    <LanguageProvider initialLang="en">
      <InstancesCard instances={instances} />
    </LanguageProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  Object.values(actions).forEach((fn) => fn.mockResolvedValue({}))
  actions.probeInstanceAction.mockResolvedValue({ name: 'Gamma' })
  vi.stubGlobal(
    'confirm',
    vi.fn(() => true),
  )
})

describe('InstancesCard', () => {
  it('lists every instance and badges the first as primary', () => {
    renderCard()
    expect(screen.getByDisplayValue('Home')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Beta')).toBeInTheDocument()
    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByText('beta.dev')).toBeInTheDocument()
  })

  it('renames an instance on blur when the value changed', async () => {
    const user = userEvent.setup()
    renderCard()
    const field = screen.getByDisplayValue('Beta')
    await user.clear(field)
    await user.type(field, 'Renamed')
    await user.tab()
    await waitFor(() => expect(actions.renameInstanceAction).toHaveBeenCalledWith('s', 'Renamed'))
  })

  it('does not rename when the value is unchanged', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByDisplayValue('Home'))
    await user.tab()
    expect(actions.renameInstanceAction).not.toHaveBeenCalled()
  })

  it('promotes a secondary instance', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByRole('button', { name: /Make primary/ }))
    expect(actions.setPrimaryInstanceAction).toHaveBeenCalledWith('s')
  })

  it('confirms before removing the primary', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getAllByRole('button', { name: /Remove/ })[0])
    expect(confirm).toHaveBeenCalled()
    expect(actions.removeInstanceAction).toHaveBeenCalledWith('p')
  })

  it('aborts removing the primary when the confirm is dismissed', async () => {
    vi.stubGlobal(
      'confirm',
      vi.fn(() => false),
    )
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getAllByRole('button', { name: /Remove/ })[0])
    expect(actions.removeInstanceAction).not.toHaveBeenCalled()
  })

  it('reconnects an expired instance with email + password', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByRole('button', { name: /Reconnect/ }))

    await user.type(screen.getByLabelText('Email'), 'u@b.io')
    await user.type(screen.getByLabelText('Password'), 'pw')
    const reconnectButtons = screen.getAllByRole('button', { name: 'Reconnect' })
    await user.click(reconnectButtons[reconnectButtons.length - 1])

    await waitFor(() =>
      expect(actions.reconnectInstanceAction).toHaveBeenCalledWith('s', 'u@b.io', 'pw'),
    )
  })

  it('adds an instance after probing its URL', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByRole('button', { name: 'Add a server' }))
    await user.type(screen.getByLabelText('API URL'), 'https://gamma.dev')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() =>
      expect(actions.probeInstanceAction).toHaveBeenCalledWith('https://gamma.dev'),
    )

    await user.type(screen.getByLabelText('Email'), 'u@g.io')
    await user.type(screen.getByLabelText('Password'), 'pw')
    await user.click(screen.getByRole('button', { name: 'Connect' }))

    await waitFor(() =>
      expect(actions.addInstanceAction).toHaveBeenCalledWith('https://gamma.dev', 'u@g.io', 'pw'),
    )
  })

  it('shows the probe error and no credential form', async () => {
    actions.probeInstanceAction.mockResolvedValue({ error: 'Not reachable' })
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByRole('button', { name: 'Add a server' }))
    await user.type(screen.getByLabelText('API URL'), 'https://x')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByText('Not reachable')).toBeInTheDocument()
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
  })

  it('surfaces an add failure', async () => {
    actions.addInstanceAction.mockResolvedValue({ error: 'Bad credentials' })
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByRole('button', { name: 'Add a server' }))
    await user.type(screen.getByLabelText('API URL'), 'https://gamma.dev')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.type(screen.getByLabelText('Email'), 'u@g.io')
    await user.type(screen.getByLabelText('Password'), 'bad')
    await user.click(screen.getByRole('button', { name: 'Connect' }))

    expect(await screen.findByText('Bad credentials')).toBeInTheDocument()
  })

  it('closes the add form from its cancel link', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByRole('button', { name: 'Add a server' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByLabelText('API URL')).not.toBeInTheDocument()
  })

  it('does not show the OAuth hint with a single instance', () => {
    renderCard([list[0]])
    expect(screen.queryByText(/OAuth for secondary servers/)).not.toBeInTheDocument()
  })
})
