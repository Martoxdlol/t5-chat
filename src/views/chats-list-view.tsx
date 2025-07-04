import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { memo, Suspense, useEffect, useRef } from 'react'
import { useParams } from 'react-router'
import { Center } from '@/components/center'
import { ChatListTile } from '@/components/chat-list-tile'
import { Spinner } from '@/components/spinner'
import { useTRPC } from '@/lib/api-client'

export const ChatsListView = memo(ChatsListViewComponent)

const MAX_PREFETCH_CHATS = 10

function ChatsListViewComponent() {
    return (
        <Suspense
            fallback={
                <Center>
                    <Spinner />
                </Center>
            }
        >
            <ChatsListViewContent />
        </Suspense>
    )
}

function ChatsListViewContent() {
    const trpc = useTRPC()

    const { data: chats } = useSuspenseQuery(
        trpc.chat.listChats.queryOptions(undefined, {
            refetchOnMount: true,
            refetchOnWindowFocus: true,
        }),
    )

    const queryClient = useQueryClient()

    useEffect(() => {
        let i = MAX_PREFETCH_CHATS
        for (const chat of chats) {
            if (i <= 0) {
                break
            }
            const existingChat = queryClient.getQueryData(trpc.chat.getChatMessages.queryKey({ chatId: chat.id }))
            if (!existingChat) {
                queryClient.prefetchQuery(trpc.chat.getChatMessages.queryOptions({ chatId: chat.id }))
            }
            i--
        }
    }, [chats, queryClient, trpc])

    const params = useParams()

    const chatId = params.chatId

    // The scrollable element for your list
    const parentRef = useRef<HTMLUListElement>(null)

    // The virtualizer
    const rowVirtualizer = useVirtualizer({
        count: chats.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 72,
    })

    return (
        <ul className='min-h-0 shrink grow overflow-y-auto' ref={parentRef}>
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                    const chat = chats![virtualItem.index]!
                    return (
                        <ChatListTile
                            key={chat.id}
                            chatId={chat.id}
                            title={chat.title}
                            emoji={chat.emoji}
                            color={chat.color}
                            lastMessage={chat.lastMessage}
                            selected={chat.id === chatId}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualItem.size}px`,
                                transform: `translateY(${virtualItem.start}px)`,
                            }}
                        />
                    )
                })}
            </div>
        </ul>
    )
}
