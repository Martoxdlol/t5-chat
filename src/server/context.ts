import { createDatabasePool, createDrizzle, type DBType } from './db'

export type Context = {
    db: DBType
}

export async function createContext(): Promise<Context> {
    const client = await createDatabasePool()

    return {
        db: createDrizzle(client),
    }
}
