import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { user, token } = await authApi.login(email, password)
      login(user, token)
      navigate('/dashboard')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
              <path d="M8 12h6v2H8v-2zm0 4h10v2H8v-2zm0 4h8v2H8v-2z" fill="white" opacity="0.9" />
              <rect x="18" y="10" width="6" height="14" rx="2" fill="white" />
            </svg>
          </div>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to your Nova Board account</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <Button type="submit" loading={loading} className={styles.submitButton}>
            Sign in
          </Button>
        </form>

        <p className={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.link}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
