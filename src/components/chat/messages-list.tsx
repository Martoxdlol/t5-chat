import { useSuspenseQuery } from '@tanstack/react-query'
import { memo } from 'react'
import { DisplayMessage } from '@/components/chat/message'
import { useTRPC } from '@/lib/api-client'

export const ChatMessagesList = memo(ChatMessagesListComponent)

function ChatMessagesListComponent(props: { chatId: string }) {
    const chatId = props.chatId

    const trpc = useTRPC()

    const { data } = useSuspenseQuery(trpc.chat.getChatMessages.queryOptions({ chatId }, { staleTime: 1000 * 60 * 5 }))

    return (
        <>
            {data?.map((msg) => (
                <DisplayMessage
                    key={msg.index}
                    content={msg.content}
                    role={msg.role}
                    contentManager={msg.contentManager}
                />
            ))}
        </>
    )
}
