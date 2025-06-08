import { memo, useCallback, useState } from 'react'

const MIN_ROWS = 3
const MAX_ROWS = 10

export const MessageInput = memo(MessageInputComponent)

function MessageInputComponent() {
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

    return (
        <form className='w-full gap-4 rounded-t-lg bg-secondary/5 p-4 ring-8 ring-secondary/15'>
            <textarea
                className='w-full resize-none bg-transparent text-base text-foreground leading-6 outline-none placeholder:text-secondary-foreground/60 disabled:opacity-0'
                placeholder='Type your message here...'
                rows={rows}
                onChange={handleOnChange}
            />
        </form>
    )
}
