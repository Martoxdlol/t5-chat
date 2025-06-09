import type React from 'react'
import { useRef } from 'react'
import { useElementDimensions } from '@/hooks/use-element-dimensions'

export function ChatView(props: { children?: React.ReactNode; input: React.ReactNode }) {
    const inputWrapperRef = useRef<HTMLDivElement>(null)
    const inputWrapperSize = useElementDimensions(inputWrapperRef.current)

    return (
        <div className='relative size-full'>
            <div
                className=' flex size-full flex-col items-center overflow-y-auto'
                style={{ paddingBottom: `${inputWrapperSize.height + 24}px` }}
            >
                <div className='w-full max-w-3xl'>{props.children}</div>

                <div className='absolute right-0 bottom-0 left-0 flex justify-center' ref={inputWrapperRef}>
                    <div className='w-full max-w-3xl bg-white/50 backdrop-blur-sm'>{props.input}</div>
                </div>
            </div>
        </div>
    )
}
