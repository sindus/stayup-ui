import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectGenerator, type GeneratorStrings } from '@/components/generate/ProjectGenerator'

const S: GeneratorStrings = {
  database: 'Database',
  comingSoon: 'soon',
  connectors: 'Connectors',
  customConnectors: 'Your connectors',
  customHint: 'Any git repo with a root Dockerfile.',
  customConnectorAdd: 'Add a connector',
  customUrlPlaceholder: 'git url',
  customNamePlaceholder: 'name',
  remove: 'Remove',
  adminUi: 'Include the admin UI',
  adminUiHint: 'Manage providers',
  advanced: 'Advanced',
  projectDir: 'Project folder',
  apiPort: 'API port',
  uiPort: 'UI port',
  dbPort: 'DB port',
  preview: 'stayup-setup.sh',
  download: 'Download',
  copy: 'Copy',
  copied: 'Copied',
  invalid: 'Cannot generate',
}

const preview = () => screen.getByTestId('script-preview').textContent ?? ''

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('ProjectGenerator', () => {
  it('renders a full script for the default selection', () => {
    render(<ProjectGenerator strings={S} />)
    const text = preview()
    expect(text).toContain('#!/usr/bin/env bash')
    expect(text).toContain('connector-rss:')
    expect(text).toContain('context: ./stayup-ui')
  })

  it('drops then restores a connector as it is toggled', async () => {
    const user = userEvent.setup()
    render(<ProjectGenerator strings={S} />)
    expect(preview()).toContain('connector-youtube:')
    await user.click(screen.getByRole('checkbox', { name: 'YouTube' }))
    expect(preview()).not.toContain('connector-youtube:')
    expect(preview()).toContain('connector-rss:')
    await user.click(screen.getByRole('checkbox', { name: 'YouTube' }))
    expect(preview()).toContain('connector-youtube:')
  })

  it('never navigates on form submit', () => {
    const { container } = render(<ProjectGenerator strings={S} />)
    const form = container.querySelector('form') as HTMLFormElement
    const submit = fireEvent.submit(form)
    expect(submit).toBe(false) // preventDefault was called
  })

  it('removes the admin UI from the script when the toggle is off', async () => {
    const user = userEvent.setup()
    render(<ProjectGenerator strings={S} />)
    await user.click(screen.getByRole('checkbox', { name: /include the admin ui/i }))
    expect(preview()).not.toContain('context: ./stayup-ui')
    expect(preview()).not.toContain('stayup-ui.git')
  })

  it('adds, fills and removes a custom connector', async () => {
    const user = userEvent.setup()
    render(<ProjectGenerator strings={S} />)
    await user.click(screen.getByRole('button', { name: 'Add a connector' }))
    await user.type(
      screen.getByLabelText('Your connectors 1 URL'),
      'https://github.com/me/weather.git',
    )
    expect(preview()).toContain('connector-weather:')

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(preview()).not.toContain('connector-weather:')
  })

  it('uses an explicit custom connector name', async () => {
    const user = userEvent.setup()
    render(<ProjectGenerator strings={S} />)
    await user.click(screen.getByRole('button', { name: 'Add a connector' }))
    await user.type(screen.getByLabelText('Your connectors 1 URL'), 'https://github.com/me/x.git')
    await user.type(screen.getByLabelText('Your connectors 1 name'), 'hackernews')
    expect(preview()).toContain('connector-hackernews:')
    expect(preview()).not.toContain('connector-x:')
  })

  it('surfaces a validation error instead of a script', async () => {
    const user = userEvent.setup()
    render(<ProjectGenerator strings={S} />)
    await user.click(screen.getByRole('button', { name: /advanced/i }))
    const dir = screen.getByLabelText('Project folder')
    await user.clear(dir)
    await user.type(dir, '../evil')
    expect(screen.queryByTestId('script-preview')).not.toBeInTheDocument()
    expect(screen.getByText(/Cannot generate/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled()
  })

  it('bakes advanced ports into the script', async () => {
    const user = userEvent.setup()
    render(<ProjectGenerator strings={S} />)
    await user.click(screen.getByRole('button', { name: /advanced/i }))
    const apiPort = screen.getByLabelText('API port')
    await user.clear(apiPort)
    await user.type(apiPort, '8080')
    expect(preview()).toContain('API_PORT="8080"')
  })

  it('downloads the script as a blob', async () => {
    const user = userEvent.setup()
    const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x')
    const revokeUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    render(<ProjectGenerator strings={S} />)
    await user.click(screen.getByRole('button', { name: 'Download' }))

    expect(createUrl).toHaveBeenCalledOnce()
    const blob = createUrl.mock.calls[0][0] as Blob
    expect(blob.type).toBe('text/x-shellscript')
    expect(click).toHaveBeenCalledOnce()
    expect(revokeUrl).toHaveBeenCalledWith('blob:x')
  })

  it('copies the script to the clipboard', async () => {
    const user = userEvent.setup()
    // userEvent.setup() installs its own clipboard stub — override it afterwards.
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    render(<ProjectGenerator strings={S} />)
    await user.click(screen.getByRole('button', { name: 'Copy' }))

    expect(writeText).toHaveBeenCalledOnce()
    expect(writeText.mock.calls[0][0]).toContain('#!/usr/bin/env bash')
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  it('shows unsupported engines as disabled with a "soon" tag', () => {
    render(<ProjectGenerator strings={S} />)
    const mysql = screen.getByRole('radio', { name: /MySQL/i })
    expect(mysql).toBeDisabled()
    const pg = screen.getByRole('radio', { name: 'PostgreSQL' })
    expect(pg).not.toBeDisabled()
    expect(within(mysql.closest('label') as HTMLElement).getByText('soon')).toBeInTheDocument()
  })
})
