import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NuxtAuthHandler({
  secret: process.env.NUXT_AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    // @ts-expect-error next-auth Credentials default export interop
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Record<'email' | 'password', string> | undefined) {
        const email = process.env.ADMIN_EMAIL
        const password = process.env.ADMIN_PASSWORD

        if (
          credentials?.email
          && credentials?.password
          && email
          && password
          && credentials.email === email
          && credentials.password === password
        ) {
          return {
            id: 'admin',
            name: 'Admin',
            email,
          }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.email = user.email
        token.name = user.name
        token.sub = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string | undefined
        session.user.name = token.name as string | undefined
      }
      return session
    },
  },
})
