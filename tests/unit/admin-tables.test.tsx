import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UsersTable } from '@/components/admin/UsersTable'
import { EditUserDialog } from '@/components/admin/EditUserDialog'
import { RepositoriesTable } from '@/components/admin/RepositoriesTable'
import { UserFluxesTable } from '@/components/admin/UserFluxesTable'
import { LanguageProvider } from '@/context/LanguageContext'
import type { AdminUser, AdminRepository, UserRepositoryItem } from '@/lib/api-client'

const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

// vi.hoisted: the components import these statically, so the stubs must exist
// before vi.mock's hoisted factory runs.
const actions = vi.hoisted(() => ({
  adminDeleteUserAction: vi.fn(),
  adminUpdateUserAction: vi.fn(),
  adminDeleteRepositoryAction: vi.fn(),
  adminClearRepositoryDataAction: vi.fn(),
  adminDeleteUserFluxAction: vi.fn(),
}))
vi.mock('@/lib/admin-actions', () => actions)

function withLang(ui: React.ReactElement) {
  return render(<LanguageProvider initialLang="en">{ui}</LanguageProvider>)
}

const USER: AdminUser = {
  id: 'u1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  created_at: '2026-01-15T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  for (const fn of Object.values(actions)) fn.mockResolvedValue({})
})

