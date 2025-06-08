export function Layout(props: { children: React.ReactNode }) {
    return (
        <div className='flex size-full'>
            <nav className='w-64 shrink-0'></nav>
            <main className='flex min-w-0 shrink grow justify-center'>{props.children}</main>
        </div>
    )
}
