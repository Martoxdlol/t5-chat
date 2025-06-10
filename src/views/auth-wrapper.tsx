import { Center } from '@/components/center'
import { GoogleSvg } from '@/components/google'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { authClient } from '@/lib/auth-client'

export function AuthWrapper(props: { children: React.ReactNode }) {
    const user = useAuth()

    // const isLoading = user === undefined

    if (!user) {
        return (
            <Center>
                <div className='flex flex-col items-center gap-4'>
                    <h1 className='text-3xl'>T5 Chat</h1>
                    <Button className='bg-white' onClick={() => authClient.signIn.social({ provider: 'google' })}>
                        <GoogleSvg />
                        <span className='mx-2'>Sign in with Google</span>
                    </Button>
                </div>
            </Center>
        )
    }

    return props.children
}
