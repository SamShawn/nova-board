'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { Mail, Lock } from 'lucide-react'
import styles from './AuthForms.module.css'

interface AuthFormsProps {
  mode: 'login' | 'register'
  onSubmit: (email: string, password: string, name?: string) => Promise<void>
  error: string | null
  loading: boolean
}

export function AuthForms({ mode, onSubmit, error, loading }: AuthFormsProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'register') {
      onSubmit(email, password, name)
    } else {
      onSubmit(email, password)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {mode === 'register' && (
        <Input
          label="Full name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<Mail size={14} />}
        />
      )}
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail size={14} />}
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<Lock size={14} />}
        required
      />
      {error && <p className={styles.error}>{error}</p>}
      <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>
        {mode === 'login' ? 'Sign in' : 'Create account'}
      </Button>
    </form>
  )
}
