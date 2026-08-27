import type { Language } from '@/lib/translations'
import { en, type DocContent } from './en'
import { fr } from './fr'
import { de } from './de'
import { es } from './es'
import { it } from './it'
import { pt } from './pt'
import { ja } from './ja'
import { zh } from './zh'

export type { DocContent }

const DOCS: Record<Language, DocContent> = { en, fr, de, es, it, pt, ja, zh }

export function getSelfHostingDoc(lang: Language): DocContent {
  return DOCS[lang]
}
