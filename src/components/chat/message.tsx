import { useEffect, useState } from 'react'
import type { ChatMessage } from '@/lib/types'
import { cn } from '@/lib/utils'
import 'katex/dist/katex.min.css'
import { RenderMarkdown } from './markdown'

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

    const content = generated ?? message.content

    if (isUserMessage) {
        return (
            <div className={cn('my-1 flex justify-end px-2 sm:px-4')}>
                <div className='max-w-[75%] rounded-xl bg-primary/50 px-3 py-2 sm:max-w-[70%] md:max-w-[65%]'>
                    <RenderMarkdown code={content} />
                </div>
            </div>
        )
    }

    if (message.role === 'assistant') {
        return (
            <div className='space-y-4 p-4 md:p-10'>
                <RenderMarkdown code={content} />
            </div>
        )
    }
}
