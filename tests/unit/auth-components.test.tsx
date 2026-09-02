import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { LoginPageContent } from '@/components/auth/LoginPageContent'
import { RegisterPageContent } from '@/components/auth/RegisterPageContent'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'
import { AdminLoginContent } from '@/components/admin/AdminLoginContent'
import { LanguageProvider } from '@/context/LanguageContext'
import { en } from '@/lib/translations'

const al = en.admin.login

const loginAction = vi.fn()
const registerAction = vi.fn()
const adminLoginAction = vi.fn()
vi.mock('@/lib/auth-actions', () => ({
  loginAction: (...a: unknown[]) => loginAction(...a),
  registerAction: (...a: unknown[]) => registerAction(...a),
  adminLoginAction: (...a: unknown[]) => adminLoginAction(...a),
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

vi.mock('@/lib/settings-actions', () => ({
  setApiUrlAction: vi.fn().mockResolvedValue({}),
  resetApiUrlAction: vi.fn().mockResolvedValue(undefined),
}))

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
    renderWithLang(<OAuthButtons apiUrl="https://api.test" />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs.some((h) => h?.includes('google'))).toBe(true)
    expect(hrefs.some((h) => h?.includes('github'))).toBe(true)
  })

  it('renders only the providers it is told to', () => {
    renderWithLang(
      <OAuthButtons apiUrl="https://api.test" providers={{ github: true, google: false }} />,
    )
    const hrefs = screen.getAllByRole('link').map((l) => l.getAttribute('href'))
    expect(hrefs.some((h) => h?.includes('github'))).toBe(true)
    expect(hrefs.some((h) => h?.includes('google'))).toBe(false)
  })

  it('renders nothing when neither provider is offered', () => {
    const { container } = renderWithLang(
      <OAuthButtons apiUrl="https://api.test" providers={{ github: false, google: false }} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})

const noOAuth = {
  registrationMode: 'open' as const,
  emailPassword: true,
  oauth: { github: false, google: false },
}

describe('LoginPageContent', () => {
  it('renders the form and a link to registration', () => {
    renderWithLang(<LoginPageContent apiUrl="https://api.test" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/register',
    )
  })

  it('drops the OAuth block when the instance offers no provider', () => {
    renderWithLang(<LoginPageContent apiUrl="https://api.test" config={noOAuth} />)
    expect(screen.queryByRole('link', { name: /GitHub/i })).not.toBeInTheDocument()
    expect(screen.queryByText('or')).not.toBeInTheDocument()
  })

  it('reveals the server field behind the host line', async () => {
    const user = userEvent.setup()
    renderWithLang(<LoginPageContent apiUrl="https://api.test" />)

    expect(screen.queryByLabelText('API URL')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Server · api\.test/ }))
    expect(screen.getByLabelText('API URL')).toBeInTheDocument()
  })

  it('shows the raw string when the API URL is not a URL', () => {
    renderWithLang(<LoginPageContent apiUrl="not-a-url" />)
    expect(screen.getByRole('button', { name: /Server · not-a-url/ })).toBeInTheDocument()
  })
})

describe('RegisterPageContent', () => {
  it('renders the form and a link to sign in', () => {
    renderWithLang(<RegisterPageContent apiUrl="https://api.test" />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
  })

  it('warns about admin approval when the instance requires it', () => {
    renderWithLang(
      <RegisterPageContent
        apiUrl="https://api.test"
        config={{ ...noOAuth, oauth: { github: true, google: true }, registrationMode: 'approval' }}
      />,
    )
    expect(
      screen.getByText(
        'Your account will need an administrator to approve it before you can sign in.',
      ),
    ).toBeInTheDocument()
  })
})

describe('AdminLoginForm', () => {
  it('submits the admin credentials (e-mail carried in the username field)', async () => {
    const user = userEvent.setup()
    renderWithLang(<AdminLoginForm />)

    await user.type(screen.getByLabelText(en.admin.email), 'root@example.com')
    await user.type(screen.getByLabelText(al.password), 'secret')
    await user.click(screen.getByRole('button', { name: al.submit }))

    await waitFor(() => expect(adminLoginAction).toHaveBeenCalledWith('root@example.com', 'secret'))
  })

  it('requires both fields', async () => {
    const user = userEvent.setup()
    renderWithLang(<AdminLoginForm />)

    await user.click(screen.getByRole('button', { name: al.submit }))

    expect(await screen.findByText(al.emailInvalid)).toBeInTheDocument()
    expect(screen.getByText(al.passwordRequired)).toBeInTheDocument()
    expect(adminLoginAction).not.toHaveBeenCalled()
  })

  it('surfaces the server error', async () => {
    adminLoginAction.mockResolvedValue({ error: 'Identifiants incorrects.' })
    const user = userEvent.setup()
    renderWithLang(<AdminLoginForm />)

    await user.type(screen.getByLabelText(en.admin.email), 'root@example.com')
    await user.type(screen.getByLabelText(al.password), 'bad')
    await user.click(screen.getByRole('button', { name: al.submit }))

    expect(await screen.findByText('Identifiants incorrects.')).toBeInTheDocument()
  })
})

describe('AdminLoginContent', () => {
  it('shows the login form, the language switcher, and reveals the API URL field behind the host line', async () => {
    const user = userEvent.setup()
    renderWithLang(<AdminLoginContent apiUrl="https://api.test" />)

    expect(screen.getByRole('button', { name: al.submit })).toBeInTheDocument()
    expect(screen.getByLabelText(en.common.language)).toBeInTheDocument()

    expect(screen.queryByLabelText('API URL')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Server · api\.test/ }))
    expect(screen.getByLabelText('API URL')).toBeInTheDocument()
  })
})
