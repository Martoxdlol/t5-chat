export * from './auth-schema'

import { int, mysqlTable, primaryKey, text, timestamp, varchar } from 'drizzle-orm/mysql-core'

export const chats = mysqlTable(
    'chat',
    {
        userId: varchar('user_id', { length: 36 }).notNull(),
        id: varchar('id', { length: 36 }).notNull(),
        title: varchar('title', { length: 255 }).notNull(),
        color: varchar('color', { length: 12 }),
        emoji: varchar('emoji', { length: 12 }),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    },
    (t) => [primaryKey({ columns: [t.userId, t.id] })],
)

export const messages = mysqlTable(
    'message',
    {
        userId: varchar('user_id', { length: 36 }).notNull(),
        chatId: varchar('chat_id', { length: 36 }).notNull(),
        role: varchar('role', { length: 36, enum: ['user', 'assistant'] }).notNull(),
        status: varchar('status', { length: 36, enum: ['prompted', 'generating', 'completed', 'failed'] }).notNull(),
        index: int('index').notNull(),
        content: text('content').notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    },
    (t) => [primaryKey({ columns: [t.userId, t.chatId, t.index] })],
)
