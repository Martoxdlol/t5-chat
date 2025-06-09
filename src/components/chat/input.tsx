import { SendHorizontal } from 'lucide-react'
import { memo, useCallback, useState } from 'react'
import type { Prompt } from '@/lib/types'
import { Button } from '../ui/button'

const MIN_ROWS = 2
const MAX_ROWS = 10

export const MessageInput = memo(MessageInputComponent)

function MessageInputComponent(props: { onPrompt?: (prompt: Prompt) => void }) {
    const [rows, setRows] = useState(3)

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

    return (
        <form className='w-full gap-4 border-t border-t-primary/10 p-4' onSubmit={handleSubmit}>
            <div className='flex items-start gap-2'>
                <textarea
                    name='message'
                    className='w-full resize-none rounded-md bg-accent p-2 text-base text-foreground leading-6 outline-none placeholder:text-secondary-foreground/60 disabled:opacity-0'
                    placeholder='Type your message here...'
                    rows={rows}
                    onChange={handleOnChange}
                />
                <Button type='submit' size='icon'>
                    <SendHorizontal />
                </Button>
            </div>
            <div className='flex items-center gap-2'>
                <p>Option 1</p>
                <p>Option 2</p>
            </div>
        </form>
    )
}
