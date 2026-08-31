import type { Language } from '@/i18n/translations'

export interface LandingStep {
  title: string
  body: string
}

export interface LandingFeature {
  title: string
  body: string
}

export interface LandingExample {
  transcript: string
  language: 'sw' | 'en' | 'mixed'
  amount: string
  category: string
  description: string
  isIncome: boolean
}

export interface LandingContent {
  nav: {
    howItWorks: string
    features: string
    cta: string
  }
  hero: {
    badge: string
    headline: string
    subheadline: string
    ctaPrimary: string
    ctaSecondary: string
    demoAriaLabel: string
  }
  /**
   * The live voice → transaction → balance sequence shown inside the
   * hero phone. Verified against the real AI extraction pipeline (same
   * source item as examples.items[0] — AI_SPEC.md § 6 / eval/dataset.ts).
   * Never fabricate example output for marketing copy. Amounts are raw
   * numbers (not pre-formatted) so the phone can animate them with the
   * app's own formatTSh.
   */
  heroDemo: {
    transcript: string
    /** A category.* key from translations.ts — translated at render time so it's never out of sync with the real app. */
    category: 'Sales' | 'Inventory' | 'Rent' | 'Operational' | 'Other'
    description: string
    isIncome: boolean
    amount: number
    balanceBefore: number
    balanceAfter: number
  }
  howItWorks: {
    eyebrow: string
    title: string
    steps: LandingStep[]
  }
  features: {
    eyebrow: string
    title: string
    items: LandingFeature[]
  }
  examples: {
    eyebrow: string
    title: string
    body: string
    items: LandingExample[]
  }
  reports: {
    eyebrow: string
    title: string
    body: string
    screenshotAlt: string
  }
  trust: {
    title: string
    body: string
  }
  finalCta: {
    title: string
    body: string
    cta: string
  }
  footer: {
    tagline: string
    sourceLink: string
  }
}

