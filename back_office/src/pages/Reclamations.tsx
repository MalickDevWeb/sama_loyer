import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, CheckMark, Switch } from '../components/ui'
import {
  FEATURES,
  PERMISSIONS,
  PRIORITY_TONE,
  REPORTS,
  ROLES,
  RULES,
  TICKETS,
  TICKET_TONE,
} from '../data/mock'
import './Reclamations.css'

type Tab = 'reports' | 'support' | 'roles' | 'settings'

function Reclamations() {
  const [tab, setTab] = useState<Tab>('reports')
  // Résultat de chaque signalement traité (en attendant l'API)
  const [closed, setClosed] = useState<Record<string, string>>({})
  const [perms, setPerms] = useState(() => ROLES.map((r) => [...r.perms]))
  const [features, setFeatures] = useState(() => Object.fromEntries(FEATURES.map((f) => [f.id, f.on])))

  const openCount = REPORTS.filter((r) => !closed[r.id]).length

  const tabs: { id: Tab; label: string }[] = [
    { id: 'reports', label: `Signalements (${openCount})` },
    { id: 'support', label: 'Assistance' },
    { id: 'roles', label: 'Rôles' },
    { id: 'settings', label: 'Paramètres' },
  ]

  const togglePerm = (ri: number, pi: number) => {
    if (ri === 0) return // Le super admin garde toutes les permissions
    setPerms((p) => p.map((row, i) => (i === ri ? row.map((v, j) => (j === pi ? !v : v)) : row)))
  }

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Réclamations et paramètres</h1>
        <p className="page-subtitle">Signalements, assistance, rôles de l'équipe et réglages de la plateforme</p>
      </div>

      <div role="tablist" aria-label="Sections" className="tabs">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className="tabs__tab" onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'reports' && (
        <div className="reports">
          {REPORTS.map((r) => {
            const result = closed[r.id]
            return (
              <article key={r.id} className="card report">
                <Badge tone={PRIORITY_TONE[r.prio]}>{r.prio}</Badge>
                <div className="report__body">
                  <span className="report__title">{r.title}</span>
                  <span className="report__detail">{r.detail}</span>
                  <span className="report__meta">
                    Signalé par {r.by} · {r.when} · cible : <Link to={r.to} className="report__target">{r.target}</Link>
                  </span>
                </div>
                {result ? (
                  <span className="report__result">{result}</span>
                ) : (
                  <div className="report__actions">
                    <button type="button" className="btn btn--md" onClick={() => setClosed((c) => ({ ...c, [r.id]: 'Classé sans suite' }))}>
                      Classer sans suite
                    </button>
                    <button type="button" className="btn btn--md btn--danger" onClick={() => setClosed((c) => ({ ...c, [r.id]: r.done }))}>
                      {r.actLabel}
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {tab === 'support' && (
        <section className="card card--flush">
          <div className="table-scroll">
            <table className="table table--head-bg" style={{ minWidth: 680 }}>
              <thead>
                <tr>
                  <th>Demande</th>
                  <th>Utilisateur</th>
                  <th>Canal</th>
                  <th>Ouverte</th>
                  <th>Assignée à</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {TICKETS.map((k) => (
                  <tr key={k.subject}>
                    <td><strong>{k.subject}</strong></td>
                    <td>{k.user}</td>
                    <td style={{ color: 'var(--text-2)' }}>{k.channel}</td>
                    <td style={{ color: 'var(--text-2)' }}>{k.when}</td>
                    <td>{k.agent}</td>
                    <td><Badge tone={TICKET_TONE[k.status]}>{k.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'roles' && (
        <section className="card">
          <div className="card-head">
            <div>
              <h2 className="card-title">Rôles et permissions</h2>
              <p className="card-subtitle roles__subtitle">Chaque membre de l'équipe n'a accès qu'à ce dont il a besoin.</p>
            </div>
            <button type="button" className="btn btn--md btn--dark">+ Inviter un membre</button>
          </div>
          <div className="table-scroll">
            <table className="table table--compact" style={{ minWidth: 720 }}>
              <thead>
                <tr>
                  <th>Rôle</th>
                  {PERMISSIONS.map((p) => (
                    <th key={p} className="roles__perm">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLES.map((r, ri) => (
                  <tr key={r.name}>
                    <td>
                      <span className="cell-stack">
                        <strong>{r.name}</strong>
                        <span style={{ color: 'var(--muted)' }}>{r.members}</span>
                      </span>
                    </td>
                    {PERMISSIONS.map((p, pi) => {
                      const on = perms[ri][pi]
                      const locked = ri === 0
                      return (
                        <td key={p} className="roles__perm">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={on}
                            aria-label={`${r.name} : ${p}`}
                            aria-disabled={locked}
                            className={`roles__check${locked ? ' roles__check--locked' : ''}`}
                            onClick={() => togglePerm(ri, pi)}
                          >
                            <CheckMark on={on} locked={locked} />
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'settings' && (
        <div className="row">
          <section className="card settings__features">
            <h2 className="card-title settings__title">Fonctionnalités</h2>
            {FEATURES.map((f) => (
              <div key={f.id} className="feature">
                <span className="feature__text">
                  <span className="feature__label">{f.label}</span>
                  <span className="feature__sub">{f.sub}</span>
                </span>
                <Switch
                  checked={!!features[f.id]}
                  label={f.label}
                  onChange={() => setFeatures((s) => ({ ...s, [f.id]: !s[f.id] }))}
                />
              </div>
            ))}
          </section>

          <form className="card settings__rules" onSubmit={(e) => e.preventDefault()}>
            <h2 className="card-title">Règles générales</h2>
            {RULES.map((r) => (
              <div key={r.id} className="field">
                <label htmlFor={r.id}>{r.label}</label>
                <input id={r.id} type="number" min={0} defaultValue={r.value} />
              </div>
            ))}
            <button type="submit" className="btn btn--berry">Enregistrer</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Reclamations
