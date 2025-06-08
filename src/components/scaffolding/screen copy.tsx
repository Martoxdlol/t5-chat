import { type ComponentProps, useLayoutEffect } from 'react'
import { cn } from '../../lib/utils'

export function Screen(props: ComponentProps<'div'>) {
    useLayoutEffect(() => {
        function focusEventHandler(e?: { preventDefault: () => void }) {
            e?.preventDefault()
            const vw = window.visualViewport
            if (vw) {
                document.documentElement.style.setProperty('--screen-height', `${vw.height}px`)
            }

            window.scrollTo(0, 0)

            const scrollMarginTop = window.visualViewport?.offsetTop
            document.documentElement.style.setProperty('--scroll-margin-top', `${scrollMarginTop ?? 0}px`)
        }

        focusEventHandler()

        const timer = setInterval(() => {
            focusEventHandler()
        }, 5000)

        const timer2 = setInterval(() => {
            // if keyboard open
            if (window.visualViewport && window.innerHeight > window.visualViewport.height) {
                focusEventHandler()
            }
        }, 1000)

        window.addEventListener('focusin', focusEventHandler)
        window.addEventListener('focusout', focusEventHandler)

        window.visualViewport?.addEventListener('resize', focusEventHandler)

        window.addEventListener('scroll', focusEventHandler)
        visualViewport?.addEventListener('scroll', focusEventHandler)

        return () => {
            window.removeEventListener('focusin', focusEventHandler)
            window.removeEventListener('focusout', focusEventHandler)
            clearInterval(timer)
            clearInterval(timer2)
            window.visualViewport?.removeEventListener('resize', focusEventHandler)
            window.removeEventListener('scroll', focusEventHandler)
            visualViewport?.removeEventListener('scroll', focusEventHandler)
        }
    }, [])

    return (
        <div {...props} className={cn('fixed top-0 right-0 bottom-0 left-0', props.style)}>
            <div className='relative mt-[var(--scroll-margin-top)] h-[var(--screen-height)] w-full overflow-hidden'>
                {props.children}
            </div>
        </div>
    )
}
