import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataSourcesPanel } from '@/components/admin/DataSourcesPanel'
import { LanguageProvider } from '@/context/LanguageContext'
import { en } from '@/lib/translations'
import type { DataSourcesResponse } from '@/lib/api-client'

const d = en.admin.dataSources
const renderDS = (ui: React.ReactElement) =>
  render(<LanguageProvider initialLang="en">{ui}</LanguageProvider>)

const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

const actions = vi.hoisted(() => ({
  adminTestDataSourceAction: vi.fn(),
  adminAddDataSourceAction: vi.fn(),
  adminDeleteDataSourceAction: vi.fn(),
}))
vi.mock('@/lib/admin-actions', () => actions)

const DATA: DataSourcesResponse = {
  primary: { engine: 'postgres', host: 'db:5432' },
  sources: [
    {
      id: 1,
      name: 'Team feeds',
      engine: 'mysql',
      host: 'mysql.internal',
      created_at: '2026-02-01',
    },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  actions.adminTestDataSourceAction.mockResolvedValue({
    ok: true,
    engine: 'postgres',
    connectors: ['rss', 'youtube'],
  })
  actions.adminAddDataSourceAction.mockResolvedValue({})
  actions.adminDeleteDataSourceAction.mockResolvedValue({})
})

describe('DataSourcesPanel', () => {
  it('renders the primary info read-only and the secondary list', () => {
    renderDS(<DataSourcesPanel data={DATA} />)
    expect(screen.getByText(d.primary)).toBeInTheDocument()
    expect(screen.getByText('db:5432')).toBeInTheDocument()
    expect(screen.getByText('Team feeds')).toBeInTheDocument()
    expect(screen.getByText('mysql.internal')).toBeInTheDocument()
  })

  it('shows an error when the payload could not be loaded', () => {
    renderDS(<DataSourcesPanel data={null} />)
    expect(screen.getByText(d.loadError)).toBeInTheDocument()
  })

  it('tests a URL then confirms, only enabling confirm once a connector is found', async () => {
    const user = userEvent.setup()
    renderDS(<DataSourcesPanel data={{ ...DATA, sources: [] }} />)

    await user.click(screen.getByRole('button', { name: /Add a secondary database/ }))
    await user.type(screen.getByLabelText(d.name), 'New cluster')
    await user.type(screen.getByLabelText(d.connectionUrl), 'postgres://u:p@h/db')

    const confirm = screen.getByRole('button', { name: d.confirm })
    expect(confirm).toBeDisabled()

    await user.click(screen.getByRole('button', { name: d.test }))
    await waitFor(() => expect(screen.getByText(/Connectors found/)).toBeInTheDocument())
    expect(confirm).toBeEnabled()

    await user.click(confirm)
    await waitFor(() =>
      expect(actions.adminAddDataSourceAction).toHaveBeenCalledWith({
        name: 'New cluster',
        url: 'postgres://u:p@h/db',
      }),
    )
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it('keeps confirm disabled when the probe finds no connector table', async () => {
    actions.adminTestDataSourceAction.mockResolvedValue({
      ok: true,
      engine: 'postgres',
      connectors: [],
    })
    const user = userEvent.setup()
    renderDS(<DataSourcesPanel data={{ ...DATA, sources: [] }} />)

    await user.click(screen.getByRole('button', { name: /Add a secondary database/ }))
    await user.type(screen.getByLabelText(d.name), 'Empty')
    await user.type(screen.getByLabelText(d.connectionUrl), 'postgres://u:p@h/db')
    await user.click(screen.getByRole('button', { name: d.test }))

    await waitFor(() => expect(screen.getByText(/No connector_\* table/)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: d.confirm })).toBeDisabled()
  })

  it('surfaces a failed probe', async () => {
    actions.adminTestDataSourceAction.mockResolvedValue({ ok: false, error: 'unreachable' })
    const user = userEvent.setup()
    renderDS(<DataSourcesPanel data={{ ...DATA, sources: [] }} />)

    await user.click(screen.getByRole('button', { name: /Add a secondary database/ }))
    await user.type(screen.getByLabelText(d.connectionUrl), 'postgres://nope')
    await user.click(screen.getByRole('button', { name: d.test }))

    expect(await screen.findByText('unreachable')).toBeInTheDocument()
  })

  it('removes a secondary source after confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    renderDS(<DataSourcesPanel data={DATA} />)

    await user.click(screen.getByRole('button', { name: d.remove }))
    await waitFor(() => expect(actions.adminDeleteDataSourceAction).toHaveBeenCalledWith(1))
    await waitFor(() => expect(refresh).toHaveBeenCalled())
    confirmSpy.mockRestore()
  })

  it('does not remove when the confirmation is dismissed', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    renderDS(<DataSourcesPanel data={DATA} />)

    await user.click(screen.getByRole('button', { name: d.remove }))
    expect(actions.adminDeleteDataSourceAction).not.toHaveBeenCalled()
    confirmSpy.mockRestore()
  })
})
