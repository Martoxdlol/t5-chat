import { type LanguageModelV1, streamText } from 'ai'
import { and, asc, eq } from 'drizzle-orm'
import type { ChatMessage } from '@/lib/types'
import { type DBTX, schema } from '../db'

export async function getChatMessages(db: DBTX, userId: string, chatId: string): Promise<ChatMessage[]> {
    return await db
        .select({
            index: schema.messages.index,
            role: schema.messages.role,
            status: schema.messages.status,
            content: schema.messages.content,
            createdAt: schema.messages.createdAt,
            model: schema.messages.model,
        })
        .from(schema.messages)
        .where(and(eq(schema.messages.userId, userId), eq(schema.messages.chatId, chatId)))
        .orderBy(asc(schema.messages.index))
}

export async function* generateMessage(
    model: LanguageModelV1,
    messages: ChatMessage[],
    _model: string,
    onFinish: (text: string) => void,
    onPartial?: (text: string) => void,
): AsyncGenerator<string> {
    const result = streamText({
        model,
        system: 'You are a helpful assistant that generates responses based on user messages. You output markdown formatted text with support for code blocks, math equations, and other markdown features. Use $$ for any math expression and symbols. Ensure all math is wrapped correctly.',
        messages: messages.map((msg) => ({
            content: msg.content,
            role: msg.role,
        })),
        onFinish: (text) => {
            onFinish(text.text)
        },
    })

    let lastPartial = Date.now()
    let partialText = ''

    for await (const chunk of result.textStream) {
        partialText += chunk

        if (onPartial) {
            const now = Date.now()
            if (now - lastPartial > 1000) {
                // Throttle partial updates to every second
                onPartial(partialText)
                lastPartial = now
            }
        }

        yield chunk
    }
}

export async function generateChatTitle(model: LanguageModelV1, firstPrompt: string): Promise<string> {
    const result = streamText({
        onError: (error) => {
            console.error('Error generating chat title:', error)
        },
        model,
        maxTokens: 600,
        messages: [
            {
                role: 'system',
                content:
                    'You are instructed to generate chat titles based on the content of the first message. The title must be concise and it must summarize the topic of the conversation. You must output only the title, without any additional text or characters.',
            },
            { role: 'user', content: firstPrompt },
        ],
    })

    let title = ''
    for await (const chunk of result.textStream) {
        title += chunk
    }

    return title.trim() || 'Unnamed Chat'
}

export async function generateChatColor(model: LanguageModelV1, firstPrompt: string): Promise<string> {
    const result = streamText({
        onError: (error) => {
            console.error('Error generating chat color:', error)
        },
        model,
        maxTokens: 600,
        messages: [
            {
                role: 'system',
                content:
                    'You are instructed to generate a color based on the feeling of the chat. The color must be a valid hex code including the hash symbol, e.g., #FF5733. The color should reflect the mood or topic of the chat. You must output only the hex color code, without any additional text or characters.',
            },
            { role: 'user', content: firstPrompt },
        ],
    })

    let color = ''
    for await (const chunk of result.textStream) {
        color += chunk
    }

    return color.trim() || '#FFFFFF' // Default to white if no color is generated
}

export async function generateChatEmoji(model: LanguageModelV1, firstPrompt: string): Promise<string> {
    const result = streamText({
        onError: (error) => {
            console.error('Error generating chat emoji:', error)
        },
        model,
        maxTokens: 600,
        messages: [
            {
                role: 'system',
                content:
                    'You are instructed to generate an emoji that represents the chat. The emoji should be relevant to the topic or mood of the conversation. You must output a emoji character, e.g., 😊, 🚀, (or any other). Do not output any text or additional characters.',
            },
            { role: 'user', content: firstPrompt },
        ],
    })

    let emoji = ''
    for await (const chunk of result.textStream) {
        emoji += chunk
    }

    return emoji.trim() || '💬' // Default to a speech bubble if no emoji is generated
}
