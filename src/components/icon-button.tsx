import type React from 'react'
import { cn } from '@/lib/utils'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode
    'aria-label': string // Ensure accessibility
}

export function IconButton({ icon, ...props }: IconButtonProps) {
    return (
        <button
            type='button'
            {...props}
            className={cn(
                props.className,
                'size-10 flex items-center justify-center rounded-full hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
            )}
        >
            {icon}
        </button>
    )
}
