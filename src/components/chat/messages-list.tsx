import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { memo, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { DisplayMessage } from '@/components/chat/message'
import { trpc as apiClient, useTRPC } from '@/lib/api-client'
import { useSetPrimaryScrollYSetter } from '../primary-scroll-provider'

export const ChatMessagesList = memo(ChatMessagesListComponent)

function ChatMessagesListComponent(props: { chatId: string }) {
    const chatId = props.chatId

    const trpc = useTRPC()

    const { data } = useSuspenseQuery(
        trpc.chat.getChatMessages.queryOptions({ chatId }, { staleTime: 1000 * 60 * 5, refetchOnMount: false }),
    )

    const setPrimaryScrollY = useSetPrimaryScrollYSetter()

    const containerRef = useRef<HTMLDivElement>(null)

    // biome-ignore lint/correctness/useExhaustiveDependencies: I need it to trigger on message added
    useLayoutEffect(() => {
        if (containerRef.current) {
            const scrollHeight = containerRef.current.scrollHeight
            containerRef.current.scrollTo({
                top: scrollHeight,
                behavior: 'smooth',
            })

            setPrimaryScrollY(scrollHeight)
        }
    }, [data.length, containerRef.current])

    const queryClient = useQueryClient()

    const handlePoll = useCallback(() => {
        const msgsRequiringUpdate = data.filter((msg) => msg.status === 'generating')

        msgsRequiringUpdate.forEach((msg) => {
            const index = msg.index
            apiClient.chat.getMessage.query({ chatId, index }).then((updatedMsg) => {
                queryClient.setQueryData(trpc.chat.getChatMessages.queryKey({ chatId }), (messages) => {
                    return (
                        messages?.map((m) => {
                            if (m.index === index) {
                                return {
                                    ...m,
                                    status: updatedMsg.status,
                                    content: updatedMsg.content,
                                }
                            }
                            return m
                        }) ?? []
                    )
                })
            })
        })
    }, [data, chatId, queryClient, trpc])

    useEffect(() => {
        const abortController = new AbortController()

        containerRef.current?.addEventListener(
            'scroll',
            () => {
                setPrimaryScrollY(containerRef.current!.scrollTop)
            },
            { signal: abortController.signal },
        )

        return () => {
            abortController.abort()
        }
    }, [setPrimaryScrollY])

    return (
        <div className='size-full overflow-y-auto' ref={containerRef}>
            <div className='h-fit w-full'>
                {data?.map((msg) => (
                    <DisplayMessage
                        chatId={chatId}
                        index={msg.index}
                        key={msg.index}
                        content={msg.content}
                        role={msg.role}
                        contentManager={msg.contentManager}
                        status={msg.status}
                        onPoll={handlePoll}
                    />
                ))}
            </div>
        </div>
    )
}
