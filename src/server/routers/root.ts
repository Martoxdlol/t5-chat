import { publicProcedure, router } from '../trpc'

export const appRouter = router({
    hello: publicProcedure.query(() => {
        return 'Hello from tRPC!'
    }),
    prompt: publicProcedure.mutation(async function* () {
        for (let i = 0; i < 30; i++) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            yield numbersGen();
        }
    }),
})

const numbersGen = async function* () {
    for (let i = 0; i < 30; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        yield i;
    }
}

export type AppRouter = typeof appRouter
