import { betterAuth } from 'better-auth'

export const auth = betterAuth({
    secret: import.meta.env.BETTER_AUTH_SECRET,
    socialProviders: {
        google: {
            clientId: import.meta.env.GOOGLE_CLIENT_ID,
            clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
        },
    },
})
