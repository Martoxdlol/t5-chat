import { createAuth } from './auth'
import { createDatabasePool, createDrizzle, type DBType } from './db'
import { getModels, type Model } from './service/models'

export type Context = {
    db: DBType
    auth: ReturnType<typeof createAuth>
    models: Map<string, Model>
}

export async function createContext(): Promise<Context> {
    const client = await createDatabasePool()
    const db = createDrizzle(client)
    const auth = createAuth(db)
    const models = await getModels()

    return {
        db,
        auth,
        models,
    }
}
