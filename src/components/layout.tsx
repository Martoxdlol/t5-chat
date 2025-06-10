import { cn } from '@/lib/utils'

export function Layout(props: { children: React.ReactNode; sidenav: React.ReactNode; hasContent?: boolean }) {
    const hasChildren = props.hasContent || false

    return (
        <div className='flex size-full select-none bg-background'>
            <nav
                className={cn(
                    'shrink-0 overflow-y-auto border-primary/10 border-r shadow',
                    '6xl:w-md w-full md:w-64 lg:w-sm',
                    {
                        flex: !hasChildren,
                        'hidden md:flex': hasChildren,
                    },
                )}
            >
                {props.sidenav}
            </nav>
            <main
                className={cn('flex min-w-0 shrink grow justify-center', {
                    'hidden md:flex': !hasChildren,
                    flex: hasChildren,
                })}
            >
                {props.children}
            </main>
        </div>
    )
}
