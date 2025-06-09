import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export async function* cumulativeGenerator(initial: string, generator: AsyncGenerator<string>) {
    let current = initial
    yield current

    for await (const chunk of generator) {
        current += chunk
        yield current
    }
}