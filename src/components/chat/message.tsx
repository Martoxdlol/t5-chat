import { memo, useEffect, useState } from 'react'
import type { ChatMessage } from '@/lib/types'
import { cn } from '@/lib/utils'
import 'katex/dist/katex.min.css'
import { useQueryClient } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { useTRPC } from '@/lib/api-client'
import { RenderMarkdown } from './markdown'

export const DisplayMessage = memo(DisplayMessageComponent)

function DisplayMessageComponent(
    props: Pick<ChatMessage, 'content' | 'role' | 'contentManager' | 'status' | 'model' | 'index'> & {
        onPoll?: () => void
        chatId?: string
    },
) {
    const message = props
    // Assuming 'role' determines if the message is from the user or another party (e.g., 'assistant', 'bot').
    // Adjust 'user' to match the actual role identifier for messages sent by the current user.
    const isUserMessage = message.role === 'user'

    const [generated, setGenerated] = useState<string | null>(null)

    const trpc = useTRPC()
    const queryClient = useQueryClient()

    useEffect(() => {
        const unsub = message.contentManager?.subscribe((content, finished) => {
            setGenerated(content)
            if (finished && props.chatId) {
                queryClient.setQueryData(trpc.chat.getChatMessages.queryKey({ chatId: props.chatId }), (prev) => {
                    if (!prev) return prev

                    return prev.map((msg) => {
                        if (msg.index === message.index) {
                            return {
                                ...msg,
                                contentManager: undefined, // Clear the content manager after completion
                                content: content,
                                status: 'completed',
                            } as ChatMessage
                        }
                        return msg
                    })
                })
            }
        })

        return () => {
            unsub?.()
        }
    }, [message, trpc, queryClient, props.chatId])

    const content = (generated ?? message.content).trim()

    const generationFailed = message.status === 'failed'

    const stuckGenerating = !generationFailed && message.status === 'generating' && !message.contentManager

    useEffect(() => {
        if (!props.onPoll) {
            return
        }

        if (stuckGenerating) {
            const timer = window.setInterval(() => {
                props.onPoll?.()
            }, 1000)

            return () => {
                window.clearInterval(timer)
            }
        }
    }, [stuckGenerating, props.onPoll])

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

    if (message.role === 'assistant') {
        return (
            <div className='px-4 py-3 last:min-h-[calc(var(--screen-height)_-_176px)] last:pb-6 md:px-10'>
                {(!generationFailed || stuckGenerating) &&
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

                {/* <div className='text-muted-foreground text-xs mt-1 flex gap-2 items-center'>
                    <p>gpt-4 </p>
                    <button type='button'>
                        fork
                    </button>
                    <button type='button'>
                        re-generate
                    </button>
                </div> */}
            </div>
        )
    }
}
