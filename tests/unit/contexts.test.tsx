import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReadProvider, useReadContext } from '@/context/FeedReadContext'
import { LanguageProvider, useLanguage } from '@/context/LanguageContext'
import type { TaggedItem } from '@/types'

const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

const LS_KEY = 'STAYUP_READ_ITEMS'

function item(id: number, provider: TaggedItem['provider'] = 'changelog'): TaggedItem {
  return { provider, item: { id } } as TaggedItem
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('FeedReadContext', () => {
  function Probe({ items = [] as TaggedItem[] }) {
    const { readIds, markRead, markAllRead } = useReadContext()
    return (
      <div>
        <span data-testid="ids">{[...readIds].sort().join(',')}</span>
        <button onClick={() => markRead(item(1))}>read one</button>
        <button onClick={() => markAllRead(items)}>read all</button>
      </div>
    )
  }

  it('starts with an empty read set', () => {
    render(
      <ReadProvider>
        <Probe />
      </ReadProvider>,
    )
    expect(screen.getByTestId('ids')).toHaveTextContent('')
  })

  it('hydrates the read set from localStorage', () => {
    localStorage.setItem(LS_KEY, JSON.stringify(['changelog:7']))
    render(
      <ReadProvider>
        <Probe />
      </ReadProvider>,
    )
    expect(screen.getByTestId('ids')).toHaveTextContent('changelog:7')
  })

  it('ignores malformed localStorage content', () => {
    localStorage.setItem(LS_KEY, 'not json')
    render(
      <ReadProvider>
        <Probe />
      </ReadProvider>,
    )
    expect(screen.getByTestId('ids')).toHaveTextContent('')
  })

  it('marks a single item read and persists it', async () => {
    const user = userEvent.setup()
    render(
      <ReadProvider>
        <Probe />
      </ReadProvider>,
    )

    await user.click(screen.getByText('read one'))

    expect(screen.getByTestId('ids')).toHaveTextContent('changelog:1')
    expect(JSON.parse(localStorage.getItem(LS_KEY)!)).toEqual(['changelog:1'])
  })

  it('keeps the same set when the item is already read', async () => {
    const user = userEvent.setup()
    render(
      <ReadProvider>
        <Probe />
      </ReadProvider>,
    )

    await user.click(screen.getByText('read one'))
    await user.click(screen.getByText('read one'))

    expect(JSON.parse(localStorage.getItem(LS_KEY)!)).toEqual(['changelog:1'])
  })

  it('marks every item read at once', async () => {
    const user = userEvent.setup()
    render(
      <ReadProvider>
        <Probe items={[item(1), item(2, 'youtube')]} />
      </ReadProvider>,
    )

    await user.click(screen.getByText('read all'))

    expect(screen.getByTestId('ids')).toHaveTextContent('changelog:1,youtube:2')
    expect(JSON.parse(localStorage.getItem(LS_KEY)!).sort()).toEqual(['changelog:1', 'youtube:2'])
  })

  it('survives a failing localStorage.setItem', async () => {
    const user = userEvent.setup()
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    render(
      <ReadProvider>
        <Probe items={[item(3)]} />
      </ReadProvider>,
    )

    await user.click(screen.getByText('read one'))
    await user.click(screen.getByText('read all'))
    expect(screen.getByTestId('ids')).toHaveTextContent('changelog:1,changelog:3')

    setItem.mockRestore()
  })

  it('exposes inert defaults outside a provider', () => {
    render(<Probe />)
    expect(screen.getByTestId('ids')).toHaveTextContent('')
  })
})

describe('LanguageContext', () => {
  function Probe() {
    const { lang, t, setLang } = useLanguage()
    return (
      <div>
        <span data-testid="lang">{lang}</span>
        <span data-testid="my-feed">{t.nav.myFeed}</span>
        <button onClick={() => setLang('en')}>en</button>
        <button onClick={() => setLang('fr')}>fr</button>
      </div>
    )
  }

  it('defaults to English', () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    )
    expect(screen.getByTestId('lang')).toHaveTextContent('en')
    expect(screen.getByTestId('my-feed')).toHaveTextContent('My feed')
  })

  it('honours the initial language', () => {
    render(
      <LanguageProvider initialLang="fr">
        <Probe />
      </LanguageProvider>,
    )
    expect(screen.getByTestId('my-feed')).toHaveTextContent('Mon flux')
  })

  it('switches dictionary, writes the cookie and refreshes the route', async () => {
    const user = userEvent.setup()
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    )

    await user.click(screen.getByText('fr'))

    expect(screen.getByTestId('lang')).toHaveTextContent('fr')
    expect(screen.getByTestId('my-feed')).toHaveTextContent('Mon flux')
    expect(document.cookie).toContain('lang=fr')
    expect(refresh).toHaveBeenCalled()
  })

  it('switches back to English', async () => {
    const user = userEvent.setup()
    render(
      <LanguageProvider initialLang="fr">
        <Probe />
      </LanguageProvider>,
    )

    await user.click(screen.getByText('en'))
    expect(screen.getByTestId('my-feed')).toHaveTextContent('My feed')
  })

  it('throws when used outside its provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow('useLanguage must be used within LanguageProvider')
    spy.mockRestore()
  })
})
