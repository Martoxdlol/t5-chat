import { SendHorizontal } from 'lucide-react'
import { memo, useCallback, useRef, useState } from 'react'
import type { Prompt } from '@/lib/types'
import { Button } from '../ui/button'

const MIN_ROWS = 1
const MAX_ROWS = 10

export const MessageInput = memo(MessageInputComponent)

function MessageInputComponent(props: { onPrompt?: (prompt: Prompt) => void }) {
    const [rows, setRows] = useState(MIN_ROWS)

    const handleOnChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let rows = 1
        for (let i = 0; i < e.target.value.length; i++) {
            if (e.target.value[i] === '\n') {
                rows++
                if (rows > MAX_ROWS) {
                    break
                }
            }
        }

        setRows(Math.max(rows, MIN_ROWS))
    }, [])

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const text = formData.get('message')?.toString().trim() || ''

            ;(e.target as HTMLFormElement).reset()

            if (text.length === 0) {
                return
            }

            props.onPrompt?.({
                text,
                model: 'TODO:implement-model-selection',
            })
        },
        [props.onPrompt],
    )

    const submitButtonRef = useRef<HTMLButtonElement>(null)

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            const button = submitButtonRef.current
            button!.click()
            return
        }
    }, [])

    return (
        <div className='p-4 pt-0'>
            <form
                className='flex flex-col gap-1 rounded-md border-t-primary/10 bg-background/50 p-3 ring-8 ring-primary/10'
                onSubmit={handleSubmit}
            >
                <div className='flex items-start gap-2'>
                    <textarea
                        name='message'
                        className='w-full resize-none p-1 text-base text-foreground leading-6 outline-none placeholder:text-primary disabled:opacity-0'
                        placeholder='Type your message here...'
                        rows={rows}
                        onChange={handleOnChange}
                        onKeyDown={handleKeyDown}
                    />
                    <Button type='submit' size='icon' ref={submitButtonRef}>
                        <SendHorizontal />
                    </Button>
                </div>
                <div className='flex items-center gap-2'>
                    <Button className='h-6' size='sm'>
                        o3-mini
                    </Button>
                </div>
            </form>
        </div>
    )
}
