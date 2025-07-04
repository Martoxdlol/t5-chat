import { z } from 'zod'
import type { MessageContent } from './message-content'

export const promptSchema = z.object({
    text: z.string().min(1, 'Prompt text is required'),
    model: z.string().min(1, 'Model is required'),
})

export type Prompt = z.infer<typeof promptSchema>

export type ChatMessage = {
    index: number
    role: 'user' | 'assistant'
    status: 'prompted' | 'generating' | 'completed' | 'failed'
    content: string
    createdAt: Date
    generator?: AsyncGenerator<string>
    result?: Promise<void>
    contentManager?: MessageContent
    model?: string
    error?: string
}
