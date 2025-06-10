import type React from 'react'
import { ChatAppBar } from '@/components/chat/appbar'

export function ChatView(props: { children?: React.ReactNode; input: React.ReactNode }) {
    return (
        <div className='relative flex size-full flex-col overflow-hidden'>
            <div className='shrink-0'>
                <ChatAppBar />
            </div>
            <div className='flex min-h-0 shrink grow flex-col bg-primary-foreground'>
                <div className='relative flex min-h-0 shrink grow flex-col'>{props.children}</div>
                <div className='shrink-0'>{props.input}</div>
            </div>
        </div>
    )
}
