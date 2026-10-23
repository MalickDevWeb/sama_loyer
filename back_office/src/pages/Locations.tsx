import { useCallback, useMemo, useState } from 'react'
import { Badge, Icon, Modal, Pills, Toast } from '../components/ui'
import { ICONS, fmt, norm } from '../lib/utils'
import { logAction } from '../lib/audit'
import { LOCATIONS, LOCATION_STATUS, type Location, type LocationStatus, type MonthState } from '../data/mock'
import './Locations.css'

type Tab = 'all' | LocationStatus

const MONTH_LABEL: Record<MonthState, string> = { paid: 'payé', late: 'en retard', due: 'à venir' }

function Locations() {
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('l3')
  // Modifications faites par l'admin (en attendant l'API)
  const [overrides, setOverrides] = useState<Record<string, Partial<Location>>>({})
  const [modal, setModal] = useState<'contract' | 'caution' | null>(null)
  const [toast, setToast] = useState('')
  const closeModal = useCallback(() => setModal(null), [])
  const clearToast = useCallback(() => setToast(''), [])

  const all = useMemo(() => LOCATIONS.map((l) => ({ ...l, ...overrides[l.id] })), [overrides])
  const count = (s: LocationStatus) => all.filter((l) => l.status === s).length
  const q = norm(query)
  const list = all.filter(
    (l) => (tab === 'all' || l.status === tab) && (!q || norm(`${l.tenant} ${l.logement} ${l.owner} ${l.contract}`).includes(q)),
  )
  const selected = all.find((l) => l.id === selectedId)

  const active = all.filter((l) => l.status !== 'ended')
  const monthRent = active.reduce((s, l) => s + l.rent, 0)
  const lateRent = all.filter((l) => l.status === 'late').reduce((s, l) => s + l.rent, 0)
  const cautions = active.reduce((s, l) => s + l.caution, 0)

  const update = (l: Location, patch: Partial<Location>, action: string, message: string) => {
    setOverrides((o) => ({ ...o, [l.id]: { ...o[l.id], ...patch } }))
    logAction('Locations', action, `${l.tenant} · ${l.logement}`)
    setToast(message)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: `Toutes (${all.length})` },
    { id: 'ok', label: `À jour (${count('ok')})` },
    { id: 'late', label: `En retard (${count('late')})` },
    { id: 'notice', label: `Préavis (${count('notice')})` },
    { id: 'ended', label: `Terminées (${count('ended')})` },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Locations et loyers</h1>
          <p className="page-subtitle">Contrats signés, loyers du mois, cautions et préavis de départ</p>
        </div>
        <div className="search-box">
          <Icon d={ICONS.search} size={16} strokeWidth={2.2} />
          <label htmlFor="location-search" className="sr-only">Rechercher une location</label>
          <input
            id="location-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Locataire, logement, contrat"
          />
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><span className="kpi__label">Locations actives</span><span className="kpi__value">{active.length}</span><span className="kpi__delta" style={{ color: 'var(--muted)' }}>contrats signés dans l'appli</span></div>
        <div className="kpi"><span className="kpi__label">Loyers attendus ce mois</span><span className="kpi__value">{fmt(monthRent)} F</span><span className="kpi__delta" style={{ color: 'var(--success)' }}>prélevés via Max it</span></div>
        <div className="kpi"><span className="kpi__label">Loyers en retard</span><span className="kpi__value">{fmt(lateRent)} F</span><span className="kpi__delta" style={{ color: 'var(--danger)' }}>{count('late')} locataire(s)</span></div>
        <div className="kpi"><span className="kpi__label">Cautions détenues</span><span className="kpi__value">{fmt(cautions)} F</span><span className="kpi__delta" style={{ color: 'var(--warning-text)' }}>{count('notice')} à restituer bientôt</span></div>
      </div>

      <Pills items={tabs} value={tab} onChange={setTab} label="Filtrer par statut" />

      <div className="row">
        <section className="card card--flush list-card">
          <div className="table-scroll">
            <table className="table table--head-bg" style={{ minWidth: 680 }}>
              <thead>
                <tr>
                  <th>Locataire</th>
                  <th>Bailleur</th>
                  <th className="num">Loyer</th>
                  <th>Prochain loyer</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {list.map((l) => (
                  <tr key={l.id} className={`list-row${l.id === selectedId ? ' list-row--on' : ''}`} onClick={() => setSelectedId(l.id)}>
                    <td>
                      <button type="button" className="list-who" aria-label={`Ouvrir la location de ${l.tenant}`} onClick={() => setSelectedId(l.id)}>
                        <span className="cell-stack">
                          <strong>{l.tenant}</strong>
                          <span className="list-meta">{l.logement}</span>
                        </span>
                      </button>
                    </td>
                    <td>{l.owner}</td>
                    <td className="num"><strong>{fmt(l.rent)} F</strong></td>
                    <td style={{ color: l.status === 'late' ? 'var(--danger)' : 'var(--text-2)', fontWeight: l.status === 'late' ? 800 : 500 }}>{l.next}</td>
                    <td><Badge tone={LOCATION_STATUS[l.status].tone}>{LOCATION_STATUS[l.status].label}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {list.length === 0 && <p className="empty">Aucune location ne correspond.</p>}
        </section>

        {selected && (
          <section aria-label="Détail de la location" className="card detail-card">
            <div>
              <h2 className="detail-card__title">{selected.tenant}</h2>
              <p className="list-meta" style={{ margin: '0 0 6px' }}>{selected.logement} · bailleur {selected.owner}</p>
              <Badge tone={LOCATION_STATUS[selected.status].tone}>{LOCATION_STATUS[selected.status].label}</Badge>
            </div>

            <div className="info-grid">
              <div><span>Loyer</span><strong>{fmt(selected.rent)} F / mois</strong></div>
              <div><span>Caution</span><strong>{fmt(selected.caution)} F</strong></div>
              <div><span>Début du bail</span><strong>{selected.start}</strong></div>
              <div><span>Entrée</span><strong>{selected.via}</strong></div>
            </div>

            <div>
              <h3 className="detail-card__h3">Loyers des derniers mois</h3>
              <div className="months">
                {selected.months.map((m) => (
                  <span key={m.m} className={`months__item months__item--${m.s}`} title={`${m.m} : ${MONTH_LABEL[m.s]}`}>
                    <span className="months__dot" />
                    {m.m}
                  </span>
                ))}
              </div>
            </div>

            <div className={`note ${selected.status === 'late' ? 'note--danger' : selected.status === 'notice' ? 'note--warning' : selected.status === 'ok' ? 'note--success' : 'note--neutral'}`}>
              {selected.info}
            </div>

            <div className="detail-card__actions">
              <button type="button" className="btn" onClick={() => setModal('contract')}>Voir le contrat</button>
              {selected.status === 'late' && (
                <button
                  type="button"
                  className="btn btn--dark"
                  onClick={() => update(selected, {}, 'Rappel de loyer envoyé', `Rappel SMS envoyé à ${selected.tenant}.`)}
                >
                  <Icon d={ICONS.bell} size={15} strokeWidth={2.2} /> Rappel SMS
                </button>
              )}
              {selected.status === 'notice' && (
                <button type="button" className="btn btn--berry" onClick={() => setModal('caution')}>Restituer la caution</button>
              )}
            </div>
            {selected.status === 'late' && (
              <button
                type="button"
                className="btn btn--success"
                onClick={() =>
                  update(
                    selected,
                    { status: 'ok', next: '1 nov.', info: 'Loyer régularisé : paiement confirmé par le bailleur.', months: selected.months.map((m) => (m.s === 'late' ? { ...m, s: 'paid' } : m)) },
                    'Loyer marqué payé (confirmé par le bailleur)',
                    `Loyer de ${selected.tenant} marqué payé.`,
                  )
                }
              >
                Marquer payé (confirmé par le bailleur)
              </button>
            )}
            <p className="detail-card__hint">Chaque action est enregistrée dans le journal.</p>
          </section>
        )}
      </div>

      {modal === 'contract' && selected && (
        <Modal title={`Contrat ${selected.contract}`} onClose={closeModal} wide>
          <div className="contract">
            <p className="contract__lead">Contrat de location signé électroniquement dans SAMA LOYER.</p>
            <dl className="receipt__rows">
              <div><dt>Locataire</dt><dd>{selected.tenant}</dd></div>
              <div><dt>Bailleur</dt><dd>{selected.owner}</dd></div>
              <div><dt>Logement</dt><dd>{selected.logement}</dd></div>
              <div><dt>Loyer mensuel</dt><dd>{fmt(selected.rent)} F, payable avec Max it avant le 5 du mois</dd></div>
              <div><dt>Caution</dt><dd>{fmt(selected.caution)} F ({Math.round(selected.caution / selected.rent)} mois, conforme au décret de 2023)</dd></div>
              <div><dt>Début</dt><dd>{selected.start}</dd></div>
              <div><dt>Préavis</dt><dd>1 mois</dd></div>
            </dl>
            <p className="contract__sign">Signé par les deux parties · code de confirmation reçu par SMS</p>
          </div>
          <div className="dialog__actions">
            <button type="button" className="btn btn--lg" onClick={closeModal}>Fermer</button>
          </div>
        </Modal>
      )}

      {modal === 'caution' && selected && (
        <Modal title="Restituer la caution ?" role="alertdialog" onClose={closeModal}>
          <p className="dialog__text">
            <strong>{fmt(selected.caution)} F</strong> seront renvoyés sur le compte Max it de {selected.tenant} après l'état des
            lieux de sortie validé par {selected.owner}. La location sera clôturée.
          </p>
          <button
            type="button"
            className="btn btn--lg btn--berry"
            onClick={() => {
              update(
                selected,
                { status: 'ended', next: '—', info: `Bail terminé. Caution de ${fmt(selected.caution)} F restituée via Max it.` },
                'Caution restituée et location clôturée',
                `${fmt(selected.caution)} F restitués à ${selected.tenant}.`,
              )
              setModal(null)
            }}
          >
            Confirmer la restitution
          </button>
          <button type="button" className="btn btn--lg" onClick={closeModal}>Annuler</button>
        </Modal>
      )}

      {toast && <Toast message={toast} onDone={clearToast} />}
    </div>
  )
}

export default Locations
