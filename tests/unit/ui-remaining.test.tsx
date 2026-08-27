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
import { FeedItemList } from '@/components/feed/FeedItemList'
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

describe('FeedItemList entry variants', () => {
  it('links a changelog entry to its release when the repo is known', () => {
    const item = {
      id: 1,
      repository_id: 1,
      content: '## Notes\r\nline',
      datetime: '2026-03-01T10:00:00Z',
      executed_at: '2026-03-01T11:00:00Z',
      success: true,
      version: 'v1.0.0',
    }
    withLang(
      <FeedItemList
        items={[item]}
        provider="changelog"
        repositories={[{ repository_id: 1, url: 'https://github.com/a/b' }]}
      />,
    )

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://github.com/a/b/releases/tag/v1.0.0',
    )
  })

  it('renders a changelog entry without a link when the repo is unknown', () => {
    const item = {
      id: 1,
      repository_id: 99,
      content: '',
      datetime: null,
      executed_at: '2026-03-01T11:00:00Z',
      success: true,
      version: 'v1.0.0',
    }
    withLang(<FeedItemList items={[item]} provider="changelog" />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('v1.0.0')).toBeInTheDocument()
  })

  it('sorts items newest first', () => {
    const mk = (id: number, datetime: string) => ({
      id,
      repository_id: 1,
      content: `body ${id}`,
      datetime,
      executed_at: datetime,
      success: true,
      version: `v${id}`,
    })
    withLang(
      <FeedItemList
        items={[mk(1, '2026-03-01T00:00:00Z'), mk(2, '2026-03-05T00:00:00Z')]}
        provider="changelog"
      />,
    )

    const versions = screen.getAllByText(/^v[12]$/).map((el) => el.textContent)
    expect(versions).toEqual(['v2', 'v1'])
  })

  it('renders a youtube entry with a thumbnail and video link', () => {
    const item = {
      id: 2,
      repository_id: 2,
      version: 'vid',
      content: JSON.stringify({
        title: 'Video title',
        thumbnail: 'https://img.example.com/t.jpg',
        url: 'https://youtube.com/@chan',
        link: 'https://youtube.com/watch?v=vid',
      }),
      datetime: '2026-03-02T10:00:00Z',
      executed_at: '2026-03-02T11:00:00Z',
      success: true,
    }
    withLang(<FeedItemList items={[item]} provider="youtube" />)

    expect(screen.getByAltText('Video title')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://youtube.com/watch?v=vid')
  })

  it('renders a youtube entry without a thumbnail or link', () => {
    const item = {
      id: 2,
      repository_id: 2,
      version: 'vid',
      content: 'not json',
      datetime: null,
      executed_at: '2026-03-02T11:00:00Z',
      success: true,
    }
    withLang(<FeedItemList items={[item]} provider="youtube" />)

    expect(screen.getByText('Untitled')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders an rss entry with a link and summary', () => {
    const item = {
      id: 3,
      repository_id: 3,
      content: JSON.stringify({
        version: 'e',
        title: 'Post title',
        link: 'https://blog.dev/post',
        summary: '<p>Summary text</p>',
      }),
      datetime: '2026-03-03T10:00:00Z',
      executed_at: '2026-03-03T11:00:00Z',
      success: true,
    }
    withLang(<FeedItemList items={[item]} provider="rss" />)

    expect(screen.getByText('Post title')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://blog.dev/post')
  })

  it('renders an rss entry with unparseable content', () => {
    const item = {
      id: 3,
      repository_id: 3,
      content: 'nope',
      datetime: null,
      executed_at: '2026-03-03T11:00:00Z',
      success: true,
    }
    withLang(<FeedItemList items={[item]} provider="rss" />)
    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })

  it('renders a scrap entry from stringified params', () => {
    const item = {
      id: 4,
      repository_id: 4,
      content: 'Scraped text',
      params: JSON.stringify({ url: 'https://scraped.dev/page' }),
      executed_at: '2026-03-04T11:00:00Z',
      success: true,
    }
    withLang(<FeedItemList items={[item]} provider="scrap" />)
    expect(screen.getByText(/Scraped text/)).toBeInTheDocument()
  })

  it('renders a scrap entry with unparseable params', () => {
    const item = {
      id: 4,
      repository_id: 4,
      content: 'Scraped text',
      params: 'not json',
      executed_at: '2026-03-04T11:00:00Z',
      success: true,
    }
    withLang(<FeedItemList items={[item]} provider="scrap" />)
    expect(screen.getByText(/Scraped text/)).toBeInTheDocument()
  })
})
