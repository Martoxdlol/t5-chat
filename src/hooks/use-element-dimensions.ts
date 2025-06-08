import { useEffect, useState } from 'react'

export function useElementDimensions(element?: HTMLElement | null) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    useEffect(() => {
        if (element) {
            const getDimensions = () => ({
                width: element.offsetWidth,
                height: element.offsetHeight,
            })

            const handleResize = () => {
                setDimensions(getDimensions())
            }

            // Initial dimensions
            handleResize()

            const resizeObserver = new ResizeObserver(handleResize)
            resizeObserver.observe(element)

            return () => {
                resizeObserver.unobserve(element)
                resizeObserver.disconnect()
            }
        } else {
            setDimensions({ width: 0, height: 0 })
        }
    }, [element])

    return dimensions
}
