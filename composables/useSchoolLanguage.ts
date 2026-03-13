import { getLanguage, getLanguageMeta, setLanguage, type SupportedLanguage } from '~/shared/app/i18n'

export function useSchoolLanguage() {
  const language = useState<SupportedLanguage>('school-language', () => (import.meta.client ? getLanguage() : 'en'))

  const applyLanguage = (nextLanguage: SupportedLanguage) => {
    language.value = nextLanguage
    if (import.meta.client) {
      setLanguage(nextLanguage)
    }
  }

  if (import.meta.client) {
    watch(
      language,
      (value) => {
        setLanguage(value)
      },
      { immediate: true }
    )

    watchEffect(() => {
      const meta = getLanguageMeta(language.value)
      document.documentElement.lang = meta.code
      document.documentElement.dir = meta.dir
    })
  }

  return {
    language,
    applyLanguage
  }
}
