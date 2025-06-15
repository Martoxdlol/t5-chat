import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, EllipsisVerticalIcon, Trash2Icon } from 'lucide-react'
import { memo, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useTRPC } from '@/lib/api-client'
import { IconButton } from '../icon-button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'

export const ChatAppBar = memo(ChatAppBarComponent)

function ChatAppBarComponent() {
    const location = useLocation()

    const params = useParams()

    const navigate = useNavigate()

    const chatId = params.chatId

    const trpc = useTRPC()

    const queryClient = useQueryClient()

    const { data: chats } = useQuery(
        trpc.chat.listChats.queryOptions(undefined, { refetchOnMount: false, refetchOnWindowFocus: false }),
    )

    const { mutateAsync: deleteChat } = useMutation(
        trpc.chat.deleteChat.mutationOptions({
            onSuccess: () => {
                if (!chatId) return

                queryClient.setQueryData(trpc.chat.listChats.queryKey(), (oldChats) => {
                    if (!oldChats) return oldChats
                    return oldChats.filter((chat) => chat.id !== chatId)
                })

                navigate('/chats', { replace: true })
            },
        }),
    )

    const chatTitle = useMemo(() => {
        return chats?.find((chat) => chat.id === chatId)?.title || 'New Chat'
    }, [chats, chatId])

    const canGoBack = location.state === 'back-to-home'

    return (
        <div className='flex h-14 items-center gap-2 bg-background px-4 shadow'>
            {canGoBack && (
                <IconButton onPress={() => window.history.back()} icon={<ArrowLeftIcon />} aria-label='back' />
            )}
            {!canGoBack && (
                <IconButton
                    onPress={() => navigate('/chats')}
                    className='shrink-0 md:hidden'
                    icon={<ArrowLeftIcon />}
                    aria-label='back'
                />
            )}
            <h2 className='min-w-0 shrink grow overflow-hidden text-ellipsis text-nowrap'>{chatTitle}</h2>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <IconButton className='shrink-0' icon={<EllipsisVerticalIcon />} aria-label='chat-options' />
                </DropdownMenuTrigger>
                <DropdownMenuContent className='border-border'>
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => chatId && deleteChat({ chatId })}>
                            <Trash2Icon />
                            Delete chat
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
