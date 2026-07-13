import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
              params: {
                prompt: 'select_account',
              },
            },
          }),
        ]
      : []),
    // Credentials provider for phone/email OTP users (saved to DB separately)
    CredentialsProvider({
      name: 'Phone / Email',
      credentials: {
        identifier: { label: 'Phone or Email', type: 'text' },
        name: { label: 'Name', type: 'text' },
        provider: { label: 'Provider', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier) return null
        const name = credentials.name || 'Customer'
        const provider = credentials.provider || 'email'
        const isPhone = /^\d{10}$/.test(credentials.identifier)
        // Find or create user in DB
        let user = await db.user.findFirst({
          where: isPhone ? { phone: credentials.identifier } : { email: credentials.identifier },
        })
        if (!user) {
          try {
            user = await db.user.create({
              data: {
                name,
                phone: isPhone ? credentials.identifier : null,
                email: !isPhone ? credentials.identifier : null,
                avatar: name.slice(0, 2).toUpperCase(),
                provider,
              },
            })
          } catch {
            user = await db.user.findFirst({
              where: isPhone ? { phone: credentials.identifier } : { email: credentials.identifier },
            })
          }
        } else {
          await db.user.update({ where: { id: user.id }, data: { loginCount: { increment: 1 } } })
        }
        if (!user) return null
        return {
          id: user.id,
          name: user.name,
          email: user.email || undefined,
          image: user.avatar,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'amrut-collection-dev-secret-change-in-prod',
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[NextAuth signIn] provider:', account?.provider, 'user:', user.email)
      try {
        if (account?.provider === 'google' && user.email) {
          let dbUser = await db.user.findFirst({ where: { email: user.email } })
          if (!dbUser) {
            try {
              dbUser = await db.user.create({
                data: {
                  name: user.name || 'Google User',
                  email: user.email,
                  avatar: user.name?.slice(0, 2).toUpperCase() || 'G',
                  provider: 'google',
                },
              })
              console.log('[NextAuth signIn] Created new user:', dbUser.id)
            } catch (createErr) {
              console.error('[NextAuth signIn] Create failed, retrying findFirst:', createErr)
              dbUser = await db.user.findFirst({ where: { email: user.email } })
            }
          } else {
            await db.user.update({ where: { id: dbUser.id }, data: { loginCount: { increment: 1 } } })
            console.log('[NextAuth signIn] Updated existing user:', dbUser.id)
          }
        }
        return true
      } catch (err) {
        console.error('[NextAuth signIn] ERROR:', err)
        return false
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        (session.user as any).id = token.uid
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
  events: {
    async error(message) {
      console.error('[NextAuth EVENT error]', message)
    },
  },
  logger: {
    error(code, message) {
      console.error('[NextAuth logger.error]', code, message)
    },
    warn(code) {
      console.warn('[NextAuth logger.warn]', code)
    },
    debug(code, message) {
      console.log('[NextAuth debug]', code, message)
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
