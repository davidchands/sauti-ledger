export const translations = {
  sw: {
    nav: {
      miamala: 'Miamala',
      ripoti: 'Ripoti',
    },
    mic: {
      idle: 'Ongea',
      idleHint: 'Bonyeza kipaza sauti na uniambie kilichotokea leo.',
    },
    miamala: {
      empty: 'Bado hakuna miamala.',
    },
    ripoti: {
      empty: 'Bado hakuna ripoti ya kuonyesha.',
    },
    language: {
      switchTo: 'Badilisha lugha kwenda Kiingereza',
    },
  },
  en: {
    nav: {
      miamala: 'Transactions',
      ripoti: 'Reports',
    },
    mic: {
      idle: 'Speak',
      idleHint: 'Tap the microphone and tell SautiLedger what happened today.',
    },
    miamala: {
      empty: 'No transactions yet.',
    },
    ripoti: {
      empty: 'Nothing to report yet.',
    },
    language: {
      switchTo: 'Switch language to Swahili',
    },
  },
} satisfies Record<'sw' | 'en', Dict>

/** Shape every language dictionary must match — leaf values are `string`, not literals. */
type Dict = {
  nav: { miamala: string; ripoti: string }
  mic: { idle: string; idleHint: string }
  miamala: { empty: string }
  ripoti: { empty: string }
  language: { switchTo: string }
}

export type Language = keyof typeof translations

type DotPaths<T, Prefix extends string = ''> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: DotPaths<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>
    }[keyof T & string]

export type TranslationPath = DotPaths<Dict>
