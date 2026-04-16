import { cache } from 'react'
import { getUserFeed } from './api-client'

// Deduplicates getUserFeed calls across layout + pages within the same request
export const getCachedUserFeed = cache(getUserFeed)
