import { useQuery } from '@tanstack/react-query'
import { ChevronLeftIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { useTRPC } from '@/lib/api-client'
import { IconButton } from '../icon-button'
import { Button } from '../ui/button'

export function ChatAppBar() {
    const location = useLocation()

    const params = useParams()

    const chatId = params.chatId

    const trpc = useTRPC()

    const { data: chats } = useQuery(
        trpc.chat.listChats.queryOptions(undefined, { refetchOnMount: false, refetchOnWindowFocus: false }),
    )

    const chatTitle = useMemo(() => {
        return chats?.find((chat) => chat.id === chatId)?.title || 'New Chat'
    }, [chats, chatId])

    const canGoBack = location.state === 'back-to-home'

    return (
        <div className='flex h-14 items-center gap-2 px-4'>
            {chatId && (
                <>
                    {canGoBack && <IconButton onClick={() => window.history.back()} icon={<ChevronLeftIcon />} aria-label='back' />}
                    {!canGoBack && (
                        <Button asChild variant='ghost' className=''>
                            <Link to='/chats'>
                                <ChevronLeftIcon className='md:hidden' />
                            </Link>
                        </Button>
                    )}
                </>
            )}

            <h2 className=''>{chatTitle}</h2>
        </div>
    )
}
