export async function* ensureCompletionAsyncGenerator(generator: AsyncGenerator<string>): AsyncGenerator<string> {
    const stream = new ReadableStream<string>({
        async start(controller) {
            // The `start` function acts as the producer. It runs the original
            // generator to completion, regardless of what the consumer does.
            try {
                for await (const value of generator) {
                    console.log('Pushing value to stream:', value)
                    controller.enqueue(value)
                }
                // Signal that the stream is finished.
                controller.close()
            } catch (e) {
                // If the source generator throws, propagate the error to the stream.
                controller.error(e)
            }
        },
    })

    const gen = (stream as any)[Symbol.asyncIterator]() as AsyncGenerator<string>

    const first = await gen.next()
    yield first.value
    while (true) {
        const next = await gen.next()
        if (next.done) {
            break
        }
        yield next.value
    }
}
