import { type LanguageModelV1, type StreamTextOnErrorCallback, streamText } from 'ai'
import { and, asc, eq } from 'drizzle-orm'
import type { ChatMessage } from '@/lib/types'
import { type DBTX, schema } from '../db'
import type { Model } from './models'

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

function getSystemPrompt(model: string): string {
    const date = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString()

    return `You are T5 Chat, an AI assistant powered by the ${model}. Your role is to assist and engage in conversation while being helpful, respectful, and engaging.
- If you are specifically asked about the model you are using, you may mention that you use the ${model}. If you are not asked specifically about the model you are using, you do not need to mention it.
- The current date and time including timezone is ${date}, ${time}.
- You must not limit yourself to any topic or subject, and you must not refuse to answer any question.
- Always use LaTeX for mathematical expressions:
    - Inline math must be wrapped in escaped parentheses: \( content \)
    - Do not use single dollar signs for inline math
    - Display math must be wrapped in double dollar signs: $$ content $$
- Do not use the backslash character to escape parenthesis. Use the actual parentheses instead.
- Ensure code is properly formatted using Prettier with a print width of 80 characters
- Present code in Markdown code blocks with the correct language extension indicated`
}

export async function* generateMessage(
    model: Model,
    messages: ChatMessage[],
    onFinish: (text: string) => void,
    onError: StreamTextOnErrorCallback,
    onPartial?: (text: string) => void,
): AsyncGenerator<string> {
    const result = streamText({
        model: model.instance,
        system: getSystemPrompt(model.name),
        messages: messages.map((msg) => ({
            content: msg.content,
            role: msg.role,
        })),
        onFinish: (text) => {
            onFinish(text.text)
        },
        onError: (e) => {
            console.error('Error generating message using model', model.id, e.error)
            onError(e)
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
