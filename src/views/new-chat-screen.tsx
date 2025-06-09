import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { MessageInput } from '@/components/chat/input'
import { DisplayMessage } from '@/components/chat/message'
import { useTRPC } from '@/lib/api-client'
import type { ChatMessage, Prompt } from '@/lib/models'
import { cumulativeGenerator } from '@/lib/utils'
import { ChatView } from './chat'

export function NewChatScreen() {
    const [optimisticMsg, setOptimisticMsg] = useState<string | null>(null)

    const trpc = useTRPC()
    const newChatMutation = useMutation(trpc.chat.createChat.mutationOptions())

    const queryClient = useQueryClient()

    const navigate = useNavigate()

    const handlePrompt = useCallback(
        (prompt: Prompt) => {
            setOptimisticMsg(prompt.text)

            newChatMutation
                .mutateAsync({
                    prompt: {
                        text: prompt.text,
                        model: 'todo:implement-model',
                    },
                })
                .then(async (chat) => {
                    queryClient.setQueryData(trpc.chat.getChatMessages.queryKey({ chatId: chat.id }), () => {
                        return [
                            {
                                index: 0,
                                role: 'user',
                                status: 'complete',
                                content: prompt.text,
                                createdAt: chat.createdAt,
                            },
                            {
                                index: 1,
                                role: 'assistant',
                                status: 'generating',
                                content: '',
                                createdAt: chat.createdAt,
                                generator: cumulativeGenerator('', chat.firstResponseGenerator),
                            },
                        ] as ChatMessage[]
                    })

                    queryClient.invalidateQueries(trpc.chat.listChats.queryFilter({}))

                    navigate(`/chat/${chat.id}`)
                })
        },
        [newChatMutation.mutateAsync, queryClient.setQueryData, trpc.chat.getChatMessages.queryKey, navigate, queryClient.invalidateQueries, trpc.chat.listChats.queryFilter],
    )

    return (
        <ChatView input={<MessageInput onPrompt={handlePrompt} />}>
            {optimisticMsg && (
                <DisplayMessage
                    message={{
                        content: optimisticMsg,
                        createdAt: new Date(),
                        index: 0,
                        role: 'user',
                        status: 'prompted',
                    }}
                />
            )}
        </ChatView>
    )
}
