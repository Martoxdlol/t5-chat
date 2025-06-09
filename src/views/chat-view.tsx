import type React from 'react'
import { ChatAppBar } from '@/components/chat/appbar'

export function ChatView(props: { children?: React.ReactNode; input: React.ReactNode }) {
    return (
        <div className='relative flex size-full flex-col overflow-hidden'>
            <div className='shrink-0'>
                <ChatAppBar />
            </div>
            <div className='min-h-0 shrink grow overflow-y-auto'>
                <div className='h-fit w-full'>{props.children}</div>
            </div>
            <div className='shrink-0'>{props.input}</div>
        </div>
    )
}
