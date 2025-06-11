import { eq } from 'drizzle-orm'
import { schema } from '../db'
import type { Model } from '../service/models'
import { protectedProcedure, publicProcedure, router } from '../trpc'
import { chatRouter } from './chat'

type ClientModel = Omit<Model, 'instance'>

export const appRouter = router({
    chat: chatRouter,
    models: publicProcedure.query(async ({ ctx }) => {
        return {
            models: Array.from(ctx.ai.models.values()).map(
                (model) =>
                    ({
                        cost: model.cost,
                        id: model.id,
                        name: model.name,
                        featured: model.featured,
                        file: model.file,
                        image: model.image,
                        provider: model.provider,
                    }) as ClientModel,
            ),
            defaultModel: ctx.ai.defaultModel,
        }
    }),
    remainingCredits: protectedProcedure.query(async ({ ctx }) => {
        const [user] = await ctx.db
            .select({
                credits: schema.user.credits,
            })
            .from(schema.user)
            .where(eq(schema.user.id, ctx.user.id))

        return {
            remainingCredits: user.credits ?? 0,
        }
    }),
})

export type AppRouter = typeof appRouter
