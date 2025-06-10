import { useQuery } from '@tanstack/react-query'
import { LogOutIcon, MessageSquarePlusIcon } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { ChatListTile } from '@/components/chat-list-tile'
import { IconButton } from '@/components/icon-button'
import { useTRPC } from '@/lib/api-client'
import { authClient } from '@/lib/auth-client'

export function ChatsListView() {
    const trpc = useTRPC()

    const { data: chats } = useQuery(trpc.chat.listChats.queryOptions())

    const params = useParams()

    const chatId = params.chatId

    const navigate = useNavigate()

    return (
        <div className='flex size-full flex-col bg-background'>
            <div className='flex h-14 shrink-0 items-center gap-1 px-4'>
                <h1 className='grow font-semibold text-xl'>T5 Chat</h1>
                <IconButton
                    aria-label='Start New Chat'
                    onMouseDown={() => authClient.signOut()}
                    icon={<LogOutIcon />}
                />
                <IconButton
                    aria-label='Start New Chat'
                    onMouseDown={() => navigate('/')}
                    icon={<MessageSquarePlusIcon />}
                />
            </div>
            <ul className='flex min-h-0 shrink grow flex-col overflow-y-auto'>
                {chats?.map((chat) => (
                    <ChatListTile
                        key={chat.id}
                        chatId={chat.id}
                        title={chat.title}
                        emoji={chat.emoji}
                        color={chat.color}
                        lastMessage={chat.lastMessage}
                        selected={chat.id === chatId}
                    />
                ))}
            </ul>
        </div>
    )
}
