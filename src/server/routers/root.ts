import type { Model } from '../service/models'
import { publicProcedure, router } from '../trpc'
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
})

export type AppRouter = typeof appRouter
