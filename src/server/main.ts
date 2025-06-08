import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { auth } from './auth'
import { createContext } from './context'
import { trpcHandler } from './handler'

async function main() {
    const app = new Hono()

    const context = await createContext()

    app.all('/api/trpc/*', (c) => trpcHandler(c.req.raw, context))
    app.all('/api/auth/*', (c) => auth.handler(c.req.raw))

    serve(app)
}

main().catch((err) => {
    console.error('Error starting server:', err)
    process.exit(1)
})
