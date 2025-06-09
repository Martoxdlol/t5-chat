import { useQuery } from '@tanstack/react-query'
import { ChevronLeftIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useTRPC } from '@/lib/api-client'
import { IconButton } from '../icon-button'

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

    const navigate = useNavigate()

    return (
        <div className='flex h-14 items-center gap-2 px-4'>
            {canGoBack && (
                <IconButton onClick={() => window.history.back()} icon={<ChevronLeftIcon />} aria-label='back' />
            )}
            {!canGoBack && (
                <IconButton
                    onClick={() => navigate('/chats')}
                    className='md:hidden'
                    icon={<ChevronLeftIcon />}
                    aria-label='back'
                />
            )}
            <h2 className=''>{chatTitle}</h2>
        </div>
    )
}
