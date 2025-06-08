import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import type { DBType } from './db'

export function createAuth(db: DBType) {
    return betterAuth({
        secret: process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.BASE_URL,
        database: drizzleAdapter(db, {
            provider: 'mysql',
        }),
        socialProviders: {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            },
        },
    })
}
