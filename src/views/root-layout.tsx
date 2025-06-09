import { Outlet, useLocation } from 'react-router'
import { Layout } from '@/components/layout'
import { HomeView } from './home-view'

export function RootLayoutElement() {
    const pathname = useLocation().pathname

    const hasContent = pathname !== '/chats'

    return (
        <Layout sidenav={<HomeView />} hasContent={hasContent}>
            <Outlet />
        </Layout>
    )
}
