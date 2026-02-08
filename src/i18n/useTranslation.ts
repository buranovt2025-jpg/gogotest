import { useLocale } from '../context/LocaleContext'
import { translations, type LocaleKey, type TranslationKeys } from './translations'

export function useTranslation() {
  const { locale } = useLocale()
  const dict = translations[locale]

  function t(key: TranslationKeys, params?: { n?: number }): string {
    const value = dict[key]
    if (typeof value === 'function' && params?.n !== undefined) {
      return (value as (n: number) => string)(params.n)
    }
    return typeof value === 'string' ? value : (dict[key] as string)
  }

  return { t, locale }
}
