import { ChevronLeftIcon } from 'lucide-react'
import type React from 'react'
import { Link, useLocation } from 'react-router'
import { Button } from '@/components/ui/button'

export function ChatView(props: { children?: React.ReactNode; input: React.ReactNode }) {
    const location = useLocation()

    const canGoBack = location.state === 'back-to-home'

    return (
        <div className='relative flex size-full flex-col overflow-hidden'>
            <div className='shrink-0 border-primary/10 border-b p-1'>
                {canGoBack && (
                    <Button variant='ghost' className='' onClick={() => window.history.back()}>
                        <ChevronLeftIcon />
                    </Button>
                )}
                {!canGoBack && (
                    <Button asChild variant='ghost' className=''>
                        <Link to='/chats'>
                            <ChevronLeftIcon className='md:hidden' />
                        </Link>
                    </Button>
                )}
            </div>
            <div className='min-h-0 shrink grow overflow-y-auto'>
                <div className='h-fit w-full'>{props.children}</div>
            </div>
            <div className='shrink-0'>{props.input}</div>
        </div>
    )
}
