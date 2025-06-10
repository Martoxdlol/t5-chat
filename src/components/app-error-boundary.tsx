import { TriangleAlertIcon } from 'lucide-react'
import { ErrorBoundary } from 'react-error-boundary'
import { Center } from './center'
import { Button } from './ui/button'

export function AppErrorBoundary(props: { children: React.ReactNode }) {
    return (
        <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
                <Center>
                    <div className='flex flex-col items-center gap-2 rounded-md p-2'>
                        <TriangleAlertIcon />
                        <p className='line-clamp-3 max-w-74 overflow-hidden text-ellipsis text-balance text-center text-muted-foreground text-sm'>
                            {error.message}
                        </p>
                        <Button onClick={resetErrorBoundary} className='mt-2'>
                            retry
                        </Button>
                    </div>
                </Center>
            )}
        >
            {props.children}
        </ErrorBoundary>
    )
}
