import { useMemo, useState } from 'react'
import { Avatar, Badge, Icon, ICONS, Pills, norm } from '../components/ui'
import { BAILLEURS, BAILLEUR_STATUS, type BailleurStatus } from '../data/mock'
import './Bailleurs.css'

type Tab = 'all' | 'pending' | 'active' | 'suspended'

const NOTE_CLASS: Record<BailleurStatus, string> = {
  active: 'note--success',
  pending: 'note--warning',
  suspended: 'note--danger',
  rejected: 'note--neutral',
}

function reportColor(n: number) {
  if (n >= 3) return 'var(--danger)'
  if (n > 0) return 'var(--warning)'
  return 'var(--muted)'
}

function Bailleurs() {
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('b2')
  // Statuts modifiés par les actions de l'admin (en attendant l'API)
  const [overrides, setOverrides] = useState<Record<string, BailleurStatus>>({})

  const all = useMemo(
    () => BAILLEURS.map((b) => ({ ...b, status: overrides[b.id] ?? b.status })),
    [overrides],
  )

  const count = (s: BailleurStatus) => all.filter((b) => b.status === s).length
  const q = norm(query)
  const list = all.filter(
    (b) => (tab === 'all' || b.status === tab) && (!q || norm(`${b.name} ${b.zone} ${b.phone}`).includes(q)),
  )
  const selected = all.find((b) => b.id === selectedId)

  const setStatus = (status: BailleurStatus) => {
    if (selected) setOverrides((o) => ({ ...o, [selected.id]: status }))
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: `Tous (${all.length})` },
    { id: 'pending', label: `À vérifier (${count('pending')})` },
    { id: 'active', label: `Vérifiés (${count('active')})` },
    { id: 'suspended', label: `Suspendus (${count('suspended')})` },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des bailleurs</h1>
          <p className="page-subtitle">Comptes, vérification d'identité et suspensions</p>
        </div>
        <div className="search-box">
          <Icon d={ICONS.search} size={16} strokeWidth={2.2} />
          <label htmlFor="bailleur-search" className="sr-only">Rechercher un bailleur</label>
          <input
            id="bailleur-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, téléphone, quartier"
          />
        </div>
      </div>

      <Pills items={tabs} value={tab} onChange={setTab} label="Filtrer par statut" />

      <div className="row">
        <section className="card card--flush bailleurs__table">
          <div className="table-scroll">
            <table className="table table--head-bg" style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th>Bailleur</th>
                  <th>Annonces</th>
                  <th>Inscrit le</th>
                  <th>Signalements</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {list.map((b) => (
                  <tr
                    key={b.id}
                    className={`bailleurs__row${b.id === selectedId ? ' bailleurs__row--on' : ''}`}
                    onClick={() => setSelectedId(b.id)}
                  >
                    <td>
                      <button type="button" className="bailleurs__who" aria-label={`Ouvrir la fiche de ${b.name}`} onClick={() => setSelectedId(b.id)}>
                        <Avatar initials={b.initials} color={b.color} />
                        <span className="cell-stack">
                          <strong>{b.name}</strong>
                          <span className="bailleurs__meta">{b.phone} · {b.zone}</span>
                        </span>
                      </button>
                    </td>
                    <td><strong>{b.ads}</strong></td>
                    <td style={{ color: 'var(--text-2)' }}>{b.since}</td>
                    <td style={{ fontWeight: 800, color: reportColor(b.reports) }}>{b.reports}</td>
                    <td><Badge tone={BAILLEUR_STATUS[b.status].tone}>{BAILLEUR_STATUS[b.status].label}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {list.length === 0 && <p className="empty">Aucun bailleur ne correspond.</p>}
        </section>

        {selected && (
          <section aria-label="Fiche du bailleur" className="card bailleur-card">
            <div className="bailleur-card__head">
              <Avatar initials={selected.initials} color={selected.color} size={52} />
              <div>
                <h2 className="bailleur-card__name">{selected.name}</h2>
                <Badge tone={BAILLEUR_STATUS[selected.status].tone}>{BAILLEUR_STATUS[selected.status].label}</Badge>
              </div>
            </div>

            <div className="info-grid">
              <div><span>Téléphone</span><strong>{selected.phone}</strong></div>
              <div><span>Zone</span><strong>{selected.zone}</strong></div>
              <div><span>Annonces</span><strong>{selected.ads}</strong></div>
              <div><span>Abonnement</span><strong>{selected.plan}</strong></div>
            </div>

            <div>
              <h3 className="bailleur-card__h3">Pièce d'identité</h3>
              <div className="id-docs">
                <div>Recto</div>
                <div>Verso</div>
              </div>
              <p className="bailleur-card__hint">Visible uniquement par les administrateurs. Jamais affichée aux locataires.</p>
            </div>

            <div className={`note ${NOTE_CLASS[selected.status]}`}>{BAILLEUR_STATUS[selected.status].note}</div>

            {selected.status === 'pending' && (
              <div className="bailleur-card__actions">
                <button type="button" className="btn btn--danger-outline" onClick={() => setStatus('rejected')}>Refuser la pièce</button>
                <button type="button" className="btn btn--success" onClick={() => setStatus('active')}>Vérifier l'identité</button>
              </div>
            )}
            {selected.status === 'active' && (
              <button type="button" className="btn btn--danger-outline" onClick={() => setStatus('suspended')}>Suspendre le compte</button>
            )}
            {(selected.status === 'suspended' || selected.status === 'rejected') && (
              <button type="button" className="btn btn--dark" onClick={() => setStatus('active')}>Réactiver le compte</button>
            )}
            <p className="bailleur-card__hint">Chaque action est enregistrée dans le journal avec ton nom et l'heure.</p>
          </section>
        )}
      </div>
    </div>
  )
}

export default Bailleurs
