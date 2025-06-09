import { createBrowserRouter, Outlet } from 'react-router'
import { ChatScreen } from './views/chat-screen'
import { Layout } from './views/layout'
import { NewChatScreen } from './views/new-chat-screen'

export const router = createBrowserRouter([
    {
        element: (
            <Layout>
                <Outlet />
            </Layout>
        ),
        children: [
            {
                path: '/',
                element: <NewChatScreen />,
            },
            {
                path: '/chat/:chatId',
                element: <ChatScreen />,
            },
        ],
    },
])
