import { createAuth } from './src/server/auth'
import { createDatabasePool, createDrizzle } from './src/server/db'
import 'dotenv/config'

const client = await createDatabasePool()
const db = createDrizzle(client)

export const auth = createAuth(db)
