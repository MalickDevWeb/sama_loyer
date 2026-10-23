import { useRef, useState, type FormEvent } from 'react'
import { Icon } from '../components/ui'
import { ICONS } from '../lib/utils'
import { logAction } from '../lib/audit'
import './Login.css'

// Identifiants de démonstration (à remplacer par l'authentification de l'API)
const DEMO_EMAIL = 'admin@samaloyer.sn'
const DEMO_CODE = '246810'

function Login({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState<'password' | 'code'>('password')
  const [error, setError] = useState('')
  const [code, setCode] = useState('')
  const codeRef = useRef<HTMLInputElement>(null)

  const submitPassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (String(data.get('password')).length < 4) {
      setError('Mot de passe incorrect.')
      return
    }
    setError('')
    setStep('code')
    window.setTimeout(() => codeRef.current?.focus(), 0)
  }

  const submitCode = (e: FormEvent) => {
    e.preventDefault()
    if (code !== DEMO_CODE) {
      setError('Code incorrect. Vérifie le SMS reçu.')
      return
    }
    logAction('Connexion', 'Connexion avec code 2FA', DEMO_EMAIL)
    onLogin()
  }

  return (
    <div className="login">
      <section className="login__brand" aria-hidden="true">
        <div className="login__logo">
          <span className="login__logo-icon"><Icon d={ICONS.home} size={26} strokeWidth={2.2} /></span>
          <span>
            <strong>SAMA LOYER</strong>
            <span>ADMINISTRATION</span>
          </span>
        </div>
        <div className="login__pitch">
          <h1>Le centre de contrôle de la location au Sénégal.</h1>
          <ul>
            <li><Icon d={ICONS.validate} size={18} /> Validation des annonces sous 24 h</li>
            <li><Icon d={ICONS.users} size={18} /> Vérification d'identité des bailleurs</li>
            <li><Icon d={ICONS.card} size={18} /> Suivi des paiements Max it</li>
          </ul>
        </div>
        <span className="login__foot">Accès réservé à l'équipe SAMA LOYER</span>
      </section>

      <section className="login__panel">
        <div className="login__card">
          {step === 'password' ? (
            <form onSubmit={submitPassword} className="login__form">
              <div>
                <h2 className="login__title">Connexion</h2>
                <p className="login__sub">Connecte-toi avec ton compte administrateur.</p>
              </div>
              <label className="form-field">
                <span>E-mail</span>
                <input name="email" type="email" required defaultValue={DEMO_EMAIL} autoComplete="username" />
              </label>
              <label className="form-field">
                <span>Mot de passe</span>
                <input name="password" type="password" required defaultValue="demo1234" autoComplete="current-password" />
              </label>
              {error && <p role="alert" className="login__error">{error}</p>}
              <button type="submit" className="btn btn--lg btn--berry login__btn">Continuer</button>
            </form>
          ) : (
            <form onSubmit={submitCode} className="login__form">
              <div>
                <span className="login__shield"><Icon d={ICONS.check} size={22} strokeWidth={2.6} /></span>
                <h2 className="login__title">Double authentification</h2>
                <p className="login__sub">Saisis le code à 6 chiffres envoyé par SMS au <span style={{ whiteSpace: 'nowrap' }}>+221 77 ••• •• 12</span>.</p>
              </div>
              <label className="form-field">
                <span>Code de vérification</span>
                <input
                  ref={codeRef}
                  className="login__code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={code}
                  placeholder="••••••"
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
              </label>
              <p className="login__demo">Démo : le code est <strong>{DEMO_CODE}</strong></p>
              {error && <p role="alert" className="login__error">{error}</p>}
              <button type="submit" className="btn btn--lg btn--berry login__btn" disabled={code.length !== 6}>
                Se connecter
              </button>
              <button type="button" className="login__back" onClick={() => { setStep('password'); setError(''); setCode('') }}>
                Retour
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

export default Login
