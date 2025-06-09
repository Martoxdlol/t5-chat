import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { and, asc, eq } from 'drizzle-orm'
import type { ChatMessage } from '@/lib/models'
import { type DBTX, schema } from '../db'

export async function getChatMessages(db: DBTX, userId: string, chatId: string): Promise<ChatMessage[]> {
    return await db
        .select({
            index: schema.messages.index,
            role: schema.messages.role,
            status: schema.messages.status,
            content: schema.messages.content,
            createdAt: schema.messages.createdAt,
        })
        .from(schema.messages)
        .where(and(eq(schema.messages.userId, userId), eq(schema.messages.chatId, chatId)))
        .orderBy(asc(schema.messages.index))
}

export async function* generateMessage(
    messages: ChatMessage[],
    _model: string,
    onFinish: (text: string) => void,
): AsyncGenerator<string> {
    const result = streamText({
        model: openai('gpt-4o-mini'),
        messages: messages.map((msg) => ({
            content: msg.content,
            role: msg.role,
        })),
        onFinish: (text) => {
            onFinish(text.text)
        },
    })

    for await (const chunk of result.textStream) {
        yield chunk
    }
}
