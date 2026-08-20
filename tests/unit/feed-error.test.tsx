import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FeedError from '@/app/(protected)/feed/error'
import { LanguageProvider } from '@/context/LanguageContext'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

function renderError(reset = vi.fn()) {
  render(
    <LanguageProvider initialLang="fr">
      <FeedError error={new Error('boom')} reset={reset} />
    </LanguageProvider>,
  )
  return reset
}

describe('FeedError', () => {
  it('shows a generic error message', () => {
    renderError()
    expect(screen.getByText('Une erreur est survenue.')).toBeInTheDocument()
  })

  it('calls reset when the retry button is clicked', () => {
    const reset = renderError()
    fireEvent.click(screen.getByText('Réessayer'))
    expect(reset).toHaveBeenCalled()
  })
})
