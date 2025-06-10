import { useSuspenseQuery } from '@tanstack/react-query'
import { memo, useLayoutEffect, useRef } from 'react'
import { DisplayMessage } from '@/components/chat/message'
import { useTRPC } from '@/lib/api-client'

export const ChatMessagesList = memo(ChatMessagesListComponent)

function ChatMessagesListComponent(props: { chatId: string }) {
    const chatId = props.chatId

    const trpc = useTRPC()

    const { data } = useSuspenseQuery(trpc.chat.getChatMessages.queryOptions({ chatId }, { staleTime: 1000 * 60 * 5 }))

    const containerRef = useRef<HTMLDivElement>(null)

    // biome-ignore lint/correctness/useExhaustiveDependencies: I need it to trigger on message added
    useLayoutEffect(() => {
        if (containerRef.current) {
            const scrollHeight = containerRef.current.scrollHeight
            containerRef.current.scrollTo({
                top: scrollHeight,
                behavior: 'smooth',
            })
        }
    }, [data.length, containerRef.current])

    return (
        <div className='size-full overflow-y-auto'
            ref={containerRef}
        >
            <div className='h-fit w-full'>
                {data?.map((msg) => (
                    <DisplayMessage
                        key={msg.index}
                        content={msg.content}
                        role={msg.role}
                        contentManager={msg.contentManager}
                        status={msg.status}
                    />
                ))}
            </div>
        </div>
    )
}
