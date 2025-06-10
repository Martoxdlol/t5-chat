import { Loader } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Spinner(props: ComponentProps<typeof Loader>) {
    return <Loader size={24} aria-label='Loading...' {...props} className={cn('animate-spin', props.className)} />
}
