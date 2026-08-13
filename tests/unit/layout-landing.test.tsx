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
  it('links to the feed and the download anchor', () => {
    render(<LandingHeader />)
    expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute('href', '/feed')
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute('href', '#download')
  })

  it('no longer links to the documentation', () => {
    render(<LandingHeader />)
    expect(screen.queryByRole('link', { name: 'Docs' })).not.toBeInTheDocument()
  })

  it('exposes the sign-in and start links', () => {
    render(<LandingHeader />)
    expect(screen.getByRole('link', { name: 'Se connecter' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Commencer' })).toHaveAttribute('href', '/register')
  })

  it('adds a solid background once scrolled', async () => {
    render(<LandingHeader />)
    const header = document.querySelector('header')!
    expect(header.style.background).toBe('')

    window.scrollY = 100
    window.dispatchEvent(new Event('scroll'))

    await vi.waitFor(() => expect(header.style.background).not.toBe(''))
    window.scrollY = 0
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
    render(<FeaturesSection />)
    expect(screen.getByRole('heading', { name: 'GitHub Changelog' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Chaînes YouTube' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Flux RSS' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Web Scraping' })).toBeInTheDocument()
  })

  it('highlights and resets a card border on hover', async () => {
    const user = userEvent.setup()
    render(<FeaturesSection />)

    const card = screen.getByRole('heading', { name: 'Flux RSS' }).closest('div.group')!
    await user.hover(card)
    expect((card as HTMLElement).style.boxShadow).not.toBe('none')

    await user.unhover(card)
    expect((card as HTMLElement).style.boxShadow).toBe('none')
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
  it('lists users, feeds and scraping requests', () => {
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
    expect(screen.getByRole('link', { name: 'Demandes scrap' })).toHaveAttribute(
      'href',
      '/admin/scrap-requests',
    )
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
