'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CONNECTOR_IDS,
  type ConnectorId,
  type DbEngine,
  SUPPORTED_DB_ENGINES,
} from '@/lib/generate/connectors'
import {
  buildSetupScript,
  type CustomConnector,
  DEFAULT_INPUT,
  type GeneratorInput,
  type RegistrationMode,
} from '@/lib/generate/buildScript'

export interface GeneratorStrings {
  database: string
  comingSoon: string
  connectors: string
  customConnectors: string
  customHint: string
  customConnectorAdd: string
  customUrlPlaceholder: string
  customNamePlaceholder: string
  remove: string
  adminUi: string
  adminUiHint: string
  registration: string
  registrationOpen: string
  registrationOpenHint: string
  registrationApproval: string
  registrationApprovalHint: string
  signInMethods: string
  emailPassword: string
  oauthHint: string
  advanced: string
  projectDir: string
  apiPort: string
  uiPort: string
  dbPort: string
  preview: string
  download: string
  copy: string
  copied: string
  invalid: string
}

const DB_ENGINES: { id: DbEngine; label: string }[] = [
  { id: 'postgres', label: 'PostgreSQL' },
  { id: 'mysql', label: 'MySQL / MariaDB' },
  { id: 'sqlite', label: 'SQLite' },
  { id: 'mongodb', label: 'MongoDB' },
]

const CONNECTOR_LABELS: Record<ConnectorId, string> = {
  changelog: 'Changelog',
  youtube: 'YouTube',
  rss: 'RSS',
  scrap: 'Scrap',
  'github-trending': 'GitHub Trending',
}

