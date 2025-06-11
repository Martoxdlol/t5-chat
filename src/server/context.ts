import { createAuth } from './auth'
import { createDatabasePool, createDrizzle, type DBType } from './db'
import { type AIContext, createAIContext } from './service/models'

export type Context = {
    db: DBType
    auth: ReturnType<typeof createAuth>
    ai: AIContext
}

export async function createContext(): Promise<Context> {
    const client = await createDatabasePool()
    const db = createDrizzle(client)
    const auth = createAuth(db)
    const ai = await createAIContext()

    return {
        db,
        auth,
        ai,
    }
}
