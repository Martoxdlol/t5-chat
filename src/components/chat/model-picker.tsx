import { useQuery } from '@tanstack/react-query'
import { memo, useEffect, useMemo } from 'react'
import { useTRPC } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

export const ModelPicker = memo(ModelPickerComponent)

function ModelPickerComponent(props: { value: string | null; onChange: (value: string | null) => void }) {
    const trpc = useTRPC()

    const { data: ai } = useQuery(trpc.models.queryOptions())

    const selectedModel = useMemo(() => {
        if (!props.value) return undefined

        const model = ai?.models.find((m) => m.id === props.value)
        if (!model) return null
        return model
    }, [props.value, ai])

    const sorted = useMemo(() => {
        if (!ai) return []

        return ai.models.slice().sort((a, b) => {
            if (a.featured && !b.featured) return -1
            if (!a.featured && b.featured) return 1
            if (a.cost !== b.cost) {
                return a.cost - b.cost
            }
            return a.name.localeCompare(b.name)
        })
    }, [ai])

    useEffect(() => {
        if (!selectedModel && ai?.defaultModel) {
            props.onChange(ai.defaultModel.id)
        }
    }, [ai, props.onChange, selectedModel])

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className='h-6' size='sm'>
                    {selectedModel === undefined ? 'select model' : (selectedModel?.name ?? 'unknown')}
                </Button>
            </PopoverTrigger>
            <PopoverContent className='flex max-h-[calc(var(--screen-height)_-_100px)] w-[100vw] max-w-200 overflow-y-auto border-accent p-1'>
                <ModelPickerGrid
                    models={sorted}
                    onSelect={(model) => {
                        props.onChange(model.id)
                    }}
                    selectedModel={selectedModel?.id}
                />
            </PopoverContent>
        </Popover>
    )
}

const ModelPickerGrid = memo(ModelPickerGridComponent)

function ModelPickerGridComponent(props: {
    models: Array<{ id: string; name: string; featured: boolean; cost: number }>
    onSelect: (model: { id: string; name: string }) => void
    selectedModel?: string
}) {
    return (
        <div className='grid size-full grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-1'>
            {props.models.map((model) => (
                <Button
                    key={model.id}
                    variant={props.selectedModel === model.id ? 'default' : 'outline'}
                    onClick={() => props.onSelect(model)}
                    className={cn('h-auto min-h-10 whitespace-normal text-center text-xs', {
                        '!border-yellow-600/50 border': model.featured,
                    })}
                >
                    {model.name}
                </Button>
            ))}
        </div>
    )
}
