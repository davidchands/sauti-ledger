import { Outlet } from 'react-router-dom'
import { BottomNavigation } from '@/components/BottomNavigation'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { SyncIndicator } from '@/components/SyncIndicator'
import { TransactionsProvider } from '@/hooks/TransactionsProvider'

export function AppShell() {
  return (
    <TransactionsProvider>
      <div className="mx-auto flex h-dvh max-w-[430px] flex-col bg-bg">
        <header
          className="flex justify-end px-5 pt-4"
          style={{ paddingTop: 'max(1rem, calc(env(safe-area-inset-top) + 0.5rem))' }}
        >
          <LanguageSwitcher />
        </header>

        <SyncIndicator />

        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>

        <BottomNavigation />
      </div>
    </TransactionsProvider>
  )
}
