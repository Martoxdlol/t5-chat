import { createBrowserRouter } from 'react-router'
import { AuthWrapper } from './views/auth-wrapper'
import { ChatScreen } from './views/chat-screen'
import { NewChatScreen } from './views/new-chat-screen'
import { RootLayoutElement } from './views/root-layout'

export const router = createBrowserRouter([
    {
        element: (
            <AuthWrapper>
                <RootLayoutElement />
            </AuthWrapper>
        ),
        children: [
            {
                path: '/',
                element: <NewChatScreen />,
            },
            {
                path: '/chats',
                element: <p>placeholder</p>,
            },
            {
                path: '/chats/:chatId',
                element: <ChatScreen />,
            },
        ],
    },
])
