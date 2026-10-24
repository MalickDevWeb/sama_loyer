import { useCallback, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Badge, CheckMark, Modal, Switch, Toast } from '../components/ui'
import {
  ALLOW_CUSTOM_CONTRACT,
  DOCUMENT_REQUIREMENTS,
  FEATURES,
  PERMISSIONS,
  PRIORITY_TONE,
  REPORTS,
  ROLES,
  RULES,
  TICKETS,
  TICKET_TONE,
  type DocFormat,
  type DocumentRequirement,
} from '../data/mock'
import { logAction } from '../lib/audit'
import './Reclamations.css'

type Tab = 'reports' | 'support' | 'roles' | 'settings'

function Reclamations() {
  const [tab, setTab] = useState<Tab>('reports')
  // Résultat de chaque signalement traité (en attendant l'API)
  const [closed, setClosed] = useState<Record<string, string>>({})
  const [perms, setPerms] = useState(() => ROLES.map((r) => [...r.perms]))
  const [features, setFeatures] = useState(() => Object.fromEntries(FEATURES.map((f) => [f.id, f.on])))
  const [saved, setSaved] = useState(false)
  // Pièces exigées des bailleurs et contrat spécifique (en attendant l'API)
  const [docs, setDocs] = useState<DocumentRequirement[]>(() => DOCUMENT_REQUIREMENTS.map((d) => ({ ...d, formats: [...d.formats] })))
  const [allowCustomContract, setAllowCustomContract] = useState(ALLOW_CUSTOM_CONTRACT)
  const [docsSaved, setDocsSaved] = useState(true)
  const [addingDoc, setAddingDoc] = useState(false)
  // Nombre de membres par rôle (augmente à chaque invitation)
  const [members, setMembers] = useState(() => ROLES.map((r) => parseInt(r.members, 10) || 0))
  const [inviting, setInviting] = useState(false)
  const [toast, setToast] = useState('')
  const closeInvite = useCallback(() => setInviting(false), [])
  const closeAddDoc = useCallback(() => setAddingDoc(false), [])

  const updateDoc = (id: string, patch: Partial<DocumentRequirement>) => {
    setDocs((list) => list.map((d) => (d.id === id ? { ...d, ...patch } : d)))
    setDocsSaved(false)
  }

  // Une pièce doit accepter au moins un format (photo ou PDF)
  const toggleFormat = (doc: DocumentRequirement, format: DocFormat) => {
    const has = doc.formats.includes(format)
    if (has && doc.formats.length === 1) {
      setToast('Garde au moins un format : photo ou PDF.')
      return
    }
    updateDoc(doc.id, { formats: has ? doc.formats.filter((f) => f !== format) : [...doc.formats, format] })
  }

  const removeDoc = (doc: DocumentRequirement) => {
    setDocs((list) => list.filter((d) => d.id !== doc.id))
    setDocsSaved(false)
  }

  const addDoc = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const label = String(data.get('label')).trim()
    const formats = (['image', 'pdf'] as DocFormat[]).filter((f) => data.get(f))
    if (!formats.length) {
      setToast('Choisis au moins un format : photo ou PDF.')
      return
    }
    const doc: DocumentRequirement = {
      id: `doc_${Date.now()}`,
      label,
      hint: String(data.get('hint') || '').trim(),
      required: data.get('required') === 'on',
      formats,
      maxFiles: Number(data.get('maxFiles')) || 1,
    }
    setDocs((list) => [...list, doc])
    setDocsSaved(false)
    setAddingDoc(false)
  }

  const saveDocs = () => {
    setDocsSaved(true)
    logAction('Bailleurs', 'Pièces exigées modifiées', `${docs.length} pièce(s) · contrat spécifique ${allowCustomContract ? 'autorisé' : 'désactivé'}`)
    setToast('Pièces exigées enregistrées. Les bailleurs voient la nouvelle liste à leur prochaine ouverture.')
  }
  const clearToast = useCallback(() => setToast(''), [])

  const sendInvite = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name'))
    const ri = Number(data.get('role'))
    setMembers((m) => m.map((n, i) => (i === ri ? n + 1 : n)))
    logAction('Équipe', `Membre invité (${ROLES[ri].name})`, name)
    setInviting(false)
    setToast(`Invitation envoyée à ${name} (${ROLES[ri].name}).`)
  }

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
                    <button type="button" className="btn btn--md" onClick={() => {
                      setClosed((c) => ({ ...c, [r.id]: 'Classé sans suite' }))
                      logAction('Réclamations', 'Signalement classé sans suite', r.title)
                    }}>
                      Classer sans suite
                    </button>
                    <button type="button" className="btn btn--md btn--danger" onClick={() => {
                      setClosed((c) => ({ ...c, [r.id]: r.done }))
                      logAction('Réclamations', r.done, r.target)
                    }}>
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
            <button type="button" className="btn btn--md btn--dark" onClick={() => setInviting(true)}>+ Inviter un membre</button>
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
                        <span style={{ color: 'var(--muted)' }}>{members[ri]} membre{members[ri] > 1 ? 's' : ''}</span>
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
        <section className="card card--flush docs-req">
          <div className="card-head docs-req__head">
            <div>
              <h2 className="card-title">Pièces exigées des bailleurs</h2>
              <p className="card-subtitle">L'écran du bailleur se construit à partir de cette liste : une pièce ajoutée ici s'affiche sans mise à jour de l'appli.</p>
            </div>
            <button type="button" className="btn btn--md" onClick={() => setAddingDoc(true)}>Ajouter une pièce</button>
          </div>
          <div className="table-scroll">
            <table className="table table--head-bg">
              <thead>
                <tr>
                  <th>Pièce</th>
                  <th className="docs-req__center">Obligatoire</th>
                  <th className="docs-req__center">Photo</th>
                  <th className="docs-req__center">PDF</th>
                  <th className="docs-req__center">Fichiers max</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {docs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="docs-req__empty">Aucune pièce demandée : les bailleurs publient sans vérification d'identité.</td>
                  </tr>
                )}
                {docs.map((d) => (
                  <tr key={d.id}>
                    <td className="docs-req__doc">
                      <span className="feature__label">{d.label}</span>
                      {d.hint && <span className="feature__sub">{d.hint}</span>}
                    </td>
                    <td className="docs-req__center">
                      <Switch checked={d.required} label={`${d.label} obligatoire`} onChange={() => updateDoc(d.id, { required: !d.required })} />
                    </td>
                    {(['image', 'pdf'] as DocFormat[]).map((f) => (
                      <td key={f} className="docs-req__center">
                        <button
                          type="button"
                          className="roles__check"
                          aria-pressed={d.formats.includes(f)}
                          aria-label={`${d.label} : ${f === 'image' ? 'photo' : 'PDF'} accepté`}
                          onClick={() => toggleFormat(d, f)}
                        >
                          <CheckMark on={d.formats.includes(f)} />
                        </button>
                      </td>
                    ))}
                    <td className="docs-req__center">
                      <input
                        className="docs-req__max"
                        type="number"
                        min={1}
                        max={5}
                        value={d.maxFiles}
                        aria-label={`${d.label} : nombre de fichiers maximum`}
                        onChange={(e) => updateDoc(d.id, { maxFiles: Math.min(5, Math.max(1, Number(e.target.value) || 1)) })}
                      />
                    </td>
                    <td className="num">
                      <button type="button" className="btn btn--sm" onClick={() => removeDoc(d)}>Retirer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="feature docs-req__contract">
            <span className="feature__text">
              <span className="feature__label">Contrat spécifique par logement</span>
              <span className="feature__sub">Le bailleur peut remplacer le modèle SAMA LOYER par son propre contrat PDF (meublé, colocation…). Le contrat est vérifié avec l'annonce.</span>
            </span>
            <Switch
              checked={allowCustomContract}
              label="Autoriser un contrat spécifique par logement"
              onChange={() => {
                setAllowCustomContract((v) => !v)
                setDocsSaved(false)
              }}
            />
          </div>
          <div className="docs-req__foot">
            {!docsSaved && <span className="feature__sub">Modifications non enregistrées</span>}
            <button type="button" className="btn btn--berry" disabled={docsSaved} onClick={saveDocs}>Enregistrer</button>
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

          <form
            className="card settings__rules"
            onSubmit={(e) => {
              e.preventDefault()
              setSaved(true)
              logAction('Équipe', 'Règles générales modifiées', 'Paramètres de la plateforme')
            }}
            onChange={() => setSaved(false)}
          >
            <h2 className="card-title">Règles générales</h2>
            {RULES.map((r) => (
              <div key={r.id} className="field">
                <label htmlFor={r.id}>{r.label}</label>
                <input id={r.id} type="number" min={0} required defaultValue={r.value} />
              </div>
            ))}
            <button type="submit" className="btn btn--berry">Enregistrer</button>
            {saved && <p role="status" className="settings__saved">Paramètres enregistrés.</p>}
          </form>
        </div>
      )}

      {inviting && (
        <Modal title="Inviter un membre" onClose={closeInvite}>
          <form className="invite-form" onSubmit={sendInvite}>
            <label className="form-field">
              <span>Nom complet</span>
              <input name="name" required placeholder="Ex. Ndèye Fall" />
            </label>
            <label className="form-field">
              <span>E-mail professionnel</span>
              <input name="email" type="email" required placeholder="prenom.nom@samaloyer.sn" />
            </label>
            <label className="form-field">
              <span>Rôle</span>
              <select name="role" defaultValue={1}>
                {ROLES.map((r, i) => (
                  <option key={r.name} value={i} disabled={i === 0}>{r.name}</option>
                ))}
              </select>
            </label>
            <span className="form-field__hint">Le membre reçoit un lien d'activation et devra activer la double authentification (2FA).</span>
            <div className="dialog__actions">
              <button type="button" className="btn btn--lg" onClick={closeInvite}>Annuler</button>
              <button type="submit" className="btn btn--lg btn--berry">Envoyer l'invitation</button>
            </div>
          </form>
        </Modal>
      )}

      {addingDoc && (
        <Modal title="Ajouter une pièce" onClose={closeAddDoc}>
          <form className="invite-form" onSubmit={addDoc}>
            <label className="form-field">
              <span>Nom de la pièce</span>
              <input name="label" required placeholder="Ex. Extrait du registre de commerce" />
            </label>
            <label className="form-field">
              <span>Aide affichée au bailleur</span>
              <input name="hint" placeholder="Ex. Pour les agences immobilières" />
            </label>
            <div className="docs-req__formats">
              <span>Formats acceptés</span>
              <label><input type="checkbox" name="image" defaultChecked /> Photo</label>
              <label><input type="checkbox" name="pdf" defaultChecked /> PDF</label>
            </div>
            <label className="form-field">
              <span>Nombre de fichiers maximum</span>
              <input name="maxFiles" type="number" min={1} max={5} defaultValue={1} />
            </label>
            <label className="docs-req__check">
              <input type="checkbox" name="required" defaultChecked /> Obligatoire pour envoyer le dossier
            </label>
            <div className="dialog__actions">
              <button type="button" className="btn btn--lg" onClick={closeAddDoc}>Annuler</button>
              <button type="submit" className="btn btn--lg btn--berry">Ajouter</button>
            </div>
          </form>
        </Modal>
      )}

      {toast && <Toast message={toast} onDone={clearToast} />}
    </div>
  )
}

export default Reclamations
