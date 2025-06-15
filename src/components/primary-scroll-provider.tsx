import { createContext, useContext, useState } from 'react'

export const ctxValue = createContext(0)
export const ctxSetter = createContext((_v: number) => {})

export function PrimaryScrollProvider(props: { children: React.ReactNode }) {
    const [scrollY, setScrollY] = useState(0)

    return (
        <ctxValue.Provider value={scrollY}>
            <ctxSetter.Provider value={setScrollY}>{props.children}</ctxSetter.Provider>
        </ctxValue.Provider>
    )
}

export function usePrimaryScrollY() {
    const value = useContext(ctxValue)

    return value
}

export function useSetPrimaryScrollYSetter() {
    return useContext(ctxSetter)
}
