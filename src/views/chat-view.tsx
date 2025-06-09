import { MessageSquareIcon } from 'lucide-react'
import type React from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function ChatView(props: { children?: React.ReactNode; input: React.ReactNode }) {
    return (
        <div className='relative flex size-full flex-col overflow-hidden'>
            <div className='shrink-0 border-primary/10 border-b p-1'>
                <Button asChild variant='ghost'>
                    <Link to='/chats'>
                        <MessageSquareIcon />
                    </Link>
                </Button>
            </div>
            <div className='min-h-0 shrink grow overflow-y-auto'>
                <div className='h-fit w-full'>{props.children}</div>
            </div>
            <div className='shrink-0'>{props.input}</div>
        </div>
    )
}
