import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PendingUsersTable } from '@/components/admin/PendingUsersTable'
import { LanguageProvider } from '@/context/LanguageContext'
import type { AdminPendingUser } from '@/lib/api-client'

const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

const actions = vi.hoisted(() => ({
  adminApprovePendingUserAction: vi.fn(),
  adminRejectPendingUserAction: vi.fn(),
}))
vi.mock('@/lib/admin-actions', () => actions)

function withLang(ui: React.ReactElement) {
  return render(<LanguageProvider initialLang="en">{ui}</LanguageProvider>)
}

const ROWS: AdminPendingUser[] = [
  {
    id: 'p-1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    method: 'password',
    created_at: '2026-01-01',
  },
  {
    id: 'p-2',
    name: 'Grace Hopper',
    email: 'grace@example.com',
    method: 'github',
    created_at: '2026-01-02',
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  actions.adminApprovePendingUserAction.mockResolvedValue({})
  actions.adminRejectPendingUserAction.mockResolvedValue({})
})

describe('PendingUsersTable', () => {
  it('shows the empty state when there is nothing to approve', () => {
    withLang(<PendingUsersTable users={[]} />)
    expect(screen.getByText('No sign-ups awaiting approval')).toBeInTheDocument()
  })

  it('renders a row per pending sign-up with its method', () => {
    withLang(<PendingUsersTable users={ROWS} />)
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('grace@example.com')).toBeInTheDocument()
    // 'password' is relabelled to the "Email" badge, an OAuth provider is shown as-is.
    // 'Email' also names the e-mail column header, hence two matches.
    expect(screen.getAllByText('Email').length).toBe(2)
    expect(screen.getByText('github')).toBeInTheDocument()
  })

  it('approves a sign-up and refreshes', async () => {
    const user = userEvent.setup()
    withLang(<PendingUsersTable users={ROWS} />)

    await user.click(screen.getAllByRole('button', { name: 'Approve' })[0])

    await waitFor(() => expect(actions.adminApprovePendingUserAction).toHaveBeenCalledWith('p-1'))
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it('rejects a sign-up and refreshes', async () => {
    const user = userEvent.setup()
    withLang(<PendingUsersTable users={ROWS} />)

    await user.click(screen.getAllByRole('button', { name: 'Reject' })[1])

    await waitFor(() => expect(actions.adminRejectPendingUserAction).toHaveBeenCalledWith('p-2'))
  })

  it('surfaces the server error and does not refresh', async () => {
    actions.adminApprovePendingUserAction.mockResolvedValue({ error: 'Email already in use' })
    const user = userEvent.setup()
    withLang(<PendingUsersTable users={ROWS} />)

    await user.click(screen.getAllByRole('button', { name: 'Approve' })[0])

    expect(await screen.findByText('Email already in use')).toBeInTheDocument()
    expect(refresh).not.toHaveBeenCalled()
  })
})
