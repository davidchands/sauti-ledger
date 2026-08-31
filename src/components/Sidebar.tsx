import { NavLink } from 'react-router-dom'
import { useLanguage } from '@/i18n/useLanguage'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { cn } from '@/lib/utils'

/**
 * Desktop-only (lg+) replacement for BottomNavigation. Same nav model,
 * different chrome — DESIGN.md § 6 asks for expansion at wide viewports,
 * not a rebuild into a generic dashboard.
 */
export function Sidebar() {
  const { t } = useLanguage()

  const tabs = [
    { to: '/miamala', label: t('nav.miamala') },
    { to: '/ripoti', label: t('nav.ripoti') },
  ]

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border px-6 py-8 lg:flex">
      <p className="text-lg font-semibold tracking-tight text-text">SautiLedger</p>

      <nav className="mt-10 flex flex-col gap-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-surface text-text' : 'text-text-muted hover:text-text',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex justify-start">
        <LanguageSwitcher />
      </div>
    </aside>
  )
}
