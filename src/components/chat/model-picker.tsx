import { useQuery } from '@tanstack/react-query'
import { memo, useEffect, useMemo, useState } from 'react'
import { useTRPC } from '@/lib/api-client'
import { Button } from '../ui/button'
import { Input } from '../ui/input' // Added Input import
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Separator } from '../ui/separator'

export const ModelPicker = memo(ModelPickerComponent)

function ModelPickerComponent(props: { value: string | null; onChange: (value: string | null) => void }) {
    const trpc = useTRPC()
    const [showAll, setShowAll] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('') // Added search term state

    const { data: ai } = useQuery(
        trpc.models.queryOptions(undefined, {
            refetchOnMount: true,
            staleTime: 1000 * 60 * 5, // 5 minutes
        }),
    )

    const selectedModel = useMemo(() => {
        if (!props.value) return undefined

        const model = ai?.models.find((m) => m.id === props.value)
        if (!model) return null // Indicates a value exists but doesn't match any known model
        return model
    }, [props.value, ai])

    const sortedModels = useMemo(() => {
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

    const featuredModels = useMemo(() => {
        return sortedModels.filter((m) => m.featured)
    }, [sortedModels])

    const modelsToDisplay = useMemo(() => {
        // If there's a search term, filter all sorted models and ignore showAll/featured
        if (searchTerm) {
            return sortedModels.filter(
                (model) =>
                    model.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                    model.id.toLowerCase().includes(searchTerm.toLowerCase().trim()),
            )
        }
        // If no search term, use showAll to pick between all sorted or just featured
        return showAll ? sortedModels : featuredModels
    }, [searchTerm, showAll, sortedModels, featuredModels])

    useEffect(() => {
        if (!selectedModel && ai?.defaultModel) {
            props.onChange(ai.defaultModel.id)
        }
    }, [ai, props.onChange, selectedModel])

    useEffect(() => {
        // Reset showAll state and search term when popover closes
        if (!isOpen) {
            setShowAll(false)
            setSearchTerm('')
        }
    }, [isOpen])

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button className='h-6' size='sm' type='button'>
                    {selectedModel === undefined ? 'Select model' : (selectedModel?.name ?? 'Unknown model')}
                </Button>
            </PopoverTrigger>
            <PopoverContent className='flex max-h-[calc(var(--screen-height)_-_100px)] w-[100vw] max-w-200 flex-col space-y-2 overflow-y-auto border-accent p-2'>
                <div className='sticky top-0 z-10 shrink-0 bg-background'>
                    <Input
                        autoFocus
                        type='text'
                        placeholder='Search models...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {modelsToDisplay.length === 0 && searchTerm ? (
                    <div className='p-4 text-center text-muted-foreground text-sm'>
                        No models found for "{searchTerm}".
                    </div>
                ) : (
                    <ModelPickerList
                        models={modelsToDisplay}
                        onSelect={(model) => {
                            props.onChange(model.id)
                            setIsOpen(false)
                            setSearchTerm('') // Clear search on selection
                        }}
                        selectedModel={selectedModel?.id}
                    />
                )}

                {/* Toggle button for showing all or featured models */}
                {!searchTerm && featuredModels.length < sortedModels.length && sortedModels.length > 0 && (
                    <>
                        <Separator />
                        {showAll ? (
                            <Button variant='ghost' size='sm' onClick={() => setShowAll(false)} className='w-full'>
                                Show featured models only
                            </Button>
                        ) : (
                            <Button variant='ghost' size='sm' onClick={() => setShowAll(true)} className='w-full'>
                                Show all models ({sortedModels.length})
                            </Button>
                        )}
                    </>
                )}
            </PopoverContent>
        </Popover>
    )
}

// Renamed from ModelPickerGrid to ModelPickerList
const ModelPickerList = memo(ModelPickerListComponent)

// Renamed from ModelPickerGridComponent to ModelPickerListComponent and updated rendering
function ModelPickerListComponent(props: {
    models: Array<{ id: string; name: string; featured: boolean; cost: number }>
    onSelect: (model: { id: string; name: string }) => void
    selectedModel?: string
}) {
    if (props.models.length === 0) {
        // This message is shown if modelsToDisplay is empty and not due to an active search
        return <div className='p-4 text-center text-muted-foreground text-sm'>No models to display.</div>
    }
    return (
        <div className='flex w-full flex-col gap-1'>
            {/* Changed from grid to flex list */}
            {props.models.map((model) => (
                <button
                    type='button'
                    key={model.id}
                    onClick={() => props.onSelect(model)}
                    className='flex justify-between rounded-md p-2 text-left text-sm hover:bg-accent'
                >
                    <span>
                        {model.featured ? '⭐ ' : ''}
                        {model.name}
                    </span>
                    <span className='text-right text-muted-foreground text-xs'>{model.cost.toFixed(2)}</span>
                </button>
            ))}
        </div>
    )
}
