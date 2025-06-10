import { getDefaultCheapModel } from '../service/models'
import { publicProcedure, router } from '../trpc'
import { chatRouter } from './chat'

export const appRouter = router({
    chat: chatRouter,
    models: publicProcedure.query(async ({ ctx }) => {
        const models = Array.from(
            ctx.models.entries().map(([id, model]) => ({
                id,
                name: model.name,
                provider: model.provider,
                image: model.image,
                file: model.file,
                cost: model.cost,
            })),
        )

        return {
            models,
            defaultModel: getDefaultCheapModel(ctx.models).id,
        }
    }),
})

export type AppRouter = typeof appRouter
