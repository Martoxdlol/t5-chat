import { openai } from '@ai-sdk/openai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { LanguageModelV1 } from 'ai'

export type Model = {
    provider: 'openrouter' | 'openai'
    // Model name
    name: string
    // Model instance (to be passed to ai-sdk)
    instance: LanguageModelV1
    // Can input text
    image: boolean
    // Can input file
    file: boolean
    // Cost relative to Gemini 2.0 Flash
    cost: number
}

type OpenRouterModel = {
    id: string
    name: string
    description: string
    architecture?: {
        input_modalities?: string[]
    }
    pricing: {
        prompt: number
        completion: number
    }
}

async function fetchAvailableModels(): Promise<OpenRouterModel[]> {
    return (await fetch('https://openrouter.ai/api/v1/models').then((r) => r.json())).data as OpenRouterModel[]
}

const GEMINI_2_FLASH_COMPLETION_COST = 0.0000004

export async function getModels(): Promise<Map<string, Model>> {
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
        throw new Error(
            'No API keys provided for OpenRouter or OpenAI.\nPlease set OPENROUTER_API_KEY or OPENAI_API_KEY in your environment variables.',
        )
    }

    const models = new Map<string, Model>()

    if (process.env.OPENROUTER_API_KEY) {
        const availableModels = await fetchAvailableModels()

        const openrouter = createOpenRouter({
            apiKey: process.env.OPENROUTER_API_KEY,
        })

        for (const model of availableModels) {
            const instance = openrouter.chat(model.id)

            // Cost relative to Gemini 2.0 Flash
            let cost = model.pricing.completion / GEMINI_2_FLASH_COMPLETION_COST

            if (cost < 0.2) {
                cost = 0.2
            }

            models.set(model.id, {
                provider: 'openrouter',
                name: model.name,
                instance,
                image: model.architecture?.input_modalities?.includes('image') ?? false,
                file: model.architecture?.input_modalities?.includes('file') ?? false,
                cost,
            })
        }
    }

    if (process.env.OPENAI_API_KEY) {
        models.set('openai_api/gpt-3.5-turbo', {
            provider: 'openai',
            name: 'OpenAI GPT-3.5 Turbo',
            instance: openai('gpt-3.5-turbo'),
            image: false,
            file: false,
            cost: 1.5,
        })
        models.set('openai_api/gpt-4', {
            provider: 'openai',
            name: 'OpenAI GPT-4',
            instance: openai('gpt-4'),
            image: false,
            file: false,
            cost: 4,
        })
        models.set('openai_api/gpt-4-turbo', {
            provider: 'openai',
            name: 'OpenAI GPT-4 Turbo',
            instance: openai('gpt-4-turbo'),
            image: false,
            file: false,
            cost: 2.5,
        })
        models.set('openai_api/gpt-4o', {
            provider: 'openai',
            name: 'OpenAI GPT-4o',
            instance: openai('gpt-4o'),
            image: false,
            file: false,
            cost: 2.5,
        })
        models.set('openai_api/gpt-4o-mini', {
            provider: 'openai',
            name: 'OpenAI GPT-4o Mini',
            instance: openai('gpt-4o-mini'),
            image: false,
            file: false,
            cost: 1,
        })
        models.set('openai_api/o3-mini', {
            provider: 'openai',
            name: 'OpenAI GPT-4o Mini (o3-mini)',
            instance: openai('o3-mini'),
            image: false,
            file: false,
            cost: 1,
        })
    }

    if (models.size === 0) {
        throw new Error('No models available. Please check your API keys and try again.')
    }

    return models
}

export function getDefaultCheapModel(models: Map<string, Model>): Model & { id: string } {
    // o3-mini or 2.0 Flash
    const result = Array.from(models.entries()).find(([id]) => {
        if (id === 'openai_api/o3-mini') {
            return true
        }

        if (id === 'google/gemini-2.0-flash-001') {
            return true
        }

        if (id === 'openai/o3-mini') {
            return true
        }
    })

    if (result) {
        return { ...result[1]!, id: result[0]! }
    }

    console.warn('No default cheap model found, returning the cheapest model instead.')

    // find cheapest model
    const cheapestModel = Array.from(models.entries()).reduce(([prevId, prev], [currId, curr]) => {
        if (prev.cost < curr.cost) {
            return [prevId, prev]
        }
        return [currId, curr]
    })

    return {
        ...cheapestModel[1]!,
        id: cheapestModel[0]!,
    }
}
