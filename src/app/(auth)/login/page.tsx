'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { AuthForms } from '@/components/auth/AuthForms'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import styles from './page.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCredentials = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.logo} />
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your NovaBoard account</p>
      </div>
      <OAuthButtons />
      <div className={styles.divider}><span>or</span></div>
      <AuthForms mode="login" onSubmit={handleCredentials} error={error} loading={loading} />
      <p className={styles.footer}>
        Don&apos;t have an account?{' '}
        <Link href="/register" className={styles.link}>Create one</Link>
      </p>
    </div>
  )
}
