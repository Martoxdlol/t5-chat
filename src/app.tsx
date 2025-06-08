import { useQuery } from '@tanstack/react-query'
import { Button } from './components/ui/button'
import { useTRPC } from './lib/api-client'
import { authClient } from './lib/auth-client'

export default function App() {
    const trpc = useTRPC()

    const { data } = useQuery(trpc.hello.queryOptions())

    const session = authClient.useSession()

    return (
        <Button
            onClick={() =>
                authClient.signIn.social({
                    provider: 'google',
                })
            }
        >
            {data} ({session.data?.user.email})
        </Button>
    )
}
