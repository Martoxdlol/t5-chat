import { useQuery } from '@tanstack/react-query'
import { MessageSquarePlusIcon } from 'lucide-react'
import { Link } from 'react-router'
import { useTRPC } from '@/lib/api-client'

export function ChatsListView() {
    const trpc = useTRPC()

    const { data: chats } = useQuery(trpc.chat.listChats.queryOptions())

    return (
        <div className='size-full overflow-y-auto'>
            <div className='sticky top-0 z-10 flex w-full flex-col bg-secondary/10 p-2 backdrop-blur-md'>
                <div className='flex items-center justify-between'>
                    <h1 className='font-semibold text-xl'>T5 Chat</h1>
                    <Link
                        to='/'
                        type='button'
                        className='flex size-12 items-center justify-center rounded-full hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50'
                        title='New chat'
                    >
                        <MessageSquarePlusIcon />
                    </Link>
                </div>
            </div>
            <ul className='flex h-fit flex-col'>
                {chats?.map((chat) => (
                    <li key={chat.id} className='block px-2 py-1'>
                        <Link
                            to={`/chats/${chat.id}`}
                            className='flex items-center gap-2 rounded-md p-2 hover:bg-accent'
                            state={'back-to-home'}
                        >
                            <div
                                className='flex size-12 items-center justify-center rounded-full bg-muted p-2'
                                style={{ backgroundColor: chat.color || undefined }}
                            >
                                {chat.emoji}
                            </div>
                            {chat.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
