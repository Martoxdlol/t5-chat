import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Suspense, useCallback } from 'react'
import { useParams } from 'react-router'
import { AppErrorBoundary } from '@/components/app-error-boundary'
import { Center } from '@/components/center'
import { MessageInput } from '@/components/chat/input'
import { ChatMessagesList } from '@/components/chat/messages-list'
import { useInvalidateRemainingCredits } from '@/components/credits-left'
import { Spinner } from '@/components/spinner'
import { useTRPC } from '@/lib/api-client'
import { MessageContent } from '@/lib/message-content'
import type { ChatMessage, Prompt } from '@/lib/types'
import { ChatView } from './chat-view'

export function ChatScreen() {
    const params = useParams()

    const chatId = params.chatId as string

    const trpc = useTRPC()

    const promptMutation = useMutation(trpc.chat.prompt.mutationOptions())

    const queryClient = useQueryClient()

    const invalidateRemainingCredits = useInvalidateRemainingCredits()

    const handlePrompt = useCallback(
        (prompt: Prompt) => {
            const userMsgPending: ChatMessage = {
                index: 100001,
                role: 'user',
                status: 'prompted',
                content: prompt.text,
                createdAt: new Date(),
            }

            const responseMsgPending: ChatMessage = {
                index: 100002,
                role: 'assistant',
                status: 'prompted',
                content: '',
                createdAt: new Date(),
            }

            queryClient.setQueryData(
                trpc.chat.getChatMessages.queryKey({ chatId }),
                (data) => {
                    const prev = data ?? []
                    return [...prev, userMsgPending, responseMsgPending]
                },
                {
                    updatedAt: Date.now(),
                },
            )

            promptMutation
                .mutateAsync({
                    chatId,
                    prompt: {
                        text: prompt.text,
                        model: 'todo:implement-model',
                    },
                })
                .then(({ generator, responseMessageIndex, userMessageIndex, result }) => {
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
                            result,
                        }),
                    }

                    queryClient.setQueryData(
                        trpc.chat.getChatMessages.queryKey({ chatId }),
                        (data) => {
                            const msgs = data?.slice(0, -2) ?? []
                            msgs.push(userMsg, responseMsg)
                            return msgs
                        },
                        {
                            updatedAt: Date.now(),
                        },
                    )

                    setTimeout(() => invalidateRemainingCredits(), 10_000)
                })
        },
        [
            chatId,
            promptMutation,
            queryClient.setQueryData,
            trpc.chat.getChatMessages.queryKey,
            invalidateRemainingCredits,
        ],
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
                <AppErrorBoundary>
                    <ChatMessagesList chatId={chatId} />
                </AppErrorBoundary>
            </Suspense>
        </ChatView>
    )
}
