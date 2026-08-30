import { NavLink } from 'react-router-dom'
import { useLanguage } from '@/i18n/useLanguage'
import { cn } from '@/lib/utils'

export function BottomNavigation() {
  const { t } = useLanguage()

  const tabs = [
    { to: '/miamala', label: t('nav.miamala') },
    { to: '/ripoti', label: t('nav.ripoti') },
  ]

  return (
    <nav
      className="flex border-t border-border bg-surface"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              'flex-1 py-3 text-center text-sm font-medium transition-colors',
              isActive ? 'text-text' : 'text-text-muted',
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
