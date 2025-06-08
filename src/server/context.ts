import { createAuth } from './auth'
import { createDatabasePool, createDrizzle, type DBType } from './db'

export type Context = {
    db: DBType
    auth: ReturnType<typeof createAuth>
}

export async function createContext(): Promise<Context> {
    const client = await createDatabasePool()
    const db = createDrizzle(client)
    const auth = createAuth(db)

    return {
        db,
        auth,
    }
}
