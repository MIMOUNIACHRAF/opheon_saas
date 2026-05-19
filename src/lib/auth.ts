import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getPrisma } from '@/lib/prisma'
import type { SessionUser } from '@/types'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const prisma = getPrisma()
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { tenant: true },
        })

        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenantSlug: user.tenant?.slug ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as SessionUser
        token.id = u.id
        token.role = u.role
        token.tenantId = u.tenantId ?? null
        token.tenantSlug = u.tenantSlug ?? null
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.tenantId = token.tenantId as string | null
        session.user.tenantSlug = token.tenantSlug as string | null
      }
      return session
    },
  },
}

export async function auth() {
  return getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  return session
}

export async function requireAdmin(tenantSlug?: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const { role, tenantSlug: userSlug } = session.user as SessionUser & {
    role: string
    tenantSlug: string | null
  }

  if (role === 'SUPER_ADMIN') return session
  if (['ADMIN', 'MANAGER'].includes(role) && (!tenantSlug || userSlug === tenantSlug)) {
    return session
  }

  throw new Error('Forbidden')
}
