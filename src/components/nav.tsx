import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { useTRPC } from '@/lib/api-client'
import { authClient } from '@/lib/auth-client'
import { Button } from './ui/button'

export function Sidenav() {
    const trpc = useTRPC()

    const { data: chats } = useQuery(trpc.chat.listChats.queryOptions({}))

    return (
        <>
            <Button
                onClick={() =>
                    authClient.signIn.social({
                        provider: 'google',
                    })
                }
            >
                Signin with Google
            </Button>
            <ul className='flex h-fit flex-col gap-2 p-4'>
                {chats?.map((chat) => (
                    <li key={chat.id}>
                        <Link
                            to={`/chat/${chat.id}`}
                            className='block rounded-lg px-4 py-2 font-medium text-secondary-foreground text-sm hover:bg-secondary/5 hover:text-secondary'
                        >
                            {chat.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    )
}
