import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import bcrypt from 'bcryptjs'
import type { NextAuthConfig } from 'next-auth'
import type { Session } from 'next-auth'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user || !user.passwordHash) return null
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )
        if (!isValid) return null
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: Session; token: { sub?: string } }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }: { token: { sub?: string }; user?: { id: string } }) {
      if (user?.id) {
        token.sub = user.id
      }
      return token
    },
  },
} satisfies NextAuthConfig)
