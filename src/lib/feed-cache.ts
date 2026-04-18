import { cache } from 'react'
import { getUserFeed } from './api-client'

export const getCachedUserFeed = cache(getUserFeed)
