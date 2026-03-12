import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/config/routes'
import { useLoginMutation } from '@/features/auth/api/auth.api'
import { loginSchema } from '@/features/auth/schemas/auth.schema'
import { useAuthStore } from '@/features/auth/stores/auth.store'

import './login-form.css'

const GRID_COLS = 24
const GRID_ROWS = 16

const GridBackground = () => {
  const [lit, setLit] = useState(() =>
    Array.from({ length: GRID_COLS * GRID_ROWS }, () => Math.random() > 0.92),
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLit((prev) => {
        const next = [...prev]
        const index = Math.floor(Math.random() * next.length)
        next[index] = !next[index]
        return next
      })
    }, 120)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div
      className="login-grid"
      style={{
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
      }}
    >
      {lit.map((isOn, index) => (
        <div
          className="login-grid-cell"
          key={index}
          style={{
            backgroundColor: isOn ? 'var(--status-info-soft)' : 'transparent',
          }}
        />
      ))}
    </div>
  )
}

const SprintBadge = ({ label, color }: { label: string; color: string }) => (
  <span
    className="login-badge"
    style={{ borderColor: `${color}40`, background: `${color}15`, color }}
  >
    {label}
  </span>
)

type FocusedField = 'username' | 'password' | null

export const LoginForm = () => {
  const navigate = useNavigate()
  const setAuthSession = useAuthStore((state) => state.setAuthSession)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<FocusedField>(null)
  const [mounted, setMounted] = useState(false)
  const [shake, setShake] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loginMutation = useLoginMutation()

  useEffect(() => {
    const timeout = window.setTimeout(() => setMounted(true), 80)
    return () => window.clearTimeout(timeout)
  }, [])

  const inputStyle = useMemo(
    () => (fieldName: Exclude<FocusedField, null>) => ({
      background:
        focused === fieldName ? 'var(--surface-elevated)' : 'var(--surface)',
      borderColor: focused === fieldName ? 'var(--primary)' : 'var(--border)',
    }),
    [focused],
  )

  const triggerShake = () => {
    setShake(true)
    window.setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async () => {
    const parsed = loginSchema.safeParse({ username, password })

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? 'Invalid credentials')
      triggerShake()
      return
    }

    setErrorMessage(null)

    try {
      const tokens = await loginMutation.mutateAsync(parsed.data)
      setAuthSession(parsed.data.username, tokens)
      navigate(ROUTES.overview, { replace: true })
    } catch {
      setErrorMessage('Authentication failed. Please try again.')
      triggerShake()
    }
  }

  return (
    <div className="login-root">
      <GridBackground />
      <div className="login-scanline" />
      <div className="login-vignette" />

      <div
        className="login-rail login-rail-left"
        style={{ opacity: mounted ? 1 : 0 }}
      >
        <div className="login-rail-accent login-rail-accent-blue" />
      </div>
      <div
        className="login-rail login-rail-right"
        style={{ opacity: mounted ? 1 : 0 }}
      >
        <div className="login-rail-accent login-rail-accent-green" />
      </div>

      <div
        className={`login-card ${shake ? 'shake' : ''}`}
        style={{ opacity: mounted ? 1 : 0 }}
      >
        <div className="login-card-top" />

        <div className="login-enter login-enter-1 login-header">
          <div className="login-brand-row">
            <div className="login-brand-mark">
              <svg fill="none" height="14" viewBox="0 0 14 14" width="14">
                <rect fill="currentColor" height="5" width="3" x="1" y="8" />
                <rect
                  fill="currentColor"
                  height="8"
                  opacity="0.7"
                  width="3"
                  x="5.5"
                  y="5"
                />
                <rect
                  fill="currentColor"
                  height="11"
                  opacity="0.4"
                  width="3"
                  x="10"
                  y="2"
                />
              </svg>
            </div>
            <span className="login-brand-text">Sprint Lens</span>
          </div>
          <p className="login-brand-subtitle">ENGINEERING ANALYTICS PLATFORM</p>
        </div>

        <div className="login-enter login-enter-2 login-divider">
          <div className="login-divider-line" />
          <span className="login-divider-label">AUTHENTICATE</span>
          <div className="login-divider-line" />
        </div>

        <div className="login-enter login-enter-3 login-fields">
          <div>
            <label
              className={`login-label ${focused === 'username' ? 'active' : ''}`}
            >
              Username
            </label>
            <div className="login-input-wrap">
              <span
                className={`login-input-icon ${focused === 'username' ? 'active' : ''}`}
              >
                <svg
                  fill="none"
                  height="13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 16 16"
                  width="13"
                >
                  <circle cx="8" cy="5" r="3" />
                  <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                </svg>
              </span>
              <input
                className="login-input"
                onBlur={() => setFocused(null)}
                onChange={(event) => setUsername(event.target.value)}
                onFocus={() => setFocused('username')}
                onKeyDown={(event) =>
                  event.key === 'Enter' && void handleSubmit()
                }
                placeholder="username"
                style={inputStyle('username')}
                type="text"
                value={username}
              />
            </div>
          </div>

          <div>
            <label
              className={`login-label ${focused === 'password' ? 'active' : ''}`}
            >
              Password
            </label>
            <div className="login-input-wrap">
              <span
                className={`login-input-icon ${focused === 'password' ? 'active' : ''}`}
              >
                <svg
                  fill="none"
                  height="13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 16 16"
                  width="13"
                >
                  <rect height="7" rx="1" width="10" x="3" y="7" />
                  <path d="M5 7V5a3 3 0 016 0v2" />
                </svg>
              </span>
              <input
                className="login-input login-input-password"
                onBlur={() => setFocused(null)}
                onChange={(event) => setPassword(event.target.value)}
                onFocus={() => setFocused('password')}
                onKeyDown={(event) =>
                  event.key === 'Enter' && void handleSubmit()
                }
                placeholder="••••••••"
                style={inputStyle('password')}
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                className="pw-toggle"
                onClick={() => setShowPassword((value) => !value)}
                tabIndex={-1}
                type="button"
              >
                {showPassword ? (
                  <svg
                    fill="none"
                    height="13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 16 16"
                    width="13"
                  >
                    <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" />
                    <circle cx="8" cy="8" r="2" />
                    <line x1="3" x2="13" y1="3" y2="13" />
                  </svg>
                ) : (
                  <svg
                    fill="none"
                    height="13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 16 16"
                    width="13"
                  >
                    <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" />
                    <circle cx="8" cy="8" r="2" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="login-enter login-enter-4 login-actions">
          <button
            className="login-btn"
            disabled={loginMutation.isPending}
            onClick={() => void handleSubmit()}
            type="button"
          >
            {loginMutation.isPending ? (
              <span className="login-btn-loading">
                <svg
                  className="login-spinner"
                  fill="none"
                  height="12"
                  viewBox="0 0 12 12"
                  width="12"
                >
                  <circle
                    cx="6"
                    cy="6"
                    r="5"
                    stroke="var(--text-muted)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M6 1a5 5 0 015 5"
                    stroke="var(--primary)"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                  />
                </svg>
                AUTHENTICATING...
              </span>
            ) : (
              'SIGN IN →'
            )}
          </button>
          {errorMessage ? <p className="login-error">{errorMessage}</p> : null}
        </div>

        <div className="login-footer-meta">
          <div className="login-badges">
            <SprintBadge color="var(--status-info)" label="S10" />
            <SprintBadge color="var(--status-success)" label="LIVE" />
          </div>
          <span className="login-meta-version">v2.4.1</span>
        </div>
      </div>

      <div className="login-status-bar" style={{ opacity: mounted ? 1 : 0 }}>
        <span className="login-status-online">● SYSTEM ONLINE</span>
        <span className="login-status-meta">webOS TV Platform</span>
        <div className="login-status-spacer" />
        <span className="login-status-meta">Mar 05, 2026</span>
      </div>
    </div>
  )
}
