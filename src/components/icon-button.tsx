import type { LucideProps } from 'lucide-react'
import type React from 'react'
import { cloneElement, type ReactElement } from 'react'
import { cn } from '@/lib/utils'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactElement<LucideProps>
    'aria-label': string // Ensure accessibility
}

export function IconButton({ icon, onPress, ...props }: IconButtonProps & { onPress?: () => void }) {
    return (
        <button
            // DISABLED FOR NOW: It is causing unexpected behavior in some cases
            // onMouseDown={
            //     props.onMouseDown ??
            //     ((e) => {
            //         e.stopPropagation()
            //         e.preventDefault()
            //         onPress?.()
            //     })
            // }
            onClick={
                props.onClick ??
                ((e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onPress?.()
                })
            }
            type='button'
            {...props}
            className={cn(
                'flex size-10 items-center justify-center rounded-full hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
                props.className,
            )}
        >
            {cloneElement(icon, { size: 20, ...icon.props })}
        </button>
    )
}
