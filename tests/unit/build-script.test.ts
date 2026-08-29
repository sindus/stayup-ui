import { describe, it, expect } from 'vitest'
import {
  buildSetupScript,
  deriveServiceName,
  DEFAULT_INPUT,
  type GeneratorInput,
} from '@/lib/generate/buildScript'

const base: GeneratorInput = DEFAULT_INPUT

describe('deriveServiceName', () => {
  it('slugifies the last path segment of a git URL', () => {
    expect(deriveServiceName('https://github.com/me/My_Connector.git')).toBe('my-connector')
    expect(deriveServiceName('git@github.com:acme/weather-bot.git')).toBe('weather-bot')
    expect(deriveServiceName('https://gitlab.com/x/y/z/')).toBe('z')
  })

  it('falls back to "connector" when nothing usable remains', () => {
    expect(deriveServiceName('@@@')).toBe('connector')
  })
})

describe('buildSetupScript — shape', () => {
  const script = buildSetupScript(base)

  it('is a bash script with strict mode', () => {
    expect(script.startsWith('#!/usr/bin/env bash\n')).toBe(true)
    expect(script).toContain('set -euo pipefail')
  })

  it('clones the API and every selected connector, and bakes one service each', () => {
    expect(script).toContain('clone "https://github.com/stayup-app/stayup-api.git" "stayup-api"')
    for (const id of base.connectors) {
      expect(script).toContain(
        `clone "https://github.com/stayup-app/stayup-cmd-${id}.git" "connector-${id}"`,
      )
      expect(script).toContain(`  connector-${id}:`)
      expect(script).toContain(`    build: ./connector-${id}`)
      expect(script).toContain(`[job-run "stayup-${id}"]`)
      expect(script).toContain(`image = stayup-connector-${id}`)
    }
  })

  it('bakes the chosen ports', () => {
    const s = buildSetupScript({ ...base, ports: { api: 8080, ui: 8081, db: 6543 } })
    expect(s).toContain('API_PORT="8080"')
    expect(s).toContain('UI_PORT="8081"')
    expect(s).toContain('"8081:3001"')
    expect(s).toContain('"6543:5432"')
    expect(s).toContain('"8080:3000"')
  })

  it('includes the admin UI service only when asked', () => {
    const withUi = buildSetupScript({ ...base, includeAdminUi: true })
    expect(withUi).toContain('context: ./stayup-ui')
    expect(withUi).toContain('clone "https://github.com/stayup-app/stayup-ui.git" "stayup-ui"')
    expect(withUi).toContain('docker compose up -d ui')

    const noUi = buildSetupScript({ ...base, includeAdminUi: false })
    expect(noUi).not.toContain('context: ./stayup-ui')
    expect(noUi).not.toContain('stayup-ui.git')
    expect(noUi).not.toContain('docker compose up -d ui')
  })

  it('adds an Ofelia scheduler bound to the docker socket', () => {
    expect(script).toContain('mcuadros/ofelia:latest')
    expect(script).toContain('/var/run/docker.sock:/var/run/docker.sock:ro')
    expect(script).toContain('network = stayup_default')
  })

  it('one cron var + one prompt per connector, default from the catalogue', () => {
    expect(script).toContain('CRON_rss="0 0 * * *"')
    expect(script).toContain('CRON_youtube="0 20 * * *"')
    expect(script).toContain("Cron for 'rss' [$CRON_rss]")
    expect(script).toContain('schedule = $CRON_rss')
  })

  it('passes the admin password through the environment, never a file or argv', () => {
    expect(script).toContain('-e ADMIN_PASSWORD="$ADMIN_PASSWORD"')
    expect(script).toContain('node dist/scripts/create-admin.js')
    expect(script).not.toMatch(/create-admin\.js "?\$ADMIN_PASSWORD/)
    expect(script).not.toMatch(/^ADMIN_PASSWORD=.*ADMIN_PASSWORD/m) // not written to .env
  })

  it('leaves no un-interpolated JS placeholder', () => {
    expect(script).not.toMatch(/\$\{[a-zA-Z]/) // no `${projectDir}` etc.
  })
})

describe('buildSetupScript — custom connectors', () => {
  it('appends a custom connector with a derived name', () => {
    const s = buildSetupScript({
      ...base,
      connectors: ['rss'],
      customConnectors: [{ gitUrl: 'https://github.com/acme/hackernews.git' }],
    })
    expect(s).toContain('clone "https://github.com/acme/hackernews.git" "connector-hackernews"')
    expect(s).toContain('  connector-hackernews:')
    expect(s).toContain('CRON_hackernews="0 0 * * *"')
    expect(s).toContain('[job-run "stayup-hackernews"]')
  })

  it('honours an explicit service name and disambiguates a collision', () => {
    const s = buildSetupScript({
      ...base,
      connectors: ['rss'],
      customConnectors: [
        { gitUrl: 'https://github.com/a/one.git', serviceName: 'rss' },
        { gitUrl: 'https://github.com/b/two.git', serviceName: 'weather' },
      ],
    })
    expect(s).toContain('"connector-rss-2"') // collided with the official rss
    expect(s).toContain('"connector-weather"')
  })

  it('maps a hyphenated name to a valid shell variable', () => {
    const s = buildSetupScript({
      ...base,
      connectors: [],
      customConnectors: [{ gitUrl: 'https://github.com/a/b.git', serviceName: 'my-conn' }],
    })
    expect(s).toContain('CRON_my_conn="0 0 * * *"')
    expect(s).toContain('schedule = $CRON_my_conn')
    expect(s).toContain('[job-run "stayup-my-conn"]')
  })

  it('rejects a non-clonable URL', () => {
    expect(() =>
      buildSetupScript({ ...base, customConnectors: [{ gitUrl: 'not a url' }] }),
    ).toThrow(/Invalid connector URL/)
  })
})

describe('buildSetupScript — validation', () => {
  it('rejects a bad project directory', () => {
    expect(() => buildSetupScript({ ...base, projectDir: '../evil' })).toThrow(/project directory/)
  })

  it('rejects an out-of-range port', () => {
    expect(() => buildSetupScript({ ...base, ports: { api: 0, ui: 3001, db: 5432 } })).toThrow(
      /api port/,
    )
    expect(() => buildSetupScript({ ...base, ports: { api: 3000, ui: 3001, db: 99999 } })).toThrow(
      /db port/,
    )
  })

  it('still produces a valid script with no connectors selected', () => {
    const s = buildSetupScript({ ...base, connectors: [], customConnectors: [] })
    expect(s).toContain('# (no connector selected)')
    expect(s).toContain(': # no connector selected')
    expect(s).toContain('docker compose up -d db')
  })
})
