import { useEffect, useState } from 'react'
import type { ChatMessage } from '@/lib/models'
import { cn } from '@/lib/utils'

export function DisplayMessage(props: { message: ChatMessage }) {
    const { message } = props
    // Assuming 'role' determines if the message is from the user or another party (e.g., 'assistant', 'bot').
    // Adjust 'user' to match the actual role identifier for messages sent by the current user.
    const isUserMessage = message.role === 'user'

    const [generated, setGenerated] = useState<string | null>(null)

    useEffect(() => {
        if (message.generator) {
            const generator = message.generator

            const fetchGeneratedText = async () => {
                let text = ''
                for await (const chunk of generator) {
                    text += chunk
                    setGenerated(text)
                    console.log(text)
                }
            }

            fetchGeneratedText().catch((error) => {
                console.error('Error fetching generated text:', error)
            })
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
                    {message.content}
                    {props.message.status === 'generating' && generated}
                </p>
            </div>
        </div>
    )
}
