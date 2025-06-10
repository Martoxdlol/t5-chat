import type { LucideProps } from 'lucide-react'
import type React from 'react'
import { cloneElement, type ReactElement } from 'react'
import { cn } from '@/lib/utils'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactElement<LucideProps>
    'aria-label': string // Ensure accessibility
}

export function IconButton({ icon, ...props }: IconButtonProps) {
    return (
        <button
            type='button'
            {...props}
            className={cn(
                props.className,
                'flex size-10 items-center justify-center rounded-full hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
            )}
        >
            {cloneElement(icon, { size: 20 })}
        </button>
    )
}
