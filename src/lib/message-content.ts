import type { ChatMessage } from './types'

export class MessageContent {
    content: string

    subscribers = new Set<(content: string) => void>()

    constructor(message: Pick<ChatMessage, 'content' | 'generator'>) {
        this.content = message.content ?? ''
        if (message.generator) {
            this.consumeGenerator(message.generator)
        }
    }

    private async consumeGenerator(generator: AsyncGenerator<string>): Promise<void> {
        for await (const chunk of generator) {
            this.content += chunk
            this.notifySubscribers(this.content)
        }
    }

    subscribe(callback: (content: string) => void): () => void {
        this.subscribers.add(callback)

        this.notifySubscribers(this.content)

        return () => {
            this.subscribers.delete(callback)
        }
    }

    notifySubscribers(content: string): void {
        this.subscribers.forEach((callback) => callback(content))
    }
}
