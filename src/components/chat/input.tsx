import { SendHorizontal } from 'lucide-react'
import { memo, useCallback, useRef, useState } from 'react'
import { useLocalStorageState } from '@/hooks/use-local-storage-state'
import type { Prompt } from '@/lib/types'
import { RemainingCredits } from '../credits-left'
import { Button } from '../ui/button'
import { ModelPicker } from './model-picker'

const MIN_ROWS = 1
const MAX_ROWS = 10

export const MessageInput = memo(MessageInputComponent)

function MessageInputComponent(props: { onPrompt?: (prompt: Prompt) => void; placeholder?: string }) {
    const [rows, setRows] = useState(MIN_ROWS)

    const [model, setModel] = useLocalStorageState<string | null>('model', () => null)

    const [defaultValue] = useState<string>(() => localStorage.getItem('last_written_message') || '')

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

        localStorage.setItem('last_written_message', e.target.value)

        setRows(Math.max(rows, MIN_ROWS))
    }, [])

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()

            if (!props.onPrompt) {
                return
            }

            const formData = new FormData(e.currentTarget)
            const text = formData.get('message')?.toString().trim() || ''

            if (text.length === 0) {
                return
            }

            ;(e.target as HTMLFormElement).reset()

            localStorage.setItem('last_written_message', '')

            props.onPrompt?.({
                text,
                model: model || 'default',
            })
        },
        [props.onPrompt, model],
    )

    const submitButtonRef = useRef<HTMLButtonElement>(null)

    const itIsMobileRef = useRef<boolean>(false)

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Unidentified') {
            itIsMobileRef.current = true
            return
        }

        const addLineKey = e.shiftKey || e.ctrlKey || e.metaKey

        if (e.key === 'Enter' && !addLineKey && !itIsMobileRef.current) {
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
                        defaultValue={defaultValue}
                        name='message'
                        className='w-full resize-none p-1 text-base text-foreground leading-6 outline-none placeholder:text-primary disabled:opacity-0'
                        placeholder={props.placeholder || 'Type your message here...'}
                        rows={rows}
                        onChange={handleOnChange}
                        onKeyDown={handleKeyDown}
                    />
                    <Button type='submit' size='icon' ref={submitButtonRef}>
                        <SendHorizontal />
                    </Button>
                </div>
                <div className='flex items-center gap-2'>
                    <ModelPicker value={model} onChange={setModel} />
                    <RemainingCredits />
                </div>
            </form>
        </div>
    )
}
