import type { ExtractTablesWithRelations } from 'drizzle-orm'
import type { MySqlTransaction } from 'drizzle-orm/mysql-core'
import {
    drizzle,
    type MySql2Database,
    type MySql2PreparedQueryHKT,
    type MySql2QueryResultHKT,
} from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'
export { schema }

const defaultUrl = 'mysql://root:password@localhost:3306/chat'

export async function createDatabasePool(): Promise<mysql.Pool> {
    const url = new URL(process.env.DATABASE_URL || defaultUrl)


    const pool = mysql.createPool({
        host: url.hostname,
        user: url.username,
        database: url.pathname.slice(1),
        password: url.password,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
        idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
    })

    return pool
}

export type DBType = MySql2Database<typeof schema> & {
    $client: mysql.Connection
}

export function createDrizzle(client: mysql.Connection): DBType {
    return drizzle({
        client,
        schema,
        mode: process.env.DRIZZLE_PLANETSCALE_MODE === 'true' ? 'planetscale' : 'default',
    })
}

export type TXType = MySqlTransaction<
    MySql2QueryResultHKT,
    MySql2PreparedQueryHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
>
