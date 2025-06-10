/** biome-ignore-all lint/a11y/useValidAriaRole: It is not aria role and I don't want to rename its key */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { Center } from '@/components/center'
import { MessageInput } from '@/components/chat/input'
import { DisplayMessage } from '@/components/chat/message'
import { useTRPC } from '@/lib/api-client'
import { MessageContent } from '@/lib/message-content'
import type { ChatMessage, Prompt } from '@/lib/types'
import { ChatView } from './chat-view'

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
                                generator: chat.firstResponseGenerator,
                                contentManager: new MessageContent({
                                    content: '',
                                    generator: chat.firstResponseGenerator,
                                }),
                            },
                        ] as ChatMessage[]
                    })

                    queryClient.invalidateQueries(trpc.chat.listChats.queryFilter())

                    navigate(`/chats/${chat.id}`)

                    chat.titleGenerator.then((title) => {
                        queryClient.setQueryData(trpc.chat.listChats.queryKey(), (oldChats) => {
                            return oldChats?.map((c) => (c.id === chat.id ? { ...c, title } : c))
                        })
                    })

                    chat.colorGenerator.then((color) => {
                        queryClient.setQueryData(trpc.chat.listChats.queryKey(), (oldChats) => {
                            return oldChats?.map((c) => (c.id === chat.id ? { ...c, color } : c))
                        })
                    })

                    chat.emojiGenerator.then((emoji) => {
                        queryClient.setQueryData(trpc.chat.listChats.queryKey(), (oldChats) => {
                            return oldChats?.map((c) => (c.id === chat.id ? { ...c, emoji } : c))
                        })
                    })
                })
        },
        [newChatMutation, queryClient, trpc, navigate],
    )

    return (
        <ChatView input={<MessageInput onPrompt={handlePrompt} />}>
            {optimisticMsg && <DisplayMessage content={optimisticMsg} role='user' status='prompted' />}
            {!optimisticMsg && (
                <Center>
                    <p className='text-balance px-10 text-center text-2xl text-primary'>
                        Send a message to start a conversation
                    </p>
                </Center>
            )}
        </ChatView>
    )
}
