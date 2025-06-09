import { Sidenav } from "@/components/nav";

export function Layout(props: { children: React.ReactNode }) {
    return (
        <div className='flex size-full'>
            <nav className='hidden w-64 shrink-0 overflow-y-auto sm:block'>
                <Sidenav />
            </nav>
            <main className='flex min-w-0 shrink grow justify-center'>{props.children}</main>
        </div>
    )
}
