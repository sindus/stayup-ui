import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangeEmailForm } from '@/components/profile/ChangeEmailForm'
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm'
import { LanguageProvider } from '@/context/LanguageContext'

const updateProfileAction = vi.fn()
vi.mock('@/lib/auth-actions', () => ({
  updateProfileAction: (data: unknown) => updateProfileAction(data),
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

function renderWithLang(ui: React.ReactElement) {
  return render(<LanguageProvider initialLang="en">{ui}</LanguageProvider>)
}

beforeEach(() => {
  vi.clearAllMocks()
  updateProfileAction.mockResolvedValue({})
})

describe('ChangeEmailForm', () => {
  it('prefills the current email', () => {
    renderWithLang(<ChangeEmailForm currentEmail="ada@example.com" />)
    expect(screen.getByLabelText('New email address')).toHaveValue('ada@example.com')
  })

  it('submits the new email and shows a success message', async () => {
    const user = userEvent.setup()
    renderWithLang(<ChangeEmailForm currentEmail="ada@example.com" />)

    const input = screen.getByLabelText('New email address')
    await user.clear(input)
    await user.type(input, 'new@example.com')
    await user.click(screen.getByRole('button', { name: 'Update email' }))

    await waitFor(() =>
      expect(updateProfileAction).toHaveBeenCalledWith({ email: 'new@example.com' }),
    )
    expect(await screen.findByText('Email address updated.')).toBeInTheDocument()
  })

  // `ada@localhost` satisfies the native type="email" check but not zod's
  // stricter rule, so it reaches the resolver instead of being blocked by the
  // browser first.
  it('rejects an invalid email without calling the action', async () => {
    const user = userEvent.setup()
    renderWithLang(<ChangeEmailForm currentEmail="ada@example.com" />)

    const input = screen.getByLabelText('New email address')
    await user.clear(input)
    await user.type(input, 'ada@localhost')
    await user.click(screen.getByRole('button', { name: 'Update email' }))

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument()
    expect(updateProfileAction).not.toHaveBeenCalled()
  })

  it('does not submit a value the browser rejects outright', async () => {
    const user = userEvent.setup()
    renderWithLang(<ChangeEmailForm currentEmail="ada@example.com" />)

    const input = screen.getByLabelText('New email address')
    await user.clear(input)
    await user.type(input, 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Update email' }))

    expect(updateProfileAction).not.toHaveBeenCalled()
  })

  it('surfaces the server error', async () => {
    updateProfileAction.mockResolvedValue({ error: 'Email already taken' })
    const user = userEvent.setup()
    renderWithLang(<ChangeEmailForm currentEmail="ada@example.com" />)

    await user.click(screen.getByRole('button', { name: 'Update email' }))
    expect(await screen.findByText('Email already taken')).toBeInTheDocument()
  })
})

describe('ChangePasswordForm', () => {
  it('changes the password and clears the fields', async () => {
    const user = userEvent.setup()
    renderWithLang(<ChangePasswordForm />)

    await user.type(screen.getByLabelText('New password'), 'longenough1')
    await user.type(screen.getByLabelText('Confirm new password'), 'longenough1')
    await user.click(screen.getByRole('button', { name: 'Change password' }))

    await waitFor(() =>
      expect(updateProfileAction).toHaveBeenCalledWith({ password: 'longenough1' }),
    )
    await waitFor(() => expect(screen.getByLabelText('New password')).toHaveValue(''))
  })

  it('rejects a password shorter than 8 characters', async () => {
    const user = userEvent.setup()
    renderWithLang(<ChangePasswordForm />)

    await user.type(screen.getByLabelText('New password'), 'short')
    await user.type(screen.getByLabelText('Confirm new password'), 'short')
    await user.click(screen.getByRole('button', { name: 'Change password' }))

    expect(await screen.findByText('Password too short (min. 8 characters)')).toBeInTheDocument()
    expect(updateProfileAction).not.toHaveBeenCalled()
  })

  it('rejects mismatched passwords', async () => {
    const user = userEvent.setup()
    renderWithLang(<ChangePasswordForm />)

    await user.type(screen.getByLabelText('New password'), 'longenough1')
    await user.type(screen.getByLabelText('Confirm new password'), 'different123')
    await user.click(screen.getByRole('button', { name: 'Change password' }))

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument()
    expect(updateProfileAction).not.toHaveBeenCalled()
  })

  it('surfaces the server error', async () => {
    updateProfileAction.mockResolvedValue({ error: 'Too weak' })
    const user = userEvent.setup()
    renderWithLang(<ChangePasswordForm />)

    await user.type(screen.getByLabelText('New password'), 'longenough1')
    await user.type(screen.getByLabelText('Confirm new password'), 'longenough1')
    await user.click(screen.getByRole('button', { name: 'Change password' }))

    expect(await screen.findByText('Too weak')).toBeInTheDocument()
  })
})