// Verified against the real AI extraction pipeline — see AI_SPEC.md § 6
// and eval/dataset.ts. Never fabricate example output for marketing copy.
const CONTENT: Record<Language, LandingContent> = {
  sw: {
    nav: {
      howItWorks: 'Jinsi inavyofanya kazi',
      features: 'Vipengele',
      cta: 'Fungua Sauti Ledger',
    },
    hero: {
      badge: 'Imejengwa kwa wafanyabiashara wadogo Tanzania',
      headline: 'Endesha biashara yako kwa kuongea.',
      subheadline:
        'Rekodi mauzo, matumizi na fedha zako kwa kuongea tu, kwa Kiswahili au Kiingereza. Hakuna daftari, hakuna fomu ndefu.',
      ctaPrimary: 'Anza bure sasa',
      ctaSecondary: 'Ona jinsi inavyofanya kazi',
      demoAriaLabel: 'Onyesho la moja kwa moja la Sauti Ledger likibadilisha sauti kuwa muamala',
    },
    heroDemo: {
      transcript: 'Leo nimeuza mchele elfu ishirini',
      category: 'Sales',
      description: 'Mchele',
      isIncome: true,
      amount: 20000,
      balanceBefore: 133000,
      balanceAfter: 153000,
    },
    howItWorks: {
      eyebrow: 'Jinsi inavyofanya kazi',
      title: 'Kutoka sauti yako hadi muamala uliohifadhiwa',
      steps: [
        {
          title: 'Ongea',
          body: 'Shikilia kipaza sauti na useme kilichotokea, kwa Kiswahili, Kiingereza, au mchanganyiko.',
        },
        {
          title: 'Naelewa…',
          body: 'Sauti Ledger inasikiliza na kutambua kiasi, aina ya muamala, na sababu yake.',
        },
        {
          title: 'Thibitisha',
          body: 'Unaona muamala kabla haujahifadhiwa. Hariri kama ukitaka, kisha bonyeza Sahihi.',
        },
        {
          title: 'Imehifadhiwa',
          body: 'Salio lako linabadilika papo hapo. Hakuna fomu ndefu, hakuna lugha ya kihasibu.',
        },
      ],
    },
    features: {
      eyebrow: 'Vipengele',
      title: 'Kila kitu unachohitaji, hakuna zaidi',
      items: [
        {
          title: 'Sauti ya Kiswahili na Kiingereza',
          body: 'Sauti Ledger inaelewa mchanganyiko wa lugha, kama unavyoongea kawaida.',
        },
        {
          title: 'Ingiza kwa mkono ukitaka',
          body: 'Sauti ndiyo njia kuu, lakini unaweza kuongeza muamala kwa mkono wakati wowote.',
        },
        {
          title: 'Inafanya kazi bila mtandao',
          body: 'Rekodi miamala hata bila intaneti. Itasawazishwa mtandao utakaporudi.',
        },
        {
          title: 'Ripoti rahisi, si uhasibu',
          body: 'Ona salio lako, mapato na matumizi ya wiki, na wapi pesa inaishia, kwa mtazamo mmoja.',
        },
        {
          title: 'Data yako ni yako',
          body: 'Miamala yako ni ya kifaa chako. Hakuna mtu mwingine anayeweza kuiona.',
        },
        {
          title: 'Sakinisha kama programu',
          body: 'Ongeza Sauti Ledger kwenye skrini ya nyumbani. Inafanya kazi kama programu halisi.',
        },
      ],
    },
    examples: {
      eyebrow: 'Sikia mfano',
      title: 'Sema tu jinsi unavyozungumza kawaida',
      body: 'Hivi ndivyo Sauti Ledger inavyoelewa sentensi halisi: Kiswahili, Kiingereza, au vyote viwili.',
      items: [
        {
          transcript: 'Leo nimeuza mchele elfu ishirini',
          language: 'sw',
          amount: '+ TSh 20,000',
          category: 'Mauzo',
          description: 'Mchele',
          isIncome: true,
        },
        {
          transcript: 'Nimenunua stock ya laki mbili',
          language: 'sw',
          amount: '− TSh 200,000',
          category: 'Bidhaa',
          description: 'Stock',
          isIncome: false,
        },
        {
          transcript: 'I paid rent 300 thousand',
          language: 'en',
          amount: '− TSh 300,000',
          category: 'Pango',
          description: 'Rent',
          isIncome: false,
        },
        {
          transcript: 'Leo nimeuza goods za 50k',
          language: 'mixed',
          amount: '+ TSh 50,000',
          category: 'Mauzo',
          description: 'Goods',
          isIncome: true,
        },
      ],
    },
    reports: {
      eyebrow: 'Ripoti',
      title: 'Elewa biashara yako kwa dakika moja',
      body: 'Bila chati ngumu, bila lugha ya kihasibu. Sauti Ledger inakujibu maswali unayouliza kila siku: Nina kiasi gani? Nimetumia wapi zaidi wiki hii?',
      screenshotAlt: 'Skrini ya ripoti ikionyesha mapato, matumizi, na pesa inaishia wapi',
    },
    trust: {
      title: 'Umiliki na uwazi kwanza',
      body: 'Sauti Ledger haihitaji jina la benki wala maelezo magumu. Simu yako, sauti yako, biashara yako, ndivyo tunavyoanza. Rekodi zako zinabaki kwako, hata bila mtandao.',
    },
    finalCta: {
      title: 'Anza kurekodi biashara yako leo',
      body: 'Bure kuanza. Hakuna kadi ya benki inayohitajika.',
      cta: 'Fungua Sauti Ledger',
    },
    footer: {
      tagline: 'Ongea tu. Sauti Ledger itaelewa.',
      sourceLink: 'Chanzo kwenye GitHub',
    },
  },
  en: {
    nav: {
      howItWorks: 'How it works',
      features: 'Features',
      cta: 'Open Sauti Ledger',
    },
    hero: {
      badge: 'Built for Tanzanian microbusinesses',
      headline: 'Run your business by speaking.',
      subheadline:
        'Record sales, expenses, and cash flow naturally, in English or Swahili. No ledgers, no long forms.',
      ctaPrimary: 'Start free now',
      ctaSecondary: 'See how it works',
      demoAriaLabel: "Live demo of Sauti Ledger turning speech into a transaction",
    },
    heroDemo: {
      transcript: 'Leo nimeuza mchele elfu ishirini',
      category: 'Sales',
      description: 'Rice',
      isIncome: true,
      amount: 20000,
      balanceBefore: 133000,
      balanceAfter: 153000,
    },
    howItWorks: {
      eyebrow: 'How it works',
      title: 'From your voice to a saved transaction',
      steps: [
        {
          title: 'Speak',
          body: 'Hold the microphone and say what happened, in Swahili, English, or a mix of both.',
        },
        {
          title: 'Understanding…',
          body: 'Sauti Ledger listens and figures out the amount, the type, and what it was for.',
        },
        {
          title: 'Confirm',
          body: "You see the transaction before it's saved. Edit it if you need to, then tap Confirm.",
        },
        {
          title: 'Saved',
          body: 'Your balance updates instantly. No long forms, no accounting jargon.',
        },
      ],
    },
    features: {
      eyebrow: 'Features',
      title: 'Everything you need, nothing you don’t',
      items: [
        {
          title: 'Swahili and English voice',
          body: 'Sauti Ledger understands mixed-language speech, the way people actually talk.',
        },
        {
          title: 'Manual entry when you want it',
          body: 'Voice is the main way in, but you can always add a transaction by hand instead.',
        },
        {
          title: 'Works without internet',
          body: 'Record transactions even offline. They sync automatically once you’re back online.',
        },
        {
          title: 'Simple reports, not accounting',
          body: 'See your balance, this week’s income and expenses, and where the money’s going, at a glance.',
        },
        {
          title: 'Your data is yours',
          body: 'Your transactions belong to your device. No one else can see them.',
        },
        {
          title: 'Install it like an app',
          body: 'Add Sauti Ledger to your home screen. It works like a real app, not a website.',
        },
      ],
    },
    examples: {
      eyebrow: 'Hear an example',
      title: 'Just talk the way you normally would',
      body: 'This is how Sauti Ledger actually understands real sentences: Swahili, English, or both mixed together.',
      items: [
        {
          transcript: 'Leo nimeuza mchele elfu ishirini',
          language: 'sw',
          amount: '+ TSh 20,000',
          category: 'Sales',
          description: 'Rice',
          isIncome: true,
        },
        {
          transcript: 'Nimenunua stock ya laki mbili',
          language: 'sw',
          amount: '− TSh 200,000',
          category: 'Inventory',
          description: 'Stock',
          isIncome: false,
        },
        {
          transcript: 'I paid rent 300 thousand',
          language: 'en',
          amount: '− TSh 300,000',
          category: 'Rent',
          description: 'Rent',
          isIncome: false,
        },
        {
          transcript: 'Leo nimeuza goods za 50k',
          language: 'mixed',
          amount: '+ TSh 50,000',
          category: 'Sales',
          description: 'Goods',
          isIncome: true,
        },
      ],
    },
    reports: {
      eyebrow: 'Reports',
      title: 'Understand your business in a minute',
      body: 'No complicated charts, no accounting language. Sauti Ledger answers the questions you actually ask every day: What do I have? Where did most of it go this week?',
      screenshotAlt: "Screenshot of the reports screen showing income, expenses, and the biggest expense category",
    },
    trust: {
      title: 'Ownership and clarity first',
      body: "Sauti Ledger doesn't need a bank name or complicated details. Your phone, your voice, your business, that's where we start. Your records stay yours, even offline.",
    },
    finalCta: {
      title: 'Start recording your business today',
      body: 'Free to start. No bank card required.',
      cta: 'Open Sauti Ledger',
    },
    footer: {
      tagline: 'Just speak. Sauti Ledger will understand.',
      sourceLink: 'Source on GitHub',
    },
  },
}

export function getLandingContent(language: Language): LandingContent {
  return CONTENT[language]
}