export function ProjectGenerator({ strings: s }: { strings: GeneratorStrings }) {
  const [selected, setSelected] = useState<Set<ConnectorId>>(new Set(CONNECTOR_IDS))
  const [custom, setCustom] = useState<CustomConnector[]>([])
  const [includeAdminUi, setIncludeAdminUi] = useState(true)
  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>(
    DEFAULT_INPUT.registrationMode,
  )
  const [oauthGoogle, setOauthGoogle] = useState(false)
  const [oauthGithub, setOauthGithub] = useState(false)
  const [ports, setPorts] = useState(DEFAULT_INPUT.ports)
  const [projectDir, setProjectDir] = useState(DEFAULT_INPUT.projectDir)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [copied, setCopied] = useState(false)

  const input: GeneratorInput = useMemo(
    () => ({
      projectDir,
      connectors: CONNECTOR_IDS.filter((id) => selected.has(id)),
      customConnectors: custom.filter((c) => c.gitUrl.trim() !== ''),
      includeAdminUi,
      registrationMode,
      oauth: { google: oauthGoogle, github: oauthGithub },
      ports,
    }),
    [
      projectDir,
      selected,
      custom,
      includeAdminUi,
      registrationMode,
      oauthGoogle,
      oauthGithub,
      ports,
    ],
  )

  const { script, error } = useMemo(() => {
    try {
      return { script: buildSetupScript(input), error: null as string | null }
    } catch (e) {
      return { script: null, error: e instanceof Error ? e.message : String(e) }
    }
  }, [input])

  function toggleConnector(id: ConnectorId) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function updateCustom(i: number, patch: Partial<CustomConnector>) {
    setCustom((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))
  }

  async function copyScript() {
    if (!script) return
    await navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadScript() {
    if (!script) return
    const blob = new Blob([script], { type: 'text/x-shellscript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'stayup-setup.sh'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <form className="space-y-7" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="space-y-2">
          <legend className="text-[13px] font-semibold text-fg">{s.database}</legend>
          <div className="flex flex-wrap gap-2">
            {DB_ENGINES.map((e) => {
              const supported = SUPPORTED_DB_ENGINES.includes(e.id)
              return (
                <label
                  key={e.id}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-[13px] ${
                    supported
                      ? 'cursor-pointer border-peach/60 bg-peach/10 text-fg'
                      : 'cursor-not-allowed border-border text-muted-foreground opacity-60'
                  }`}
                >
                  <input
                    type="radio"
                    name="db-engine"
                    value={e.id}
                    defaultChecked={e.id === 'postgres'}
                    disabled={!supported}
                    className="accent-peach"
                  />
                  {e.label}
                  {!supported && (
                    <span className="text-[11px] uppercase tracking-wide">{s.comingSoon}</span>
                  )}
                </label>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-[13px] font-semibold text-fg">{s.connectors}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {CONNECTOR_IDS.map((id) => (
              <label
                key={id}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] text-fg-soft hover:border-peach/50"
              >
                <input
                  type="checkbox"
                  checked={selected.has(id)}
                  onChange={() => toggleConnector(id)}
                  className="accent-peach"
                />
                {CONNECTOR_LABELS[id]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-[13px] font-semibold text-fg">{s.customConnectors}</legend>
          <p className="text-[12px] leading-relaxed text-muted-foreground">{s.customHint}</p>
          {custom.map((c, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <Input
                aria-label={`${s.customConnectors} ${i + 1} URL`}
                placeholder={s.customUrlPlaceholder}
                value={c.gitUrl}
                onChange={(e) => updateCustom(i, { gitUrl: e.target.value })}
                className="min-w-[16rem] flex-1"
              />
              <Input
                aria-label={`${s.customConnectors} ${i + 1} name`}
                placeholder={s.customNamePlaceholder}
                value={c.serviceName ?? ''}
                onChange={(e) => updateCustom(i, { serviceName: e.target.value })}
                className="w-40"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCustom((prev) => prev.filter((_, idx) => idx !== i))}
              >
                {s.remove}
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCustom((prev) => [...prev, { gitUrl: '', serviceName: '' }])}
          >
            {s.customConnectorAdd}
          </Button>
        </fieldset>

        <label className="flex cursor-pointer items-start gap-2 text-[13px] text-fg-soft">
          <input
            type="checkbox"
            checked={includeAdminUi}
            onChange={(e) => setIncludeAdminUi(e.target.checked)}
            className="mt-0.5 accent-peach"
          />
          <span>
            <span className="font-medium text-fg">{s.adminUi}</span>
            <span className="block text-muted-foreground">{s.adminUiHint}</span>
          </span>
        </label>

        <fieldset className="space-y-2">
          <legend className="text-[13px] font-semibold text-fg">{s.registration}</legend>
          {(
            [
              ['open', s.registrationOpen, s.registrationOpenHint],
              ['approval', s.registrationApproval, s.registrationApprovalHint],
            ] as const
          ).map(([mode, label, hint]) => (
            <label
              key={mode}
              className="flex cursor-pointer items-start gap-2 text-[13px] text-fg-soft"
            >
              <input
                type="radio"
                name="registration-mode"
                value={mode}
                checked={registrationMode === mode}
                onChange={() => setRegistrationMode(mode)}
                className="mt-0.5 accent-peach"
              />
              <span>
                <span className="font-medium text-fg">{label}</span>
                <span className="block text-muted-foreground">{hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-[13px] font-semibold text-fg">{s.signInMethods}</legend>
          <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <input type="checkbox" checked disabled className="accent-peach" />
            {s.emailPassword}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-fg-soft">
            <input
              type="checkbox"
              checked={oauthGithub}
              onChange={(e) => setOauthGithub(e.target.checked)}
              className="accent-peach"
            />
            GitHub
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-fg-soft">
            <input
              type="checkbox"
              checked={oauthGoogle}
              onChange={(e) => setOauthGoogle(e.target.checked)}
              className="accent-peach"
            />
            Google
          </label>
          {(oauthGithub || oauthGoogle) && (
            <p className="text-[12px] leading-relaxed text-muted-foreground">{s.oauthHint}</p>
          )}
        </fieldset>

        <div>
          <button
            type="button"
            className="text-[12px] font-mono uppercase tracking-wide text-muted-foreground hover:text-fg"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? '−' : '+'} {s.advanced}
          </button>
          {showAdvanced && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="gen-dir">{s.projectDir}</Label>
                <Input
                  id="gen-dir"
                  value={projectDir}
                  onChange={(e) => setProjectDir(e.target.value)}
                />
              </div>
              {(['api', 'ui', 'db'] as const).map((k) => (
                <div key={k} className="space-y-1">
                  <Label htmlFor={`gen-port-${k}`}>
                    {k === 'api' ? s.apiPort : k === 'ui' ? s.uiPort : s.dbPort}
                  </Label>
                  <Input
                    id={`gen-port-${k}`}
                    type="number"
                    value={ports[k]}
                    onChange={(e) => setPorts((p) => ({ ...p, [k]: Number(e.target.value) || 0 }))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-fg">{s.preview}</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyScript}
              disabled={!script}
            >
              {copied ? s.copied : s.copy}
            </Button>
            <Button type="button" size="sm" onClick={downloadScript} disabled={!script}>
              {s.download}
            </Button>
          </div>
        </div>
        {error ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
            {s.invalid}: {error}
          </p>
        ) : (
          <pre
            data-testid="script-preview"
            className="max-h-[32rem] overflow-auto rounded-lg border border-border bg-[var(--bg-soft)] p-4 text-[12px] leading-relaxed text-fg-soft"
          >
            {script}
          </pre>
        )}
      </div>
    </div>
  )
}
