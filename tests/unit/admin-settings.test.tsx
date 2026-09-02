import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminPasswordForm } from '@/components/admin/AdminPasswordForm'
import { CreateAdminDialog } from '@/components/admin/CreateAdminDialog'
import { EditAdminDialog } from '@/components/admin/EditAdminDialog'
import { ProvidersTable } from '@/components/admin/ProvidersTable'
import { LanguageProvider } from '@/context/LanguageContext'
import { en } from '@/lib/translations'

const pt = en.admin.providersTable

const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

const actions = vi.hoisted(() => ({
  adminChangeOwnPasswordAction: vi.fn(),
  adminCreateAdminAction: vi.fn(),
  adminUpdateAdminAction: vi.fn(),
  adminSetProviderApprovalAction: vi.fn(),
}))
vi.mock('@/lib/admin-actions', () => actions)

function withLang(ui: React.ReactElement) {
  return render(<LanguageProvider initialLang="en">{ui}</LanguageProvider>)
}

beforeEach(() => {
  vi.clearAllMocks()
  for (const fn of Object.values(actions)) fn.mockResolvedValue({})
})

describe('AdminPasswordForm', () => {
  it('changes the password and clears the fields on success', async () => {
    const user = userEvent.setup()
    withLang(<AdminPasswordForm />)

    await user.type(screen.getByLabelText(en.admin.currentPassword), 'old-secret')
    await user.type(screen.getByLabelText(en.admin.newPassword), 'longenough1')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(actions.adminChangeOwnPasswordAction).toHaveBeenCalledWith({
        currentPassword: 'old-secret',
        password: 'longenough1',
      }),
    )
    expect(await screen.findByText(en.admin.passwordUpdated)).toBeInTheDocument()
    expect(screen.getByLabelText(en.admin.newPassword)).toHaveValue('')
  })

  it('rejects a short new password without calling the action', async () => {
    const user = userEvent.setup()
    withLang(<AdminPasswordForm />)

    await user.type(screen.getByLabelText(en.admin.currentPassword), 'old-secret')
    await user.type(screen.getByLabelText(en.admin.newPassword), 'short')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Password too short (min. 8 characters)')).toBeInTheDocument()
    expect(actions.adminChangeOwnPasswordAction).not.toHaveBeenCalled()
  })

  it('surfaces the server error', async () => {
    actions.adminChangeOwnPasswordAction.mockResolvedValue({ error: 'Wrong current password' })
    const user = userEvent.setup()
    withLang(<AdminPasswordForm />)

    await user.type(screen.getByLabelText(en.admin.currentPassword), 'nope')
    await user.type(screen.getByLabelText(en.admin.newPassword), 'longenough1')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Wrong current password')).toBeInTheDocument()
  })
})

