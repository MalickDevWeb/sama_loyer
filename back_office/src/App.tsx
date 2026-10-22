import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import { NAV_ITEMS } from './routes'

function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {NAV_ITEMS.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
