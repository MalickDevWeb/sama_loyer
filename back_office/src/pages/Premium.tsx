import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Switch } from '../components/ui'
import { OFFERS, PREMIUM_PAYMENTS, SPONSORED } from '../data/mock'
import './Premium.css'

function YesNo({ ok }: { ok: boolean }) {
  return <td style={{ fontWeight: 800, color: ok ? 'var(--success)' : 'var(--danger)' }}>{ok ? 'Oui' : 'Non'}</td>
}

function Premium() {
  const [activeOffers, setActiveOffers] = useState<Record<string, boolean>>({ pm: true, b7: true, b30: true })
  const [removed, setRemoved] = useState<Record<string, boolean>>({})

  // Une annonce n'est mise en avant que si les 3 conditions sont vraies
  const rows = SPONSORED.map((p) => {
    const isRemoved = !!removed[p.id]
    const live = p.sub && p.valid && p.dispo && !isRemoved
    let why = ''
    if (isRemoved) why = 'Retirée manuellement'
    else if (!p.sub) why = 'Masquée : abonnement expiré'
    else if (!p.valid) why = 'Masquée : pas validée'
    else if (!p.dispo) why = 'Masquée : non disponible'
    return { ...p, live, why }
  })

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Abonnements Premium</h1>
        <p className="page-subtitle">Offres, paiements confirmés et annonces sponsorisées</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><span className="kpi__label">Abonnés actifs</span><span className="kpi__value">214</span></div>
        <div className="kpi"><span className="kpi__label">Expirent sous 7 jours</span><span className="kpi__value">23</span></div>
        <div className="kpi"><span className="kpi__label">Annonces sponsorisées</span><span className="kpi__value">{rows.filter((r) => r.live).length}</span></div>
        <div className="kpi"><span className="kpi__label">Paiements Premium (30 j)</span><span className="kpi__value">[MONTANT] F</span></div>
      </div>

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">Offres proposées aux bailleurs</h2>
          <button type="button" className="btn btn--md btn--dark">+ Nouvelle offre</button>
        </div>
        <div className="offers">
          {OFFERS.map((o) => {
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
                <button type="button" className="offer__edit">Modifier l'offre</button>
              </div>
            )
          })}
        </div>
      </section>

      <div className="row">
        <section className="card premium__sponsored">
          <h2 className="card-title">Annonces sponsorisées</h2>
          <p className="card-subtitle">
            Une annonce n'est mise en avant que si les 3 conditions sont vraies. Le Premium ne contourne jamais la validation.
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
                          onClick={() => setRemoved((r) => ({ ...r, [p.id]: true }))}
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
    </div>
  )
}

export default Premium
