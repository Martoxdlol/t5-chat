import { memo, useEffect, useState } from 'react'
import type { ChatMessage } from '@/lib/types'
import { cn } from '@/lib/utils'
import 'katex/dist/katex.min.css'
import { Loader } from 'lucide-react'
import { RenderMarkdown } from './markdown'

export const DisplayMessage = memo(DisplayMessageComponent)

function DisplayMessageComponent(props: Pick<ChatMessage, 'content' | 'role' | 'contentManager' | 'status'>) {
    const message = props
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

    const content = (generated ?? message.content).trim()

    if (isUserMessage) {
        return (
            <div
                className={cn('my-1 flex justify-end px-2 py-3 first:pt-6 sm:px-4', {
                    'animate-pulse': message.status === 'prompted',
                })}
            >
                <div className='max-w-[75%] rounded-xl bg-primary/50 px-3 py-2 sm:max-w-[70%] md:max-w-[65%]'>
                    <RenderMarkdown code={content} />
                </div>
            </div>
        )
    }

    const generationFailed = message.status === 'failed' || (message.status === 'generating' && !message.contentManager)

    if (message.role === 'assistant') {
        return (
            <div className='min-h-[calc(var(--screen-height)_-_176px)] px-4 py-3 last:pb-6 md:px-10'>
                {!generationFailed &&
                    (content ? (
                        <RenderMarkdown code={content} />
                    ) : (
                        <p className='flex items-center gap-2 font-semibold text-sm'>
                            <Loader className='animate-spin' />
                            Generating
                        </p>
                    ))}
                {generationFailed && (
                    <p className='font-semibold text-red-500 text-sm'>Generation failed. Please try again.</p>
                )}
            </div>
        )
    }
}
