import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { Context } from './context'

export type TRPCContext = Context & {
    req: Request
}

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<TRPCContext>().create({ transformer: superjson })

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router
export const publicProcedure = t.procedure

/**
 * Export reusable procedure that checks if the user is authenticated
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    const session = await ctx.auth.api.getSession({ headers: ctx.req.headers })

    if (!session) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Unauthorized',
        })
    }

    return next({
        ctx: {
            ...ctx,
            user: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                image: session.user.image || null,
            },
        },
    })
})
