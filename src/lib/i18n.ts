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

const locales: Record<string, Dict> = { en, es }

export function t(key: string, lang?: string): string {
  const l = lang || (localStorage.getItem('lang') || 'en')
  return (locales[l] && locales[l][key]) || locales['en'][key] || key
}

export function setLang(lang: string) {
  localStorage.setItem('lang', lang)
}

