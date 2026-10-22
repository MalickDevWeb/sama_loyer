import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Icon, ICONS, fmt } from '../components/ui'
import { DASHBOARD_KPIS, SIGNUP_MONTHS, SIGNUPS, TODO, TRANSACTIONS, TX_TONE, ZONES } from '../data/mock'
import './Dashboard.css'

type Range = 'w' | 'm' | 'y'

const RANGES: { id: Range; label: string }[] = [
  { id: 'w', label: '7 jours' },
  { id: 'm', label: '30 jours' },
  { id: 'y', label: '12 mois' },
]

const DELTA_COLOR = { up: 'var(--success)', down: 'var(--danger)', warn: 'var(--warning-text)' }

const CHART_MAX = 1400
const ZONE_MAX = ZONES[0][1]

function Dashboard() {
  const [range, setRange] = useState<Range>('m')

  return (
    <div className="page dashboard">
      <div className="page-header page-header--center">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">Vue d'ensemble de la plateforme · octobre 2026</p>
        </div>
        <div className="dashboard__tools">
          <span className="demo-tag">Données de démonstration</span>
          <div role="group" aria-label="Période" className="segmented">
            {RANGES.map((r) => (
              <button key={r.id} type="button" aria-pressed={range === r.id} onClick={() => setRange(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        {DASHBOARD_KPIS.map((k) => {
          const body = (
            <>
              <span className="kpi__label">{k.label}</span>
              <span className="kpi__value">{k.value}</span>
              <span className="kpi__delta" style={{ color: DELTA_COLOR[k.tone] }}>{k.delta}</span>
            </>
          )
          return k.to ? (
            <Link key={k.label} to={k.to} className="kpi">{body}</Link>
          ) : (
            <div key={k.label} className="kpi">{body}</div>
          )
        })}
      </div>

      <div className="row row--stretch">
        <section className="card dashboard__signups">
          <h2 className="card-title">Nouvelles inscriptions par mois</h2>
          <p className="card-subtitle">Locataires et bailleurs · 12 derniers mois</p>
          <div
            className="bar-chart"
            role="img"
            aria-label="Inscriptions mensuelles, de 420 en novembre 2025 à 1 380 en octobre 2026"
          >
            {SIGNUPS.map((v, i) => {
              const last = i === SIGNUPS.length - 1
              return (
                <div key={SIGNUP_MONTHS[i]} className="bar-chart__col" title={`${SIGNUP_MONTHS[i]} : ${fmt(v)} inscriptions`}>
                  {last && <span className="bar-chart__value">{fmt(v)}</span>}
                  <div
                    className={`bar-chart__bar${last ? ' bar-chart__bar--last' : ''}`}
                    style={{ height: Math.round((v / CHART_MAX) * 200) }}
                  />
                </div>
              )
            })}
          </div>
          <div className="bar-chart__labels">
            {SIGNUP_MONTHS.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </section>

        <section className="card dashboard__todo">
          <h2 className="card-title">À traiter</h2>
          {TODO.map((t) => (
            <Link key={t.label} to={t.to} className="todo-item">
              <span className="todo-item__num" style={{ background: t.color }}>{t.n}</span>
              <span className="todo-item__text">
                <span className="todo-item__label">{t.label}</span>
                <span className="todo-item__sub">{t.sub}</span>
              </span>
              <Icon d={ICONS.chevron} size={16} strokeWidth={2.2} />
            </Link>
          ))}
        </section>
      </div>

      <div className="row row--stretch">
        <section className="card dashboard__zones">
          <h2 className="card-title">Annonces en ligne par zone</h2>
          <p className="card-subtitle">Top 5 des communes</p>
          <div className="zone-list">
            {ZONES.map(([name, value]) => (
              <div key={name} className="zone-row" title={`${name} : ${fmt(value)} annonces`}>
                <span className="zone-row__name">{name}</span>
                <div className="zone-row__track">
                  <div className="zone-row__bar" style={{ width: `${Math.round((value / ZONE_MAX) * 100)}%` }} />
                </div>
                <span className="zone-row__value">{fmt(value)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card dashboard__tx">
          <div className="card-head">
            <h2 className="card-title">Dernières transactions</h2>
            <Link to="/transactions" className="link-strong">Tout voir</Link>
          </div>
          <div className="table-scroll">
            <table className="table table--compact" style={{ minWidth: 560 }}>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Utilisateur</th>
                  <th>Type</th>
                  <th className="num">Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {TRANSACTIONS.slice(0, 5).map((x) => (
                  <tr key={x.ref}>
                    <td className="mono">{x.ref}</td>
                    <td>{x.user}</td>
                    <td style={{ color: 'var(--text-2)' }}>{x.label}</td>
                    <td className="num"><strong>{x.amount}</strong></td>
                    <td><Badge tone={TX_TONE[x.status]}>{x.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
