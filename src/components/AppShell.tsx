import { Outlet } from 'react-router-dom'
import { BottomNavigation } from '@/components/BottomNavigation'
import { Sidebar } from '@/components/Sidebar'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { CurrencySwitcher } from '@/components/CurrencySwitcher'
import { SyncIndicator } from '@/components/SyncIndicator'
import { TransactionsProvider } from '@/hooks/TransactionsProvider'

/**
 * Mobile stays the primary experience (max-w-[430px], bottom tabs). At
 * lg+, the shell expands into a sidebar + wider centered column instead
 * of stretching the phone layout edge to edge — DESIGN.md § 6: "never
 * design desktop first and simply shrink it," which cuts both ways.
 */
export function AppShell() {
  return (
    <TransactionsProvider>
      <div className="flex min-h-dvh bg-bg lg:mx-auto lg:max-w-6xl">
        <Sidebar />

        <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col lg:mx-0 lg:max-w-none">
          <header
            className="flex items-center justify-end gap-2 px-5 pt-4 lg:hidden"
            style={{ paddingTop: 'max(1rem, calc(env(safe-area-inset-top) + 0.5rem))' }}
          >
            <CurrencySwitcher />
            <LanguageSwitcher />
          </header>

          <SyncIndicator />

          <main className="flex flex-1 flex-col lg:mx-auto lg:w-full lg:max-w-2xl lg:px-4 lg:py-6">
            <Outlet />
          </main>

          <div className="lg:hidden">
            <BottomNavigation />
          </div>
        </div>
      </div>
    </TransactionsProvider>
  )
}
