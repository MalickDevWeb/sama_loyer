import { useCallback, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Icon, Modal, Switch, Toast, type Tone } from '../components/ui'
import { ABONNES, OFFERS, PREMIUM_PAYMENTS, PREMIUM_REVENUE_30D, SPONSORED } from '../data/mock'
import { ICONS, fmt } from '../lib/utils'
import { logAction } from '../lib/audit'
import './Premium.css'

function YesNo({ ok }: { ok: boolean }) {
  return <td style={{ fontWeight: 800, color: ok ? 'var(--success)' : 'var(--danger)' }}>{ok ? 'Oui' : 'Non'}</td>
}

type Offer = (typeof OFFERS)[number]

interface Draft {
  id: string | null
  label: string
  amount: string
  unit: string
  sub: string
}

// Statut d'un abonné selon les jours restants
const subStatus: Record<'active' | 'soon' | 'expired', { tone: Tone; label: (days: number) => string }> = {
  active: { tone: 'success', label: (d) => `Actif · ${d} j` },
  soon: { tone: 'warning', label: (d) => `Expire dans ${d} j` },
  expired: { tone: 'danger', label: () => 'Expiré · espace bloqué' },
}

const UNITS = ['/ mois', '· 30 jours', '· paiement unique']

/** « 15 000 F / mois » -> { amount: '15000', unit: '/ mois' } */
function splitPrice(price: string) {
  const m = price.match(/^([ds]+)s*Fs*(.*)$/)
  return { amount: m ? m[1].replace(/s/g, '') : '', unit: m && m[2] ? m[2] : '· paiement unique' }
}

