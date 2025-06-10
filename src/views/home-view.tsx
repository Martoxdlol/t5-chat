import { LogOutIcon, MessageSquarePlusIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import { AppErrorBoundary } from '@/components/app-error-boundary'
import { IconButton } from '@/components/icon-button'
import { authClient } from '@/lib/auth-client'
import { ChatsListView } from './chats-list-view'

export function HomeView() {
    const navigate = useNavigate()

    return (
        <div className='flex size-full flex-col bg-background'>
            <div className='flex h-14 shrink-0 items-center gap-1 border-primary/10 border-r px-4'>
                <h1 className='grow font-semibold text-xl'>T5 Chat</h1>
                <IconButton aria-label='Start New Chat' onPress={() => authClient.signOut()} icon={<LogOutIcon />} />
                <IconButton
                    aria-label='Start New Chat'
                    onPress={() => navigate('/')}
                    icon={<MessageSquarePlusIcon />}
                />
            </div>
            <AppErrorBoundary>
                <ChatsListView />
            </AppErrorBoundary>
        </div>
    )
}
