import type React from 'react'
import { ChatAppBar } from '@/components/chat/appbar'
import { PrimaryScrollProvider } from '@/components/primary-scroll-provider'

export function ChatView(props: { children?: React.ReactNode; input: React.ReactNode }) {
    return (
        <PrimaryScrollProvider>
            <div className='relative flex size-full flex-col overflow-hidden'>
                <div className='z-10 shrink-0'>
                    <ChatAppBar />
                </div>
                <div className='flex min-h-0 shrink grow flex-col bg-primary-foreground'>
                    <div className='relative flex min-h-0 shrink grow flex-col'>{props.children}</div>
                    <div className='z-10 shrink-0'>{props.input}</div>
                </div>
            </div>
        </PrimaryScrollProvider>
    )
}
