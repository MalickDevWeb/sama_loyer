import { NavLink, Outlet } from 'react-router-dom'
import { NAV_ITEMS } from '../routes'
import './AdminLayout.css'

function AdminLayout() {
  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand">
          SAMA <span>LOGEMENT</span>
        </div>
        <nav className="admin__nav">
          {NAV_ITEMS.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `admin__link${isActive ? ' admin__link--active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="admin__content">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
