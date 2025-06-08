import mysql from 'mysql2/promise'

const defaultUrl = 'mysql://root:password@localhost:3306/chat'

export async function createDatabase(): Promise<mysql.Pool> {
    const url = new URL(import.meta.env.DATABASE_URL || defaultUrl)

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
