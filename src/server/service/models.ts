import { openai } from '@ai-sdk/openai'
import { createOpenRouter, type OpenRouterProvider } from '@openrouter/ai-sdk-provider'
import type { LanguageModelV1 } from 'ai'

const GEMINI_2_FLASH_COMPLETION_COST = 0.0000004

const FEATURED_MODELS = new Map<string, string>([
    ['google/gemini-2.0-flash-001', 'Gemini 2.0 Flash'],
    ['google/gemini-2.5-flash-preview', 'Gemini 2.5 Flash'],
    ['google/gemini-2.5-flash-preview:thinking', 'Gemini 2.5 Flash (thinking)'],
    ['google/gemini-2.5-pro-preview', 'Gemini 2.5 Pro'],
    ['openai/gpt-3.5-turbo', 'GPT-3.5 Turbo'],
    ['openai/o3-mini', 'O3 Mini'],
    ['openai/o4-mini', 'O4 Mini'],
    ['openai/o4-mini-high', 'O4 Mini High'],
    ['openai/gpt-4', 'GPT-4'],
    ['openai/gpt-4-turbo', 'GPT-4 Turbo'],
    ['openai/gpt-4.1', 'GPT-4.1'],
    ['openai/codex-mini', 'Codex Mini'],
    ['anthropic/claude-3.7-sonnet', 'Claude 3.7 Sonnet'],
    ['anthropic/claude-sonnet-4', 'Claude Sonnet 4'],
    ['anthropic/claude-opus-4', 'Claude Opus 4'],
    ['perplexity/r1-1776', 'R1 1776'],
])

const EXCLUDED_MODELS = new Set<string>([
    'google/gemini-2.5-pro-exp-03-25', // For some reason it doesn't work
    'openrouter/auto',
])

// More providers could be added here in the future
export type ModelProvider = 'openrouter' | 'openai'

export type Model = {
    // Unique identifier for the model
    id: string
    // Model provider
    provider: ModelProvider
    // Model name
    name: string
    // Featured (top model)
    featured: boolean
    // Model instance (to be passed to ai-sdk)
    instance: LanguageModelV1
    // Can input text
    image: boolean
    // Can input file
    file: boolean
    // Cost relative to Gemini 2.0 Flash
    cost: number
}

export type AIContext = {
    models: Map<string, Model>
    defaultModel: Model
    openrouter: OpenRouterProvider | null
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

// Cost relative to Gemini 2.0 Flash
function getModelCost(model: OpenRouterModel): number {
    if (!model.pricing || !model.pricing.completion) {
        return 0.2 // Default cost if not specified
    }

    return model.pricing.completion / GEMINI_2_FLASH_COMPLETION_COST
}

export async function createAIContext(): Promise<AIContext> {
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
        throw new Error(
            'No API keys provided for OpenRouter or OpenAI.\nPlease set OPENROUTER_API_KEY or OPENAI_API_KEY in your environment variables.',
        )
    }

    const models = new Map<string, Model>()

    let openrouter: OpenRouterProvider | null = null

    if (process.env.OPENROUTER_API_KEY) {
        const availableModels = await fetchAvailableModels()

        openrouter = createOpenRouter({
            apiKey: process.env.OPENROUTER_API_KEY,
        })

        for (const model of availableModels) {
            if (EXCLUDED_MODELS.has(model.id)) {
                continue // Skip excluded models
            }

            const instance = openrouter.chat(model.id)

            const cost = getModelCost(model)

            models.set(model.id, {
                featured: FEATURED_MODELS.has(model.id),
                id: model.id,
                provider: 'openrouter',
                name: FEATURED_MODELS.get(model.id) ?? model.name,
                instance,
                image: model.architecture?.input_modalities?.includes('image') ?? false,
                file: model.architecture?.input_modalities?.includes('file') ?? false,
                cost,
            })
        }
    }

    if (process.env.OPENAI_API_KEY) {
        const featured = !openrouter
        const namePrefix = featured ? '' : '(OpenAI API) '

        models.set('openai_provider/gpt-3.5-turbo', {
            id: 'openai_provider/gpt-3.5-turbo',
            featured,
            provider: 'openai',
            name: `${namePrefix}GPT-3.5 Turbo`,
            instance: openai('gpt-3.5-turbo'),
            image: false,
            file: false,
            cost: 1.5,
        })
        models.set('openai_provider/gpt-4', {
            id: 'openai_provider/gpt-4',
            featured,
            provider: 'openai',
            name: `${namePrefix}GPT-4`,
            instance: openai('gpt-4'),
            image: false,
            file: false,
            cost: 4,
        })
        models.set('openai_provider/gpt-4-turbo', {
            id: 'openai_provider/gpt-4-turbo',
            featured,
            provider: 'openai',
            name: `${namePrefix}GPT-4 Turbo`,
            instance: openai('gpt-4-turbo'),
            image: false,
            file: false,
            cost: 2.5,
        })
        models.set('openai_provider/gpt-4o', {
            id: 'openai_provider/gpt-4o',
            featured,
            provider: 'openai',
            name: `${namePrefix}GPT-4o`,
            instance: openai('gpt-4o'),
            image: false,
            file: false,
            cost: 2.5,
        })
        models.set('openai_provider/gpt-4o-mini', {
            id: 'openai_provider/gpt-4o-mini',
            featured,
            provider: 'openai',
            name: `${namePrefix}GPT-4o Mini`,
            instance: openai('gpt-4o-mini'),
            image: false,
            file: false,
            cost: 1,
        })
        models.set('openai_provider/o3-mini', {
            id: 'openai_provider/o3-mini',
            featured,
            provider: 'openai',
            name: `${namePrefix}O3 Mini`,
            instance: openai('o3-mini'),
            image: false,
            file: false,
            cost: 1,
        })
        models.set('openai_provider/o4-mini', {
            id: 'openai_provider/o4-mini',
            featured,
            provider: 'openai',
            name: `${namePrefix}O4 Mini`,
            instance: openai('o4-mini'),
            image: false,
            file: false,
            cost: 1,
        })
    }

    if (models.size === 0) {
        throw new Error('No models available. Please check your API keys and try again.')
    }

    const defaultModel =
        models.get('openai/o4-mini') ??
        models.get('google/gemini-2.0-flash-001') ??
        models.get('openai_provider/gpt-3.5-turbo') ??
        models.get('openai_provider/o4-mini') ??
        models.values().next().value!

    return {
        models,
        defaultModel,
        openrouter,
    }
}
