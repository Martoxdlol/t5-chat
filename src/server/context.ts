import type { Pool } from 'mysql2/promise'
import { createDatabase } from './db'

export type Context = {
    db: Pool
}

export async function createContext(): Promise<Context> {
    return {
        db: await createDatabase(),
    }
}
