import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navbar } from '@/components/layout/Navbar'
import { UserMenu } from '@/components/layout/UserMenu'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { CtaButtons } from '@/components/landing/CtaButtons'
import { DownloadSection } from '@/components/landing/DownloadSection'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { LanguageProvider } from '@/context/LanguageContext'

const logoutAction = vi.fn()
vi.mock('@/lib/auth-actions', () => ({ logoutAction: () => logoutAction() }))

let pathname = '/feed'
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useRouter: () => ({ refresh: vi.fn() }),
}))

const USER = { id: 'u1', name: 'Ada Lovelace', email: 'ada@example.com' }

function renderWithLang(ui: React.ReactElement, lang: 'fr' | 'en' = 'en') {
  return render(<LanguageProvider initialLang={lang}>{ui}</LanguageProvider>)
}

beforeEach(() => {
  vi.clearAllMocks()
  pathname = '/feed'
})

describe('Navbar', () => {
  it('renders the feed tab', () => {
    renderWithLang(<Navbar user={USER} />)
    expect(screen.getByRole('link', { name: 'My feed' })).toHaveAttribute('href', '/feed')
  })

  it('no longer renders a documentation tab', () => {
    renderWithLang(<Navbar user={USER} />)
    expect(screen.queryByRole('link', { name: /documentation/i })).not.toBeInTheDocument()
  })

  it('marks the active tab', () => {
    renderWithLang(<Navbar user={USER} />)
    expect(screen.getByRole('link', { name: 'My feed' }).className).toContain('font-medium')
  })

  it('treats a nested feed route as active', () => {
    pathname = '/feed/flux/3'
    renderWithLang(<Navbar user={USER} />)
    expect(screen.getByRole('link', { name: 'My feed' }).className).toContain('font-medium')
  })

  it('does not mark the tab active on another route', () => {
    pathname = '/profile'
    renderWithLang(<Navbar user={USER} />)
    expect(screen.getByRole('link', { name: 'My feed' }).className).toContain(
      'text-muted-foreground',
    )
  })

  it('shows the user initial', () => {
    renderWithLang(<Navbar user={USER} />)
    expect(screen.getByTitle('Ada Lovelace')).toHaveTextContent('A')
  })

  it('exposes the language switcher', () => {
    renderWithLang(<Navbar user={USER} />)
    expect(screen.getByLabelText('Language')).toBeInTheDocument()
  })

  it('shows no server status dots without a server list', () => {
    renderWithLang(<Navbar user={USER} />)
    expect(screen.queryByRole('group', { name: 'Server status' })).not.toBeInTheDocument()
  })

  it('shows one status dot per server, linking to the profile', () => {
    renderWithLang(
      <Navbar
        user={USER}
        servers={[
          { id: 'a', name: 'Alpha', expired: false },
          { id: 'b', name: 'Beta', expired: true },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Alpha — Connected' })).toHaveAttribute(
      'href',
      '/profile',
    )
    expect(screen.getByRole('link', { name: 'Beta — Disconnected' })).toHaveAttribute(
      'href',
      '/profile',
    )
  })

  // Navbar's `?? '?'` initial fallback is unreachable in practice: UserMenu,
  // rendered alongside it, calls user.name.split() and throws first. An empty
  // name therefore renders an empty initial rather than '?'.
  it('renders an empty initial for an empty name', () => {
    renderWithLang(<Navbar user={{ ...USER, name: '' }} />)
    expect(screen.getByTitle('').textContent).toBe('')
  })
})

describe('UserMenu', () => {
  it('renders the initials of a two-word name', () => {
    renderWithLang(<UserMenu user={USER} />)
    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('opens the menu and shows the profile link and sign out', async () => {
    const user = userEvent.setup()
    renderWithLang(<UserMenu user={USER} />)

    await user.click(screen.getByTestId('user-menu-trigger'))

    expect(await screen.findByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'My profile' })).toHaveAttribute('href', '/profile')
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toBeInTheDocument()
  })

  it('calls logoutAction when signing out', async () => {
    const user = userEvent.setup()
    renderWithLang(<UserMenu user={USER} />)

    await user.click(screen.getByTestId('user-menu-trigger'))
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }))

    expect(logoutAction).toHaveBeenCalled()
  })
})

describe('LandingHeader', () => {
  // Ancres absolues : l'en-tête sert aussi la page de doc, où ces sections
  // n'existent pas — une ancre nue n'y menait nulle part.
  it('links to the features and download anchors on the landing page', () => {
    renderWithLang(<LandingHeader />)
    expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute('href', '/#features')
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute('href', '/#download')
  })

  // Le lien mène à l'index des parcours, pas directement à l'auto-hébergement :
  // quelqu'un qui vient écrire un provider n'a rien à y faire.
  it('links to the documentation index', () => {
    renderWithLang(<LandingHeader />)
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs')
  })

  it('exposes the sign-in and start links', () => {
    renderWithLang(<LandingHeader />)
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/register')
  })

  it('adds a solid background once scrolled', async () => {
    renderWithLang(<LandingHeader />)
    const header = document.querySelector('header')!
    expect(header.style.background).toBe('')

    window.scrollY = 100
    window.dispatchEvent(new Event('scroll'))

    await vi.waitFor(() => expect(header.style.background).not.toBe(''))
    window.scrollY = 0
  })

  // Sur mobile la nav et les CTA sont repliés derrière un bouton : sans lui,
  // un téléphone n'a aucun accès aux liens ni à « Commencer ».
  it('folds the navigation into a toggle for small screens', async () => {
    const user = userEvent.setup()
    renderWithLang(<LandingHeader />)

    const toggle = screen.getByRole('button', { name: 'Menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    // Les liens existent alors en double : barre desktop + panneau mobile.
    expect(screen.getAllByRole('link', { name: 'Features' })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'Get started' })).toHaveLength(2)

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByRole('link', { name: 'Features' })).toHaveLength(1)
  })

  // Ouvrir le menu sur mobile puis élargir la fenêtre ne doit pas laisser le
  // panneau ouvert par-dessus la mise en page desktop.
  it('closes the mobile menu when the viewport grows back to desktop', async () => {
    const user = userEvent.setup()
    const original = window.innerWidth
    window.innerWidth = 500
    renderWithLang(<LandingHeader />)

    const toggle = screen.getByRole('button', { name: 'Menu' })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    window.innerWidth = 900
    window.dispatchEvent(new Event('resize'))

    await vi.waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'false'))
    window.innerWidth = original
  })
})