function Premium() {
  const [offers, setOffers] = useState<Offer[]>(() => [...OFFERS])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [toast, setToast] = useState('')
  const closeDraft = useCallback(() => setDraft(null), [])
  const clearToast = useCallback(() => setToast(''), [])

  const openEdit = (o: Offer) => setDraft({ id: o.id, label: o.label, sub: o.sub, ...splitPrice(o.price) })
  const openNew = () => setDraft({ id: null, label: '', amount: '', unit: '/ mois', sub: '' })

  const saveDraft = (e: FormEvent) => {
    e.preventDefault()
    if (!draft) return
    const price = `${fmt(Number(draft.amount) || 0)} F ${draft.unit === '· paiement unique' ? '' : draft.unit}`.trim()
    if (draft.id) {
      setOffers((list) => list.map((o) => (o.id === draft.id ? { ...o, label: draft.label, sub: draft.sub, price } : o)))
      logAction('Abonnements', 'Offre modifiée', `${draft.label} · ${price}`)
      setToast(`Offre « ${draft.label} » mise à jour.`)
    } else {
      const id = `offre-${offers.length + 1}`
      setOffers((list) => [...list, { id, label: draft.label, sub: draft.sub, price, sold: 'Nouvelle offre' }])
      setActiveOffers((a) => ({ ...a, [id]: true }))
      logAction('Abonnements', 'Nouvelle offre créée', `${draft.label} · ${price}`)
      setToast(`Offre « ${draft.label} » créée et proposée aux bailleurs.`)
    }
    setDraft(null)
  }

  const [activeOffers, setActiveOffers] = useState<Record<string, boolean>>({ trial: true, pm: true, b7: true, b30: true })
  const [removed, setRemoved] = useState<Record<string, boolean>>({})

  // Abonnés : jours ajoutés par l'admin et relances envoyées (en attendant l'API)
  const [extra, setExtra] = useState<Record<string, number>>({})
  const [reminded, setReminded] = useState<Record<string, boolean>>({})
  const [extendId, setExtendId] = useState<string | null>(null)
  const closeExtend = useCallback(() => setExtendId(null), [])

  const abonnes = ABONNES.map((a) => {
    const days = a.daysLeft + (extra[a.id] ?? 0)
    const status = days < 0 ? subStatus.expired : days <= 7 ? subStatus.soon : subStatus.active
    return { ...a, days, status, end: extra[a.id] ? `dans ${days} j` : a.end }
  })
  const toExtend = abonnes.find((a) => a.id === extendId)

  const remind = (a: (typeof abonnes)[number]) => {
    setReminded((r) => ({ ...r, [a.id]: true }))
    logAction('Abonnements', 'Relance de renouvellement envoyée', a.name)
    setToast(`SMS de renouvellement envoyé à ${a.name}.`)
  }

  const extend = (a: (typeof abonnes)[number]) => {
    // Un abonnement expiré repart d'aujourd'hui, sinon on ajoute 30 jours à la date de fin
    setExtra((x) => ({ ...x, [a.id]: (x[a.id] ?? 0) + (a.days < 0 ? 30 - a.days : 30) }))
    logAction('Abonnements', 'Abonnement prolongé de 30 jours (geste commercial)', a.name)
    setToast(`${a.name} : 30 jours offerts.`)
    setExtendId(null)
  }

  // Une annonce n'est mise en avant que si les 3 conditions sont vraies
  const rows = SPONSORED.map((p) => {
    const isRemoved = !!removed[p.id]
    const live = p.sub && p.valid && p.dispo && !isRemoved
    let why = ''
    if (isRemoved) why = 'Retirée manuellement'
    else if (!p.sub) why = 'Abonnement expiré'
    else if (!p.valid) why = 'Pas validée'
    else if (!p.dispo) why = 'Déjà louée'
    return { ...p, live, why }
  })

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Abonnements et Boost</h1>
        <p className="page-subtitle">Offres bailleurs, paiements Max it et annonces mises en avant</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><span className="kpi__label">Abonnés Pro actifs</span><span className="kpi__value">214</span></div>
        <div className="kpi"><span className="kpi__label">Expirent sous 7 jours</span><span className="kpi__value">23</span></div>
        <div className="kpi"><span className="kpi__label">Annonces sponsorisées</span><span className="kpi__value">{rows.filter((r) => r.live).length}</span></div>
        <div className="kpi"><span className="kpi__label">Revenus abonnements (30 j)</span><span className="kpi__value">{fmt(PREMIUM_REVENUE_30D)} F</span></div>
      </div>

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">Offres proposées aux bailleurs</h2>
          <button type="button" className="btn btn--md btn--dark" onClick={openNew}>+ Nouvelle offre</button>
        </div>
        <div className="offers">
          {offers.map((o) => {
            const on = !!activeOffers[o.id]
            return (
              <div key={o.id} className={`offer${on ? ' offer--on' : ''}`}>
                <div className="offer__head">
                  <span className="offer__label">{o.label}</span>
                  <Switch
                    checked={on}
                    label={`Activer l’offre ${o.label}`}
                    onChange={() => setActiveOffers((a) => ({ ...a, [o.id]: !a[o.id] }))}
                  />
                </div>
                <span className="offer__price">{o.price}</span>
                <span className="offer__sub">{o.sub}</span>
                <span className="offer__sold">{o.sold}</span>
                <button type="button" className="offer__edit" onClick={() => openEdit(o)}>Modifier l'offre</button>
              </div>
            )
          })}
        </div>
      </section>

      <section className="card card--flush">
        <div className="card-head premium__subs-head">
          <div>
            <h2 className="card-title">Abonnés bailleurs</h2>
            <p className="card-subtitle">À la fin de l'essai ou de l'abonnement, l'espace bailleur est bloqué jusqu'au paiement Max it.</p>
          </div>
        </div>
        <div className="table-scroll">
          <table className="table table--head-bg" style={{ minWidth: 760 }}>
            <thead>
              <tr>
                <th>Bailleur</th>
                <th>Offre</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {abonnes.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.name}</strong></td>
                  <td>{a.plan}</td>
                  <td style={{ color: 'var(--text-2)' }}>{a.start}</td>
                  <td style={{ color: 'var(--text-2)' }}>{a.end}</td>
                  <td><Badge tone={a.status.tone}>{a.status.label(a.days)}</Badge></td>
                  <td>
                    <div className="tx-actions">
                      {a.status !== subStatus.active && (
                        <button type="button" className="btn btn--sm" disabled={reminded[a.id]} onClick={() => remind(a)}>
                          <Icon d={ICONS.bell} size={14} strokeWidth={2.2} /> {reminded[a.id] ? 'Relancé' : 'Relancer'}
                        </button>
                      )}
                      <button type="button" className="btn btn--sm" onClick={() => setExtendId(a.id)}>+30 jours</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="row">
        <section className="card premium__sponsored">
          <h2 className="card-title">Annonces sponsorisées</h2>
          <p className="card-subtitle">
            Une annonce n'est mise en avant que si les 3 conditions sont vraies. L'abonnement ne contourne jamais la validation.
          </p>
          <div className="table-scroll">
            <table className="table table--compact" style={{ minWidth: 620 }}>
              <thead>
                <tr>
                  <th>Annonce</th>
                  <th>Abonnement actif</th>
                  <th>Validée</th>
                  <th>Disponible</th>
                  <th>Mise en avant</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="cell-stack">
                        <strong>{p.title}</strong>
                        <span style={{ color: 'var(--muted)' }}>{p.owner} · fin {p.end}</span>
                      </span>
                    </td>
                    <YesNo ok={p.sub} />
                    <YesNo ok={p.valid} />
                    <YesNo ok={p.dispo} />
                    <td>
                      {p.live ? (
                        <button
                          type="button"
                          className="btn btn--sm"
                          onClick={() => {
                            setRemoved((r) => ({ ...r, [p.id]: true }))
                            logAction('Abonnements', 'Mise en avant retirée', p.title)
                          }}
                        >
                          Retirer
                        </button>
                      ) : (
                        <span className="premium__why">{p.why}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card premium__payments">
          <div className="card-head">
            <h2 className="card-title">Paiements confirmés</h2>
            <Link to="/transactions" className="link-strong">Tout voir</Link>
          </div>
          {PREMIUM_PAYMENTS.map((x) => (
            <div key={`${x.who}-${x.date}`} className="payment">
              <span className="payment__text">
                <span className="payment__who">{x.who}</span>
                <span className="payment__meta">{x.what} · {x.method} · {x.date}</span>
              </span>
              <span className="payment__amount">{x.amount}</span>
            </div>
          ))}
        </section>
      </div>

      {draft && (
        <Modal title={draft.id ? 'Modifier l’offre' : 'Nouvelle offre'} onClose={closeDraft}>
          <form className="offer-form" onSubmit={saveDraft}>
            <label className="form-field">
              <span>Nom de l'offre</span>
              <input required value={draft.label} placeholder="Ex. Boost 14 jours" onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
            </label>
            <div className="offer-form__row">
              <label className="form-field">
                <span>Prix (F CFA)</span>
                <input required type="number" min={0} step={500} value={draft.amount} placeholder="15000" onChange={(e) => setDraft({ ...draft, amount: e.target.value })} />
              </label>
              <label className="form-field">
                <span>Facturation</span>
                <select value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })}>
                  {UNITS.map((u) => <option key={u} value={u}>{u.replace(/^[/·]s*/, '')}</option>)}
                </select>
              </label>
            </div>
            <label className="form-field">
              <span>Ce que le bailleur obtient</span>
              <textarea required value={draft.sub} placeholder="Ex. 1 annonce en tête de son quartier" onChange={(e) => setDraft({ ...draft, sub: e.target.value })} />
            </label>
            <span className="form-field__hint">Le paiement se fait avec Max it. Le nouveau prix s'applique aux prochains achats.</span>
            <div className="dialog__actions">
              <button type="button" className="btn btn--lg" onClick={closeDraft}>Annuler</button>
              <button type="submit" className="btn btn--lg btn--berry">{draft.id ? 'Enregistrer' : 'Créer l’offre'}</button>
            </div>
          </form>
        </Modal>
      )}

      {toExtend && (
        <Modal title={`Offrir 30 jours à ${toExtend.name} ?`} role="alertdialog" onClose={closeExtend}>
          <p className="dialog__text">
            Geste commercial : l'espace bailleur reste ouvert 30 jours de plus, sans paiement.
            {toExtend.days < 0 ? ' Son espace est débloqué immédiatement.' : ''} L'action est enregistrée dans le journal.
          </p>
          <button type="button" className="btn btn--lg btn--berry" onClick={() => extend(toExtend)}>Offrir 30 jours</button>
          <button type="button" className="btn btn--lg" onClick={closeExtend}>Annuler</button>
        </Modal>
      )}

      {toast && <Toast message={toast} onDone={clearToast} />}
    </div>
  )
}

export default Premium
