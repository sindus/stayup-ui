import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataSourcesPanel } from '@/components/admin/DataSourcesPanel'
import type { DataSourcesResponse } from '@/lib/api-client'

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
    render(<DataSourcesPanel data={DATA} />)
    expect(screen.getByText('Base principale')).toBeInTheDocument()
    expect(screen.getByText('db:5432')).toBeInTheDocument()
    expect(screen.getByText('Team feeds')).toBeInTheDocument()
    expect(screen.getByText('mysql.internal')).toBeInTheDocument()
  })

  it('shows an error when the payload could not be loaded', () => {
    render(<DataSourcesPanel data={null} />)
    expect(screen.getByText(/Impossible de charger/)).toBeInTheDocument()
  })

  it('tests a URL then confirms, only enabling confirm once a connector is found', async () => {
    const user = userEvent.setup()
    render(<DataSourcesPanel data={{ ...DATA, sources: [] }} />)

    await user.click(screen.getByRole('button', { name: /Ajouter une base secondaire/ }))
    await user.type(screen.getByLabelText('Nom'), 'New cluster')
    await user.type(screen.getByLabelText('URL de connexion'), 'postgres://u:p@h/db')

    const confirm = screen.getByRole('button', { name: 'Confirmer' })
    expect(confirm).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Tester' }))
    await waitFor(() => expect(screen.getByText(/Connecteurs trouvés/)).toBeInTheDocument())
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
    render(<DataSourcesPanel data={{ ...DATA, sources: [] }} />)

    await user.click(screen.getByRole('button', { name: /Ajouter une base secondaire/ }))
    await user.type(screen.getByLabelText('Nom'), 'Empty')
    await user.type(screen.getByLabelText('URL de connexion'), 'postgres://u:p@h/db')
    await user.click(screen.getByRole('button', { name: 'Tester' }))

    await waitFor(() => expect(screen.getByText(/Aucune table connector_\*/)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Confirmer' })).toBeDisabled()
  })

  it('surfaces a failed probe', async () => {
    actions.adminTestDataSourceAction.mockResolvedValue({ ok: false, error: 'unreachable' })
    const user = userEvent.setup()
    render(<DataSourcesPanel data={{ ...DATA, sources: [] }} />)

    await user.click(screen.getByRole('button', { name: /Ajouter une base secondaire/ }))
    await user.type(screen.getByLabelText('URL de connexion'), 'postgres://nope')
    await user.click(screen.getByRole('button', { name: 'Tester' }))

    expect(await screen.findByText('unreachable')).toBeInTheDocument()
  })

  it('removes a secondary source after confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    render(<DataSourcesPanel data={DATA} />)

    await user.click(screen.getByRole('button', { name: 'Retirer' }))
    await waitFor(() => expect(actions.adminDeleteDataSourceAction).toHaveBeenCalledWith(1))
    await waitFor(() => expect(refresh).toHaveBeenCalled())
    confirmSpy.mockRestore()
  })

  it('does not remove when the confirmation is dismissed', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    render(<DataSourcesPanel data={DATA} />)

    await user.click(screen.getByRole('button', { name: 'Retirer' }))
    expect(actions.adminDeleteDataSourceAction).not.toHaveBeenCalled()
    confirmSpy.mockRestore()
  })
})
