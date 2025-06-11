import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useTRPC } from '@/lib/api-client'
import { Button } from './ui/button'

export function RemainingCredits() {
    const user = useAuth()

    const trpc = useTRPC()

    const { data: r } = useQuery(
        trpc.remainingCredits.queryOptions(undefined, {
            enabled: !!user,
            staleTime: 1000 * 60 * 2,
            refetchOnMount: true,
        }),
    )

    if (!user || !r) {
        return null
    }

    return (
        <Button className='h-6' size='sm' variant='outline' type='button'>
            {r?.remainingCredits} credits left
        </Button>
    )
}

export function useInvalidateRemainingCredits() {
    const trpc = useTRPC()
    const qc = useQueryClient()
    return useCallback(() => qc.invalidateQueries(trpc.remainingCredits.queryFilter()), [qc, trpc])
}
