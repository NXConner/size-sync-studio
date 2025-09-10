type Dict = Record<string, string>

const en: Dict = {
  settings_title: 'Settings',
  export_json: 'Export JSON',
  export_csv: 'Export CSV',
  export_pdf: 'Export PDF',
}

const es: Dict = {
  settings_title: 'Ajustes',
  export_json: 'Exportar JSON',
  export_csv: 'Exportar CSV',
  export_pdf: 'Exportar PDF',
}

const ar: Dict = {
  settings_title: 'الإعدادات',
  export_json: 'تصدير JSON',
  export_csv: 'تصدير CSV',
  export_pdf: 'تصدير PDF',
}

const locales: Record<string, Dict> = { en, es, ar }

export function t(key: string, lang?: string): string {
  const l = lang || (localStorage.getItem('lang') || 'en')
  return (locales[l] && locales[l][key]) || locales['en'][key] || key
}

export function setLang(lang: string) {
  localStorage.setItem('lang', lang)
}

export function detectLang(): string {
  try {
    const stored = localStorage.getItem('lang')
    if (stored) return stored
  } catch {}
  const nav = typeof navigator !== 'undefined' ? (navigator.language || (navigator as any).userLanguage || 'en') : 'en'
  const code = nav.toLowerCase().split('-')[0]
  return locales[code] ? code : 'en'
}

export function isRtl(lang?: string): boolean {
  const l = lang || detectLang()
  return ['ar', 'he', 'fa', 'ur'].includes(l)
}

