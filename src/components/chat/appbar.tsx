import { useQuery } from '@tanstack/react-query'
import { ArrowLeftIcon, EllipsisVerticalIcon } from 'lucide-react'
import { memo, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useTRPC } from '@/lib/api-client'
import { IconButton } from '../icon-button'

export const ChatAppBar = memo(ChatAppBarComponent)

function ChatAppBarComponent() {
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
        <div className='flex h-14 items-center gap-2 bg-background px-4 shadow'>
            {canGoBack && (
                <IconButton onMouseDown={() => window.history.back()} icon={<ArrowLeftIcon />} aria-label='back' />
            )}
            {!canGoBack && (
                <IconButton
                    onMouseDown={() => navigate('/chats')}
                    className='shrink-0 md:hidden'
                    icon={<ArrowLeftIcon />}
                    aria-label='back'
                />
            )}
            <h2 className='min-w-0 shrink grow overflow-hidden text-ellipsis text-nowrap'>{chatTitle}</h2>
            <IconButton className='shrink-0' icon={<EllipsisVerticalIcon />} aria-label='chat-options' />
        </div>
    )
}
