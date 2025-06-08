import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { Context } from './context'
import { appRouter } from './routers/root'

export function trpcHandler(req: Request, context: Context) {
    return fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext: () => context,
    })
}
