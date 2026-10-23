import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, CheckMark } from '../components/ui'
import { ANNONCES_A_VALIDER, REFUSAL_REASONS, VALIDATION_CHECKS, photoOf } from '../data/mock'
import { logAction } from '../lib/audit'
import './Validation.css'

type Decision = 'ok' | 'fix' | 'no'

function dotColor(flags: number) {
  if (flags > 2) return 'var(--danger)'
  if (flags) return '#E0A526'
  return '#2BA36A'
}

function Validation() {
  const [currentId, setCurrentId] = useState<string | null>('v1')
  const [done, setDone] = useState<Record<string, Decision>>({})
  const [checks, setChecks] = useState<boolean[]>([])
  const [choosing, setChoosing] = useState<'fix' | 'no' | null>(null)
  const [log, setLog] = useState('')

  const pending = ANNONCES_A_VALIDER.filter((a) => !done[a.id])
  const current = ANNONCES_A_VALIDER.find((a) => a.id === currentId)
  const allChecked = VALIDATION_CHECKS.every((_, i) => checks[i])

  const select = (id: string) => {
    setCurrentId(id)
    setChecks([])
    setChoosing(null)
  }

  const decide = (kind: Decision, reason = '') => {
    if (!current) return
    const nextDone = { ...done, [current.id]: kind }
    const next = ANNONCES_A_VALIDER.find((a) => !nextDone[a.id])
    setDone(nextDone)
    setCurrentId(next ? next.id : null)
    setChecks([])
    setChoosing(null)
    const label = kind === 'ok' ? 'Annonce approuvée et mise en ligne' : kind === 'fix' ? `Correction demandée : ${reason}` : `Annonce refusée : ${reason}`
    logAction('Annonces', label, `${current.title} · ${current.place}`)
    if (kind === 'ok') setLog(`« ${current.title} » approuvée et mise en ligne.`)
    else if (kind === 'fix') setLog(`Correction demandée pour « ${current.title} » : ${reason}.`)
    else setLog(`« ${current.title} » refusée : ${reason}.`)
  }

  const toggleCheck = (i: number) => {
    setChecks((c) => {
      const next = [...c]
      next[i] = !next[i]
      return next
    })
  }

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Validation des annonces</h1>
        <p className="page-subtitle">{pending.length} annonce(s) en attente · objectif : réponse sous 24 h</p>
      </div>

      <div className="row">
        <section aria-label="File d'attente" className="card queue">
          {pending.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={a.id === currentId}
              className="queue__item"
              onClick={() => select(a.id)}
            >
              <img className="queue__thumb" src={photoOf(a.photos[0])} alt="" loading="lazy" />
              <span className="queue__text">
                <span className="queue__title">{a.title}</span>
                <span className="queue__meta">{a.place} · attend depuis {a.wait}</span>
                {a.flags.length > 0 && <span className="queue__flags">{a.flags.length} alerte(s)</span>}
              </span>
              <span className="queue__dot" style={{ background: dotColor(a.flags.length) }} />
            </button>
          ))}
          {pending.length === 0 && <p className="empty">File vide. Bravo.</p>}
        </section>

        {current && (
          <section aria-label="Examen de l'annonce" className="card review">
            <div className="review__head">
              <div>
                <h2 className="review__title">{current.title}</h2>
                <p className="review__meta">
                  {current.type} · {current.place} · <strong>{current.price} FCFA/mois</strong> · caution {current.caution}
                </p>
              </div>
              <Link to="/bailleurs" className="review__owner">
                Bailleur : {current.owner}{' '}
                <Badge tone={current.ownerOk ? 'success' : 'warning'}>{current.ownerOk ? 'Vérifié' : 'À vérifier'}</Badge>
              </Link>
            </div>

            {current.flags.length > 0 && (
              <div className="review__alerts">
                <span className="review__alerts-title">Alertes automatiques</span>
                {current.flags.map((f) => (
                  <span key={f} className="review__alert"><span aria-hidden="true">•</span>{f}</span>
                ))}
              </div>
            )}

            <div>
              <h3 className="review__h3">Photos ({current.photos.length}) et vidéo</h3>
              <div className="photos">
                {current.photos.map((p) => (
                  <div key={p} className="photos__item">
                    <img src={photoOf(p)} alt={p} loading="lazy" />
                    <span>{p}</span>
                  </div>
                ))}
                {current.video && (
                  <div className="photos__item photos__item--video">
                    <img src={photoOf(current.photos[0])} alt="" loading="lazy" />
                    <span className="photos__play" aria-hidden="true">▶</span>
                    <span>Vidéo 0:28</span>
                  </div>
                )}
              </div>
            </div>

            <div className="row">
              <div className="review__col">
                <h3 className="review__h3">Description</h3>
                <p className="review__desc">{current.desc}</p>
                <h3 className="review__h3 review__h3--spaced">Équipements déclarés</h3>
                <p className="review__equip">{current.equip}</p>
              </div>
              <div className="review__col review__col--narrow">
                <h3 className="review__h3">Liste de contrôle</h3>
                <div className="checklist">
                  {VALIDATION_CHECKS.map((c, i) => (
                    <button
                      key={c}
                      type="button"
                      role="checkbox"
                      aria-checked={!!checks[i]}
                      className={`checklist__item${checks[i] ? ' checklist__item--on' : ''}`}
                      onClick={() => toggleCheck(i)}
                    >
                      <CheckMark on={!!checks[i]} />
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="decision">
              {choosing && (
                <>
                  <span className="decision__label">Motif à envoyer au bailleur</span>
                  <div className="pills">
                    {REFUSAL_REASONS.map((r) => (
                      <button key={r} type="button" className="pill" onClick={() => decide(choosing, r)}>{r}</button>
                    ))}
                  </div>
                </>
              )}
              <div className="decision__buttons">
                <button type="button" className="btn btn--lg btn--danger-outline" onClick={() => setChoosing('no')}>Refuser</button>
                <button type="button" className="btn btn--lg" onClick={() => setChoosing('fix')}>Demander une correction</button>
                <button
                  type="button"
                  className={`btn btn--lg ${allChecked ? 'btn--success' : 'btn--disabled'}`}
                  aria-disabled={!allChecked}
                  onClick={() => allChecked && decide('ok')}
                >
                  {allChecked ? 'Approuver et publier' : 'Coche les 6 points pour approuver'}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {log && <div role="status" className="toast">{log}</div>}
    </div>
  )
}

export default Validation
