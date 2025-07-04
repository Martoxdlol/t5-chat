import { memo } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

export const ChatListTile = memo(ChatListTileComponent)

function ChatListTileComponent(props: {
    title: string
    emoji?: string | null
    color?: string | null
    lastMessage?: string | null
    chatId: string
    selected?: boolean
    style?: React.CSSProperties
}) {
    // const navigate = useNavigate()

    return (
        <li className='flex shrink-0 items-center overflow-hidden px-2 py-1' style={props.style}>
            <Link
                // TODO: Review logic
                // onMouseDown={(e) => {
                //     e.preventDefault()
                //     e.stopPropagation()
                //     navigate(e.currentTarget.pathname, {
                //         state: 'back-to-home',
                //     })
                // }}
                // onClick={(e) => {
                //     e.preventDefault()
                //     e.stopPropagation()
                //     navigate(e.currentTarget.pathname, {
                //         state: 'back-to-home',
                //     })
                // }}
                to={`/chats/${props.chatId}`}
                className={cn('flex w-full items-center gap-2 rounded-lg p-2 hover:bg-accent', {
                    'bg-accent': props.selected,
                })}
                state={'back-to-home'}
            >
                <div
                    className='flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted p-2'
                    style={{ backgroundColor: props.color || undefined }}
                >
                    {props.emoji}
                </div>
                <div className='min-w-0 shrink grow'>
                    <p className='w-full overflow-hidden text-ellipsis whitespace-nowrap'>{props.title}</p>
                    <p className='w-full overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground text-xs'>
                        {props.lastMessage}
                    </p>
                </div>
            </Link>
        </li>
    )
}
