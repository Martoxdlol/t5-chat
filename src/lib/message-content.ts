import type { ChatMessage } from './types'

export class MessageContent {
    content: string
    completed: boolean = false

    subscribers = new Set<(content: string, completed: boolean) => void>()

    constructor(message: Pick<ChatMessage, 'content' | 'generator'>) {
        this.content = message.content ?? ''
        if (message.generator) {
            this.consumeGenerator(message.generator)
        }
    }

    private async consumeGenerator(generator: AsyncGenerator<string>): Promise<void> {
        for await (const chunk of generator) {
            this.content += chunk
            this.notifySubscribers(this.content, this.completed)
        }
        this.completed = true
        this.notifySubscribers(this.content, this.completed)
    }

    subscribe(callback: (content: string, completed: boolean) => void): () => void {
        this.subscribers.add(callback)

        this.notifySubscribers(this.content, this.completed)

        return () => {
            this.subscribers.delete(callback)
        }
    }

    notifySubscribers(content: string, completed: boolean): void {
        this.subscribers.forEach((callback) => callback(content, completed))
    }

    toJSON() {
        return null
    }
}
