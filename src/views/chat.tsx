import { useRef } from 'react'
import { MessageInput } from '@/components/chat/input'
import { useElementDimensions } from '@/hooks/use-element-dimensions'

export function ChatView() {
    const inputWrapperRef = useRef<HTMLDivElement>(null)
    const inputWrapperSize = useElementDimensions(inputWrapperRef.current)

    return (
        <div
            className='relative flex size-full flex-col items-center overflow-y-auto'
            style={{ paddingBottom: `${inputWrapperSize.height}px` }}
        >
            <div className='w-full max-w-3xl'>Messages</div>

            <div className='fixed bottom-0 w-full max-w-3xl' ref={inputWrapperRef}>
                <MessageInput />
            </div>
        </div>
    )
}
