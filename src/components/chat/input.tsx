import { useQuery } from '@tanstack/react-query'
import { Loader2Icon, SendHorizontal } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocalStorageState } from '@/hooks/use-local-storage-state'
import { useTRPC } from '@/lib/api-client'
import type { Prompt } from '@/lib/types'
import { Button } from '../ui/button'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '../ui/dialog'

const MIN_ROWS = 1
const MAX_ROWS = 10

export const MessageInput = memo(MessageInputComponent)

function MessageInputComponent(props: { onPrompt?: (prompt: Prompt) => void }) {
    const [rows, setRows] = useState(MIN_ROWS)

    const [model, setModel] = useLocalStorageState<string | null>('model', () => null)

    const handleOnChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let rows = 1
        for (let i = 0; i < e.target.value.length; i++) {
            if (e.target.value[i] === '\n') {
                rows++
                if (rows > MAX_ROWS) {
                    break
                }
            }
        }

        setRows(Math.max(rows, MIN_ROWS))
    }, [])

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const text = formData.get('message')?.toString().trim() || ''

            ;(e.target as HTMLFormElement).reset()

            if (text.length === 0) {
                return
            }

            props.onPrompt?.({
                text,
                model: model || 'default',
            })
        },
        [props.onPrompt, model],
    )

    const submitButtonRef = useRef<HTMLButtonElement>(null)

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            const button = submitButtonRef.current
            button!.click()
            return
        }
    }, [])

    return (
        <div className='p-4 pt-0'>
            <form
                className='flex flex-col gap-1 rounded-md border-t-primary/10 bg-background/50 p-3 ring-8 ring-primary/10'
                onSubmit={handleSubmit}
            >
                <div className='flex items-start gap-2'>
                    <textarea
                        name='message'
                        className='w-full resize-none p-1 text-base text-foreground leading-6 outline-none placeholder:text-primary disabled:opacity-0'
                        placeholder='Type your message here...'
                        rows={rows}
                        onChange={handleOnChange}
                        onKeyDown={handleKeyDown}
                    />
                    <Button type='submit' size='icon' ref={submitButtonRef}>
                        <SendHorizontal />
                    </Button>
                </div>
                <div className='flex items-center gap-2'>
                    <ModelsSelect model={model} setModel={setModel} />
                </div>
            </form>
        </div>
    )
}

const ModelsSelect = memo(ModelsSelectComponent)

function ModelsSelectComponent(props: { model?: string | null; setModel: (model: string) => void }) {
    const trpc = useTRPC()

    const model = props.model
    const setModel = props.setModel

    const { data: models } = useQuery(trpc.models.queryOptions())

    const selectedModel = useMemo(() => {
        if (model) {
            const selectedModel = models?.models.find((m) => m.id === model)
            if (!selectedModel && models) {
                return models?.models.find((m) => m.id === models.defaultModel)
            }
            return selectedModel
        }
        if (models?.defaultModel) {
            return models?.models.find((m) => m.id === models.defaultModel)
        }
        return undefined
    }, [model, models])

    // biome-ignore lint/correctness/useExhaustiveDependencies: Won't change
    useEffect(() => {
        if (selectedModel && !model) {
            setModel(selectedModel.id)
        }
    }, [selectedModel, model])

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className='h-6' size='sm'>
                    {selectedModel?.name ?? <Loader2Icon className='animate-spin' size={18} />}
                </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[var(--screen-height)] overflow-y-auto'>
                <ModelsSelectDialog
                    models={models?.models || []}
                    onSelect={(modelId) => {
                        setModel(modelId)
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}

const ModelsSelectDialog = memo(ModelsSelectDialogListComponent)

function ModelsSelectDialogListComponent(props: {
    models: { id: string; name: string }[]
    onSelect: (modelId: string) => void
}) {
    return (
        <>
            {props.models?.map((model) => (
                <DialogClose value={model.id} key={model.id} onClick={() => props.onSelect(model.id)} asChild>
                    <Button variant='ghost'>{model.name}</Button>
                </DialogClose>
            ))}
        </>
    )
}
