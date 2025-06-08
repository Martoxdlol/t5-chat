import { RouterProvider } from 'react-router'
import { Screen } from './components/scaffolding/screen'
import { ApiProvider } from './lib/api-provider'
import { router } from './router'

export default function App() {
    return (
        <Screen>
            <ApiProvider>
                <RouterProvider router={router} />
            </ApiProvider>
        </Screen>
    )
}
