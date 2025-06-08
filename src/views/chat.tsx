import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'
import { MessageInput } from '@/components/chat/input'
import { Button } from '@/components/ui/button'
import { useElementDimensions } from '@/hooks/use-element-dimensions'
import { useTRPC } from '@/lib/api-client'

export function ChatView() {
    const inputWrapperRef = useRef<HTMLDivElement>(null)
    const inputWrapperSize = useElementDimensions(inputWrapperRef.current)

    const trpc = useTRPC()

    const mutation = useMutation(trpc.prompt.mutationOptions())

    console.log(mutation.data)

    return (
        <div
            className='relative flex size-full flex-col items-center overflow-y-auto'
            style={{ paddingBottom: `${inputWrapperSize.height}px` }}
        >
            <div className='w-full max-w-3xl'>Messages</div>
            <Button
                onClick={() => {
                    mutation.mutateAsync().then(async (data) => {
                        for await (const item of data) {
                            logGenerator(item)
                        }
                    })
                }}
            >
                Start Prompt
            </Button>

            <div className='fixed bottom-0 w-full max-w-3xl' ref={inputWrapperRef}>
                <MessageInput />
            </div>
        </div>
    )
}

async function logGenerator(data: AsyncIterable<number>) {
    for await (const item of data) {
        console.log(item);
    }
}