import { useState } from 'react'
import { Icon, Pills } from '../components/ui'
import { ICONS, norm } from '../lib/utils'
import { useAudit, type AuditModule } from '../lib/audit'
import './Journal.css'

type Tab = 'all' | AuditModule

const MODULES: AuditModule[] = ['Annonces', 'Locations', 'Locataires', 'Bailleurs', 'Abonnements', 'Transactions', 'Réclamations', 'Équipe', 'Connexion']

function Journal() {
  const entries = useAudit()
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')

  const q = norm(query)
  const list = entries.filter(
    (e) => (tab === 'all' || e.module === tab) && (!q || norm(`${e.who} ${e.action} ${e.target}`).includes(q)),
  )

  // On ne propose que les modules présents dans le journal
  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: `Tout (${entries.length})` },
    ...MODULES.filter((m) => entries.some((e) => e.module === m)).map((m) => ({ id: m as Tab, label: m })),
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Journal d'audit</h1>
          <p className="page-subtitle">Qui a fait quoi, et quand. Les entrées ne peuvent pas être modifiées.</p>
        </div>
        <div className="search-box">
          <Icon d={ICONS.search} size={16} strokeWidth={2.2} />
          <label htmlFor="journal-search" className="sr-only">Rechercher dans le journal</label>
          <input
            id="journal-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Membre, action, cible"
          />
        </div>
      </div>

      <Pills items={tabs} value={tab} onChange={setTab} label="Filtrer par module" />

      <section className="card card--flush">
        <ol className="journal">
          {list.map((e) => (
            <li key={e.id} className="journal__item">
              <span className="journal__when">{e.when}</span>
              <span className="journal__dot" aria-hidden="true" />
              <span className="journal__body">
                <span className="journal__action">{e.action}</span>
                <span className="journal__meta">
                  <span className="journal__module">{e.module}</span>
                  {e.target} · par <strong>{e.who}</strong>
                </span>
              </span>
            </li>
          ))}
        </ol>
        {list.length === 0 && <p className="empty">Aucune action pour ces filtres.</p>}
      </section>
    </div>
  )
}

export default Journal
