import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TRPCProvider, trpc } from './api-client'

export const queryClient = new QueryClient()

export function ApiProvider(props: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <TRPCProvider trpcClient={trpc} queryClient={queryClient}>
                {props.children}
            </TRPCProvider>
        </QueryClientProvider>
    )
}