describe('HeroSection', () => {
  it('shows the default version in the badge', () => {
    renderWithLang(<HeroSection />)
    expect(screen.getByText(/0\.3\.8/)).toBeInTheDocument()
  })

  it('shows a supplied version', () => {
    renderWithLang(<HeroSection version="1.2.3" />)
    expect(screen.getByText(/1\.2\.3/)).toBeInTheDocument()
  })

  it('links to the feed when signed in', () => {
    renderWithLang(<HeroSection isLoggedIn />)
    const feedLinks = screen.getAllByRole('link').filter((l) => l.getAttribute('href') === '/feed')
    expect(feedLinks.length).toBeGreaterThan(0)
  })

  it('links to registration when signed out', () => {
    renderWithLang(<HeroSection />)
    const hrefs = screen.getAllByRole('link').map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('/register')
  })
})

describe('FeaturesSection', () => {
  it('renders one card per provider', () => {
    renderWithLang(<FeaturesSection />)
    expect(screen.getByRole('heading', { name: 'GitHub Changelog' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'YouTube Channels' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'RSS Feeds' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Web Scraping' })).toBeInTheDocument()
  })

  it('highlights and resets a card border on hover', async () => {
    const user = userEvent.setup()
    renderWithLang(<FeaturesSection />)

    const card = screen.getByRole('heading', { name: 'RSS Feeds' }).closest('div.group')!
    await user.hover(card)
    expect((card as HTMLElement).style.borderColor).toContain('color-mix')

    await user.unhover(card)
    expect((card as HTMLElement).style.borderColor).toBe('var(--border-subtle)')
  })
})

describe('CtaButtons', () => {
  it('shows a single feed CTA when signed in', () => {
    renderWithLang(<CtaButtons isLoggedIn />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/feed')
  })

  it('shows register and sign-in CTAs when signed out', () => {
    renderWithLang(<CtaButtons />)
    const hrefs = screen.getAllByRole('link').map((l) => l.getAttribute('href'))
    expect(hrefs).toEqual(['/register', '/login'])
  })
})

describe('DownloadSection', () => {
  it('offers a download link per desktop platform', () => {
    renderWithLang(<DownloadSection version="0.3.8" />)
    const hrefs = screen
      .getAllByRole('link')
      .map((l) => l.getAttribute('href'))
      .filter(Boolean) as string[]

    expect(hrefs.some((h) => h.endsWith('.dmg'))).toBe(true)
    expect(hrefs.some((h) => h.endsWith('.exe'))).toBe(true)
    expect(hrefs.some((h) => h.endsWith('.deb'))).toBe(true)
    expect(hrefs.some((h) => h.endsWith('.AppImage'))).toBe(true)
  })

  it('shows the package-manager commands', () => {
    renderWithLang(<DownloadSection version="0.3.8" />)
    expect(screen.getAllByText('brew install --cask stayup-app/tap/stayup').length).toBeGreaterThan(
      0,
    )
    expect(screen.getAllByText('sudo snap install stayup').length).toBeGreaterThan(0)
  })
})

describe('AdminSidebar', () => {
  it('lists users, feeds, providers and flux requests', () => {
    pathname = '/admin/users'
    render(<AdminSidebar />)
    expect(screen.getByRole('link', { name: 'Utilisateurs' })).toHaveAttribute(
      'href',
      '/admin/users',
    )
    expect(screen.getByRole('link', { name: 'Flux' })).toHaveAttribute(
      'href',
      '/admin/repositories',
    )
    expect(screen.getByRole('link', { name: 'Providers' })).toHaveAttribute(
      'href',
      '/admin/providers',
    )
    expect(screen.getByRole('link', { name: 'Demandes de flux' })).toHaveAttribute(
      'href',
      '/admin/flux-requests',
    )
    expect(screen.getByRole('link', { name: 'Bases de données' })).toHaveAttribute(
      'href',
      '/admin/data-sources',
    )
  })

  it('shows the Admins entry only for a super admin', () => {
    render(<AdminSidebar isSuper />)
    expect(screen.getByRole('link', { name: 'Admins' })).toHaveAttribute('href', '/admin/admins')
  })

  it('no longer lists a documentation entry', () => {
    render(<AdminSidebar />)
    expect(screen.queryByRole('link', { name: 'Documentation' })).not.toBeInTheDocument()
  })

  it('marks the active entry', () => {
    pathname = '/admin/users/u1'
    render(<AdminSidebar />)
    expect(screen.getByRole('link', { name: 'Utilisateurs' }).className).toContain('font-medium')
  })
})
