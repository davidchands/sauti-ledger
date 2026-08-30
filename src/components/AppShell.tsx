import { Outlet } from 'react-router-dom'
import { BottomNavigation } from '@/components/BottomNavigation'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function AppShell() {
  return (
    <div className="mx-auto flex h-dvh max-w-[430px] flex-col bg-bg">
      <header className="flex justify-end px-5 pt-4">
        <LanguageSwitcher />
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  )
}
