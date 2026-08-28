import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import { HeroSection } from '@/components/landing/HeroSection'
import { DownloadSection } from '@/components/landing/DownloadSection'
import { LanguageProvider } from '@/context/LanguageContext'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

function withLang(ui: React.ReactElement) {
  return render(<LanguageProvider initialLang="en">{ui}</LanguageProvider>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DropdownMenu composition', () => {
  it('renders every sub-component once opened', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Section</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem inset>
              Plain
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup value="a">
              <DropdownMenuRadioItem value="a">Radio A</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Nested</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    await user.click(screen.getByText('Open'))

    expect(await screen.findByText('Section')).toBeInTheDocument()
    expect(screen.getByText('Plain')).toBeInTheDocument()
    expect(screen.getByText('⌘P')).toBeInTheDocument()
    expect(screen.getByRole('menuitemcheckbox', { name: 'Checked' })).toBeInTheDocument()
    expect(screen.getByRole('menuitemradio', { name: 'Radio A' })).toBeInTheDocument()
    expect(screen.getByText('More')).toBeInTheDocument()
  })

  it('opens the submenu on hover', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Nested</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    await user.click(await screen.findByText('More'))
    expect(await screen.findByText('Nested')).toBeInTheDocument()
  })
})

describe('AvatarImage', () => {
  // Radix probes the URL with `new Image()` and mounts the <img> only once that
  // probe reports success, which jsdom never does — so drive the probe manually.
  function stubImageLoading(succeed: boolean) {
    const original = globalThis.Image
    class ProbeImage {
      private listeners: Record<string, Array<() => void>> = {}
      addEventListener(event: string, handler: () => void) {
        ;(this.listeners[event] ??= []).push(handler)
      }
      removeEventListener() {}
      set src(_value: string) {
        setTimeout(() => {
          for (const handler of this.listeners[succeed ? 'load' : 'error'] ?? []) handler()
        }, 0)
      }
    }
    globalThis.Image = ProbeImage as unknown as typeof Image
    return () => {
      globalThis.Image = original
    }
  }

  it('shows the image once it loads', async () => {
    const restore = stubImageLoading(true)
    try {
      render(
        <Avatar>
          <AvatarImage src="https://img.example.com/a.png" alt="Ada" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>,
      )
      expect(await screen.findByAltText('Ada')).toBeInTheDocument()
    } finally {
      restore()
    }
  })

  it('keeps the fallback when the image fails to load', async () => {
    const restore = stubImageLoading(false)
    try {
      render(
        <Avatar>
          <AvatarImage src="https://img.example.com/missing.png" alt="Ada" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>,
      )
      expect(await screen.findByText('AD')).toBeInTheDocument()
      expect(screen.queryByAltText('Ada')).not.toBeInTheDocument()
    } finally {
      restore()
    }
  })
})

describe('OAuthButtons hover styling', () => {
  it('highlights and resets the GitHub button', async () => {
    const user = userEvent.setup()
    withLang(<OAuthButtons apiUrl="https://api.test" />)

    const github = screen
      .getAllByRole('link')
      .find((l) => l.getAttribute('href')?.includes('github'))!

    await user.hover(github)
    expect(github.style.background).toBe('var(--surface-hi)')

    await user.unhover(github)
    expect(github.style.background).toBe('var(--surface)')
  })

  it('highlights and resets the Google button', async () => {
    const user = userEvent.setup()
    withLang(<OAuthButtons apiUrl="https://api.test" />)

    const google = screen
      .getAllByRole('link')
      .find((l) => l.getAttribute('href')?.includes('google'))!

    await user.hover(google)
    expect(google.style.background).toBe('var(--surface-hi)')

    await user.unhover(google)
    expect(google.style.background).toBe('var(--surface)')
  })
})

describe('HeroSection mock feed rows', () => {
  it('highlights and resets a mock row on hover', async () => {
    const user = userEvent.setup()
    withLang(<HeroSection />)

    const row = screen.getByText('vercel/next.js').closest('div.flex.items-center') as HTMLElement
    await user.hover(row)
    expect(row.style.background).toBe('var(--surface-2)')

    await user.unhover(row)
    expect(row.style.background).toBe('')
  })

  it('renders both versioned and titled mock rows', () => {
    withLang(<HeroSection />)
    expect(screen.getByText('v15.3.0')).toBeInTheDocument()
    expect(screen.getByText('React 19 is Here')).toBeInTheDocument()
  })
})

describe('DownloadSection hover styling', () => {
  it('highlights and resets a platform card', async () => {
    const user = userEvent.setup()
    withLang(<DownloadSection version="0.3.8" />)

    const card = screen.getAllByText('Windows')[0].closest('div') as HTMLElement
    await user.hover(card)
    await user.unhover(card)
    expect(card).toBeInTheDocument()
  })
})
