export const translations = {
  sw: {
    nav: {
      miamala: 'Miamala',
      ripoti: 'Ripoti',
    },
    mic: {
      idle: 'Ongea',
      idleHint: 'Bonyeza kipaza sauti na uniambie kilichotokea leo.',
      recording: 'Ninasikiliza…',
      processing: 'Naelewa…',
      success: 'Imehifadhiwa',
      error: 'Jaribu tena',
    },
    balance: {
      label: 'Salio la sasa',
    },
    today: {
      label: 'Leo',
    },
    category: {
      Sales: 'Mauzo',
      Inventory: 'Bidhaa',
      Rent: 'Pango',
      Operational: 'Uendeshaji',
      Other: 'Nyingine',
    },
    confirmation: {
      title: 'Thibitisha muamala',
      edit: 'Hariri',
      confirm: 'Sahihi',
      cancel: 'Ghairi',
      typeIncome: 'Mapato',
      typeExpense: 'Matumizi',
      amountLabel: 'Kiasi',
      categoryLabel: 'Aina',
      descriptionLabel: 'Maelezo',
    },
    miamala: {
      empty: 'Bado hakuna miamala.',
    },
    ripoti: {
      empty: 'Bado hakuna ripoti ya kuonyesha.',
      thisWeek: 'Wiki hii',
      income: 'Mapato',
      expense: 'Matumizi',
      biggestLeak: 'Pesa inaishia wapi?',
    },
    error: {
      genericTitle: 'Hitilafu imetokea.',
      genericBody: 'Taarifa zako ziko salama. Jaribu tena.',
      retry: 'Jaribu tena',
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
      recording: 'Listening…',
      processing: 'Understanding…',
      success: 'Saved',
      error: 'Try again',
    },
    balance: {
      label: 'Current balance',
    },
    today: {
      label: 'Today',
    },
    category: {
      Sales: 'Sales',
      Inventory: 'Inventory',
      Rent: 'Rent',
      Operational: 'Operations',
      Other: 'Other',
    },
    confirmation: {
      title: 'Confirm transaction',
      edit: 'Edit',
      confirm: 'Confirm',
      cancel: 'Cancel',
      typeIncome: 'Income',
      typeExpense: 'Expense',
      amountLabel: 'Amount',
      categoryLabel: 'Category',
      descriptionLabel: 'Description',
    },
    miamala: {
      empty: 'No transactions yet.',
    },
    ripoti: {
      empty: 'Nothing to report yet.',
      thisWeek: 'This week',
      income: 'Income',
      expense: 'Expenses',
      biggestLeak: "Where's the money going?",
    },
    error: {
      genericTitle: 'Something went wrong.',
      genericBody: 'Your data is safe. Please try again.',
      retry: 'Try again',
    },
    language: {
      switchTo: 'Switch language to Swahili',
    },
  },
} satisfies Record<'sw' | 'en', Dict>

/** Shape every language dictionary must match — leaf values are `string`, not literals. */
type Dict = {
  nav: { miamala: string; ripoti: string }
  mic: {
    idle: string
    idleHint: string
    recording: string
    processing: string
    success: string
    error: string
  }
  balance: { label: string }
  today: { label: string }
  category: { Sales: string; Inventory: string; Rent: string; Operational: string; Other: string }
  confirmation: {
    title: string
    edit: string
    confirm: string
    cancel: string
    typeIncome: string
    typeExpense: string
    amountLabel: string
    categoryLabel: string
    descriptionLabel: string
  }
  miamala: { empty: string }
  ripoti: {
    empty: string
    thisWeek: string
    income: string
    expense: string
    biggestLeak: string
  }
  error: { genericTitle: string; genericBody: string; retry: string }
  language: { switchTo: string }
}

export type Language = keyof typeof translations

type DotPaths<T, Prefix extends string = ''> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: DotPaths<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>
    }[keyof T & string]

export type TranslationPath = DotPaths<Dict>
