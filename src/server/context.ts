export type Context = {
    db: null
}

export async function createContext(): Promise<Context> {

    return {
        db: null, // Replace with actual db instance
    };
}