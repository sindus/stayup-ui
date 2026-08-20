'use client'

import { useLinkStatus } from 'next/link'
import { Loader2 } from 'lucide-react'

/** Small spinner shown next to a Link's content while its navigation is pending. */
export function LinkPendingSpinner() {
  const { pending } = useLinkStatus()
  if (!pending) return null
  return <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
}
