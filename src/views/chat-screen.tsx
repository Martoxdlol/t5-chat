import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Suspense, useCallback } from 'react'
import { useParams } from 'react-router'
import { Center } from '@/components/center'
import { MessageInput } from '@/components/chat/input'
import { ChatMessagesList } from '@/components/chat/messages-list'
import { Spinner } from '@/components/spinner'
import { useTRPC } from '@/lib/api-client'
import { MessageContent } from '@/lib/message-content'
import type { ChatMessage, Prompt } from '@/lib/types'
import { ChatView } from './chat-view'

export function ChatScreen() {
    const params = useParams()

    const chatId = params.chatId as string

    const trpc = useTRPC()

    const { data } = useQuery(trpc.chat.getChatMessages.queryOptions({ chatId }, { staleTime: 1000 * 60 * 5 }))

    const promptMutation = useMutation(trpc.chat.prompt.mutationOptions())

    const queryClient = useQueryClient()

    const handlePrompt = useCallback(
        (prompt: Prompt) => {
            promptMutation
                .mutateAsync({
                    chatId,
                    prompt: {
                        text: prompt.text,
                        model: 'todo:implement-model',
                    },
                })
                .then(({ generator, responseMessageIndex, userMessageIndex }) => {
                    const userMsg: ChatMessage = {
                        index: userMessageIndex,
                        role: 'user',
                        status: 'completed',
                        content: prompt.text,
                        createdAt: new Date(),
                    }

                    const responseMsg: ChatMessage = {
                        index: responseMessageIndex,
                        role: 'assistant',
                        status: 'generating',
                        content: '',
                        createdAt: new Date(),
                        generator,
                        contentManager: new MessageContent({
                            content: '',
                            generator,
                        }),
                    }

                    queryClient.setQueryData(
                        trpc.chat.getChatMessages.queryKey({ chatId }),
                        (data) => {
                            return [...(data || []), userMsg, responseMsg] as ChatMessage[]
                        },
                        {
                            updatedAt: Date.now(),
                        },
                    )
                })
        },
        [chatId, promptMutation, queryClient.setQueryData, trpc.chat.getChatMessages.queryKey],
    )

    return (
        <ChatView input={<MessageInput onPrompt={handlePrompt} />}>
            <Suspense
                key={chatId}
                fallback={
                    <Center>
                        <Spinner className='my-10' />
                    </Center>
                }
            >
                <ChatMessagesList chatId={chatId} />
            </Suspense>
        </ChatView>
    )
}
