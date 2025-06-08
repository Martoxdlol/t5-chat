import { createTRPCClient, httpBatchStreamLink, httpSubscriptionLink, splitLink } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import superjson from 'superjson'

// Type only
import type { AppRouter } from '@/server/routers/root'

export const trpc = createTRPCClient<AppRouter>({
    links: [
        splitLink({
            condition: (op) => op.type === 'subscription',
            true: httpSubscriptionLink({
                url: '/api/trpc',
                transformer: superjson,
            }),
            false: httpBatchStreamLink({
                url: '/api/trpc',
                transformer: superjson,
            }),
        }),
    ],
})

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>()