describe('CreateAdminDialog', () => {
  it('creates an admin, closes the dialog and refreshes', async () => {
    const user = userEvent.setup()
    withLang(<CreateAdminDialog />)

    await user.click(screen.getByRole('button', { name: en.admin.newAdminShort }))
    await user.type(screen.getByLabelText('Name'), 'Grace Hopper')
    await user.type(screen.getByLabelText('Email'), 'grace@example.com')
    await user.type(screen.getByLabelText(en.admin.login.password), 'longenough1')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(actions.adminCreateAdminAction).toHaveBeenCalledWith({
        name: 'Grace Hopper',
        email: 'grace@example.com',
        password: 'longenough1',
      }),
    )
    await waitFor(() => expect(refresh).toHaveBeenCalled())
    await waitFor(() => expect(screen.queryByText(en.admin.newAdmin)).not.toBeInTheDocument())
  })

  it('keeps the dialog open and shows the server error', async () => {
    actions.adminCreateAdminAction.mockResolvedValue({ error: 'Email already taken' })
    const user = userEvent.setup()
    withLang(<CreateAdminDialog />)

    await user.click(screen.getByRole('button', { name: en.admin.newAdminShort }))
    await user.type(screen.getByLabelText('Name'), 'Grace Hopper')
    await user.type(screen.getByLabelText('Email'), 'grace@example.com')
    await user.type(screen.getByLabelText(en.admin.login.password), 'longenough1')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Email already taken')).toBeInTheDocument()
    expect(refresh).not.toHaveBeenCalled()
  })

  it('validates the fields before submitting', async () => {
    const user = userEvent.setup()
    withLang(<CreateAdminDialog />)

    await user.click(screen.getByRole('button', { name: en.admin.newAdminShort }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Name too short (min. 2 characters)')).toBeInTheDocument()
    expect(actions.adminCreateAdminAction).not.toHaveBeenCalled()
  })

  it('closes on cancel', async () => {
    const user = userEvent.setup()
    withLang(<CreateAdminDialog />)

    await user.click(screen.getByRole('button', { name: en.admin.newAdminShort }))
    expect(screen.getByText(en.admin.newAdmin)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(screen.queryByText(en.admin.newAdmin)).not.toBeInTheDocument())
  })
})

describe('EditAdminDialog', () => {
  const ADMIN = {
    id: 'a1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    is_super: false,
    created_at: '2026-01-01T00:00:00Z',
  }

  it('prefills the form and updates without a password when left blank', async () => {
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    withLang(<EditAdminDialog admin={ADMIN} onSuccess={onSuccess} />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByLabelText('Name')).toHaveValue('Ada Lovelace')

    const name = screen.getByLabelText('Name')
    await user.clear(name)
    await user.type(name, 'Ada L.')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(actions.adminUpdateAdminAction).toHaveBeenCalledWith('a1', {
        name: 'Ada L.',
        email: 'ada@example.com',
      }),
    )
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })

  it('includes the password when one is entered', async () => {
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    withLang(<EditAdminDialog admin={ADMIN} onSuccess={onSuccess} />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.type(screen.getByLabelText('New password (optional)'), 'brandnew123')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(actions.adminUpdateAdminAction).toHaveBeenCalledWith('a1', {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'brandnew123',
      }),
    )
  })

  it('keeps the dialog open and shows the server error', async () => {
    actions.adminUpdateAdminAction.mockResolvedValue({ error: 'Email already taken' })
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    withLang(<EditAdminDialog admin={ADMIN} onSuccess={onSuccess} />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Email already taken')).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('rejects an invalid email before submitting', async () => {
    const user = userEvent.setup()
    withLang(<EditAdminDialog admin={ADMIN} onSuccess={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    const email = screen.getByLabelText('Email')
    await user.clear(email)
    await user.type(email, 'ada@localhost')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument()
    expect(actions.adminUpdateAdminAction).not.toHaveBeenCalled()
  })

  it('closes on cancel', async () => {
    const user = userEvent.setup()
    withLang(<EditAdminDialog admin={ADMIN} onSuccess={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByText(en.admin.editAdmin)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(screen.queryByText(en.admin.editAdmin)).not.toBeInTheDocument())
  })
})

describe('ProvidersTable', () => {
  const PROVIDERS = [
    { name: 'changelog', displayName: 'Changelog', flux_approval: 'auto' as const },
    { name: 'scrap', displayName: 'Web scraping', flux_approval: 'manual' as const },
  ]

  it('shows the empty state', () => {
    withLang(<ProvidersTable providers={[]} />)
    expect(screen.getByText(pt.none)).toBeInTheDocument()
  })

  it('renders each provider with its current approval mode', () => {
    withLang(<ProvidersTable providers={PROVIDERS} />)
    expect(screen.getByText('Changelog')).toBeInTheDocument()
    expect(screen.getByText(pt.auto)).toBeInTheDocument()
    expect(screen.getByText(pt.onApproval)).toBeInTheDocument()
  })

  it('flips an auto provider to manual and refreshes', async () => {
    const user = userEvent.setup()
    withLang(<ProvidersTable providers={PROVIDERS} />)

    await user.click(screen.getByRole('button', { name: pt.switchToApproval }))

    await waitFor(() =>
      expect(actions.adminSetProviderApprovalAction).toHaveBeenCalledWith('changelog', 'manual'),
    )
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it('flips a manual provider back to auto', async () => {
    const user = userEvent.setup()
    withLang(<ProvidersTable providers={PROVIDERS} />)

    await user.click(screen.getByRole('button', { name: pt.switchToAuto }))

    await waitFor(() =>
      expect(actions.adminSetProviderApprovalAction).toHaveBeenCalledWith('scrap', 'auto'),
    )
  })

  it('surfaces the server error and does not refresh', async () => {
    actions.adminSetProviderApprovalAction.mockResolvedValue({ error: 'Nope' })
    const user = userEvent.setup()
    withLang(<ProvidersTable providers={PROVIDERS} />)

    await user.click(screen.getByRole('button', { name: pt.switchToApproval }))

    expect(await screen.findByText('Nope')).toBeInTheDocument()
    expect(refresh).not.toHaveBeenCalled()
  })
})
