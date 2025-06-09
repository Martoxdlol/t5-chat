import { useEffect, useState } from 'react'
import type { ChatMessage } from '@/lib/types'
import { cn } from '@/lib/utils'

export function DisplayMessage(props: { message: ChatMessage }) {
    const { message } = props
    // Assuming 'role' determines if the message is from the user or another party (e.g., 'assistant', 'bot').
    // Adjust 'user' to match the actual role identifier for messages sent by the current user.
    const isUserMessage = message.role === 'user'

    const [generated, setGenerated] = useState<string | null>(null)

    useEffect(() => {
        const unsub = message.contentManager?.subscribe((content) => {
            setGenerated(content)
        })

        return () => {
            unsub?.()
        }
    }, [message])

    return (
        <div className={cn('my-1 flex px-2 sm:px-4', isUserMessage ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                    'max-w-[75%] rounded-xl px-3 py-2 sm:max-w-[70%] md:max-w-[65%]',
                    { 'bg-secondary/50': props.message.role === 'assistant' },
                    { 'bg-primary/50': props.message.role === 'user' },
                )}
            >
                <p className='whitespace-pre-wrap break-words text-sm'>
                    {props.message.status === 'generating' ? generated : message.content}
                </p>
            </div>
        </div>
    )
}
