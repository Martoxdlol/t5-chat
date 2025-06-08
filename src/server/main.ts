import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { createContext } from './context'
import { trpcHandler } from './handler'

async function main() {
    const app = new Hono()

    const context = await createContext()

    app.all('/api/trpc/*', (c) => trpcHandler(c.req.raw, context))
    app.all('/api/auth/*', (c) => context.auth.handler(c.req.raw))

    if (process.env.NODE_ENV === 'production') {
        app.use('/*', serveStatic({ root: './dist/app', index: 'index.html' }))
        app.get('/*', serveStatic({ root: './dist/app', path: 'index.html' }))
    }


    serve(app)
}

main().catch((err) => {
    console.error('Error starting server:', err)
    process.exit(1)
})
