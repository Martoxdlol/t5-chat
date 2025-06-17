import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { TRPCProvider, trpc } from './api-client'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 1 days
            refetchOnMount: true,
            staleTime: 1000 * 60 * 20, // 20 minutes
        },
    },
})

const localStoragePersister = createSyncStoragePersister({
    key: 'cache-v1',
    storage: window.localStorage,
})

persistQueryClient({
    queryClient,
    persister: localStoragePersister,
})

export function ApiProvider(props: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <TRPCProvider trpcClient={trpc} queryClient={queryClient}>
                {props.children}
            </TRPCProvider>
        </QueryClientProvider>
    )
}
