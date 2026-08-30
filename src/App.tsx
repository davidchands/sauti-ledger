import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { MiamalaPage } from '@/pages/MiamalaPage'
import { RipotiPage } from '@/pages/RipotiPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/miamala" replace />} />
        <Route path="miamala" element={<MiamalaPage />} />
        <Route path="ripoti" element={<RipotiPage />} />
        <Route path="*" element={<Navigate to="/miamala" replace />} />
      </Route>
    </Routes>
  )
}
