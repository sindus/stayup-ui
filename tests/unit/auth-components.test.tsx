import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { LoginPageContent } from '@/components/auth/LoginPageContent'
import { RegisterPageContent } from '@/components/auth/RegisterPageContent'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'
import { LanguageProvider } from '@/context/LanguageContext'

const loginAction = vi.fn()
const registerAction = vi.fn()
const adminLoginAction = vi.fn()
vi.mock('@/lib/auth-actions', () => ({
  loginAction: (...a: unknown[]) => loginAction(...a),
  registerAction: (...a: unknown[]) => registerAction(...a),
  adminLoginAction: (...a: unknown[]) => adminLoginAction(...a),
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

function renderWithLang(ui: React.ReactElement) {
  return render(<LanguageProvider initialLang="en">{ui}</LanguageProvider>)
}

beforeEach(() => {
  vi.clearAllMocks()
  loginAction.mockResolvedValue(undefined)
  registerAction.mockResolvedValue(undefined)
  adminLoginAction.mockResolvedValue(undefined)
})

describe('LoginForm', () => {
  it('submits email and password', async () => {
    const user = userEvent.setup()
    renderWithLang(<LoginForm />)

    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(loginAction).toHaveBeenCalledWith('ada@example.com', 'secret'))
  })

  it('shows a validation error for an empty password', async () => {
    const user = userEvent.setup()
    renderWithLang(<LoginForm />)

    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Password is required')).toBeInTheDocument()
    expect(loginAction).not.toHaveBeenCalled()
  })

  it('surfaces the server error', async () => {
    loginAction.mockResolvedValue({ error: 'Wrong credentials' })
    const user = userEvent.setup()
    renderWithLang(<LoginForm />)

    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Wrong credentials')).toBeInTheDocument()
  })
})

describe('RegisterForm', () => {
  it('submits name, email and password', async () => {
    const user = userEvent.setup()
    renderWithLang(<RegisterForm />)

    await user.type(screen.getByLabelText('Name'), 'Ada')
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'longenough1')
    const confirm = screen.queryByLabelText('Confirm password')
    if (confirm) await user.type(confirm, 'longenough1')

    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() =>
      expect(registerAction).toHaveBeenCalledWith('Ada', 'ada@example.com', 'longenough1'),
    )
  })

  it('surfaces the server error', async () => {
    registerAction.mockResolvedValue({ error: 'Email already used' })
    const user = userEvent.setup()
    renderWithLang(<RegisterForm />)

    await user.type(screen.getByLabelText('Name'), 'Ada')
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'longenough1')
    const confirm = screen.queryByLabelText('Confirm password')
    if (confirm) await user.type(confirm, 'longenough1')

    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Email already used')).toBeInTheDocument()
  })

  it('rejects a too-short password', async () => {
    const user = userEvent.setup()
    renderWithLang(<RegisterForm />)

    await user.type(screen.getByLabelText('Name'), 'Ada')
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'short')
    const confirm = screen.queryByLabelText('Confirm password')
    if (confirm) await user.type(confirm, 'short')

    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(registerAction).not.toHaveBeenCalled()
  })
})

describe('OAuthButtons', () => {
  it('links to the Google and GitHub providers', () => {
    renderWithLang(<OAuthButtons />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs.some((h) => h?.includes('google'))).toBe(true)
    expect(hrefs.some((h) => h?.includes('github'))).toBe(true)
  })
})

describe('LoginPageContent', () => {
  it('renders the form and a link to registration', () => {
    renderWithLang(<LoginPageContent />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/register',
    )
  })
})

describe('RegisterPageContent', () => {
  it('renders the form and a link to sign in', () => {
    renderWithLang(<RegisterPageContent />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
  })
})

describe('AdminLoginForm', () => {
  it('submits the admin credentials', async () => {
    const user = userEvent.setup()
    render(<AdminLoginForm />)

    await user.type(screen.getByLabelText('Identifiant'), 'root')
    await user.type(screen.getByLabelText('Mot de passe'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    await waitFor(() => expect(adminLoginAction).toHaveBeenCalledWith('root', 'secret'))
  })

  it('requires both fields', async () => {
    const user = userEvent.setup()
    render(<AdminLoginForm />)

    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(await screen.findByText('Identifiant requis')).toBeInTheDocument()
    expect(screen.getByText('Mot de passe requis')).toBeInTheDocument()
    expect(adminLoginAction).not.toHaveBeenCalled()
  })

  it('surfaces the server error', async () => {
    adminLoginAction.mockResolvedValue({ error: 'Identifiants incorrects.' })
    const user = userEvent.setup()
    render(<AdminLoginForm />)

    await user.type(screen.getByLabelText('Identifiant'), 'root')
    await user.type(screen.getByLabelText('Mot de passe'), 'bad')
    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(await screen.findByText('Identifiants incorrects.')).toBeInTheDocument()
  })
})
