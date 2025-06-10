import { createBrowserRouter, Link } from 'react-router'
import { AppErrorBoundary } from './components/app-error-boundary'
import { Center } from './components/center'
import { Button } from './components/ui/button'
import { AuthWrapper } from './views/auth-wrapper'
import { ChatScreen } from './views/chat-screen'
import { NewChatScreen } from './views/new-chat-screen'
import { RootLayoutElement } from './views/root-layout'

export const router = createBrowserRouter([
    {
        element: (
            <AppErrorBoundary>
                <AuthWrapper>
                    <RootLayoutElement />
                </AuthWrapper>
            </AppErrorBoundary>
        ),
        children: [
            {
                path: '/',
                element: <NewChatScreen />,
            },
            {
                path: '/chats',
                element: (
                    <Center>
                        <Button asChild>
                            <Link to='/'>Start New Chat</Link>
                        </Button>
                    </Center>
                ),
            },
            {
                path: '/chats/:chatId',
                element: <ChatScreen />,
            },
        ],
    },
    {
        path: '*',
        element: (
            <Center>
                <div className='flex flex-col items-center gap-2'>
                    <h1 className='text-xl'>Page not found</h1>
                    <Button asChild>
                        <Link to='/'>Home</Link>
                    </Button>
                </div>
            </Center>
        ),
    },
])
