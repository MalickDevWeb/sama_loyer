import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/Login'
import { NAV_ITEMS } from './routes'

// Session admin gardée pour l'onglet en cours (en attendant l'API)
const SESSION_KEY = 'sama_admin_session'

function readSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function writeSession(on: boolean) {
  try {
    if (on) sessionStorage.setItem(SESSION_KEY, '1')
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // stockage indisponible : la session ne survit pas au rechargement
  }
}

function App() {
  const [authed, setAuthed] = useState(readSession)

  const setSession = (on: boolean) => {
    writeSession(on)
    setAuthed(on)
  }

  if (!authed) return <Login onLogin={() => setSession(true)} />

  return (
    <Routes>
      <Route element={<AdminLayout onLogout={() => setSession(false)} />}>
        {NAV_ITEMS.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
