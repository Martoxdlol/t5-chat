import { type ComponentProps, useLayoutEffect } from 'react'
import { cn } from '../../lib/utils'

/**
 * This component is intended to avoid scroll when virtual keyboard is open on mobile devices.
 * Specially on IOS
 * It does something similar to <meta name="viewport" content="interactive-widget=resizes-content" />
 * and updates css variable --screen-height with the height of the visual viewport.
 */
export function Screen(props: ComponentProps<'div'>) {
    useLayoutEffect(() => {
        const abortController = new AbortController()

        function handleEvent(e?: { preventDefault?: () => void }) {
            e?.preventDefault?.()

            const vw = window.visualViewport
            if (vw) {
                document.documentElement.style.setProperty('--screen-height', `${vw.height}px`)
            }

            window.scrollTo(0, 0)
        }

        function preventTouchScroll(e: TouchEvent) {
            e.preventDefault()
        }

        handleEvent()

        window.addEventListener('focusin', handleEvent, { signal: abortController.signal })
        window.addEventListener('focusout', handleEvent, { signal: abortController.signal })
        window.addEventListener('scroll', handleEvent, { signal: abortController.signal })
        window.addEventListener('resize', handleEvent, { signal: abortController.signal })

        window.visualViewport?.addEventListener('resize', handleEvent, { signal: abortController.signal })
        window.visualViewport?.addEventListener('scroll', handleEvent, { signal: abortController.signal })

        // Prevent touch scrolling
        window.addEventListener('touchstart', preventTouchScroll, { signal: abortController.signal })
        window.addEventListener('touchmove', preventTouchScroll, { signal: abortController.signal })

        const timer = window.setInterval(() => {
            handleEvent()
        }, 5000)

        return () => {
            clearInterval(timer)
            abortController.abort()
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
