import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Icon } from '../components/ui'
import { ICONS } from '../lib/utils'
import { NAV_ITEMS } from '../routes'
import './AdminLayout.css'

function AdminLayout() {
  // Sur mobile, le menu est replié derrière un bouton
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  // Chaque écran s'ouvre en haut de page
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="admin">
      <aside className={`admin__sidebar${menuOpen ? ' admin__sidebar--open' : ''}`}>
        <div className="admin__top">
          <div className="admin__brand">
            <span className="admin__logo">
              <Icon d={ICONS.home} size={20} strokeWidth={2.2} />
            </span>
            <span className="admin__brand-text">
              <span className="admin__brand-name">SAMA LOGEMENT</span>
              <span className="admin__brand-sub">ADMINISTRATION</span>
            </span>
          </div>
          <button
            type="button"
            className="admin__menu-btn"
            aria-expanded={menuOpen}
            aria-controls="admin-nav"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon d={menuOpen ? ICONS.close : ICONS.menu} size={22} strokeWidth={2.2} />
          </button>
        </div>

        <nav id="admin-nav" aria-label="Administration" className="admin__nav">
          {NAV_ITEMS.map(({ path, label, icon, badge }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `admin__link${isActive ? ' admin__link--active' : ''}`}
            >
              <Icon d={icon} />
              <span className="admin__link-label">{label}</span>
              {badge ? <span className="admin__badge">{badge}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="admin__user">
          <span className="admin__user-avatar">SA</span>
          <span className="admin__user-meta">
            <span className="admin__user-name">Super admin</span>
            <span className="admin__user-sub">Connexion sécurisée · 2FA</span>
          </span>
          <button type="button" className="admin__logout" aria-label="Se déconnecter">
            <Icon d={ICONS.logout} strokeWidth={2.2} />
          </button>
        </div>
      </aside>

      <main className="admin__content">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
