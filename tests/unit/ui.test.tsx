import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge, badgeVariants } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { LanguageProvider } from '@/context/LanguageContext'

const setTheme = vi.fn()
const useThemeMock = vi.fn(() => ({ theme: 'dark', setTheme }))
vi.mock('next-themes', () => ({
  useTheme: () => useThemeMock(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="next-themes">{children}</div>
  ),
}))

const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

beforeEach(() => {
  vi.clearAllMocks()
  useThemeMock.mockReturnValue({ theme: 'dark', setTheme })
})

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>new</Badge>)
    expect(screen.getByText('new')).toBeInTheDocument()
  })

  it('applies the default variant classes', () => {
    render(<Badge>x</Badge>)
    expect(screen.getByText('x').className).toContain('bg-primary/10')
  })

  it.each([
    'changelog',
    'youtube',
    'rss',
    'scrap',
    'success',
    'warning',
    'secondary',
    'outline',
    'destructive',
  ] as const)('supports the %s variant', (variant) => {
    render(<Badge variant={variant}>{variant}</Badge>)
    expect(screen.getByText(variant)).toBeInTheDocument()
  })

  it('merges a custom className', () => {
    render(<Badge className="custom-badge">y</Badge>)
    expect(screen.getByText('y').className).toContain('custom-badge')
  })

  it('exposes badgeVariants as a class builder', () => {
    expect(badgeVariants({ variant: 'youtube' })).toContain('var(--rose)')
  })
})

describe('Button', () => {
  it('renders a button element by default', () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument()
  })

  it('calls onClick', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={onClick}>Go</Button>)

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    )

    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it.each(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const)(
    'supports the %s variant',
    (variant) => {
      render(<Button variant={variant}>{variant}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    },
  )

  it.each(['default', 'sm', 'lg', 'icon'] as const)('supports the %s size', (size) => {
    render(<Button size={size}>x</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders its child element when asChild is set', () => {
    render(
      <Button asChild>
        <a href="/somewhere">Link</a>
      </Button>,
    )
    expect(screen.getByRole('link', { name: 'Link' })).toHaveAttribute('href', '/somewhere')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('forwards a ref', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Button ref={ref}>x</Button>)
    expect(ref.current?.tagName).toBe('BUTTON')
  })

  it('exposes buttonVariants as a class builder', () => {
    expect(buttonVariants({ variant: 'ghost', size: 'sm' })).toContain('h-8')
  })
})

describe('Card', () => {
  it('renders the full composition', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )

    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('merges custom classNames on every part', () => {
    render(
      <Card className="c">
        <CardHeader className="h">
          <CardTitle className="t">T</CardTitle>
          <CardDescription className="d">D</CardDescription>
        </CardHeader>
        <CardContent className="ct">C</CardContent>
        <CardFooter className="f">F</CardFooter>
      </Card>,
    )

    expect(screen.getByText('T').className).toContain('t')
    expect(screen.getByText('D').className).toContain('d')
    expect(screen.getByText('C').className).toContain('ct')
    expect(screen.getByText('F').className).toContain('f')
  })
})

describe('Input', () => {
  it('accepts typed text', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Email" />)

    await user.type(screen.getByPlaceholderText('Email'), 'ada@example.com')
    expect(screen.getByPlaceholderText('Email')).toHaveValue('ada@example.com')
  })

  it('forwards the type attribute', () => {
    render(<Input type="password" data-testid="pw" />)
    expect(screen.getByTestId('pw')).toHaveAttribute('type', 'password')
  })

  it('merges a custom className', () => {
    render(<Input className="custom-input" data-testid="i" />)
    expect(screen.getByTestId('i').className).toContain('custom-input')
  })
})

describe('Label', () => {
  it('associates with its control', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <Input id="email" />
      </>,
    )
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })
})

describe('Separator', () => {
  it('renders horizontally by default', () => {
    render(<Separator data-testid="sep" />)
    expect(screen.getByTestId('sep').className).toContain('h-[1px]')
  })

  it('renders vertically when asked', () => {
    render(<Separator orientation="vertical" data-testid="sep" />)
    expect(screen.getByTestId('sep').className).toContain('w-[1px]')
  })
})

describe('Table', () => {
  it('renders the full composition', () => {
    render(
      <Table>
        <TableCaption>Caption</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    )

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Caption')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Ada' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Total' })).toBeInTheDocument()
  })
})

describe('Avatar', () => {
  it('renders the fallback when no image loads', () => {
    render(
      <Avatar>
        <AvatarFallback>AD</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText('AD')).toBeInTheDocument()
  })
})

describe('ThemeToggle', () => {
  it('switches from dark to light', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('button', { name: 'Basculer le thème' }))
    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('switches from light to dark', async () => {
    useThemeMock.mockReturnValue({ theme: 'light', setTheme })
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('button', { name: 'Basculer le thème' }))
    expect(setTheme).toHaveBeenCalledWith('dark')
  })
})

describe('LanguageSwitcher', () => {
  function renderSwitcher(initialLang: 'fr' | 'en' = 'fr') {
    return render(
      <LanguageProvider initialLang={initialLang}>
        <LanguageSwitcher />
      </LanguageProvider>,
    )
  }

  it('renders one button per language', () => {
    renderSwitcher()
    expect(screen.getByRole('button', { name: 'Français' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
  })

  it('highlights the active language', () => {
    renderSwitcher('fr')
    expect(screen.getByRole('button', { name: 'Français' }).className).toContain('opacity-100')
    expect(screen.getByRole('button', { name: 'English' }).className).toContain('opacity-35')
  })

  it('switches language on click', async () => {
    const user = userEvent.setup()
    renderSwitcher('fr')

    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(screen.getByRole('button', { name: 'English' }).className).toContain('opacity-100')
    expect(refresh).toHaveBeenCalled()
  })
})

describe('ThemeProvider', () => {
  it('renders its children through next-themes', () => {
    render(
      <ThemeProvider attribute="class">
        <span>child</span>
      </ThemeProvider>,
    )
    expect(screen.getByTestId('next-themes')).toBeInTheDocument()
    expect(screen.getByText('child')).toBeInTheDocument()
  })
})
