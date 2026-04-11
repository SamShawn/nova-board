'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { AuthForms } from '@/components/auth/AuthForms'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import styles from './page.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (email: string, password: string, name?: string) => {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Registration failed')
      setLoading(false)
      return
    }
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      setError('Account created but sign in failed. Please try logging in.')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.logo} />
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Start managing projects with NovaBoard</p>
      </div>
      <OAuthButtons />
      <div className={styles.divider}><span>or</span></div>
      <AuthForms mode="register" onSubmit={handleRegister} error={error} loading={loading} />
      <p className={styles.footer}>
        Already have an account?{' '}
        <Link href="/login" className={styles.link}>Sign in</Link>
      </p>
    </div>
  )
}
