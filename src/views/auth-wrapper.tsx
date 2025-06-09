import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { authClient } from '@/lib/auth-client'

export function AuthWrapper(props: { children: React.ReactNode }) {
    const user = useAuth()

    const isLoading = user === undefined

    if (!user) {
        return (
            <Layout sidenav={null} hasContent>
                <Button onClick={() => authClient.signIn.social({ provider: 'google' })}>Sign in with Google</Button>
            </Layout>
        )
    }

    return props.children
}