describe('UsersTable', () => {
  it('shows the empty state', () => {
    withLang(<UsersTable users={[]} />)
    expect(screen.getByText('No users')).toBeInTheDocument()
  })

  it('renders a user row with a link to their feeds', () => {
    withLang(<UsersTable users={[USER]} />)

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Feeds' })).toHaveAttribute('href', '/admin/users/u1')
  })

  it('asks for confirmation before deleting', async () => {
    const user = userEvent.setup()
    withLang(<UsersTable users={[USER]} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    expect(actions.adminDeleteUserAction).not.toHaveBeenCalled()
  })

  it('deletes the user on confirmation and refreshes', async () => {
    const user = userEvent.setup()
    withLang(<UsersTable users={[USER]} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(actions.adminDeleteUserAction).toHaveBeenCalledWith('u1'))
    expect(refresh).toHaveBeenCalled()
  })

  it('can back out of the confirmation', async () => {
    const user = userEvent.setup()
    withLang(<UsersTable users={[USER]} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(actions.adminDeleteUserAction).not.toHaveBeenCalled()
  })

  it('surfaces a delete error without refreshing', async () => {
    actions.adminDeleteUserAction.mockResolvedValue({ error: 'Cannot delete admin' })
    const user = userEvent.setup()
    withLang(<UsersTable users={[USER]} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(await screen.findByText('Cannot delete admin')).toBeInTheDocument()
    expect(refresh).not.toHaveBeenCalled()
  })
})

describe('EditUserDialog', () => {
  it('opens prefilled with the current values', async () => {
    const user = userEvent.setup()
    withLang(<EditUserDialog user={USER} onSuccess={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByLabelText('Name')).toHaveValue('Ada Lovelace')
    expect(within(dialog).getByLabelText('Email')).toHaveValue('ada@example.com')
  })

  it('saves name and email without a password when left blank', async () => {
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    withLang(<EditUserDialog user={USER} onSuccess={onSuccess} />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    const dialog = await screen.findByRole('dialog')

    const name = within(dialog).getByLabelText('Name')
    await user.clear(name)
    await user.type(name, 'Grace Hopper')
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(actions.adminUpdateUserAction).toHaveBeenCalledWith('u1', {
        name: 'Grace Hopper',
        email: 'ada@example.com',
      }),
    )
    expect(onSuccess).toHaveBeenCalled()
  })

  it('includes the password when one is entered', async () => {
    const user = userEvent.setup()
    withLang(<EditUserDialog user={USER} onSuccess={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    const dialog = await screen.findByRole('dialog')

    await user.type(within(dialog).getByLabelText('New password (optional)'), 'newsecret1')
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(actions.adminUpdateUserAction).toHaveBeenCalledWith('u1', {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'newsecret1',
      }),
    )
  })

  it('rejects an empty name', async () => {
    const user = userEvent.setup()
    withLang(<EditUserDialog user={USER} onSuccess={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    const dialog = await screen.findByRole('dialog')

    await user.clear(within(dialog).getByLabelText('Name'))
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))

    expect(
      await within(dialog).findByText('Name too short (min. 2 characters)'),
    ).toBeInTheDocument()
    expect(actions.adminUpdateUserAction).not.toHaveBeenCalled()
  })

  it('surfaces the server error and stays open', async () => {
    actions.adminUpdateUserAction.mockResolvedValue({ error: 'Email already taken' })
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    withLang(<EditUserDialog user={USER} onSuccess={onSuccess} />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Email already taken')).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('closes on cancel', async () => {
    const user = userEvent.setup()
    withLang(<EditUserDialog user={USER} onSuccess={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})

describe('RepositoriesTable', () => {
  const REPO: AdminRepository = {
    id: 5,
    url: 'https://github.com/facebook/react',
    type: 'changelog',
    config: {},
    subscriber_count: '3',
  }

  it('shows the empty state', () => {
    withLang(<RepositoriesTable repositories={[]} />)
    expect(screen.getByText('No feeds')).toBeInTheDocument()
  })

  it('renders the URL, provider label and subscriber count', () => {
    withLang(<RepositoriesTable repositories={[REPO]} />)

    expect(screen.getByText('https://github.com/facebook/react')).toBeInTheDocument()
    expect(screen.getByText('Changelog')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('clears the repository data after confirmation', async () => {
    const user = userEvent.setup()
    withLang(<RepositoriesTable repositories={[REPO]} />)

    await user.click(screen.getByRole('button', { name: 'Clear data' }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(actions.adminClearRepositoryDataAction).toHaveBeenCalledWith(5))
    expect(refresh).toHaveBeenCalled()
  })

  it('deletes the repository after confirmation', async () => {
    const user = userEvent.setup()
    withLang(<RepositoriesTable repositories={[REPO]} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(actions.adminDeleteRepositoryAction).toHaveBeenCalledWith(5))
  })

  it('surfaces a clear-data error', async () => {
    actions.adminClearRepositoryDataAction.mockResolvedValue({ error: 'Repository locked' })
    const user = userEvent.setup()
    withLang(<RepositoriesTable repositories={[REPO]} />)

    await user.click(screen.getByRole('button', { name: 'Clear data' }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(await screen.findByText('Repository locked')).toBeInTheDocument()
  })

  it('surfaces a delete error', async () => {
    actions.adminDeleteRepositoryAction.mockResolvedValue({ error: 'Still subscribed' })
    const user = userEvent.setup()
    withLang(<RepositoriesTable repositories={[REPO]} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(await screen.findByText('Still subscribed')).toBeInTheDocument()
  })

  it('falls back to a capitalized type for an unknown provider', () => {
    withLang(<RepositoriesTable repositories={[{ ...REPO, type: 'mystery' }]} />)
    expect(screen.getByText('Mystery')).toBeInTheDocument()
  })
})

describe('UserFluxesTable', () => {
  const LINK: UserRepositoryItem = {
    id: 'l1',
    repository_id: 1,
    created_at: '2026-02-01T00:00:00Z',
    url: 'https://github.com/facebook/react',
    provider: 'changelog',
    config: {},
  }

  it('shows the empty state', () => {
    withLang(<UserFluxesTable userId="u1" repositories={[]} />)
    expect(screen.getByText('No feeds configured')).toBeInTheDocument()
  })

  it('renders a feed row', () => {
    withLang(<UserFluxesTable userId="u1" repositories={[LINK]} />)
    expect(screen.getByText('https://github.com/facebook/react')).toBeInTheDocument()
    expect(screen.getByText('Changelog')).toBeInTheDocument()
  })

  it('removes the link after confirmation', async () => {
    const user = userEvent.setup()
    withLang(<UserFluxesTable userId="u1" repositories={[LINK]} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(actions.adminDeleteUserFluxAction).toHaveBeenCalledWith('u1', 'l1'))
    expect(refresh).toHaveBeenCalled()
  })

  it('surfaces a removal error', async () => {
    actions.adminDeleteUserFluxAction.mockResolvedValue({ error: 'Link not found' })
    const user = userEvent.setup()
    withLang(<UserFluxesTable userId="u1" repositories={[LINK]} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(await screen.findByText('Link not found')).toBeInTheDocument()
  })

  it('can back out of the confirmation', async () => {
    const user = userEvent.setup()
    withLang(<UserFluxesTable userId="u1" repositories={[LINK]} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(actions.adminDeleteUserFluxAction).not.toHaveBeenCalled()
  })
})
