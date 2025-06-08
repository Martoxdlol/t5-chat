export * from './auth-schema'

import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const chats = mysqlTable('chat', {
    id: varchar('id', { length: 36 }).primaryKey(),
})
