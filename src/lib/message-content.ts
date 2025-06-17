import type { ChatMessage } from './types'

export type MessageContentStatus = 'generating' | 'complete' | 'failed'

export class MessageContent {
    content: string
    status: MessageContentStatus = 'generating'
    result: Promise<void>
    error?: string

    subscribers = new Set<(content: string, status: MessageContentStatus, error: string | undefined) => void>()

    constructor(message: Pick<ChatMessage, 'content' | 'generator' | 'result'>) {
        this.content = message.content ?? ''
        this.result = message.result ?? Promise.resolve()
        if (message.generator) {
            this.consumeGenerator(message.generator)
        }
    }

    private async consumeGenerator(generator: AsyncGenerator<string>): Promise<void> {
        for await (const chunk of generator) {
            this.content += chunk
            this.notifySubscribers(this.content, this.status, undefined)
        }

        this.result
            .then(() => {
                this.status = 'complete'
                this.notifySubscribers(this.content, this.status, undefined)
            })
            .catch((error) => {
                console.error('Error consuming generator:', error)
                this.status = 'failed'
                this.error = error.message
                this.notifySubscribers(this.content, this.status, error.message)
            })
    }

    subscribe(
        callback: (content: string, status: MessageContentStatus, error: string | undefined) => void,
    ): () => void {
        this.subscribers.add(callback)

        this.notifySubscribers(this.content, this.status, this.error)

        return () => {
            this.subscribers.delete(callback)
        }
    }

    notifySubscribers(content: string, status: MessageContentStatus, error: string | undefined): void {
        this.subscribers.forEach((callback) => callback(content, status, error))
    }

    toJSON() {
        return null
    }
}
